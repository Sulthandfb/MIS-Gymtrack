from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_, extract, case, text
from datetime import datetime, timedelta, date
from typing import List, Optional, Dict, Any
import calendar

from app.models.finance import IncomeTransaction, ExpenseTransaction, BudgetAllocation, FinancialTarget
from app.models.member import Member
from app.schemas.finance import (
    FinanceOverviewStats, RevenueBreakdown, ExpenseBreakdown, MonthlyTrendData,
    CashFlowData, BudgetVarianceData, FinancialTargetData, PaymentMethodData,
    FinanceInsight, DateRangeFilter, CashFlowPrediction, FinancialForecast
)

# ========================================
# OVERVIEW DASHBOARD FUNCTIONS
# ========================================
def get_finance_overview_stats(db: Session, date_filter: DateRangeFilter) -> FinanceOverviewStats:
    """Get finance overview statistics for dashboard cards"""
    
    start_date, end_date = _get_date_range(date_filter)
    
    # Total revenue
    total_revenue = db.query(func.sum(IncomeTransaction.amount)).filter(
        IncomeTransaction.transaction_date >= start_date,
        IncomeTransaction.transaction_date <= end_date
    ).scalar() or 0
    
    # Total expenses
    total_expenses = db.query(func.sum(ExpenseTransaction.amount)).filter(
        ExpenseTransaction.transaction_date >= start_date,
        ExpenseTransaction.transaction_date <= end_date
    ).scalar() or 0
    
    # Net profit
    net_profit = float(total_revenue) - float(total_expenses)
    
    # Profit margin
    profit_margin = (net_profit / float(total_revenue)) * 100 if total_revenue > 0 else 0
    
    # Monthly growth (compare with previous period)
    prev_start, prev_end = _get_previous_period(start_date, end_date)
    prev_revenue = db.query(func.sum(IncomeTransaction.amount)).filter(
        IncomeTransaction.transaction_date >= prev_start,
        IncomeTransaction.transaction_date <= prev_end
    ).scalar() or 0
    
    monthly_growth = ((float(total_revenue) - float(prev_revenue)) / float(prev_revenue)) * 100 if prev_revenue > 0 else 0
    
    return FinanceOverviewStats(
        total_revenue=float(total_revenue),
        total_expenses=float(total_expenses),
        net_profit=net_profit,
        profit_margin=round(profit_margin, 2),
        monthly_growth=round(monthly_growth, 2)
    )

def get_revenue_breakdown(db: Session, date_filter: DateRangeFilter) -> RevenueBreakdown:
    """Get revenue breakdown by income type"""
    
    start_date, end_date = _get_date_range(date_filter)
    
    revenue_data = db.query(
        IncomeTransaction.income_type,
        func.sum(IncomeTransaction.amount).label('total')
    ).filter(
        IncomeTransaction.transaction_date >= start_date,
        IncomeTransaction.transaction_date <= end_date
    ).group_by(IncomeTransaction.income_type).all()
    
    breakdown = {
        'membership': 0,
        'personal_training': 0,
        'class_fees': 0,
        'product_sales': 0
    }
    
    for income_type, total in revenue_data:
        if income_type == 'membership':
            breakdown['membership'] = float(total)
        elif income_type == 'personal_training':
            breakdown['personal_training'] = float(total)
        elif income_type == 'class_fee':
            breakdown['class_fees'] = float(total)
        elif income_type == 'product_sale':
            breakdown['product_sales'] = float(total)
    
    return RevenueBreakdown(**breakdown)

def get_expense_breakdown(db: Session, date_filter: DateRangeFilter) -> ExpenseBreakdown:
    """Get expense breakdown by category"""
    
    start_date, end_date = _get_date_range(date_filter)
    
    expense_data = db.query(
        ExpenseTransaction.expense_category,
        func.sum(ExpenseTransaction.amount).label('total')
    ).filter(
        ExpenseTransaction.transaction_date >= start_date,
        ExpenseTransaction.transaction_date <= end_date
    ).group_by(ExpenseTransaction.expense_category).all()
    
    breakdown = {
        'rent': 0,
        'utilities': 0,
        'staff_salary': 0,
        'equipment': 0,
        'marketing': 0,
        'maintenance': 0
    }
    
    for category, total in expense_data:
        if category in breakdown:
            breakdown[category] = float(total)
    
    return ExpenseBreakdown(**breakdown)

