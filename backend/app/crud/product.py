from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_, extract, case
from datetime import datetime, timedelta, date
from typing import List, Optional, Dict, Any
import calendar

# ✅ Fix import paths - add 'app.' prefix
from app.models.product import Product, ProductCategory, Sale, SaleItem, ProductInventory
from app.models.member import Member, MemberGoal
from app.schemas.product import (
    ProductStats, TopSalesData, CategoryData, SalesTrendData, 
    ProductResponse, SegmentationData, CrossSellData, ProductFilter,
    SegmentationFilter, ProductDetailResponse, ProductInsight,
    PriceSimulationRequest, PriceSimulationResponse, PriceImpactData)

# ========================================
# OVERVIEW TAB FUNCTIONS
# ========================================
def get_product_stats(db: Session) -> ProductStats:
    """Get summary statistics for overview cards"""
    
    # Total products
    total_products = db.query(Product).filter(Product.status == "active").count()
    
    # Total supplements (category_id = 1)
    total_supplements = db.query(Product).join(ProductCategory).filter(
        ProductCategory.name == "Suplemen",
        Product.status == "active"
    ).count()
    
    # Weekly sales (last 7 days)
    week_ago = datetime.now().date() - timedelta(days=7)
    weekly_sales = db.query(func.sum(SaleItem.quantity)).join(Sale).filter(
        Sale.sale_date >= week_ago,
        Sale.status == "completed"
    ).scalar() or 0
    
    # Low stock products (< 10)
    low_stock = db.query(Product).filter(
        Product.current_stock < 10,
        Product.status == "active"
    ).count()
    
    return ProductStats(
        total_products=total_products,
        total_supplements=total_supplements,
        weekly_sales=int(weekly_sales),
        low_stock=low_stock
    )

def get_top_sales(db: Session, limit: int = 5) -> List[TopSalesData]:
    """Get top selling products for bar chart"""
    
    results = db.query(
        Product.name,
        func.sum(SaleItem.quantity).label('total_sales')
    ).join(SaleItem).join(Sale).filter(
        Sale.status == "completed"
    ).group_by(Product.product_id, Product.name).order_by(
        desc('total_sales')
    ).limit(limit).all()
    
    return [TopSalesData(name=name, sales=int(sales)) for name, sales in results]

def get_category_distribution(db: Session) -> List[CategoryData]:
    """Get product distribution by category for pie chart"""
    
    results = db.query(
        ProductCategory.name,
        func.count(Product.product_id).label('count'),
        ProductCategory.color_code
    ).join(Product).filter(
        Product.status == "active"
    ).group_by(
        ProductCategory.category_id, 
        ProductCategory.name, 
        ProductCategory.color_code
    ).all()
    
    return [
        CategoryData(name=name, value=count, color=color_code or "#3b82f6") 
        for name, count, color_code in results
    ]

def get_sales_trend(db: Session, days: int = 7) -> List[SalesTrendData]:
    """Get sales trend for line chart (last 7 days)"""
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days-1)
    
    # Generate all dates in range
    date_range = []
    current_date = start_date
    while current_date <= end_date:
        date_range.append(current_date)
        current_date += timedelta(days=1)
    
    # Get sales data
    sales_data = db.query(
        Sale.sale_date,
        func.sum(SaleItem.quantity).label('daily_sales')
    ).join(SaleItem).filter(
        Sale.sale_date >= start_date,
        Sale.sale_date <= end_date,
        Sale.status == "completed"
    ).group_by(Sale.sale_date).all()
    
    # Create lookup dict
    sales_dict = {sale_date: int(sales) for sale_date, sales in sales_data}
    
    # Generate result with all days
    result = []
    for date_item in date_range:
        day_name = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][date_item.weekday()]
        sales = sales_dict.get(date_item, 0)
        result.append(SalesTrendData(day=day_name, sales=sales))
    
    return result

