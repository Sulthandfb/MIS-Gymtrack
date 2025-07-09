from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from decimal import Decimal

# ========================================
# RESPONSE SCHEMAS
# ========================================
class FinanceOverviewStats(BaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float
    profit_margin: float
    monthly_growth: float

class RevenueBreakdown(BaseModel):
    membership: float
    personal_training: float
    class_fees: float
    product_sales: float

class ExpenseBreakdown(BaseModel):
    rent: float
    utilities: float
    staff_salary: float
    equipment: float
    marketing: float
    maintenance: float

class MonthlyTrendData(BaseModel):
    month: str
    revenue: float
    expenses: float
    profit: float

class CashFlowData(BaseModel):
    date: str
    cash_in: float
    cash_out: float
    net_flow: float
    cumulative: float

class BudgetVarianceData(BaseModel):
    category: str
    allocated: float
    actual: float
    variance: float
    variance_percentage: float

class FinancialTargetData(BaseModel):
    target_type: str
    target_value: float
    actual_value: float
    achievement_percentage: float
    status: str  # 'achieved', 'on_track', 'behind'

class PaymentMethodData(BaseModel):
    method: str
    amount: float
    percentage: float
    transaction_count: int

class FinanceInsight(BaseModel):
    title: str
    text: str
    recommendation: Optional[str] = None
    impact_level: str  # 'high', 'medium', 'low'
    category: str  # 'revenue', 'expense', 'profit', 'cash_flow'

# ========================================
# DETAILED TRANSACTION SCHEMAS
# ========================================
class IncomeTransactionResponse(BaseModel):
    income_id: int
    transaction_date: date
    income_type: str
    amount: Decimal
    payment_method: str
    member_id: Optional[int]
    description: Optional[str]
    
    class Config:
        from_attributes = True

class ExpenseTransactionResponse(BaseModel):
    expense_id: int
    transaction_date: date
    expense_category: str
    amount: Decimal
    payment_method: str
    vendor_name: Optional[str]
    description: Optional[str]
    receipt_number: Optional[str]
    
    class Config:
        from_attributes = True

class BudgetAllocationResponse(BaseModel):
    budget_id: int
    budget_year: int
    budget_month: int
    category: str
    allocated_amount: Decimal
    actual_amount: Decimal
    
    class Config:
        from_attributes = True

class FinancialTargetResponse(BaseModel):
    target_id: int
    target_year: int
    target_month: int
    target_type: str
    target_value: Decimal
    actual_value: Decimal
    
    class Config:
        from_attributes = True

# ========================================
# FILTER SCHEMAS
# ========================================
class FinanceFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    income_type: Optional[str] = None
    expense_category: Optional[str] = None
    payment_method: Optional[str] = None

class DateRangeFilter(BaseModel):
    period: str = "12months"  # '1month', '3months', '6months', '12months', 'ytd', 'custom'
    start_date: Optional[date] = None
    end_date: Optional[date] = None

# ========================================
# PREDICTION SCHEMAS
# ========================================
class CashFlowPrediction(BaseModel):
    month: str
    predicted_revenue: float
    predicted_expenses: float
    predicted_profit: float
    confidence_level: float

class FinancialForecast(BaseModel):
    period: str
    predictions: List[CashFlowPrediction]
    key_assumptions: List[str]
    risk_factors: List[str]
