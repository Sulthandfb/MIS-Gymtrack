from sqlalchemy import Column, Integer, String, Date, Enum
from sqlalchemy.ext.declarative import declarative_base
from app.database import Base, SessionLocal
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class Member(Base):
    __tablename__ = "member"
    member_id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    birth_date = Column(Date)
    join_date = Column(Date)
    membership_type = Column(String)
    membership_expiry = Column(Date)
    status = Column(String)

class MemberGoal(Base):
    __tablename__ = "member_goal"
    goal_id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.member_id"))
    goal_type = Column(String)  # Contoh: "Weight Loss", "Muscle Gain", "Endurance"
    target_date = Column(Date)
    initial_value = Column(Integer, nullable=True)
    target_value = Column(Integer, nullable=True)

    member = relationship("Member", backref="goals")