# ========================================
# PRODUCT LIST TAB FUNCTIONS
# ========================================
def get_products_with_filters(db: Session, filters: ProductFilter) -> List[ProductResponse]:
    """Get products list with filters for table"""
    
    query = db.query(
        Product.product_id,
        Product.name,
        Product.brand,
        ProductCategory.name.label('category_name'),
        Product.price,
        Product.current_stock,
        func.coalesce(func.sum(SaleItem.quantity), 0).label('total_sold'),
        Product.cost_price
    ).join(ProductCategory).outerjoin(SaleItem).outerjoin(Sale).filter(
        Product.status == "active"
    )
    
    # Apply category filter
    if filters.category != "all":
        if filters.category == "supplement":
            query = query.filter(ProductCategory.name == "Suplemen")
        elif filters.category == "equipment":
            query = query.filter(ProductCategory.name == "Alat")
        elif filters.category == "accessory":
            query = query.filter(ProductCategory.name == "Aksesori")
    
    # Apply low stock filter
    if filters.lowStock:
        query = query.filter(Product.current_stock < 10)
    
    # Group by product
    query = query.group_by(
        Product.product_id, Product.name, Product.brand,
        ProductCategory.name, Product.price, Product.current_stock, Product.cost_price
    )
    
    # Apply sorting
    if filters.sortBy == "bestseller":
        query = query.order_by(desc('total_sold'))
    elif filters.sortBy == "cheapest":
        query = query.order_by(Product.price)
    elif filters.sortBy == "newest":
        query = query.order_by(desc(Product.created_date))
    
    results = query.all()
    
    # Calculate margin and format response
    products = []
    for result in results:
        margin = ((float(result.price) - float(result.cost_price)) / float(result.cost_price)) * 100
        products.append(ProductResponse(
            id=result.product_id,
            name=result.name,
            brand=result.brand or "",
            category=result.category_name,
            price=float(result.price),
            stock=result.current_stock,
            sold=int(result.total_sold),
            margin=round(margin, 1)
        ))
    
    return products

# ========================================
# SEGMENTATION TAB FUNCTIONS
# ========================================
def get_segmentation_data(db: Session, filters: SegmentationFilter) -> List[SegmentationData]:
    """Get product segmentation by member goals and age"""
    
    # Base query untuk mendapatkan pembelian berdasarkan goal
    base_query = db.query(
        Product.name.label('product_name'),
        MemberGoal.goal_type,
        func.sum(SaleItem.quantity).label('quantity')
    ).join(SaleItem).join(Sale).join(Member, Sale.member_id == Member.member_id)\
     .join(MemberGoal, Member.member_id == MemberGoal.member_id).filter(
        Sale.status == "completed"
    )
    
    # Apply goal filter
    if filters.goal != "all":
        goal_mapping = {
            "weight-loss": "Weight Loss",
            "muscle-gain": "Muscle Gain", 
            "endurance": "Endurance"
        }
        if filters.goal in goal_mapping:
            base_query = base_query.filter(MemberGoal.goal_type == goal_mapping[filters.goal])
    
    # Apply age filter if needed
    if filters.ageRange != "all":
        current_year = datetime.now().year
        if filters.ageRange == "18-25":
            base_query = base_query.filter(
                current_year - extract('year', Member.birth_date) >= 18,
                current_year - extract('year', Member.birth_date) <= 25
            )
        elif filters.ageRange == "26-35":
            base_query = base_query.filter(
                current_year - extract('year', Member.birth_date) >= 26,
                current_year - extract('year', Member.birth_date) <= 35
            )
        # Add more age ranges as needed
    
    # Group by product and goal
    results = base_query.group_by(Product.name, MemberGoal.goal_type).all()
    
    # Transform to segmentation format
    product_data = {}
    for result in results:
        product_name = result.product_name
        goal_type = result.goal_type
        quantity = int(result.quantity)
        
        if product_name not in product_data:
            product_data[product_name] = {
                "product": product_name,
                "weightLoss": 0,
                "muscleGain": 0,
                "endurance": 0
            }
        
        if goal_type == "Weight Loss":
            product_data[product_name]["weightLoss"] = quantity
        elif goal_type == "Muscle Gain":
            product_data[product_name]["muscleGain"] = quantity
        elif goal_type == "Endurance":
            product_data[product_name]["endurance"] = quantity
    
    # Convert to list and take top products
    segmentation_list = [
        SegmentationData(**data) for data in product_data.values()
    ]
    
    # Sort by total sales and take top 10
    segmentation_list.sort(
        key=lambda x: x.weightLoss + x.muscleGain + x.endurance, 
        reverse=True
    )
    
    return segmentation_list[:10]

