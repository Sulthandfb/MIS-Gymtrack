# backend/app/routes/feedback.py

from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.crud import feedback as crud_feedback
from app.services import sentiment_ai_analyzer # Import the AI analyzer service
from app.schemas.feedback import (
    Feedback, FeedbackCreate, FeedbackUpdate, FeedbackListItem,
    FeedbackTopic, FeedbackTopicCreate, FeedbackTopicUpdate,
    SentimentTrend, SentimentTrendCreate, SentimentTrendUpdate,
    FeedbackDashboardSummary, SentimentDistribution, TopicAnalysisItem, DailySentimentTrend, AIInsight
)

router = APIRouter()

# --- Dashboard Overview Endpoints ---
@router.get("/summary", response_model=FeedbackDashboardSummary)
async def get_feedback_dashboard_summary(db: Session = Depends(get_db)):
    """Get overall sentiment summary for the dashboard."""
    try:
        summary_data = crud_feedback.get_sentiment_dashboard_summary(db)
        return summary_data
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch feedback summary: {e}")

@router.get("/sentiment-distribution", response_model=List[SentimentDistribution])
async def get_sentiment_distribution(db: Session = Depends(get_db)):
    """Get sentiment distribution data for bar chart."""
    try:
        return crud_feedback.get_sentiment_distribution_data(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch sentiment distribution: {e}")

@router.get("/topic-analysis", response_model=List[TopicAnalysisItem])
async def get_topic_analysis(db: Session = Depends(get_db)):
    """Get topic analysis data for bubble chart."""
    try:
        return crud_feedback.get_topic_analysis_data(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch topic analysis: {e}")

@router.get("/sentiment-trends", response_model=List[DailySentimentTrend])
async def get_daily_sentiment_trends(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD) for trend data"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD) for trend data"),
    db: Session = Depends(get_db)
):
    """Get daily sentiment trend data for line chart."""
    try:
        return crud_feedback.get_daily_sentiment_trend_data(db, start_date=start_date, end_date=end_date)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch daily sentiment trends: {e}")

@router.get("/recent-feedback", response_model=List[FeedbackListItem])
async def get_recent_feedback(limit: int = Query(10, ge=1), db: Session = Depends(get_db)):
    """Get recent feedback items for the dashboard list."""
    try:
        return crud_feedback.get_feedback_list(db, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch recent feedback: {e}")

@router.get("/feedback-types", response_model=List[str])
async def get_feedback_types(db: Session = Depends(get_db)):
    """Get all available feedback types for filters."""
    return crud_feedback.get_all_feedback_types(db)

@router.get("/member-names", response_model=List[str])
async def get_member_names(db: Session = Depends(get_db)):
    """Get all member names for filters."""
    return crud_feedback.get_all_member_names(db)

# --- AI Insights Endpoints ---
@router.get("/ai-insights/overall", response_model=List[AIInsight])
async def get_overall_ai_insights(db: Session = Depends(get_db)):
    """Generate and retrieve overall AI insights for feedback."""
    try:
        return await sentiment_ai_analyzer.generate_overall_ai_insights(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate overall AI insights: {e}")

@router.get("/ai-recommendations", response_model=Dict[str, Any])
async def get_ai_recommendations(db: Session = Depends(get_db)):
    """Generate AI-powered recommendations based on sentiment analysis."""
    try:
        return await sentiment_ai_analyzer.generate_ai_recommendations(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate AI recommendations: {e}")

@router.get("/monthly-sentiment-trends", response_model=List[Dict[str, Any]])
async def get_monthly_sentiment_trends(
    year: int = Query(2024, description="Year for monthly trends"),
    db: Session = Depends(get_db)
):
    """Get monthly sentiment trends for a specific year."""
    try:
        return crud_feedback.get_monthly_sentiment_trends(db, year=year)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch monthly sentiment trends: {e}")

@router.get("/topic-sentiment-comparison", response_model=Dict[str, List[Dict[str, Any]]])
async def get_topic_sentiment_comparison(
    year: int = Query(2024, description="Year for topic comparison"),
    db: Session = Depends(get_db)
):
    """Get topic sentiment comparison between first and second half of year."""
    try:
        return crud_feedback.get_topic_sentiment_comparison(db, year=year)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch topic sentiment comparison: {e}")

@router.post("/process-ai-batch", response_model=Dict[str, int], status_code=status.HTTP_200_OK)
async def process_feedback_with_ai(limit: int = Query(10, ge=1), db: Session = Depends(get_db)):
    """Trigger AI processing for a batch of unprocessed feedback."""
    try:
        processed_count = await sentiment_ai_analyzer.analyze_and_process_feedback_batch(db, limit=limit)
        return {"processed_count": processed_count}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to process feedback with AI: {e}")

# --- Basic CRUD for Feedback (for management, if needed) ---
@router.get("/list", response_model=List[FeedbackListItem])
async def get_all_feedback(
    member_id: Optional[int] = Query(None), 
    feedback_type: Optional[str] = Query(None), 
    sentiment: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    search_query: Optional[str] = Query(None),
    skip: int = Query(0, ge=0), 
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get a comprehensive list of feedback with filters."""
    return crud_feedback.get_feedback_list(
        db, member_id, feedback_type, sentiment, start_date, end_date, search_query, skip, limit
    )

@router.get("/{feedback_id}", response_model=Feedback)
async def get_feedback(feedback_id: int, db: Session = Depends(get_db)):
    """Get a single feedback item by ID."""
    feedback_item = crud_feedback.get_feedback_by_id(db, feedback_id)
    if not feedback_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    return feedback_item

@router.post("/", response_model=Feedback, status_code=status.HTTP_201_CREATED)
async def create_new_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    """Create a new feedback item."""
    return crud_feedback.create_feedback(db, feedback)

@router.put("/{feedback_id}", response_model=Feedback)
async def update_existing_feedback(feedback_id: int, feedback: FeedbackUpdate, db: Session = Depends(get_db)):
    """Update an existing feedback item."""
    updated_feedback = crud_feedback.update_feedback(db, feedback_id, feedback)
    if not updated_feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    return updated_feedback

@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback_item(feedback_id: int, db: Session = Depends(get_db)):
    """Delete a feedback item."""
    deleted_feedback = crud_feedback.delete_feedback(db, feedback_id)
    if not deleted_feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)