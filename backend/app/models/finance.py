from sqlalchemy import Column, Integer, String, DECIMAL, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class IncomeTransaction(Base):
    __tablename__ = "income_transaction"
    
    income_id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(Date, nullable=False, index=True)
    income_type = Column(String(50), nullable=False, index=True)  # 'membership', 'personal_training', 'class_fee', 'product_sale'
    amount = Column(DECIMAL(12, 2), nullable=False)
    payment_method = Column(String(20), nullable=False)  # 'cash', 'card', 'transfer'
    member_id = Column(Integer, ForeignKey("member.member_id"), nullable=True)
    description = Column(Text, nullable=True)
    reference_id = Column(Integer, nullable=True)  # ID referensi ke tabel lain
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationship
    member = relationship("Member", back_populates="income_transactions")

class ExpenseTransaction(Base):
    __tablename__ = "expense_transaction"
    
    expense_id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(Date, nullable=False, index=True)
    expense_category = Column(String(50), nullable=False, index=True)  # 'rent', 'utilities', 'equipment', 'staff_salary', 'marketing', 'maintenance'
    amount = Column(DECIMAL(12, 2), nullable=False)
    payment_method = Column(String(20), nullable=False)
    vendor_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    receipt_number = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class BudgetAllocation(Base):
    __tablename__ = "budget_allocation"
    
    budget_id = Column(Integer, primary_key=True, index=True)
    budget_year = Column(Integer, nullable=False, index=True)
    budget_month = Column(Integer, nullable=False, index=True)
    category = Column(String(50), nullable=False)
    allocated_amount = Column(DECIMAL(12, 2), nullable=False)
    actual_amount = Column(DECIMAL(12, 2), default=0)
    created_at = Column(DateTime, server_default=func.now())

class FinancialTarget(Base):
    __tablename__ = "financial_target"
    
    target_id = Column(Integer, primary_key=True, index=True)
    target_year = Column(Integer, nullable=False, index=True)
    target_month = Column(Integer, nullable=False, index=True)
    target_type = Column(String(50), nullable=False)  # 'revenue', 'profit', 'member_growth', 'retention_rate'
    target_value = Column(DECIMAL(12, 2), nullable=False)
    actual_value = Column(DECIMAL(12, 2), default=0)
    created_at = Column(DateTime, server_default=func.now())
