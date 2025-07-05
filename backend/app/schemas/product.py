from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from decimal import Decimal

# ========================================
# RESPONSE SCHEMAS
# ========================================
class ProductStats(BaseModel):
    total_products: int
    total_supplements: int
    weekly_sales: int
    low_stock: int

class TopSalesData(BaseModel):
    name: str
    sales: int

class CategoryData(BaseModel):
    name: str
    value: int
    color: str

class SalesTrendData(BaseModel):
    day: str
    sales: int

class ProductInsight(BaseModel):
    title: str
    text: str
    recommendation: Optional[str] = None
    borderColor: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    brand: Optional[str]
    category: str
    price: float
    stock: int
    sold: int
    margin: float

class SegmentationData(BaseModel):
    product: str
    weightLoss: int
    muscleGain: int
    endurance: int

class CrossSellData(BaseModel):
    baseProduct: str
    relatedProduct: str
    confidence: int

# ========================================
# NEW: PRICE SIMULATION SCHEMAS
# ========================================
class PriceSimulationRequest(BaseModel):
    productId: int
    priceChangePercent: float
    bundlingProductId: Optional[int] = None
    bundlingDiscount: Optional[float] = None

class PriceSimulationResponse(BaseModel):
    productId: int
    productName: str
    currentPrice: float
    newPrice: float
    currentSales: int
    newSales: int
    currentProfit: float
    newProfit: float
    profitChangePercent: float
    salesChangePercent: float
    elasticity: float
    bundlingRevenue: float

class PriceImpactData(BaseModel):
    priceChangePercent: int
    newPrice: float
    predictedSales: int
    predictedProfit: float
    profitMargin: float

class ProductForSimulation(BaseModel):
    id: str
    name: str
    brand: str
    currentPrice: float
    costPrice: float
    currentSales: int

# ========================================
# DETAILED SCHEMAS
# ========================================
class ProductCategoryResponse(BaseModel):
    category_id: int
    name: str
    description: Optional[str]
    color_code: Optional[str]
    
    class Config:
        from_attributes = True

class ProductDetailResponse(BaseModel):
    product_id: int
    name: str
    brand: Optional[str]
    category_id: int
    category_name: str
    price: Decimal
    cost_price: Decimal
    current_stock: int
    description: Optional[str]
    created_date: date
    status: str
    margin: float
    
    class Config:
        from_attributes = True

class SaleResponse(BaseModel):
    sale_id: int
    member_id: int
    sale_date: date
    total_amount: Decimal
    payment_method: str
    status: str
    
    class Config:
        from_attributes = True

class SaleItemResponse(BaseModel):
    sale_item_id: int
    sale_id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    
    class Config:
        from_attributes = True

class ProductInventoryResponse(BaseModel):
    inventory_id: int
    product_id: int
    product_name: str
    transaction_type: str
    quantity: int
    stock_date: date
    notes: Optional[str]
    expiry_date: Optional[date]
    
    class Config:
        from_attributes = True

# ========================================
# FILTER SCHEMAS
# ========================================
class ProductFilter(BaseModel):
    category: Optional[str] = "all"
    lowStock: Optional[bool] = False
    sortBy: Optional[str] = "bestseller"

class SegmentationFilter(BaseModel):
    goal: Optional[str] = "all"
    ageRange: Optional[str] = "all"

# ========================================
# AGGREGATION SCHEMAS
# ========================================
class ProductSalesAggregation(BaseModel):
    product_id: int
    product_name: str
    total_sold: int
    total_revenue: Decimal
    category_name: str

class CategorySalesAggregation(BaseModel):
    category_name: str
    total_products: int
    total_sold: int
    total_revenue: Decimal
    color_code: str

class WeeklySalesAggregation(BaseModel):
    day_name: str
    day_date: date
    total_sales: int
    total_revenue: Decimal

class MemberGoalSegmentation(BaseModel):
    goal_type: str
    age_range: str
    product_name: str
    purchase_count: int
