from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.services.groq_client import get_groq_client
from app.services.product_insight_generator import generate_product_insights

# ✅ Fix import paths - add 'app.' prefix
from app.database import get_db

# ✅ Fix import paths - add 'app.' prefix
from app.crud.product import (
    get_product_stats, get_top_sales, get_category_distribution, 
    get_sales_trend, get_products_with_filters, get_segmentation_data,
    get_cross_sell_data, get_segmentation_insights, get_products_for_simulation,
    simulate_price_change, generate_price_impact_chart)
from app.schemas.product import (
    ProductStats, TopSalesData, CategoryData, SalesTrendData,
    ProductResponse, SegmentationData, CrossSellData, ProductFilter,
    SegmentationFilter, ProductInsight, PriceSimulationRequest, 
    PriceSimulationResponse, PriceImpactData, ProductForSimulation)

router = APIRouter(prefix="/product", tags=["products"])

# ========================================
# OVERVIEW TAB ENDPOINTS
# ========================================
@router.get("/stats", response_model=ProductStats)
async def get_product_statistics(db: Session = Depends(get_db)):
    """
    Get product statistics for overview dashboard cards
    - Total products
    - Total supplements  
    - Weekly sales
    - Low stock count
    """
    try:
        return get_product_stats(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching product stats: {str(e)}")

@router.get("/top-sales", response_model=List[TopSalesData])
async def get_top_selling_products(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)):
    """
    Get top selling products for bar chart
    """
    try:
        return get_top_sales(db, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching top sales: {str(e)}")

@router.get("/category-distribution", response_model=List[CategoryData])
async def get_product_category_distribution(db: Session = Depends(get_db)):
    """
    Get product distribution by category for pie chart
    """
    try:
        return get_category_distribution(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching category distribution: {str(e)}")

@router.get("/trend", response_model=List[SalesTrendData])
async def get_product_sales_trend(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)):
    """
    Get sales trend for line chart (default last 7 days)
    """
    try:
        return get_sales_trend(db, days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sales trend: {str(e)}")

@router.get("/insights", response_model=List[ProductInsight])
async def get_product_ai_insights(db: Session = Depends(get_db)):
    """
    Generate AI insights specifically for product & supplement management using Groq
    """
    try:
        # Get comprehensive product data for AI analysis
        stats = get_product_stats(db)
        top_sales = get_top_sales(db, 10)
        
        # Generate specialized product insights using Groq
        groq_client = get_groq_client()
        insights = await generate_product_insights(groq_client, stats, top_sales)
        
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating product insights: {str(e)}")

# ========================================
# PRODUCT LIST TAB ENDPOINTS
# ========================================
@router.get("/", response_model=List[ProductResponse])
async def get_products(
    category: str = Query("all", description="Filter by category: all, supplement, equipment, accessory"),
    lowStock: bool = Query(False, description="Show only low stock items"),
    sortBy: str = Query("bestseller", description="Sort by: bestseller, cheapest, newest"),
    db: Session = Depends(get_db)):
    """
    Get products list with filters for product table
    """
    try:
        filters = ProductFilter(category=category, lowStock=lowStock, sortBy=sortBy)
        return get_products_with_filters(db, filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching products: {str(e)}")

# ========================================
# SEGMENTATION TAB ENDPOINTS
# ========================================
@router.get("/segmentation", response_model=List[SegmentationData])
async def get_product_segmentation(
    goal: str = Query("all", description="Filter by goal: all, weight-loss, muscle-gain, endurance"),
    age_range: str = Query("all", description="Filter by age: all, 18-25, 26-35, 36-45, 46+"),
    db: Session = Depends(get_db)):
    """
    Get product segmentation by member goals and age ranges
    """
    try:
        filters = SegmentationFilter(goal=goal, ageRange=age_range)
        return get_segmentation_data(db, filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching segmentation data: {str(e)}")

@router.get("/cross-sell", response_model=List[CrossSellData])
async def get_cross_sell_analysis(db: Session = Depends(get_db)):
    """
    Get cross-sell analysis showing products frequently bought together
    """
    try:
        return get_cross_sell_data(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cross-sell data: {str(e)}")

# ========================================
# NEW: SEGMENTATION-SPECIFIC INSIGHTS
# ========================================
@router.get("/segmentation-insights", response_model=List[ProductInsight])
async def get_segmentation_specific_insights(
    goal: str = Query("all", description="Filter by goal: all, weight-loss, muscle-gain, endurance"),
    age_range: str = Query("all", description="Filter by age: all, 18-25, 26-35, 36-45, 46+"),
    db: Session = Depends(get_db)):
    """
    Get insights specific to segmentation analysis
    """
    try:
        filters = SegmentationFilter(goal=goal, ageRange=age_range)
        return get_segmentation_insights(db, filters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching segmentation insights: {str(e)}")

# ========================================
# NEW: PRICE SIMULATION ENDPOINTS
# ========================================
@router.get("/simulation-products", response_model=List[ProductForSimulation])
async def get_simulation_products(db: Session = Depends(get_db)):
    """
    Get products available for price simulation
    """
    try:
        products = get_products_for_simulation(db)
        return [ProductForSimulation(**product) for product in products]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching simulation products: {str(e)}")

@router.post("/price-simulation", response_model=PriceSimulationResponse)
async def simulate_product_price_change(
    request: PriceSimulationRequest,
    db: Session = Depends(get_db)):
    """
    Simulate the impact of price changes on sales and profit
    """
    try:
        return simulate_price_change(db, request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in price simulation: {str(e)}")

@router.get("/price-impact-chart/{product_id}", response_model=List[PriceImpactData])
async def get_price_impact_chart(
    product_id: int,
    db: Session = Depends(get_db)):
    """
    Get price impact chart data for visualization
    """
    try:
        return generate_price_impact_chart(db, product_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating price impact chart: {str(e)}")

# ========================================
# ADDITIONAL UTILITY ENDPOINTS
# ========================================
@router.get("/low-stock", response_model=List[ProductResponse])
async def get_low_stock_products(
    threshold: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)):
    """
    Get products with low stock for alerts
    """
    try:
        filters = ProductFilter(category="all", lowStock=True, sortBy="bestseller")
        products = get_products_with_filters(db, filters)
        return [p for p in products if p.stock < threshold]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching low stock products: {str(e)}")

@router.get("/categories", response_model=List[CategoryData])
async def get_product_categories(db: Session = Depends(get_db)):
    """
    Get all product categories for filters
    """
    try:
        return get_category_distribution(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

# ========================================
# HEALTH CHECK
# ========================================
@router.get("/health")
async def product_api_health():
    """
    Health check endpoint for product API
    """
    return {"status": "healthy", "service": "product-api", "version": "1.0.0"}
