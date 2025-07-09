from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.crud import finance as finance_crud
from app.schemas.finance import DateRangeFilter

router = APIRouter()

def create_date_filter(period: str) -> DateRangeFilter:
    """Convert period string to DateRangeFilter object"""
    end_date = datetime.now().date()
    if period == "7days":
        start_date = end_date - timedelta(days=7)
    elif period == "30days":
        start_date = end_date - timedelta(days=30)
    elif period == "3months":
        start_date = end_date - timedelta(days=90)
    elif period == "6months":
        start_date = end_date - timedelta(days=180)
    elif period == "12months":
        start_date = end_date - timedelta(days=365)
    else:
        start_date = end_date - timedelta(days=30)  # default
    return DateRangeFilter(start_date=start_date, end_date=end_date)

@router.get("/overview")
async def get_finance_overview(
    period: str = Query("30days"), db: Session = Depends(get_db)
):
    try:
        date_filter = create_date_filter(period)
        overview = finance_crud.get_finance_overview_stats(db, date_filter)
        return overview
    except Exception as e:
        print(f"Error getting finance overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/revenue-breakdown")
async def get_revenue_breakdown(
    period: str = Query("30days"), db: Session = Depends(get_db)
):
    try:
        date_filter = create_date_filter(period)
        return finance_crud.get_revenue_breakdown(db, date_filter)
    except Exception as e:
        print(f"Error getting revenue breakdown: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/expense-breakdown")
async def get_expense_breakdown(
    period: str = Query("30days"), db: Session = Depends(get_db)
):
    try:
        date_filter = create_date_filter(period)
        return finance_crud.get_expense_breakdown(db, date_filter)
    except Exception as e:
        print(f"Error getting expense breakdown: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/monthly-trend")
async def get_monthly_trend(
    months: int = Query(12), db: Session = Depends(get_db)
):
    try:
        return finance_crud.get_monthly_trend(db, months)
    except Exception as e:
        print(f"Error getting monthly trend: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cash-flow")
async def get_cash_flow(
    days: int = Query(30), db: Session = Depends(get_db)
):
    try:
        return finance_crud.get_cash_flow_data(db, days)
    except Exception as e:
        print(f"Error getting cash flow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/payment-methods")
async def get_payment_methods(
    period: str = Query("30days"), db: Session = Depends(get_db)
):
    try:
        date_filter = create_date_filter(period)
        return finance_crud.get_payment_method_distribution(db, date_filter)
    except Exception as e:
        print(f"Error getting payment methods: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/insights")
async def get_financial_insights(
    period: str = Query("30days"), db: Session = Depends(get_db)
):
    try:
        date_filter = create_date_filter(period)
        insights = finance_crud.generate_finance_insights(db, date_filter)
        return {"insights": insights}
    except Exception as e:
        print(f"Error generating financial insights: {e}")
        return {"insights": ["Unable to generate insights at this time"]}

@router.get("/budget-variance")
async def get_budget_variance(
    year: int = Query(2025), db: Session = Depends(get_db)
):
    try:
        return finance_crud.get_budget_variance(db, year)
    except Exception as e:
        print(f"Error getting budget variance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/targets")
async def get_financial_targets(
    year: int = Query(2025), db: Session = Depends(get_db)
):
    try:
        return finance_crud.get_financial_targets(db, year)
    except Exception as e:
        print(f"Error getting financial targets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forecast")
async def get_cash_flow_forecast(
    months: int = Query(3), db: Session = Depends(get_db)
):
    try:
        return finance_crud.predict_cash_flow(db, months)
    except Exception as e:
        print(f"Error getting forecast: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/income-transactions")
async def get_income_transactions(
    period: str = Query("30days"), db: Session = Depends(get_db)
):
    try:
        date_filter = create_date_filter(period)
        return finance_crud.get_income_transactions(db, date_filter)
    except Exception as e:
        print(f"Error getting income transactions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/expense-transactions")
async def get_expense_transactions(
    period: str = Query("30days"), db: Session = Depends(get_db)
):
    try:
        date_filter = create_date_filter(period)
        return finance_crud.get_expense_transactions(db, date_filter)
    except Exception as e:
        print(f"Error getting expense transactions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/income-stats")
async def get_income_stats(
    period: str = Query("30days"), db: Session = Depends(get_db)
):
    try:
        date_filter = create_date_filter(period)
        return finance_crud.get_income_stats(db, date_filter)
    except Exception as e:
        print(f"Error getting income stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/expense-stats")
async def get_expense_stats(
    period: str = Query("30days"), db: Session = Depends(get_db)
):
    try:
        date_filter = create_date_filter(period)
        return finance_crud.get_expense_stats(db, date_filter)
    except Exception as e:
        print(f"Error getting expense stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