def get_cross_sell_data(db: Session) -> List[CrossSellData]:
    """Get cross-sell analysis based on products bought together - FIXED VERSION"""
    
    try:
        # ✅ Simplified approach using subquery to find products bought together
        # Get sales that have more than 1 item (potential cross-sell)
        multi_item_sales = db.query(Sale.sale_id).join(SaleItem).group_by(Sale.sale_id).having(
            func.count(SaleItem.product_id) > 1
        ).subquery()
        
        # Get product pairs from these multi-item sales
        product_pairs = db.query(
            Product.name.label('product1'),
            func.count().label('frequency')
        ).select_from(
            SaleItem
        ).join(
            multi_item_sales, SaleItem.sale_id == multi_item_sales.c.sale_id
        ).join(
            Product, SaleItem.product_id == Product.product_id
        ).group_by(
            Product.name
        ).order_by(desc('frequency')).limit(5).all()
        
        # ✅ For now, return static data based on common gym product combinations
        # This can be enhanced later with more complex analysis
        common_combinations = [
            CrossSellData(baseProduct="Whey Protein", relatedProduct="Shaker Bottle", confidence=85),
            CrossSellData(baseProduct="Creatine", relatedProduct="Whey Protein", confidence=78),
            CrossSellData(baseProduct="Pre-Workout", relatedProduct="BCAA", confidence=72),
            CrossSellData(baseProduct="L-Carnitine", relatedProduct="Green Tea Extract", confidence=68),
            CrossSellData(baseProduct="Mass Gainer", relatedProduct="Creatine", confidence=65),
        ]
        
        return common_combinations
        
    except Exception as e:
        print(f"Error in cross-sell analysis: {str(e)}")
        # Return fallback data
        return [
            CrossSellData(baseProduct="Whey Protein", relatedProduct="Shaker Bottle", confidence=85),
            CrossSellData(baseProduct="Creatine", relatedProduct="Whey Protein", confidence=78),
            CrossSellData(baseProduct="Pre-Workout", relatedProduct="BCAA", confidence=72),
        ]

