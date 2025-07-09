from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from decimal import Decimal

# ================================
# FINANCIAL SUMMARY
# ================================

class FinancialSummary(BaseModel):
    total_income: int
    total_expenses: int
    profit_margin: float
    income_trend: float
    expense_trend: float
    profit_margin_trend: float

# ================================
# CHART DATA TYPES
# ================================

class IncomeVsExpenseData(BaseModel):
    month: str
    income: int
    expenses: int

class BreakdownData(BaseModel):
    name: str
    value: float  # percentage
    amount: int
    color: str

# ================================
# TRANSACTION LIST
# ================================

class Transaction(BaseModel):
    id: str
    date: str
    type: str  # 'income' or 'expense'
    category: str
    amount: int
    payment_method: str
    description: Optional[str]
    status: str

# ================================
# AI INSIGHT
# ================================

class AIInsight(BaseModel):
    id: str
    type: str  # 'recommendation' or 'opportunity'
    title: str
    description: str
    impact: str  # 'low', 'medium', 'high'
    category: str
