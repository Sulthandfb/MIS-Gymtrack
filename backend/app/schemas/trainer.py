# backend/app/schemas/trainer.py
from pydantic import BaseModel
from typing import Optional, List # Pastikan List ada di sini
from datetime import date, time # Tambahkan time untuk jadwal

# --- Model yang sudah ada ---
class TrainerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[date] = None
    join_date: Optional[date] = None
    specialization: str
    certification: Optional[str] = None
    hourly_rate: float
    rating: float
    status: Optional[str] = None
    profile_image: Optional[str] = None
    bio: Optional[str] = None

class TrainerCreate(TrainerBase):
    pass

class Trainer(TrainerBase):
    trainer_id: int

    class Config:
        from_attributes = True

class TrainerPerformance(BaseModel):
    id: int
    name: str
    specialization: str
    classes: int
    feedback: float
    retention: float
    activeMembers: int
    status: str
    experience: str

    class Config:
        from_attributes = True

# --- Model Baru untuk Dashboard Data ---
class TrainerStats(BaseModel):
    weekly_classes: int
    active_trainers: int
    high_engagement_classes: int
    avg_satisfaction: float

class TrainerClassParticipantsData(BaseModel):
    trainer: str
    strength: int
    yoga: int
    cardio: int
    pilates: int

class TrainerSatisfactionTrendData(BaseModel):
    week: str
    class Config:
        extra = "allow"

class TrainerClassTypeData(BaseModel):
    name: str
    value: float
    color: str

class TrainerCourseComparisonData(BaseModel):
    type: str
    offline: int
    online: int

class TrainerInsightItem(BaseModel):
    icon_name: str
    title: str
    message: str
    type: str
    color: str

class TrainerAlertItem(BaseModel):
    icon_name: str
    title: str
    message: str
    action: str
    priority: str

# Model Utama untuk semua data Dashboard Trainer
class TrainerDashboardData(BaseModel):
    stats: TrainerStats
    classParticipantsData: List[TrainerClassParticipantsData]
    satisfactionTrendData: List[TrainerSatisfactionTrendData]
    classTypeData: List[TrainerClassTypeData]
    courseComparisonData: List[TrainerCourseComparisonData]
    trainerPerformanceData: List[TrainerPerformance]
    insights: List[TrainerInsightItem]
    alerts: List[TrainerAlertItem]

    class Config:
        from_attributes = True

# --- Skema Baru untuk Trainer Detail Page ---

class TrainerActivityDataItem(BaseModel):
    date: str # Akan dalam format YYYY-MM-DD
    kehadiran: int
    kepuasan: float
    engagement: float

    class Config:
        from_attributes = True

class TrainerScheduleClassItem(BaseModel):
    id: int # schedule_id
    name: str # class name
    time: str # "HH:MM - HH:MM"
    duration: str # "XX min"
    location: str
    participants: str # "X/Y"
    available: int
    type: str # Class type, e.g., "Strength"
    day_of_week: str # e.g., "Senin", "Selasa"

    class Config:
        from_attributes = True