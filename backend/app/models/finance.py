from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

# ========================
# INCOME TRANSACTION TABLE
# ========================
class IncomeTransaction(Base):
    __tablename__ = "income_transaction"

    income_id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(Date, nullable=False)
    income_type = Column(String(50), nullable=False)  # e.g. 'membership', 'personal_training'
    amount = Column(Float, nullable=False)
    payment_method = Column(String(20), nullable=False)  # e.g. 'cash', 'card', 'transfer'
    member_id = Column(Integer, ForeignKey("member.member_id"), nullable=True)
    description = Column(Text, nullable=True)
    reference_id = Column(Integer, nullable=True)  # optional foreign reference (e.g., to session/sale)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship ke member (opsional)
    member = relationship("Member", back_populates="income_transactions", lazy="joined")


# ==========================
# EXPENSE TRANSACTION TABLE
# ==========================
class ExpenseTransaction(Base):
    __tablename__ = "expense_transaction"

    expense_id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(Date, nullable=False)
    expense_category = Column(String(50), nullable=False)  # e.g. 'rent', 'marketing'
    amount = Column(Float, nullable=False)
    payment_method = Column(String(20), nullable=False)  # 'cash', 'card', 'transfer'
    vendor_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    receipt_number = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ======================
# BUDGET ALLOCATION TABLE
# ======================
class BudgetAllocation(Base):
    __tablename__ = "budget_allocation"
    __table_args__ = (
        UniqueConstraint('budget_year', 'budget_month', 'category', name='unique_budget_allocation'),
    )

    budget_id = Column(Integer, primary_key=True, index=True)
    budget_year = Column(Integer, nullable=False)
    budget_month = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)
    allocated_amount = Column(Float, nullable=False)
    actual_amount = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ========================
# FINANCIAL TARGETS TABLE
# ========================
class FinancialTarget(Base):
    __tablename__ = "financial_target"
    __table_args__ = (
        UniqueConstraint('target_year', 'target_month', 'target_type', name='unique_financial_target'),
    )

    target_id = Column(Integer, primary_key=True, index=True)
    target_year = Column(Integer, nullable=False)
    target_month = Column(Integer, nullable=False)
    target_type = Column(String(50), nullable=False)  # 'revenue', 'profit', etc
    target_value = Column(Float, nullable=False)
    actual_value = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