def get_monthly_trend(db: Session, months: int = 12) -> List[MonthlyTrendData]:
    """Get monthly revenue, expense, and profit trend"""
    
    end_date = datetime.now().date()
    start_date = end_date.replace(day=1) - timedelta(days=30 * (months - 1))
    
    # Generate month range
    month_range = []
    current_date = start_date.replace(day=1)
    while current_date <= end_date:
        month_range.append(current_date)
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)
    
    # Get revenue data
    revenue_data = db.query(
        extract('year', IncomeTransaction.transaction_date).label('year'),
        extract('month', IncomeTransaction.transaction_date).label('month'),
        func.sum(IncomeTransaction.amount).label('revenue')
    ).filter(
        IncomeTransaction.transaction_date >= start_date
    ).group_by('year', 'month').all()
    
    # Get expense data
    expense_data = db.query(
        extract('year', ExpenseTransaction.transaction_date).label('year'),
        extract('month', ExpenseTransaction.transaction_date).label('month'),
        func.sum(ExpenseTransaction.amount).label('expenses')
    ).filter(
        ExpenseTransaction.transaction_date >= start_date
    ).group_by('year', 'month').all()
    
    # Create lookup dictionaries
    revenue_dict = {(int(year), int(month)): float(revenue) for year, month, revenue in revenue_data}
    expense_dict = {(int(year), int(month)): float(expenses) for year, month, expenses in expense_data}
    
    # Generate result
    result = []
    for month_date in month_range:
        key = (month_date.year, month_date.month)
        revenue = revenue_dict.get(key, 0)
        expenses = expense_dict.get(key, 0)
        profit = revenue - expenses
        
        month_name = calendar.month_abbr[month_date.month]
        result.append(MonthlyTrendData(
            month=f"{month_name} {month_date.year}",
            revenue=revenue,
            expenses=expenses,
            profit=profit
        ))
    
    return result

def get_cash_flow_data(db: Session, days: int = 30) -> List[CashFlowData]:
    """Get daily cash flow data"""
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days-1)
    
    # Generate date range
    date_range = []
    current_date = start_date
    while current_date <= end_date:
        date_range.append(current_date)
        current_date += timedelta(days=1)
    
    # Get daily income
    income_data = db.query(
        IncomeTransaction.transaction_date,
        func.sum(IncomeTransaction.amount).label('cash_in')
    ).filter(
        IncomeTransaction.transaction_date >= start_date
    ).group_by(IncomeTransaction.transaction_date).all()
    
    # Get daily expenses
    expense_data = db.query(
        ExpenseTransaction.transaction_date,
        func.sum(ExpenseTransaction.amount).label('cash_out')
    ).filter(
        ExpenseTransaction.transaction_date >= start_date
    ).group_by(ExpenseTransaction.transaction_date).all()
    
    # Create lookup dictionaries
    income_dict = {date: float(amount) for date, amount in income_data}
    expense_dict = {date: float(amount) for date, amount in expense_data}
    
    # Generate result with cumulative calculation
    result = []
    cumulative = 0
    
    for date_item in date_range:
        cash_in = income_dict.get(date_item, 0)
        cash_out = expense_dict.get(date_item, 0)
        net_flow = cash_in - cash_out
        cumulative += net_flow
        
        result.append(CashFlowData(
            date=date_item.strftime('%Y-%m-%d'),
            cash_in=cash_in,
            cash_out=cash_out,
            net_flow=net_flow,
            cumulative=cumulative
        ))
    
    return result

def get_budget_variance(db: Session, year: int, month: Optional[int] = None) -> List[BudgetVarianceData]:
    """Get budget vs actual variance analysis"""
    
    query = db.query(BudgetAllocation)
    
    if month:
        query = query.filter(
            BudgetAllocation.budget_year == year,
            BudgetAllocation.budget_month == month
        )
    else:
        query = query.filter(BudgetAllocation.budget_year == year)
    
    budget_data = query.all()
    
    result = []
    for budget in budget_data:
        variance = float(budget.actual_amount) - float(budget.allocated_amount)
        variance_percentage = (variance / float(budget.allocated_amount)) * 100 if budget.allocated_amount > 0 else 0
        
        result.append(BudgetVarianceData(
            category=budget.category,
            allocated=float(budget.allocated_amount),
            actual=float(budget.actual_amount),
            variance=variance,
            variance_percentage=round(variance_percentage, 2)
        ))
    
    return result

