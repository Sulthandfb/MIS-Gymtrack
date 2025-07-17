from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional, Tuple
import json
import re

from app.services.groq_client import generate_groq_insight
from app.models.member import Member, MemberGoal
from app.models.trainer import Trainer
from app.models.inventory import Equipment, EquipmentCategory
from app.models.finance import IncomeTransaction, ExpenseTransaction
from app.models.feedback import Feedback
from app.models.product import Product, Sale, SaleItem
from app.crud.chatbot import create_chat_message, get_recent_messages
from app.schemas.chatbot import ChatMessageCreate

# Import fungsi-fungsi existing dari CRUD modules
from app.crud import member as crud_member
from app.crud import finance as crud_finance
from app.crud import inventory as crud_inventory
from app.crud import trainer as crud_trainer
from app.crud import feedback as crud_feedback

class ChatbotService:
    def __init__(self, db: Session):
        self.db = db
    
    def detect_intent(self, message: str) -> Tuple[str, List[str]]:
        """Detect user intent and extract relevant keywords"""
        message_lower = message.lower()
        
        # Intent patterns
        intents = {
            'member_info': ['member', 'anggota', 'pelanggan', 'user'],
            'trainer_info': ['trainer', 'pelatih', 'instruktur'],
            'inventory_info': ['alat', 'equipment', 'inventori', 'peralatan'],
            'finance_info': ['keuangan', 'pendapatan', 'pengeluaran', 'finance', 'revenue'],
            'feedback_info': ['feedback', 'ulasan', 'review', 'keluhan'],
            'product_info': ['produk', 'product', 'suplemen', 'penjualan'],
            'general_stats': ['statistik', 'ringkasan', 'overview', 'total'],
            'greeting': ['halo', 'hai', 'hello', 'hi', 'selamat'],
            'help': ['bantuan', 'help', 'apa yang bisa']
        }
        
        detected_intent = 'general'
        keywords = []
        
        for intent, patterns in intents.items():
            if any(pattern in message_lower for pattern in patterns):
                detected_intent = intent
                keywords = [word for word in patterns if word in message_lower]
                break
        
        return detected_intent, keywords
    
    def get_member_data(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get member statistics and data using existing CRUD functions"""
        # Gunakan fungsi yang sudah ada di crud/member.py
        member_stats = crud_member.get_member_stats(self.db)
        member_segments = crud_member.get_member_segments(self.db)
        
        # Recent members
        recent_members = self.db.query(Member).order_by(desc(Member.join_date)).limit(5).all()
        
        return {
            'total_members': member_stats['total'],
            'active_members': member_stats['active'], 
            'new_members_this_month': member_stats['new_members'],
            'retention_rate': member_stats['retention'],  # Ini yang missing sebelumnya!
            'recent_members': [{'name': m.name, 'join_date': str(m.join_date)} for m in recent_members],
            'membership_distribution': member_segments
        }
    
    def get_trainer_data(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get trainer statistics and data"""
        query = self.db.query(Trainer)
        
        if filters:
            if 'specialization' in filters:
                query = query.filter(Trainer.specialization.ilike(f"%{filters['specialization']}%"))
        
        total_trainers = query.count()
        active_trainers = query.filter(Trainer.status == 'active').count()
        
        # Top rated trainers
        top_trainers = query.filter(Trainer.rating.isnot(None)).order_by(desc(Trainer.rating)).limit(3).all()
        
        # Specialization distribution
        spec_dist = self.db.query(
            Trainer.specialization,
            func.count(Trainer.trainer_id).label('count')
        ).group_by(Trainer.specialization).all()
        
        return {
            'total_trainers': total_trainers,
            'active_trainers': active_trainers,
            'top_trainers': [{'name': t.name, 'rating': float(t.rating) if t.rating else 0, 'specialization': t.specialization} for t in top_trainers],
            'specialization_distribution': [{'specialization': s.specialization, 'count': s.count} for s in spec_dist]
        }
    
    def get_inventory_data(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get inventory statistics and data using existing CRUD functions"""
        # Gunakan fungsi yang sudah ada di crud/inventory.py
        inventory_summary = crud_inventory.get_inventory_summary(self.db)
        
        # Recent equipment
        recent_equipment = self.db.query(Equipment).order_by(desc(Equipment.purchase_date)).limit(5).all()
        
        # Equipment by category
        category_dist = self.db.query(
            EquipmentCategory.category_name,
            func.count(Equipment.equipment_id).label('count')
        ).join(Equipment).group_by(EquipmentCategory.category_name).all()
        
        return {
            'total_equipment': inventory_summary['total_equipment'],
            'working_equipment': inventory_summary['total_active_equipment'],
            'broken_equipment': inventory_summary['total_broken_equipment'],
            'in_maintenance': inventory_summary['total_in_maintenance_equipment'],
            'needs_replacement': inventory_summary['total_replacement_needed_equipment'],
            'backup_stock': inventory_summary['total_backup_stock'],
            'total_equipment_value': inventory_summary['total_equipment_value'],  # Ini yang missing sebelumnya!
            'category_distribution': [{'category': c.category_name, 'count': c.count} for c in category_dist],
            'recent_equipment': [{'name': e.name, 'status': e.status, 'purchase_date': str(e.purchase_date)} for e in recent_equipment]
        }
    
    def get_finance_data(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get finance statistics and data using existing CRUD functions"""
        current_year = date.today().year
        
        # Gunakan fungsi yang sudah ada di crud/finance.py
        financial_summary = crud_finance.get_financial_summary(self.db, current_year)
        income_breakdown = crud_finance.get_income_breakdown(self.db, current_year)
        expense_breakdown = crud_finance.get_expense_breakdown(self.db, current_year)
        
        # Hitung profit margin yang akurat
        profit_margin = financial_summary.get('profit_margin', 0)
        net_profit = financial_summary['total_income'] - financial_summary['total_expenses']
        
        return {
            'monthly_income': financial_summary['total_income'],
            'monthly_expenses': financial_summary['total_expenses'],
            'net_profit': net_profit,
            'profit_margin': profit_margin,  # Ini yang missing sebelumnya!
            'profit_margin_trend': financial_summary.get('profit_margin_trend', 0),
            'income_breakdown': income_breakdown,
            'expense_breakdown': expense_breakdown,
            'income_by_type': [{'type': item['name'], 'total': item['amount']} for item in income_breakdown]
        }
    
    def get_feedback_data(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get feedback statistics and data"""
        query = self.db.query(Feedback)
        
        total_feedback = query.count()
        positive_feedback = query.filter(Feedback.sentiment == 'Positive').count()
        negative_feedback = query.filter(Feedback.sentiment == 'Negative').count()
        
        # Average rating
        avg_rating = self.db.query(func.avg(Feedback.rating)).scalar() or 0
        
        # Recent feedback
        recent_feedback = query.order_by(desc(Feedback.feedback_date)).limit(5).all()
        
        return {
            'total_feedback': total_feedback,
            'positive_feedback': positive_feedback,
            'negative_feedback': negative_feedback,
            'average_rating': float(avg_rating),
            'recent_feedback': [{'content': f.content[:100], 'rating': f.rating, 'sentiment': f.sentiment} for f in recent_feedback]
        }
    
    def get_product_data(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get product statistics and data"""
        query = self.db.query(Product)
        
        total_products = query.count()
        active_products = query.filter(Product.status == 'active').count()
        low_stock = query.filter(Product.current_stock < 10).count()
        
        # Top selling products
        top_products = self.db.query(
            Product.name,
            func.sum(SaleItem.quantity).label('total_sold')
        ).join(SaleItem).group_by(Product.name).order_by(desc(func.sum(SaleItem.quantity))).limit(5).all()
        
        return {
            'total_products': total_products,
            'active_products': active_products,
            'low_stock_products': low_stock,
            'top_selling': [{'name': p.name, 'total_sold': p.total_sold} for p in top_products]
        }
    
    async def process_message(self, message: str, session_id: int) -> Dict[str, Any]:
        """Process user message and generate response"""
        
        # Save user message
        user_message = ChatMessageCreate(content=message, message_type='user')
        create_chat_message(self.db, user_message, session_id)
        
        # Detect intent
        intent, keywords = self.detect_intent(message)
        
        # Get relevant data based on intent
        context_data = {}
        data_sources = []
        
        if intent == 'member_info':
            context_data = self.get_member_data()
            data_sources = ['members']
        elif intent == 'trainer_info':
            context_data = self.get_trainer_data()
            data_sources = ['trainers']
        elif intent == 'inventory_info':
            context_data = self.get_inventory_data()
            data_sources = ['inventory']
        elif intent == 'finance_info':
            context_data = self.get_finance_data()
            data_sources = ['finance']
        elif intent == 'feedback_info':
            context_data = self.get_feedback_data()
            data_sources = ['feedback']
        elif intent == 'product_info':
            context_data = self.get_product_data()
            data_sources = ['products']
        elif intent == 'general_stats':
            context_data = {
                'members': self.get_member_data(),
                'trainers': self.get_trainer_data(),
                'inventory': self.get_inventory_data(),
                'finance': self.get_finance_data()
            }
            data_sources = ['members', 'trainers', 'inventory', 'finance']
        
        # Generate AI response
        response = await self.generate_ai_response(message, intent, context_data, session_id)
        
        # Save bot response
        bot_message = ChatMessageCreate(content=response, message_type='bot')
        create_chat_message(self.db, bot_message, session_id, context_data)
        
        return {
            'response': response,
            'session_id': session_id,
            'context_used': context_data,
            'data_sources': data_sources
        }
    
    async def generate_ai_response(self, message: str, intent: str, context_data: Dict, session_id: int) -> str:
        """Generate AI response using Groq"""
        
        # Get recent conversation history
        recent_messages = get_recent_messages(self.db, session_id, 5)
        conversation_history = []
        for msg in recent_messages:
            conversation_history.append(f"{msg.message_type}: {msg.content}")
        
        # Create context-aware prompt
        prompt = self.create_context_prompt(message, intent, context_data, conversation_history)
        
        try:
            response = await generate_groq_insight(prompt)
            return response
        except Exception as e:
            return f"Maaf, saya mengalami kesulitan dalam memproses permintaan Anda. Silakan coba lagi nanti."
    
    def create_context_prompt(self, message: str, intent: str, context_data: Dict, conversation_history: List[str]) -> str:
        """Create context-aware prompt for AI"""
        
        base_prompt = f"""
Anda adalah asisten AI untuk aplikasi manajemen gym yang bernama GymBot. 
Anda membantu pengguna mendapatkan informasi tentang data gym dengan ramah dan informatif.

Pertanyaan pengguna: "{message}"
Intent yang terdeteksi: {intent}

Riwayat percakapan terbaru:
{chr(10).join(conversation_history[-3:]) if conversation_history else "Tidak ada riwayat percakapan"}

Data kontekstual yang tersedia:
{json.dumps(context_data, indent=2, ensure_ascii=False)}

PENTING: Gunakan data yang tersedia untuk memberikan jawaban yang AKURAT. Contoh:
- Jika ditanya retensi rate, gunakan nilai dari 'retention_rate' di data member
- Jika ditanya margin profit, gunakan nilai dari 'profit_margin' di data finance  
- Jika ditanya total nilai aset, gunakan 'total_equipment_value' di data inventory
- Selalu berikan angka yang tepat dari data, bukan estimasi

Berikan respons yang:
1. Ramah dan profesional
2. Berdasarkan data AKTUAL yang tersedia (gunakan angka yang tepat)
3. Memberikan insight yang berguna dan akurat
4. Menawarkan informasi tambahan jika relevan
5. Gunakan bahasa Indonesia yang natural
6. Jika data tidak tersedia, jelaskan dengan jelas bahwa informasi tidak tersedia

Jangan memberikan informasi yang tidak ada di data atau membuat estimasi sendiri.
"""
        
        return base_prompt
