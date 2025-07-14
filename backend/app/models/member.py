# app/models/member.py

from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.finance import IncomeTransaction
from app.models.product import Sale

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

    # ✅ Pakai string agar aman dari circular import
    feedbacks = relationship("Feedback", back_populates="member")

    income_transactions = relationship(IncomeTransaction, back_populates="member")
    goals = relationship("MemberGoal", back_populates="member")
    sales = relationship(Sale, back_populates="member")


class MemberGoal(Base):
    __tablename__ = "member_goal"

    goal_id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("member.member_id"))
    goal_type = Column(String)
    target_date = Column(Date)
    initial_value = Column(Integer, nullable=True)
    target_value = Column(Integer, nullable=True)

    member = relationship("Member", back_populates="goals")
