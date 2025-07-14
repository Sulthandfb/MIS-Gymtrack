# backend/app/crud/feedback.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text, and_, extract
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional, Tuple

from app.models.feedback import Feedback, FeedbackTopic, SentimentTrend
from app.models.member import Member # Assuming Member model is in app.models.member
from app.schemas.feedback import (
    FeedbackCreate, FeedbackUpdate,
    FeedbackTopicCreate, FeedbackTopicUpdate,
    SentimentTrendCreate, SentimentTrendUpdate,
    SentimentDistribution, TopicAnalysisItem, DailySentimentTrend, AIInsight,
    FeedbackListItem, FeedbackDashboardSummary
)

# --- Helper Functions ---
def get_feedback_by_id(db: Session, feedback_id: int):
    return db.query(Feedback).options(joinedload(Feedback.member)).filter(Feedback.feedback_id == feedback_id).first()

def get_feedback_topic_by_id(db: Session, topic_id: int):
    return db.query(FeedbackTopic).filter(FeedbackTopic.topic_id == topic_id).first()

def get_sentiment_trend_by_date_type(db: Session, trend_date: date, feedback_type: str):
    return db.query(SentimentTrend).filter(
        and_(SentimentTrend.date == trend_date, SentimentTrend.feedback_type == feedback_type)
    ).first()

