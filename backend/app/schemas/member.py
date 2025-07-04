from pydantic import BaseModel
from typing import Optional, List

class Member(BaseModel):
    id: str
    name: str
    joinDate: str
    status: str

class SegmentData(BaseModel):
    name: str
    value: int
    color: str
    members: List[Member]

class WorkoutTime(BaseModel):
    time: str
    members: int

class FunnelStep(BaseModel):
    name: str
    value: int
    fill: str

class NotificationResponse(BaseModel):
    type: str
    responded: int
    ignored: int

class ABTestData(BaseModel):
    feature: str
    success: int
    total: int

class Insight(BaseModel):
    title: str
    text: str
    recommendation: Optional[str] = None
    borderColor: Optional[str] = None

class MemberStats(BaseModel):
    active: int
    retention: float
    new_members: int
    total: int

class MemberActivity(BaseModel):
    month: str
    value: int

class ChartSegmentMember(BaseModel):
    goal: str
    value: int
    color: str
    members: List[Member]

class ChartWorkoutTime(BaseModel):
    hour: str
    count: int

class ChartFunnel(BaseModel):
    stage: str
    value: int
    color: str

class ChartNotification(BaseModel):
    type: str
    responded: int
    ignored: int

class ChartABTest(BaseModel):
    variant: str
    success: int
    total: int

# Alias mapping for better naming in FastAPI routes
ChartSegment = SegmentData
ChartWorkout = WorkoutTime
ChartFunnelStep = FunnelStep
ChartNotifResponse = NotificationResponse
ChartABTesting = ABTestData
