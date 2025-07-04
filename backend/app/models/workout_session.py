# backend/app/models/workout_session.py
from sqlalchemy import Column, Integer, Date, Time, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class WorkoutSession(Base):
    __tablename__ = "workout_session"
    session_id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("workout_plan.plan_id"))
    session_date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    notes = Column(Text)
    # Jika ada trainer_id di tabel WorkoutSession (sesuai ERD), tambahkan ini
    # trainer_id = Column(Integer, ForeignKey("trainer.trainer_id"))

    workout_plan = relationship("WorkoutPlan", backref="sessions")
    # Jika ada trainer_id:
    # trainer = relationship("Trainer", backref="workout_sessions_conducted")