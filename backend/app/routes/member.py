from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

# CRUD
from app.crud.member import (
    get_member_stats,
    get_member_activity,
    get_member_segments,
    get_workout_time,
    get_conversion_funnel,
    get_notification_response,
    get_ab_test_data,
)

# Schemas
from app.schemas.member import (
    Insight,
    MemberStats,
    MemberActivity,
    SegmentData,
    WorkoutTime,
    FunnelStep,
    NotificationResponse,
    ABTestData,
)

# LLM Insight
from app.services.insight_generator import generate_insights

router = APIRouter()

# ===== Member Stats & AI Insight =====
@router.get("/insight/member", response_model=list[Insight])
async def member_insight(db: Session = Depends(get_db)):
    stats = get_member_stats(db)
    activity = get_member_activity(db)
    return await generate_insights(stats=stats, activity=activity)

@router.get("/stats/members", response_model=MemberStats)
def member_stats(db: Session = Depends(get_db)):
    return get_member_stats(db)

@router.get("/stats/member-activity", response_model=list[MemberActivity])
def member_activity(db: Session = Depends(get_db)):
    return get_member_activity(db)

# ===== Chart Data Endpoints =====
@router.get("/stats/member-segment", response_model=list[SegmentData])
def member_segments(db: Session = Depends(get_db)):
    return get_member_segments(db)

@router.get("/stats/workout-time", response_model=list[WorkoutTime])
def workout_time(db: Session = Depends(get_db)):
    return get_workout_time(db)

@router.get("/stats/conversion-funnel", response_model=list[FunnelStep])
def conversion_funnel(db: Session = Depends(get_db)):
    return get_conversion_funnel(db)

@router.get("/stats/notification-response", response_model=list[NotificationResponse])
def notification_response(db: Session = Depends(get_db)):
    return get_notification_response(db)

@router.get("/stats/ab-test", response_model=list[ABTestData])
def ab_test_data(db: Session = Depends(get_db)):
    return get_ab_test_data(db)