# --- CRUD for Feedback ---
def get_feedback_list(
    db: Session, 
    member_id: Optional[int] = None, 
    feedback_type: Optional[str] = None, 
    sentiment: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search_query: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[FeedbackListItem]:
    query = db.query(Feedback).options(joinedload(Feedback.member))

    if member_id:
        query = query.filter(Feedback.member_id == member_id)
    if feedback_type:
        query = query.filter(Feedback.feedback_type == feedback_type)
    if sentiment:
        query = query.filter(Feedback.sentiment == sentiment)
    if start_date:
        query = query.filter(Feedback.feedback_date >= start_date)
    if end_date:
        query = query.filter(Feedback.feedback_date <= end_date)
    if search_query:
        query = query.filter(Feedback.content.ilike(f"%{search_query}%"))
    
    feedbacks = query.order_by(Feedback.feedback_date.desc(), Feedback.created_at.desc()).offset(skip).limit(limit).all()
    
    # Format for FeedbackListItem schema
    result_list = []
    for fb in feedbacks:
        result_list.append(FeedbackListItem(
            feedback_id=fb.feedback_id,
            member_id=fb.member_id,
            member_name=fb.member.name if fb.member else "Unknown Member", # Assuming Member model has 'name'
            feedback_date=fb.feedback_date,
            feedback_type=fb.feedback_type,
            content=fb.content,
            rating=float(fb.rating), # Ensure float type
            sentiment=fb.sentiment,
            sentiment_score=float(fb.sentiment_score) # Ensure float type
        ))
    return result_list


def create_feedback(db: Session, feedback: FeedbackCreate) -> Feedback:
    db_feedback = Feedback(**feedback.model_dump(exclude_unset=True))
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def update_feedback(db: Session, feedback_id: int, feedback: FeedbackUpdate) -> Optional[Feedback]:
    db_feedback = db.query(Feedback).filter(Feedback.feedback_id == feedback_id).first()
    if db_feedback:
        for key, value in feedback.model_dump(exclude_unset=True).items():
            setattr(db_feedback, key, value)
        db.commit()
        db.refresh(db_feedback)
    return db_feedback

def delete_feedback(db: Session, feedback_id: int) -> Optional[Feedback]:
    db_feedback = db.query(Feedback).filter(Feedback.feedback_id == feedback_id).first()
    if db_feedback:
        db.delete(db_feedback)
        db.commit()
    return db_feedback

# --- CRUD for FeedbackTopic ---
def get_feedback_topics_for_feedback(db: Session, feedback_id: int) -> List[FeedbackTopic]:
    return db.query(FeedbackTopic).filter(FeedbackTopic.feedback_id == feedback_id).all()

def create_feedback_topic(db: Session, topic: FeedbackTopicCreate) -> FeedbackTopic:
    db_topic = FeedbackTopic(**topic.model_dump())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

def update_feedback_topic(db: Session, topic_id: int, topic: FeedbackTopicUpdate) -> Optional[FeedbackTopic]:
    db_topic = db.query(FeedbackTopic).filter(FeedbackTopic.topic_id == topic_id).first()
    if db_topic:
        for key, value in topic.model_dump(exclude_unset=True).items():
            setattr(db_topic, key, value)
        db.commit()
        db.refresh(db_topic)
    return db_topic

def delete_feedback_topic(db: Session, topic_id: int) -> Optional[FeedbackTopic]:
    db_topic = db.query(FeedbackTopic).filter(FeedbackTopic.topic_id == topic_id).first()
    if db_topic:
        db.delete(db_topic)
        db.commit()
    return db_topic

# --- CRUD for SentimentTrend ---
def get_sentiment_trends(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None, feedback_type: Optional[str] = None) -> List[SentimentTrend]:
    query = db.query(SentimentTrend)
    if start_date:
        query = query.filter(SentimentTrend.date >= start_date)
    if end_date:
        query = query.filter(SentimentTrend.date <= end_date)
    if feedback_type:
        query = query.filter(SentimentTrend.feedback_type == feedback_type)
    return query.order_by(SentimentTrend.date).all()

def create_sentiment_trend(db: Session, trend: SentimentTrendCreate) -> SentimentTrend:
    db_trend = SentimentTrend(**trend.model_dump())
    db.add(db_trend)
    db.commit()
    db.refresh(db_trend)
    return db_trend

# --- Dashboard Data Aggregation Functions ---

def get_sentiment_dashboard_summary(db: Session) -> FeedbackDashboardSummary:
    total_feedback = db.query(func.count(Feedback.feedback_id)).scalar() or 0
    positive_count = db.query(func.count(Feedback.feedback_id)).filter(Feedback.sentiment == 'Positive').scalar() or 0
    neutral_count = db.query(func.count(Feedback.feedback_id)).filter(Feedback.sentiment == 'Neutral').scalar() or 0
    negative_count = db.query(func.count(Feedback.feedback_id)).filter(Feedback.sentiment == 'Negative').scalar() or 0
    
    avg_rating = db.query(func.avg(Feedback.rating)).scalar()
    avg_rating = float(avg_rating) if avg_rating is not None else 0.0

    positive_percentage = (positive_count / total_feedback * 100) if total_feedback > 0 else 0.0
    neutral_percentage = (neutral_count / total_feedback * 100) if total_feedback > 0 else 0.0
    negative_percentage = (negative_count / total_feedback * 100) if total_feedback > 0 else 0.0

    # For latest_ai_insight, we'll need to fetch from a dedicated AI insights log or generate one dynamically
    # For now, return None or a placeholder. Real insights generated by sentiment_ai_analyzer.
    latest_ai_insight_data = None # This will be populated by the AI service

    return FeedbackDashboardSummary(
        total_feedback=total_feedback,
        positive_count=positive_count,
        neutral_count=neutral_count,
        negative_count=negative_count,
        positive_percentage=round(positive_percentage, 1),
        neutral_percentage=round(neutral_percentage, 1),
        negative_percentage=round(negative_percentage, 1),
        avg_rating=round(avg_rating, 1),
        latest_ai_insight=latest_ai_insight_data # Will be filled by router or AI service
    )

def get_sentiment_distribution_data(db: Session) -> List[SentimentDistribution]:
    # Aggregates feedback counts by sentiment
    results = db.query(
        Feedback.sentiment,
        func.count(Feedback.feedback_id).label("count")
    ).group_by(Feedback.sentiment).all()

    total_count = sum(r.count for r in results)
    
    distribution = []
    for r in results:
        distribution.append(SentimentDistribution(
            sentiment=r.sentiment,
            count=r.count,
            percentage=round((r.count / total_count * 100) if total_count > 0 else 0.0, 1)
        ))
    return distribution


def get_topic_analysis_data(db: Session) -> List[TopicAnalysisItem]:
    # Aggregates topic frequency and average sentiment score for each topic
    results = db.query(
        FeedbackTopic.topic,
        func.count(FeedbackTopic.topic_id).label("frequency"),
        func.avg(FeedbackTopic.sentiment_score).label("avg_sentiment_score")
    ).group_by(FeedbackTopic.topic).order_by(func.count(FeedbackTopic.topic_id).desc()).all()

    topic_items = []
    for r in results:
        topic_items.append(TopicAnalysisItem(
            topic=r.topic,
            frequency=r.frequency,
            sentiment_score=float(r.avg_sentiment_score) # Ensure float type
        ))
    return topic_items


def get_daily_sentiment_trend_data(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[DailySentimentTrend]:
    # Fetches aggregated data from SentimentTrend table
    query = db.query(SentimentTrend)
    
    # Define a default range if no dates are provided (e.g., last 30 days or all data)
    if start_date is None:
        min_date_result = db.query(func.min(SentimentTrend.date)).scalar()
        start_date = min_date_result if min_date_result else date.today() - timedelta(days=30)
    if end_date is None:
        max_date_result = db.query(func.max(SentimentTrend.date)).scalar()
        end_date = max_date_result if max_date_result else date.today()

    query = query.filter(and_(SentimentTrend.date >= start_date, SentimentTrend.date <= end_date))
    trends = query.order_by(SentimentTrend.date).all()
    
    # Format for DailySentimentTrend schema
    result_list = []
    # Generate all dates in range to ensure continuity for chart (fill missing dates with zeros)
    current_date_iter = start_date
    all_dates_data = {t.date: t for t in trends} # Map existing data by date
    
    while current_date_iter <= end_date:
        trend_data = all_dates_data.get(current_date_iter)
        if trend_data:
            result_list.append(DailySentimentTrend(
                date=trend_data.date,
                feedback_type=trend_data.feedback_type, # Note: This will only pick one type if multiple per day
                positive=trend_data.positive_count,
                neutral=trend_data.neutral_count,
                negative=trend_data.negative_count,
                total=trend_data.total_count,
                avg_rating=float(trend_data.avg_rating)
            ))
        else:
            # Fill missing dates with zero counts
            result_list.append(DailySentimentTrend(
                date=current_date_iter,
                feedback_type="N/A", # Placeholder
                positive=0, neutral=0, negative=0, total=0, avg_rating=0.0
            ))
        current_date_iter += timedelta(days=1)
        
    return result_list

# Helper for filter dropdowns
def get_all_feedback_types(db: Session) -> List[str]:
    # This assumes feedback_type values are fixed by the CHECK constraint
    return ['Class', 'Trainer', 'Facility', 'General']

def get_all_member_names(db: Session) -> List[str]:
    results = db.query(Member.name).order_by(Member.name).all()
    return [r.name for r in results if r.name]