def get_financial_targets(db: Session, year: int, month: Optional[int] = None) -> List[FinancialTargetData]:
    """Get financial targets vs actual performance"""
    
    query = db.query(FinancialTarget)
    
    if month:
        query = query.filter(
            FinancialTarget.target_year == year,
            FinancialTarget.target_month == month
        )
    else:
        query = query.filter(FinancialTarget.target_year == year)
    
    targets = query.all()
    
    result = []
    for target in targets:
        achievement_percentage = (float(target.actual_value) / float(target.target_value)) * 100 if target.target_value > 0 else 0
        
        # Determine status
        if achievement_percentage >= 100:
            status = "achieved"
        elif achievement_percentage >= 80:
            status = "on_track"
        else:
            status = "behind"
        
        result.append(FinancialTargetData(
            target_type=target.target_type,
            target_value=float(target.target_value),
            actual_value=float(target.actual_value),
            achievement_percentage=round(achievement_percentage, 2),
            status=status
        ))
    
    return result

def get_payment_method_distribution(db: Session, date_filter: DateRangeFilter) -> List[PaymentMethodData]:
    start_date, end_date = _get_date_range(date_filter)

    income_data = db.query(
        IncomeTransaction.payment_method,
        func.sum(IncomeTransaction.amount).label('amount'),
        func.count(IncomeTransaction.income_id).label('count')
    ).filter(
        IncomeTransaction.transaction_date >= start_date,
        IncomeTransaction.transaction_date <= end_date
    ).group_by(IncomeTransaction.payment_method).all()

    total_amount = sum(float(amount) for _, amount, _ in income_data)

    result = []
    for method, amount, count in income_data:
        percentage = (float(amount) / total_amount) * 100 if total_amount > 0 else 0

        result.append(PaymentMethodData(
            method=method,
            amount=float(amount),
            percentage=round(percentage, 2),
            transaction_count=count
        ))

    return sorted(result, key=lambda x: x.amount, reverse=True)

