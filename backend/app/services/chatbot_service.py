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
        """Get member statistics and data"""
        query = self.db.query(Member)
        
        if filters:
            if 'status' in filters:
                query = query.filter(Member.status == filters['status'])
            if 'membership_type' in filters:
                query = query.filter(Member.membership_type == filters['membership_type'])
        
        total_members = query.count()
        active_members = query.filter(Member.status == 'active').count()
        
        # Recent members
        recent_members = query.order_by(desc(Member.join_date)).limit(5).all()
        
        # Membership distribution
        membership_dist = self.db.query(
            Member.membership_type,
            func.count(Member.member_id).label('count')
        ).group_by(Member.membership_type).all()
        
        return {
            'total_members': total_members,
            'active_members': active_members,
            'recent_members': [{'name': m.name, 'join_date': str(m.join_date)} for m in recent_members],
            'membership_distribution': [{'type': m.membership_type, 'count': m.count} for m in membership_dist]
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
        """Get inventory statistics and data"""
        query = self.db.query(Equipment)
        
        total_equipment = query.count()
        working_equipment = query.filter(Equipment.status == 'Baik').count()
        needs_maintenance = query.filter(Equipment.next_maintenance <= date.today()).count()
        
        # Equipment by category
        category_dist = self.db.query(
            EquipmentCategory.category_name,
            func.count(Equipment.equipment_id).label('count')
        ).join(Equipment).group_by(EquipmentCategory.category_name).all()
        
        # Recent equipment
        recent_equipment = query.order_by(desc(Equipment.purchase_date)).limit(5).all()
        
        return {
            'total_equipment': total_equipment,
            'working_equipment': working_equipment,
            'needs_maintenance': needs_maintenance,
            'category_distribution': [{'category': c.category_name, 'count': c.count} for c in category_dist],
            'recent_equipment': [{'name': e.name, 'status': e.status, 'purchase_date': str(e.purchase_date)} for e in recent_equipment]
        }
    
    def get_finance_data(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get finance statistics and data"""
        today = date.today()
        current_month = today.month
        current_year = today.year
        
        # Income this month
        monthly_income = self.db.query(func.sum(IncomeTransaction.amount)).filter(
            and_(
                func.extract('month', IncomeTransaction.transaction_date) == current_month,
                func.extract('year', IncomeTransaction.transaction_date) == current_year
            )
        ).scalar() or 0
        
        # Expenses this month
        monthly_expenses = self.db.query(func.sum(ExpenseTransaction.amount)).filter(
            and_(
                func.extract('month', ExpenseTransaction.transaction_date) == current_month,
                func.extract('year', ExpenseTransaction.transaction_date) == current_year
            )
        ).scalar() or 0
        
        # Income by type
        income_by_type = self.db.query(
            IncomeTransaction.income_type,
            func.sum(IncomeTransaction.amount).label('total')
        ).group_by(IncomeTransaction.income_type).all()
        
        return {
            'monthly_income': float(monthly_income),
            'monthly_expenses': float(monthly_expenses),
            'net_profit': float(monthly_income - monthly_expenses),
            'income_by_type': [{'type': i.income_type, 'total': float(i.total)} for i in income_by_type]
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

Berikan respons yang:
1. Ramah dan profesional
2. Berdasarkan data yang tersedia
3. Memberikan insight yang berguna
4. Menawarkan informasi tambahan jika relevan
5. Gunakan bahasa Indonesia yang natural

Jika tidak ada data yang relevan, berikan respons yang menjelaskan hal tersebut dengan ramah.
"""
        
        return base_prompt
