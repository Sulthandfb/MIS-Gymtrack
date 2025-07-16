from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ChatSession(Base):
    __tablename__ = "chat_session"
    
    session_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), nullable=True)  # Optional user identification
    session_start = Column(DateTime(timezone=True), server_default=func.now())
    last_activity = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Integer, default=1)
    
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_message"
    
    message_id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_session.session_id"))
    message_type = Column(String(20), nullable=False)  # 'user' or 'bot'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    context_data = Column(Text, nullable=True)  # JSON string for context
    
    session = relationship("ChatSession", back_populates="messages")