# ========================================
# AI INSIGHTS GENERATION
# ========================================
def generate_finance_insights(db: Session, date_filter: DateRangeFilter) -> List[FinanceInsight]:
    """Generate AI-powered financial insights"""
    
    insights = []
    
    try:
        # Get overview stats for analysis
        stats = get_finance_overview_stats(db, date_filter)
        revenue_breakdown = get_revenue_breakdown(db, date_filter)
        expense_breakdown = get_expense_breakdown(db, date_filter)
        
        # Profit margin insight
        if stats.profit_margin < 15:
            insights.append(FinanceInsight(
                title="Margin Keuntungan Rendah",
                text=f"Margin keuntungan saat ini {stats.profit_margin:.1f}% berada di bawah target 15%.",
                recommendation="Evaluasi struktur biaya dan pertimbangkan penyesuaian harga membership atau optimasi biaya operasional.",
                impact_level="high",
                category="profit"
            ))
        elif stats.profit_margin > 25:
            insights.append(FinanceInsight(
                title="Margin Keuntungan Sehat",
                text=f"Margin keuntungan {stats.profit_margin:.1f}% menunjukkan performa finansial yang sangat baik.",
                recommendation="Pertahankan efisiensi operasional dan pertimbangkan investasi untuk ekspansi atau peningkatan fasilitas.",
                impact_level="low",
                category="profit"
            ))
        
        # Revenue growth insight
        if stats.monthly_growth < -5:
            insights.append(FinanceInsight(
                title="Penurunan Pendapatan Signifikan",
                text=f"Pendapatan mengalami penurunan {abs(stats.monthly_growth):.1f}% dibanding periode sebelumnya.",
                recommendation="Lakukan analisis mendalam terhadap faktor penyebab dan implementasikan strategi retensi member serta akuisisi baru.",
                impact_level="high",
                category="revenue"
            ))
        elif stats.monthly_growth > 10:
            insights.append(FinanceInsight(
                title="Pertumbuhan Pendapatan Positif",
                text=f"Pendapatan tumbuh {stats.monthly_growth:.1f}% menunjukkan tren yang sangat positif.",
                recommendation="Manfaatkan momentum ini untuk meningkatkan kapasitas dan kualitas layanan.",
                impact_level="medium",
                category="revenue"
            ))
        
        # Revenue source analysis
        total_revenue = (revenue_breakdown.membership + revenue_breakdown.personal_training + 
                        revenue_breakdown.class_fees + revenue_breakdown.product_sales)
        
        if total_revenue > 0:
            membership_percentage = (revenue_breakdown.membership / total_revenue) * 100
            
            if membership_percentage < 60:
                insights.append(FinanceInsight(
                    title="Diversifikasi Pendapatan Baik",
                    text=f"Membership berkontribusi {membership_percentage:.1f}% dari total pendapatan, menunjukkan diversifikasi yang sehat.",
                    recommendation="Pertahankan keseimbangan sumber pendapatan untuk mengurangi risiko ketergantungan pada satu sumber.",
                    impact_level="low",
                    category="revenue"
                ))
            elif membership_percentage > 80:
                insights.append(FinanceInsight(
                    title="Ketergantungan Tinggi pada Membership",
                    text=f"Membership mendominasi {membership_percentage:.1f}% dari total pendapatan.",
                    recommendation="Tingkatkan pendapatan dari personal training, kelas, dan penjualan produk untuk diversifikasi yang lebih baik.",
                    impact_level="medium",
                    category="revenue"
                ))
        
        # Expense analysis
        total_expenses = (expense_breakdown.rent + expense_breakdown.utilities + 
                         expense_breakdown.staff_salary + expense_breakdown.equipment + 
                         expense_breakdown.marketing + expense_breakdown.maintenance)
        
        if total_expenses > 0:
            salary_percentage = (expense_breakdown.staff_salary / total_expenses) * 100
            
            if salary_percentage > 50:
                insights.append(FinanceInsight(
                    title="Biaya Staff Tinggi",
                    text=f"Biaya gaji staff mencapai {salary_percentage:.1f}% dari total pengeluaran.",
                    recommendation="Evaluasi produktivitas staff dan pertimbangkan optimasi jadwal kerja atau sistem insentif berbasis performa.",
                    impact_level="medium",
                    category="expense"
                ))
            
            marketing_percentage = (expense_breakdown.marketing / total_expenses) * 100
            
            if marketing_percentage < 10:
                insights.append(FinanceInsight(
                    title="Investasi Marketing Rendah",
                    text=f"Biaya marketing hanya {marketing_percentage:.1f}% dari total pengeluaran.",
                    recommendation="Pertimbangkan peningkatan investasi marketing untuk mendorong akuisisi member baru dan pertumbuhan bisnis.",
                    impact_level="medium",
                    category="expense"
                ))
        
        return insights[:4]  # Return max 4 insights
        
    except Exception as e:
        print(f"Error generating finance insights: {str(e)}")
        return [
            FinanceInsight(
                title="Analisis Keuangan",
                text="Sistem sedang menganalisis data keuangan untuk memberikan insight yang lebih akurat.",
                recommendation="Pastikan data transaksi tercatat dengan lengkap untuk analisis yang optimal.",
                impact_level="low",
                category="revenue"
            )
        ]

