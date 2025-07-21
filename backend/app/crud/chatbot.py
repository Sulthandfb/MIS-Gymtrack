from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from datetime import datetime, timedelta
from typing import List, Optional
import json
import decimal # Tambahkan import ini

from app.models.chatbot import ChatSession, ChatMessage
from app.schemas.chatbot import ChatSessionCreate, ChatMessageCreate

# Fungsi default encoder untuk menangani tipe Decimal
def json_encoder_default(obj):
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError(repr(obj) + " is not JSON serializable")

def create_chat_session(db: Session, session: ChatSessionCreate) -> ChatSession:
    db_session = ChatSession(**session.dict())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_chat_session(db: Session, session_id: int) -> Optional[ChatSession]:
    return db.query(ChatSession).filter(ChatSession.session_id == session_id).first()

def get_or_create_session(db: Session, user_id: Optional[str] = None) -> ChatSession:
    # Get active session for user or create new one
    if user_id:
        session = db.query(ChatSession).filter(
            and_(ChatSession.user_id == user_id, ChatSession.is_active == 1)
        ).first()
        if session:
            return session
    
    # Create new session
    new_session = ChatSessionCreate(user_id=user_id)
    return create_chat_session(db, new_session)

def create_chat_message(db: Session, message: ChatMessageCreate, session_id: int, context_data: Optional[dict] = None) -> ChatMessage:
    # Gunakan custom encoder saat mendumps context_data
    context_json = json.dumps(context_data, default=json_encoder_default) if context_data else None
    db_message = ChatMessage(
        session_id=session_id,
        content=message.content,
        message_type=message.message_type,
        context_data=context_json
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Update session last activity
    session = get_chat_session(db, session_id)
    if session:
        session.last_activity = datetime.now()
        db.commit()
    
    return db_message

def get_chat_history(db: Session, session_id: int, limit: int = 10) -> List[ChatMessage]:
    return db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(desc(ChatMessage.timestamp)).limit(limit).all()

def get_recent_messages(db: Session, session_id: int, limit: int = 5) -> List[ChatMessage]:
    return db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.timestamp).limit(limit).all()