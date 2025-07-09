from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import calendar

# === GET /api/finance/summary ===
def get_financial_summary(db: Session, year: int):
    current_month = datetime.now().month

    income = db.execute(text("""
        SELECT COALESCE(SUM(amount), 0) as total
        FROM income_transaction
        WHERE EXTRACT(MONTH FROM transaction_date) = :month
          AND EXTRACT(YEAR FROM transaction_date) = :year
    """), {"month": current_month, "year": year}).scalar()

    expenses = db.execute(text("""
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expense_transaction
        WHERE EXTRACT(MONTH FROM transaction_date) = :month
          AND EXTRACT(YEAR FROM transaction_date) = :year
    """), {"month": current_month, "year": year}).scalar()

    prev_month = current_month - 1 if current_month > 1 else 12
    prev_year = year if current_month > 1 else year - 1

    prev_income = db.execute(text("""
        SELECT COALESCE(SUM(amount), 0) as total
        FROM income_transaction
        WHERE EXTRACT(MONTH FROM transaction_date) = :month
          AND EXTRACT(YEAR FROM transaction_date) = :year
    """), {"month": prev_month, "year": prev_year}).scalar()

    prev_expenses = db.execute(text("""
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expense_transaction
        WHERE EXTRACT(MONTH FROM transaction_date) = :month
          AND EXTRACT(YEAR FROM transaction_date) = :year
    """), {"month": prev_month, "year": prev_year}).scalar()

    profit_margin = ((income - expenses) / income * 100) if income > 0 else 0
    prev_profit_margin = ((prev_income - prev_expenses) / prev_income * 100) if prev_income > 0 else 0

    return {
        "profit_margin": round(profit_margin, 1),
        "total_income": int(income),
        "total_expenses": int(expenses),
        "profit_margin_trend": round(profit_margin - prev_profit_margin, 1),
        "income_trend": round(((income - prev_income) / prev_income * 100) if prev_income > 0 else 0, 1),
        "expense_trend": round(((expenses - prev_expenses) / prev_expenses * 100) if prev_expenses > 0 else 0, 1),
    }


# === GET /api/finance/income-vs-expenses ===
def get_income_vs_expenses(db: Session, year: int):
    query = text("""
        WITH months AS (SELECT generate_series(1, 12) AS month_num),
        income_data AS (
            SELECT EXTRACT(MONTH FROM transaction_date) as month_num, SUM(amount) as income
            FROM income_transaction
            WHERE EXTRACT(YEAR FROM transaction_date) = :year
            GROUP BY month_num
        ),
        expense_data AS (
            SELECT EXTRACT(MONTH FROM transaction_date) as month_num, SUM(amount) as expenses
            FROM expense_transaction
            WHERE EXTRACT(YEAR FROM transaction_date) = :year
            GROUP BY month_num
        )
        SELECT m.month_num, COALESCE(i.income, 0) as income, COALESCE(e.expenses, 0) as expenses
        FROM months m
        LEFT JOIN income_data i ON m.month_num = i.month_num
        LEFT JOIN expense_data e ON m.month_num = e.month_num
        ORDER BY m.month_num
    """)
    result = db.execute(query, {"year": year}).fetchall()
    return [{
        "month": calendar.month_abbr[int(row.month_num)],
        "income": int(row.income),
        "expenses": int(row.expenses)
    } for row in result]


# === GET /api/finance/income-breakdown ===
def get_income_breakdown(db: Session, year: int):
    query = text("""
        SELECT income_type, SUM(amount) as total_amount
        FROM income_transaction
        WHERE EXTRACT(YEAR FROM transaction_date) = :year
        GROUP BY income_type
        ORDER BY total_amount DESC
    """)
    results = db.execute(query, {"year": year}).fetchall()
    total = sum(float(row.total_amount) for row in results)
    colors = {
        "membership": "#3b82f6",
        "personal_training": "#10b981",
        "class_fee": "#f59e0b",
        "product_sale": "#ef4444"
    }
    return [{
        "name": row.income_type.replace("_", " ").title(),
        "value": round(float(row.total_amount) / total * 100, 1) if total > 0 else 0,
        "amount": int(row.total_amount),
        "color": colors.get(row.income_type, "#6b7280")
    } for row in results]


# === GET /api/finance/expense-breakdown ===
def get_expense_breakdown(db: Session, year: int):
    query = text("""
        SELECT expense_category, SUM(amount) as total_amount
        FROM expense_transaction
        WHERE EXTRACT(YEAR FROM transaction_date) = :year
        GROUP BY expense_category
        ORDER BY total_amount DESC
    """)
    results = db.execute(query, {"year": year}).fetchall()
    total = sum(float(row.total_amount) for row in results)
    colors = {
        "staff_salary": "#8b5cf6",
        "rent": "#06b6d4",
        "utilities": "#84cc16",
        "equipment": "#f97316",
        "marketing": "#ec4899",
        "maintenance": "#6b7280"
    }
    return [{
        "name": row.expense_category.replace("_", " ").title(),
        "value": round(float(row.total_amount) / total * 100, 1) if total > 0 else 0,
        "amount": int(row.total_amount),
        "color": colors.get(row.expense_category, "#6b7280")
    } for row in results]


# === GET /api/finance/recent-transactions ===
def get_recent_transactions(db: Session, limit: int):
    income_query = text("""
        SELECT 'income' as type, income_type as category, amount, payment_method, transaction_date, description
        FROM income_transaction
        ORDER BY transaction_date DESC, created_at DESC
        LIMIT :limit
    """)
    expense_query = text("""
        SELECT 'expense' as type, expense_category as category, amount, payment_method, transaction_date, description
        FROM expense_transaction
        ORDER BY transaction_date DESC, created_at DESC
        LIMIT :limit
    """)
    income_results = db.execute(income_query, {"limit": limit//2}).fetchall()
    expense_results = db.execute(expense_query, {"limit": limit//2}).fetchall()

    all_data = []
    for row in income_results + expense_results:
        all_data.append({
            "id": f"{row.type}_{row.transaction_date.strftime('%Y%m%d%H%M%S')}",
            "date": row.transaction_date.strftime("%Y-%m-%d"),
            "type": row.type,
            "category": row.category.replace("_", " ").title(),
            "amount": int(row.amount),
            "payment_method": row.payment_method,
            "description": row.description,
            "status": "completed"
        })
    return sorted(all_data, key=lambda x: x["date"], reverse=True)[:limit]
