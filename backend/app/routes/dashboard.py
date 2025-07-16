
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import member, trainer, product, finance, inventory, feedback
from typing import Dict, Any
import asyncio

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    """Get comprehensive dashboard summary with all key metrics"""
    try:
        # Fetch data from all modules
        member_stats = member.get_member_stats(db)
        member_activity = member.get_member_activity(db)
        
        # Product stats
        product_stats = product.get_product_stats(db)
        top_sales = product.get_top_sales(db, limit=5)
        
        # Financial summary
        financial_summary = finance.get_financial_summary(db, year=2024)
        
        # Inventory summary
        inventory_summary = inventory.get_inventory_summary(db)
        
        # Feedback summary
        feedback_summary = feedback.get_sentiment_dashboard_summary(db)
        
        # Trainer stats
        trainer_data = await trainer.get_trainer_performance_data(db)
        
        return {
            "member_stats": member_stats,
            "member_activity": member_activity,
            "product_stats": product_stats,
            "top_sales": top_sales,
            "financial_summary": financial_summary,
            "inventory_summary": inventory_summary,
            "feedback_summary": feedback_summary,
            "trainer_stats": trainer_data["stats"]
        }
    except Exception as e:
        print(f"Error in dashboard summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health-check")
async def health_check():
    """Health check endpoint for dashboard"""
    return {"status": "healthy", "service": "dashboard"}
