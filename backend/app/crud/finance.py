from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import calendar
from typing import List, Dict, Any, Optional, Tuple

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
        SELECT 
            income_id AS id, -- Tambahkan ID untuk kunci unik di frontend
            'income' as type, 
            income_type as category, 
            amount, 
            payment_method, 
            transaction_date, 
            description,
            created_at -- Tambahkan created_at untuk sorting jika perlu
        FROM income_transaction
        ORDER BY transaction_date DESC, created_at DESC
        LIMIT :limit
    """)
    expense_query = text("""
        SELECT 
            expense_id AS id, -- Tambahkan ID untuk kunci unik di frontend
            'expense' as type, 
            expense_category as category, 
            amount, 
            payment_method, 
            transaction_date, 
            description,
            created_at -- Tambahkan created_at untuk sorting jika perlu
        FROM expense_transaction
        ORDER BY transaction_date DESC, created_at DESC
        LIMIT :limit
    """)
    income_results = db.execute(income_query, {"limit": limit//2}).fetchall()
    expense_results = db.execute(expense_query, {"limit": limit//2}).fetchall()

    all_data = []
    for row in income_results + expense_results:
        all_data.append({
            # Penting: Gabungkan ID dan tipe untuk memastikan keunikan key di React
            "id": f"{row.type}_{row.id}", 
            "date": row.transaction_date.strftime("%Y-%m-%d"),
            "type": row.type,
            "category": row.category.replace("_", " ").title(),
            "amount": int(row.amount),
            "payment_method": row.payment_method,
            "description": row.description,
            "status": "Completed" # Asumsi status default
        })
    # Urutkan berdasarkan tanggal, lalu ID untuk konsistensi
    return sorted(all_data, key=lambda x: (x["date"], x["id"]), reverse=True)[:limit]


# === NEW: GET /api/finance/transactions (Filtered Transactions) ===
def get_filtered_transactions(
    db: Session,
    type: Optional[str] = None,
    category: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Fetches filtered transactions and a list of available categories.
    """
    transactions = []
    all_categories_set = set() # Menggunakan set untuk menyimpan kategori unik

    # Convert category from frontend format (Title Case with spaces) to database format (snake_case)
    db_category = None
    if category:
        db_category = category.lower().replace(" ", "_")


    # --- Fetch Income Transactions ---
    if type == "income" or type is None:
        income_query_str = """
            SELECT
                income_id AS id,
                transaction_date AS date,
                income_type AS category,
                amount,
                payment_method,
                description,
                'income' AS type,
                'Completed' AS status -- Asumsi status default
            FROM income_transaction
            WHERE 1=1
        """
        income_params = {}

        if db_category: # Use db_category for filtering
            income_query_str += " AND income_type = :db_category"
            income_params["db_category"] = db_category
        if date_from:
            income_query_str += " AND transaction_date >= :date_from"
            income_params["date_from"] = date_from
        if date_to:
            income_query_str += " AND transaction_date <= :date_to"
            income_params["date_to"] = date_to
        
        # Add filtering specific to the year 2024 for data consistency based on provided SQL
        income_query_str += " AND EXTRACT(YEAR FROM transaction_date) = 2024"

        # Fetch all income categories for the filter dropdown (still fetches original DB categories)
        income_categories_query = text("SELECT DISTINCT income_type FROM income_transaction WHERE EXTRACT(YEAR FROM transaction_date) = 2024")
        income_categories_results = db.execute(income_categories_query).fetchall()
        for row in income_categories_results:
            all_categories_set.add(row.income_type)

        # Order for the main transaction list
        income_query_str += " ORDER BY transaction_date DESC, income_id DESC"
        
        income_results = db.execute(text(income_query_str), income_params).fetchall()
        for row in income_results:
            row_dict = dict(row._mapping)
            # Format category for frontend display
            row_dict['category'] = row_dict['category'].replace("_", " ").title() 
            row_dict['id'] = f"income_{row_dict['id']}" 
            transactions.append(row_dict)

    # --- Fetch Expense Transactions ---
    if type == "expense" or type is None:
        expense_query_str = """
            SELECT
                expense_id AS id,
                transaction_date AS date,
                expense_category AS category,
                amount,
                payment_method,
                description,
                'expense' AS type,
                'Completed' AS status -- Asumsi status default
            FROM expense_transaction
            WHERE 1=1
        """
        expense_params = {}

        if db_category: # Use db_category for filtering
            expense_query_str += " AND expense_category = :db_category"
            expense_params["db_category"] = db_category
        if date_from:
            expense_query_str += " AND transaction_date >= :date_from"
            expense_params["date_from"] = date_from
        if date_to:
            expense_query_str += " AND transaction_date <= :date_to"
            expense_params["date_to"] = date_to

        # Add filtering specific to the year 2024 for data consistency
        expense_query_str += " AND EXTRACT(YEAR FROM transaction_date) = 2024"

        # Fetch all expense categories for the filter dropdown (still fetches original DB categories)
        expense_categories_query = text("SELECT DISTINCT expense_category FROM expense_transaction WHERE EXTRACT(YEAR FROM transaction_date) = 2024")
        expense_categories_results = db.execute(expense_categories_query).fetchall()
        for row in expense_categories_results:
            all_categories_set.add(row.expense_category)

        # Order for the main transaction list
        expense_query_str += " ORDER BY transaction_date DESC, expense_id DESC"

        expense_results = db.execute(text(expense_query_str), expense_params).fetchall()
        for row in expense_results:
            row_dict = dict(row._mapping)
            # Format category for frontend display
            row_dict['category'] = row_dict['category'].replace("_", " ").title()
            row_dict['id'] = f"expense_{row_dict['id']}"
            transactions.append(row_dict)

    # --- Combine and Sort All Transactions ---
    # Jika type adalah None (ingin semua transaksi), gabungkan dan sort
    # Jika type ditentukan, transactions sudah hanya berisi tipe itu dan perlu diurutkan
    transactions.sort(key=lambda x: (x['date'], x['id']), reverse=True)


    # --- Apply Pagination (Limit and Offset) ---
    final_transactions = transactions[offset : offset + limit]

    # Convert category names for the return list to Title Case
    formatted_categories_list = [cat.replace("_", " ").title() for cat in all_categories_set]

    return final_transactions, sorted(list(formatted_categories_list))