# backend/app/schemas/feedback.py

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List, Dict, Any

# Assuming member schema exists for nested relationships
from app.schemas.member import Member # Import Member schema for nested relationships

# --- Feedback Schemas ---
class FeedbackBase(BaseModel):
    member_id: Optional[int] = None # Optional because member might be deleted or not linked
    feedback_date: date
    feedback_type: str = Field(..., max_length=50) # 'Class', 'Trainer', 'Facility', 'General'
    content: str
    rating: float = Field(..., ge=1.0, le=5.0) # Use float for DECIMAL(2,1)
    sentiment: str = Field(..., max_length=20) # 'Positive', 'Neutral', 'Negative'
    sentiment_score: float = Field(0.0, ge=-1.0, le=1.0) # DECIMAL(3,2)
    is_processed_by_ai: bool = False
    processed_at: Optional[datetime] = None
    raw_llm_response: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackUpdate(BaseModel):
    feedback_date: Optional[date] = None
    feedback_type: Optional[str] = Field(None, max_length=50)
    content: Optional[str] = None
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    sentiment: Optional[str] = Field(None, max_length=20)
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0)
    is_processed_by_ai: Optional[bool] = None
    processed_at: Optional[datetime] = None
    raw_llm_response: Optional[str] = None

class Feedback(FeedbackBase):
    feedback_id: int
    created_at: datetime
    updated_at: datetime

    # Nested relationship
    member: Optional[Member] # Member can be optional if member_id is nullable or member might not exist

    class Config:
        from_attributes = True

# --- Feedback Topic Schemas ---
class FeedbackTopicBase(BaseModel):
    feedback_id: int
    topic: str = Field(..., max_length=100)
    sentiment_score: float = Field(0.0, ge=-1.0, le=1.0)
    confidence: float = Field(0.0, ge=0.0, le=1.0)

class FeedbackTopicCreate(FeedbackTopicBase):
    pass

class FeedbackTopicUpdate(BaseModel):
    topic: Optional[str] = Field(None, max_length=100)
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0)
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)

class FeedbackTopic(FeedbackTopicBase):
    topic_id: int
    created_at: datetime

    # No direct back_populates to Feedback needed for this schema response usually
    class Config:
        from_attributes = True

# --- Sentiment Trend Schemas ---
class SentimentTrendBase(BaseModel):
    date: date
    feedback_type: str = Field(..., max_length=50)
    positive_count: int = Field(0, ge=0)
    neutral_count: int = Field(0, ge=0)
    negative_count: int = Field(0, ge=0)
    total_count: int = Field(0, ge=0)
    avg_rating: float = Field(0.0, ge=1.0, le=5.0)

class SentimentTrendCreate(SentimentTrendBase):
    pass

# ✅ FIXED: SentimentTrendUpdate defined and exported here
class SentimentTrendUpdate(BaseModel):
    trend_date: Optional[date] = None
    feedback_type: Optional[str] = Field(None, max_length=50)
    positive_count: Optional[int] = Field(None, ge=0)
    neutral_count: Optional[int] = Field(None, ge=0)
    negative_count: Optional[int] = Field(None, ge=0)
    total_count: Optional[int] = Field(None, ge=0)
    avg_rating: Optional[float] = Field(None, ge=1.0, le=5.0)

class SentimentTrend(SentimentTrendBase):
    trend_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Dashboard Specific Schemas ---

# For Sentiment Bar Chart (Distribution)
class SentimentDistribution(BaseModel):
    sentiment: str
    count: int
    percentage: float

# For Bubble Chart (Topics)
class TopicAnalysisItem(BaseModel):
    topic: str
    frequency: int
    sentiment_score: float # avg_sentiment_score for topic

# For Sentiment Trend Line Chart
class DailySentimentTrend(BaseModel):
    date: date
    feedback_type: str # The type this trend aggregates
    positive: int # Renamed from positive_count in backend for chart clarity
    neutral: int   # Renamed from neutral_count
    negative: int  # Renamed from negative_count
    total: int     # Renamed from total_count
    avg_rating: float

# For AI Insights (from LLM)
class AIInsight(BaseModel): # Re-use or adapt from insight types if needed
    insight_type: str = Field(..., description="e.g., 'trend', 'issue', 'strength', 'opportunity'")
    title: str
    description: str
    impact: str = Field(..., description="e.g., 'Positive', 'Negative', 'Neutral'")
    recommendation: str
    confidence: float = Field(..., ge=0.0, le=1.0)

# For Feedback List
class FeedbackListItem(BaseModel):
    feedback_id: int
    member_id: Optional[int]
    member_name: Optional[str] # Assuming we can join to get member name
    feedback_date: date
    feedback_type: str
    content: str
    rating: float
    sentiment: str
    sentiment_score: float

    class Config:
        from_attributes = True

# Main Dashboard Response Types
class FeedbackDashboardSummary(BaseModel):
    total_feedback: int
    positive_count: int
    neutral_count: int
    negative_count: int
    positive_percentage: float # float
    neutral_percentage: float # float
    negative_percentage: float # float
    avg_rating: float # float
    latest_ai_insight: Optional[AIInsight] # For the top right card

# Combined interface for initial dashboard data fetch
class FeedbackDashboardData(BaseModel):
    summary: FeedbackDashboardSummary
    sentiment_distribution: List[SentimentDistribution] # For bar chart
    topic_analysis: List[TopicAnalysisItem] # For bubble chart
    sentiment_trend_daily: List[DailySentimentTrend] # For line chart
    recent_feedback: List[FeedbackListItem]
    all_ai_insights: List[AIInsight] # All insights for the scrollable list
    feedback_types: List[str] # For filters
    member_names: List[str] # For filters, if relevant