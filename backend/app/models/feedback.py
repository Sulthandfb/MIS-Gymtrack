# app/models/feedback.py

from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey, DECIMAL, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Feedback(Base):
    __tablename__ = "feedback"

    feedback_id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.member_id"), nullable=True)
    feedback_date = Column(Date, nullable=False)
    feedback_type = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    rating = Column(DECIMAL(2,1), nullable=True)
    sentiment = Column(String(20), nullable=False)
    sentiment_score = Column(DECIMAL(3,2), default=0.0)
    is_processed_by_ai = Column(Boolean, default=False)
    processed_at = Column(DateTime, nullable=True)
    raw_llm_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # ✅ Pakai string untuk hindari circular import
    member = relationship("Member", back_populates="feedbacks")

    feedback_topics = relationship("FeedbackTopic", back_populates="feedback_rel", cascade="all, delete-orphan")


class FeedbackTopic(Base):
    __tablename__ = "feedback_topic"

    topic_id = Column(Integer, primary_key=True, index=True)
    feedback_id = Column(Integer, ForeignKey("feedback.feedback_id"), nullable=False)
    topic = Column(String(100), nullable=False)
    sentiment_score = Column(DECIMAL(3,2), default=0.0)
    confidence = Column(DECIMAL(3,2), default=0.0)
    created_at = Column(DateTime, default=datetime.now)

    feedback_rel = relationship("Feedback", back_populates="feedback_topics")


class SentimentTrend(Base):
    __tablename__ = "sentiment_trends"

    trend_id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    feedback_type = Column(String(50), nullable=False)
    positive_count = Column(Integer, default=0)
    neutral_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    avg_rating = Column(DECIMAL(3,2), default=0.0)
    created_at = Column(DateTime, default=datetime.now)

    __table_args__ = (
        UniqueConstraint('date', 'feedback_type', name='uq_sentiment_trends_date_type'),
    )
