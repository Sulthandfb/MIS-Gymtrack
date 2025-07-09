from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
import calendar
from typing import List, Dict, Any, Optional
from sqlalchemy import text


from app.database import get_db
from app.crud import finance as finance_crud
from app.services.finance_insight_generator import generate_finance_insights

router = APIRouter()


@router.get("/summary")
async def get_financial_summary(year: int = Query(default=2024), db: Session = Depends(get_db)):
    try:
        return finance_crud.get_financial_summary(db, year)
    except Exception as e:
        print(f"Error in get_financial_summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/income-vs-expenses")
async def get_income_vs_expenses(year: int = Query(default=2024), db: Session = Depends(get_db)):
    try:
        return finance_crud.get_income_vs_expenses(db, year)
    except Exception as e:
        print(f"Error in get_income_vs_expenses: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/income-breakdown")
async def get_income_breakdown(year: int = Query(default=2024), db: Session = Depends(get_db)):
    try:
        return finance_crud.get_income_breakdown(db, year)
    except Exception as e:
        print(f"Error in get_income_breakdown: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/expense-breakdown")
async def get_expense_breakdown(year: int = Query(default=2024), db: Session = Depends(get_db)):
    try:
        return finance_crud.get_expense_breakdown(db, year)
    except Exception as e:
        print(f"Error in get_expense_breakdown: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recent-transactions")
async def get_recent_transactions(limit: int = 10, db: Session = Depends(get_db)):
    try:
        return finance_crud.get_recent_transactions(db, limit)
    except Exception as e:
        print(f"Error in get_recent_transactions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ai-insights")