# ========================================
# CASH FLOW PREDICTION
# ========================================
def predict_cash_flow(db: Session, months_ahead: int = 3) -> FinancialForecast:
    """Predict cash flow for upcoming months using simple trend analysis"""
    
    try:
        # Get historical data for trend analysis (last 6 months)
        historical_data = get_monthly_trend(db, 6)
        
        if len(historical_data) < 3:
            raise ValueError("Insufficient historical data for prediction")
        
        # Calculate average growth rates
        revenue_growth_rates = []
        expense_growth_rates = []
        
        for i in range(1, len(historical_data)):
            prev_revenue = historical_data[i-1].revenue
            curr_revenue = historical_data[i].revenue
            
            if prev_revenue > 0:
                revenue_growth = (curr_revenue - prev_revenue) / prev_revenue
                revenue_growth_rates.append(revenue_growth)
            
            prev_expense = historical_data[i-1].expenses
            curr_expense = historical_data[i].expenses
            
            if prev_expense > 0:
                expense_growth = (curr_expense - prev_expense) / prev_expense
                expense_growth_rates.append(expense_growth)
        
        # Calculate average growth rates
        avg_revenue_growth = sum(revenue_growth_rates) / len(revenue_growth_rates) if revenue_growth_rates else 0
        avg_expense_growth = sum(expense_growth_rates) / len(expense_growth_rates) if expense_growth_rates else 0
        
        # Generate predictions
        predictions = []
        last_month_data = historical_data[-1]
        
        for i in range(1, months_ahead + 1):
            # Apply growth rate with some seasonality adjustment
            seasonality_factor = 1.0
            current_month = (datetime.now().month + i - 1) % 12 + 1
            
            # Simple seasonality: summer months (Jun-Aug) +10%, winter months (Dec-Feb) -5%
            if current_month in [6, 7, 8]:
                seasonality_factor = 1.1
            elif current_month in [12, 1, 2]:
                seasonality_factor = 0.95
            
            predicted_revenue = last_month_data.revenue * (1 + avg_revenue_growth) ** i * seasonality_factor
            predicted_expenses = last_month_data.expenses * (1 + avg_expense_growth) ** i
            predicted_profit = predicted_revenue - predicted_expenses
            
            # Confidence decreases with time
            confidence = max(0.5, 0.9 - (i * 0.1))
            
            month_name = calendar.month_name[current_month]
            year = datetime.now().year if current_month >= datetime.now().month else datetime.now().year + 1
            
            predictions.append(CashFlowPrediction(
                month=f"{month_name} {year}",
                predicted_revenue=round(predicted_revenue, 2),
                predicted_expenses=round(predicted_expenses, 2),
                predicted_profit=round(predicted_profit, 2),
                confidence_level=round(confidence, 2)
            ))
        
        return FinancialForecast(
            period=f"{months_ahead} months ahead",
            predictions=predictions,
            key_assumptions=[
                f"Revenue growth rate: {avg_revenue_growth*100:.1f}% per month",
                f"Expense growth rate: {avg_expense_growth*100:.1f}% per month",
                "Seasonal adjustments applied for summer and winter months",
                "Based on historical trend analysis of last 6 months"
            ],
            risk_factors=[
                "Economic conditions may affect member retention",
                "Seasonal variations may differ from historical patterns",
                "Unexpected equipment maintenance or replacement costs",
                "Competition and market changes not accounted for"
            ]
        )
        
    except Exception as e:
        print(f"Error predicting cash flow: {str(e)}")
        return FinancialForecast(
            period=f"{months_ahead} months ahead",
            predictions=[],
            key_assumptions=["Insufficient data for accurate prediction"],
            risk_factors=["Prediction model requires more historical data"]
        )

# ========================================
# UTILITY FUNCTIONS
# ========================================
def _get_date_range(date_filter: DateRangeFilter) -> tuple[date, date]:
    """Convert date filter to actual date range"""
    
    end_date = datetime.now().date()
    
    if date_filter.period == "custom" and date_filter.start_date and date_filter.end_date:
        return date_filter.start_date, date_filter.end_date
    elif date_filter.period == "1month":
        start_date = end_date.replace(day=1)
    elif date_filter.period == "3months":
        start_date = (end_date.replace(day=1) - timedelta(days=90)).replace(day=1)
    elif date_filter.period == "6months":
        start_date = (end_date.replace(day=1) - timedelta(days=180)).replace(day=1)
    elif date_filter.period == "ytd":
        start_date = end_date.replace(month=1, day=1)
    else:  # 12months default
        start_date = (end_date.replace(day=1) - timedelta(days=365)).replace(day=1)
    
    return start_date, end_date

def _get_previous_period(start_date: date, end_date: date) -> tuple[date, date]:
    """Get previous period dates for comparison"""
    
    period_length = (end_date - start_date).days
    prev_end = start_date - timedelta(days=1)
    prev_start = prev_end - timedelta(days=period_length)
    
    return prev_start, prev_end