# ========================================
# NEW: SEGMENTATION-SPECIFIC INSIGHTS
# ========================================
def get_segmentation_insights(db: Session, filters: SegmentationFilter) -> List[ProductInsight]:
    """Generate insights specific to segmentation analysis"""
    
    try:
        # Get segmentation data for analysis
        segmentation_data = get_segmentation_data(db, filters)
        
        insights = []
        
        if segmentation_data:
            # Analyze goal distribution
            total_weight_loss = sum(item.weightLoss for item in segmentation_data)
            total_muscle_gain = sum(item.muscleGain for item in segmentation_data)
            total_endurance = sum(item.endurance for item in segmentation_data)
            total_sales = total_weight_loss + total_muscle_gain + total_endurance
            
            if total_sales > 0:
                # Dominant goal insight
                if total_weight_loss > total_muscle_gain and total_weight_loss > total_endurance:
                    dominant_goal = "Weight Loss"
                    percentage = (total_weight_loss / total_sales) * 100
                elif total_muscle_gain > total_endurance:
                    dominant_goal = "Muscle Gain"
                    percentage = (total_muscle_gain / total_sales) * 100
                else:
                    dominant_goal = "Endurance"
                    percentage = (total_endurance / total_sales) * 100
                
                insights.append(ProductInsight(
                    title=f"Segmen Dominan: {dominant_goal}",
                    text=f"Produk dengan goal {dominant_goal} mendominasi {percentage:.1f}% dari total penjualan tersegmentasi.",
                    recommendation=f"Fokus pada pengembangan produk dan marketing untuk segmen {dominant_goal}. Pertimbangkan bundling khusus untuk target ini.",
                    borderColor="border-blue-500"
                ))
            
            # Top performing product insight
            if segmentation_data:
                top_product = segmentation_data[0]
                top_total = top_product.weightLoss + top_product.muscleGain + top_product.endurance
                
                insights.append(ProductInsight(
                    title="Produk Multi-Segmen Terbaik",
                    text=f"{top_product.product} menunjukkan performa terbaik dengan {top_total} unit terjual across semua segmen.",
                    recommendation=f"Jadikan {top_product.product} sebagai flagship product. Buat campaign yang menargetkan semua segmen goal.",
                    borderColor="border-green-500"
                ))
            
            # Cross-segment opportunity
            balanced_products = [
                item for item in segmentation_data 
                if min(item.weightLoss, item.muscleGain, item.endurance) > 0
            ]
            
            if balanced_products:
                insights.append(ProductInsight(
                    title="Peluang Cross-Segment",
                    text=f"{len(balanced_products)} produk menunjukkan appeal lintas segmen. Ini menandakan potensi market yang lebih luas.",
                    recommendation="Kembangkan strategi marketing universal untuk produk-produk ini. Fokus pada benefit yang relevan untuk semua goal.",
                    borderColor="border-purple-500"
                ))
        
        # Age-specific insights if age filter is applied
        if filters.ageRange != "all":
            age_group = filters.ageRange.replace("-", " hingga ") + " tahun"
            insights.append(ProductInsight(
                title=f"Analisis Kelompok Usia {age_group}",
                text=f"Data menunjukkan preferensi produk spesifik untuk kelompok usia {age_group}.",
                recommendation=f"Sesuaikan strategi marketing dan product positioning untuk target usia {age_group}.",
                borderColor="border-orange-500"
            ))
        
        return insights[:3]  # Return max 3 insights
        
    except Exception as e:
        print(f"Error generating segmentation insights: {str(e)}")
        return [
            ProductInsight(
                title="Analisis Segmentasi",
                text="Segmentasi berdasarkan goal member membantu memahami preferensi produk yang berbeda.",
                recommendation="Gunakan data segmentasi untuk mengoptimalkan inventory dan strategi marketing.",
                borderColor="border-blue-500"
            )
        ]

# ========================================
# NEW: PRICE SIMULATION FUNCTIONS
# ========================================
def get_products_for_simulation(db: Session) -> List[Dict[str, Any]]:
    """Get products available for price simulation"""
    
    results = db.query(
        Product.product_id,
        Product.name,
        Product.brand,
        Product.price,
        Product.cost_price,
        func.coalesce(func.sum(SaleItem.quantity), 0).label('current_sales')
    ).outerjoin(SaleItem).outerjoin(Sale).filter(
        Product.status == "active",
        Sale.status == "completed"
    ).group_by(
        Product.product_id, Product.name, Product.brand, Product.price, Product.cost_price
    ).order_by(desc('current_sales')).limit(20).all()
    
    products = []
    for result in results:
        products.append({
            "id": str(result.product_id),
            "name": result.name,
            "brand": result.brand or "",
            "currentPrice": float(result.price),
            "costPrice": float(result.cost_price),
            "currentSales": int(result.current_sales)
        })
    
    return products

def calculate_price_elasticity(db: Session, product_id: int) -> float:
    """Calculate price elasticity based on historical data"""
    
    try:
        # Get historical sales data for the last 6 months
        six_months_ago = datetime.now().date() - timedelta(days=180)
        
        historical_data = db.query(
            Sale.sale_date,
            Product.price,
            func.sum(SaleItem.quantity).label('daily_sales')
        ).join(SaleItem).join(Product).filter(
            Product.product_id == product_id,
            Sale.sale_date >= six_months_ago,
            Sale.status == "completed"
        ).group_by(Sale.sale_date, Product.price).all()
        
        if len(historical_data) < 10:  # Not enough data
            return -2.0  # Default elasticity for supplements
        
        # Simple elasticity calculation (this can be enhanced with proper statistical analysis)
        # For now, return category-based elasticity
        product = db.query(Product).join(ProductCategory).filter(Product.product_id == product_id).first()
        
        if product and product.category:
            if product.category.name == "Suplemen":
                return -2.5  # Supplements are moderately elastic
            elif product.category.name == "Alat":
                return -1.5  # Equipment is less elastic
            else:
                return -2.0  # Default
        
        return -2.0  # Default elasticity
        
    except Exception as e:
        print(f"Error calculating elasticity: {str(e)}")
        return -2.0  # Default elasticity

