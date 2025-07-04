# backend/app/models/workout_plan.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class WorkoutPlan(Base):
    __tablename__ = "workout_plan"
    plan_id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.member_id"))
    trainer_id = Column(Integer, ForeignKey("trainer.trainer_id"))
    start_date = Column(Date)
    end_date = Column(Date)
    goal = Column(String)

    member = relationship("Member", backref="workout_plans")
    trainer = relationship("Trainer", backref="assigned_workout_plans")