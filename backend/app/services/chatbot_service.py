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
            'trainer_active': ['trainer aktif', 'pelatih aktif', 'instruktur aktif', 'trainer yang aktif'],
            'inventory_info': ['alat', 'equipment', 'inventori', 'peralatan'],
            'finance_info': ['keuangan', 'pendapatan', 'pengeluaran', 'finance', 'revenue', 'margin', 'profit'],
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
            if 'status' in filters:
                query = query.filter(Trainer.status == filters['status'])
        
        total_trainers = query.count()
        
        # Coba beberapa kemungkinan status aktif yang ada di database
        active_trainers_query = self.db.query(Trainer).filter(
            Trainer.status.in_(['active', 'Active', 'ACTIVE', 'aktif', 'Aktif'])
        )
        active_trainers = active_trainers_query.count()
        
        # Get all trainers with their status for debugging
        all_trainers_status = self.db.query(Trainer.name, Trainer.status).all()
        
        # Top rated trainers (aktif saja)
        top_trainers = active_trainers_query.filter(Trainer.rating.isnot(None)).order_by(desc(Trainer.rating)).limit(3).all()
        
        # Active trainers list
        active_trainers_list = active_trainers_query.all()
        
        # Specialization distribution (hanya trainer aktif)
        spec_dist = self.db.query(
            Trainer.specialization,
            func.count(Trainer.trainer_id).label('count')
        ).filter(Trainer.status.in_(['active', 'Active', 'ACTIVE', 'aktif', 'Aktif'])).group_by(Trainer.specialization).all()
        
        return {
            'total_trainers': total_trainers,
            'active_trainers': active_trainers,
            'all_trainers_status': [{'name': t.name, 'status': t.status} for t in all_trainers_status],
            'active_trainers_list': [{'name': t.name, 'specialization': t.specialization, 'rating': float(t.rating) if t.rating else 0, 'status': t.status} for t in active_trainers_list],
            'top_trainers': [{'name': t.name, 'rating': float(t.rating) if t.rating else 0, 'specialization': t.specialization, 'status': t.status} for t in top_trainers],
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
        
        # Use 2024 as the data year since that's where your data is (as per user's instruction)
        data_year = 2024 
        
        # Income this month
        monthly_income = self.db.query(func.sum(IncomeTransaction.amount)).filter(
            and_(
                func.extract('month', IncomeTransaction.transaction_date) == current_month,
                func.extract('year', IncomeTransaction.transaction_date) == data_year
            )
        ).scalar() or 0
        
        # Expenses this month
        monthly_expenses = self.db.query(func.sum(ExpenseTransaction.amount)).filter(
            and_(
                func.extract('month', ExpenseTransaction.transaction_date) == current_month,
                func.extract('year', ExpenseTransaction.transaction_date) == data_year
            )
        ).scalar() or 0
        
        # Calculate margin profit
        net_profit = float(monthly_income - monthly_expenses)
        margin_profit = (net_profit / float(monthly_income)) * 100 if monthly_income > 0 else 0
        
        # Income by type (filtered by data_year)
        income_by_type = self.db.query(
            IncomeTransaction.income_type,
            func.sum(IncomeTransaction.amount).label('total')
        ).filter(
            func.extract('year', IncomeTransaction.transaction_date) == data_year
        ).group_by(IncomeTransaction.income_type).all()
        
        # Last 6 months trend (using data_year for consistency)
        last_6_months_data = []
        for i in range(6):
            # Calculate month_date correctly to stay within data_year
            month_delta = i # For consistency in month calculation
            
            # Start from current_month and go back, ensuring we stay in data_year
            target_month = (current_month - month_delta - 1) % 12 + 1
            target_year = data_year if (current_month - month_delta) > 0 else data_year - 1 # Adjust year if needed
            
            # Create a date object for the first day of the target month
            # Handle cases where target_month is 0 or negative after modulo
            if target_month <= 0:
                target_month += 12
                target_year -= 1

            month_date = date(target_year, target_month, 1)

            month_income = self.db.query(func.sum(IncomeTransaction.amount)).filter(
                and_(
                    func.extract('month', IncomeTransaction.transaction_date) == month_date.month,
                    func.extract('year', IncomeTransaction.transaction_date) == month_date.year
                )
            ).scalar() or 0
            month_expenses = self.db.query(func.sum(ExpenseTransaction.amount)).filter(
                and_(
                    func.extract('month', ExpenseTransaction.transaction_date) == month_date.month,
                    func.extract('year', ExpenseTransaction.transaction_date) == month_date.year
                )
            ).scalar() or 0
            
            last_6_months_data.insert(0, { # Insert at beginning to keep chronological order
                'month': month_date.strftime('%B %Y'),
                'income': float(month_income),
                'expenses': float(month_expenses),
                'profit': float(month_income - month_expenses)
            })
        
        return {
            'monthly_income': float(monthly_income),
            'monthly_expenses': float(monthly_expenses),
            'net_profit': net_profit,
            'margin_profit': round(margin_profit, 2),
            'income_by_type': [{'type': i.income_type, 'total': float(i.total)} for i in income_by_type],
            'last_6_months_trend': last_6_months_data,
            'data_year': data_year # Indicate the year of the data
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
        elif intent == 'trainer_active':
            context_data = self.get_trainer_data({'status': 'active'})
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
        
        # Add a note about the data year if finance data is present
        data_year_note = ""
        if 'finance' in context_data and 'data_year' in context_data['finance']:
            data_year_note = f" (Perlu diketahui, data internal ini sebagian besar berasal dari tahun {context_data['finance']['data_year']} dan bersifat simulasi/dummy, bukan real-time.)"
        elif 'members' in context_data or 'trainers' in context_data or 'inventory' in context_data or 'product' in context_data:
             data_year_note = " (Perlu diketahui, data internal ini bersifat simulasi/dummy dan mungkin tidak real-time.)"


        base_prompt = f"""
Anda adalah asisten AI bernama GymTrack AI untuk aplikasi manajemen gym yang bernama GymTrack.
Tugas utama Anda adalah membantu pengguna mendapatkan informasi dan wawasan dari data internal gym mereka, serta memberikan saran dan tren umum terkait industri gym.

Pertanyaan pengguna: "{message}"
Intent yang terdeteksi: {intent}

Riwayat percakapan terbaru:
{chr(10).join(conversation_history[-5:]) if conversation_history else "Tidak ada riwayat percakapan."}

Data kontekstual internal gym yang tersedia:{data_year_note}
{json.dumps(context_data, indent=2, ensure_ascii=False)}

Berdasarkan pertanyaan pengguna, intent, riwayat percakapan, dan data kontekstual yang tersedia, berikan respons yang:
1.  **Ramah, profesional, dan relevan:** Pastikan nada dan isi respons sesuai dengan persona asisten AI gym.
2.  **Berbasis data internal (jika relevan):** Analisis data kontekstual yang diberikan untuk memberikan jawaban spesifik, metrik (seperti total member, member aktif, margin profit, dll.), dan ringkasan. Jika ada data, gunakan data tersebut sebagai dasar utama jawaban.
3.  **Memberikan wawasan dan saran (jika data internal tidak langsung menjawab):** Jika pertanyaan bersifat umum atau membutuhkan perspektif yang lebih luas (misalnya, "cara meningkatkan retensi member"), gunakan pengetahuan umum Anda tentang tren dan praktik terbaik di industri gym. Fokus pada informasi yang berguna dan relevan dengan pengelolaan gym.
4.  **Hanya membahas topik terkait gym/fitness:** Jawablah pertanyaan seputar manajemen gym, operasional, member, trainer, keuangan gym, tren fitness, dan hal-hal lain yang relevan dengan industri gym. **TOLONG JANGAN MENJAWAB PERTANYAAN DI LUAR KONTEKS GYM/FITNESS.**
5.  **Gunakan bahasa Indonesia yang alami dan mudah dipahami.**
6.  **Sertakan data sumber (jika digunakan):** Jika Anda merujuk pada data internal, sebutkan secara jelas bagian data mana yang Anda gunakan.

Jika tidak ada data internal yang relevan untuk menjawab pertanyaan secara spesifik, atau jika pertanyaan memerlukan pengetahuan eksternal, berikan jawaban berdasarkan pengetahuan umum Anda tentang industri gym, namun tetap dalam batasan topik gym/fitness.
Jika pertanyaan sama sekali tidak relevan dengan gym/fitness, atau jika Anda tidak bisa memberikan jawaban yang akurat, jelaskan dengan sopan bahwa Anda hanya dapat membantu dengan topik terkait gym.
"""
        return base_prompt