async def get_ai_insights(db: Session = Depends(get_db)):
    try:
        year = 2024
        financial_summary = finance_crud.get_financial_summary(db, year)
        income_breakdown = finance_crud.get_income_breakdown(db, year)
        expense_breakdown = finance_crud.get_expense_breakdown(db, year)
        monthly_trends = finance_crud.get_income_vs_expenses(db, year)
        recent_transactions = finance_crud.get_recent_transactions(db, 10)

        insights = await generate_finance_insights(
            db=db,
            financial_summary=financial_summary,
            income_breakdown=income_breakdown,
            expense_breakdown=expense_breakdown,
            monthly_trends=monthly_trends,
            recent_transactions=recent_transactions
        )

        return insights
    except Exception as e:
        print(f"Error in get_finance_ai_insight: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================================
# NEW: TRANSACTIONS FILTERED ENDPOINT
# ========================================
@router.get("/transactions")
async def get_filtered_transactions(
    type: Optional[str] = Query(None, description="Type of transaction (income or expense)"),
    category: Optional[str] = Query(None, description="Category of transaction"),
    date_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(20, ge=1, description="Number of transactions to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Session = Depends(get_db)
):
    """
    Fetches a list of transactions (income or expense) based on provided filters.
    """
    try:
        # Panggil fungsi CRUD yang akan menangani logika filtering database
        # Anda perlu membuat fungsi ini di app/crud/finance.py
        transactions_data, categories_data = finance_crud.get_filtered_transactions(
            db, type, category, date_from, date_to, limit, offset
        )

        return {
            "transactions": transactions_data,
            "categories": categories_data
        }
    except Exception as e:
        print(f"Error in get_filtered_transactions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/income-analysis")
async def get_income_analysis(db: Session = Depends(get_db)):
    """Get total income and chart grouped by income_type and month"""
    try:
        year = 2024  # atau gunakan Query param jika ingin fleksibel
        query = text("""
            SELECT income_type, EXTRACT(MONTH FROM transaction_date) AS month_num, SUM(amount) AS amount
            FROM income_transaction
            WHERE EXTRACT(YEAR FROM transaction_date) = :year
            GROUP BY income_type, month_num
            ORDER BY month_num, income_type
        """)
        results = db.execute(query, {"year": year}).fetchall()

        monthly_data = {}
        for row in results:
            month = int(row.month_num)
            if month not in monthly_data:
                monthly_data[month] = {}
            monthly_data[month][row.income_type] = int(row.amount)

        all_types = ['membership', 'personal_training', 'class_fee', 'product_sale']
        chart_data = []
        for m in range(1, 13):
            entry = {"month": calendar.month_abbr[m]}
            for t in all_types:
                entry[t] = monthly_data.get(m, {}).get(t, 0)
            entry["total"] = sum(entry[t] for t in all_types)
            chart_data.append(entry)

        # Hitung bulan terakhir dan sebelumnya
        available_months = sorted(monthly_data.keys())
        latest = available_months[-1] if available_months else None
        previous = available_months[-2] if len(available_months) >= 2 else None

        latest_total = sum(monthly_data.get(latest, {}).values()) if latest else 0
        previous_total = sum(monthly_data.get(previous, {}).values()) if previous else 0
        growth = (
            ((latest_total - previous_total) / previous_total) * 100
            if previous_total > 0 else 0
        )

        # Biggest source in latest month
        biggest = {"name": "N/A", "amount": 0}
        if latest and monthly_data.get(latest):
            biggest_type = max(monthly_data[latest].items(), key=lambda x: x[1])
            biggest = {"name": biggest_type[0], "amount": biggest_type[1]}

        return {
            "current_month_total": latest_total,
            "growth_percentage": round(growth, 2),
            "biggest_source": biggest,
            "monthly_chart_data": chart_data
        }

    except Exception as e:
        print(f"Error in get_income_analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/expense-analysis")
async def get_expense_analysis(db: Session = Depends(get_db)):
    """Get total expenses grouped by month and category"""
    try:
        year = 2024
        query = text("""
            SELECT expense_category, EXTRACT(MONTH FROM transaction_date) AS month_num, SUM(amount) AS amount
            FROM expense_transaction
            WHERE EXTRACT(YEAR FROM transaction_date) = :year
            GROUP BY expense_category, month_num
            ORDER BY month_num, expense_category
        """)
        results = db.execute(query, {"year": year}).fetchall()

        fixed = {"rent", "staff_salary"}
        variable = {"utilities", "equipment", "marketing", "maintenance"}

        monthly_data = {}
        for row in results:
            month = int(row.month_num)
            if month not in monthly_data:
                monthly_data[month] = {"fixed": 0, "variable": 0}
            if row.expense_category in fixed:
                monthly_data[month]["fixed"] += int(row.amount)
            elif row.expense_category in variable:
                monthly_data[month]["variable"] += int(row.amount)

        chart_data = []
        for m in range(1, 13):
            data = monthly_data.get(m, {"fixed": 0, "variable": 0})
            chart_data.append({
                "month": calendar.month_abbr[m],
                "fixed": data["fixed"],
                "variable": data["variable"],
                "total": data["fixed"] + data["variable"]
            })

        # Hitung bulan terakhir dan sebelumnya
        available_months = sorted(monthly_data.keys())
        latest = available_months[-1] if available_months else None
        previous = available_months[-2] if len(available_months) >= 2 else None

        latest_total = sum(monthly_data.get(latest, {}).values()) if latest else 0
        previous_total = sum(monthly_data.get(previous, {}).values()) if previous else 0
        growth = (
            ((latest_total - previous_total) / previous_total) * 100
            if previous_total > 0 else 0
        )

        # Kategori terbesar di bulan terakhir
        biggest = {"name": "N/A", "amount": 0}
        if latest:
            # Hitung semua kategori untuk bulan terakhir
            query2 = text("""
                SELECT expense_category, SUM(amount) AS amount
                FROM expense_transaction
                WHERE EXTRACT(YEAR FROM transaction_date) = :year
                  AND EXTRACT(MONTH FROM transaction_date) = :month
                GROUP BY expense_category
            """)
            res = db.execute(query2, {"year": year, "month": latest}).fetchall()
            if res:
                max_cat = max(res, key=lambda r: r.amount)
                biggest = {"name": max_cat.expense_category, "amount": int(max_cat.amount)}

        # Hitung persentase fixed vs variable
        total = latest_total
        fixed_amt = monthly_data.get(latest, {}).get("fixed", 0)
        variable_amt = monthly_data.get(latest, {}).get("variable", 0)
        fixed_pct = round((fixed_amt / total) * 100, 1) if total else 0
        variable_pct = round((variable_amt / total) * 100, 1) if total else 0

        return {
            "current_month_total": latest_total,
            "growth_percentage": round(growth, 2),
            "biggest_category": biggest,
            "fixed_vs_variable": {
                "fixed_percentage": fixed_pct,
                "variable_percentage": variable_pct
            },
            "monthly_chart_data": chart_data
        }

    except Exception as e:
        print(f"Error in get_expense_analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))