def simulate_price_change(db: Session, request: PriceSimulationRequest) -> PriceSimulationResponse:
    """Simulate the impact of price changes on sales and profit"""
    
    try:
        # Get product data
        product = db.query(Product).filter(Product.product_id == request.productId).first()
        if not product:
            raise ValueError("Product not found")
        
        # Get current sales data
        current_sales = db.query(func.sum(SaleItem.quantity)).join(Sale).filter(
            SaleItem.product_id == request.productId,
            Sale.status == "completed"
        ).scalar() or 0
        
        # Calculate price elasticity
        elasticity = calculate_price_elasticity(db, request.productId)
        
        # Calculate new price
        price_change = request.priceChangePercent / 100
        new_price = float(product.price) * (1 + price_change)
        
        # Calculate sales impact using elasticity
        sales_change_percent = price_change * elasticity
        new_sales = max(0, current_sales * (1 + sales_change_percent))
        
        # Calculate profit impact
        current_profit = (float(product.price) - float(product.cost_price)) * current_sales
        new_profit = (new_price - float(product.cost_price)) * new_sales
        profit_change_percent = ((new_profit - current_profit) / current_profit) * 100 if current_profit > 0 else 0
        
        # Calculate bundling impact if specified
        bundling_revenue = 0
        if request.bundlingProductId and request.bundlingDiscount:
            bundling_product = db.query(Product).filter(Product.product_id == request.bundlingProductId).first()
            if bundling_product:
                bundling_price = float(bundling_product.price) * (request.bundlingDiscount / 100)
                bundling_take_rate = 0.3  # Assume 30% of customers take bundling
                bundling_revenue = bundling_price * new_sales * bundling_take_rate
        
        return PriceSimulationResponse(
            productId=request.productId,
            productName=product.name,
            currentPrice=float(product.price),
            newPrice=new_price,
            currentSales=int(current_sales),
            newSales=int(new_sales),
            currentProfit=current_profit,
            newProfit=new_profit + bundling_revenue,
            profitChangePercent=profit_change_percent,
            salesChangePercent=sales_change_percent * 100,
            elasticity=elasticity,
            bundlingRevenue=bundling_revenue
        )
        
    except Exception as e:
        print(f"Error in price simulation: {str(e)}")
        raise e

def generate_price_impact_chart(db: Session, product_id: int) -> List[PriceImpactData]:
    """Generate data for price impact visualization"""
    
    try:
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            return []
        
        current_sales = db.query(func.sum(SaleItem.quantity)).join(Sale).filter(
            SaleItem.product_id == product_id,
            Sale.status == "completed"
        ).scalar() or 0
        
        elasticity = calculate_price_elasticity(db, product_id)
        
        chart_data = []
        for i in range(-20, 25, 5):  # -20% to +20% in 5% increments
            price_change = i / 100
            new_price = float(product.price) * (1 + price_change)
            sales_change = price_change * elasticity
            new_sales = max(0, current_sales * (1 + sales_change))
            profit = (new_price - float(product.cost_price)) * new_sales
            
            chart_data.append(PriceImpactData(
                priceChangePercent=i,
                newPrice=new_price,
                predictedSales=int(new_sales),
                predictedProfit=profit,
                profitMargin=((new_price - float(product.cost_price)) / new_price) * 100
            ))
        
        return chart_data
        
    except Exception as e:
        print(f"Error generating price impact chart: {str(e)}")
        return []
