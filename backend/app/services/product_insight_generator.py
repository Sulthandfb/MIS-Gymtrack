import json
from typing import List, Dict, Any
# ✅ Fix import paths - add 'app.' prefix
from app.schemas.product import ProductStats, TopSalesData, ProductInsight

async def generate_product_insights(groq_client, stats: ProductStats, top_sales: List[TopSalesData]) -> List[ProductInsight]:
    """
    Generate AI insights specifically for product & supplement management using Groq
    """
    try:
        # ✅ Simplified prompt to avoid 400 errors
        prompt = f"""
        Analyze gym product sales data and provide 2 business insights in JSON format:

        Data:
        - Total Products: {stats.total_products}
        - Supplements: {stats.total_supplements}
        - Weekly Sales: {stats.weekly_sales} units
        - Low Stock Items: {stats.low_stock}
        - Top Product: {top_sales[0].name if top_sales else 'None'} ({top_sales[0].sales if top_sales else 0} sales)

        Return JSON array with this format:
        [
            {{
                "title": "Insight Title",
                "text": "Brief analysis",
                "recommendation": "Action to take",
                "borderColor": "border-blue-500"
            }}
        ]
        """
        
        # ✅ Updated to use active Groq model
        response = await groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",  # ✅ Changed to active model
            messages=[
                {"role": "system", "content": "You are a business analyst. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,  # ✅ Lower temperature for more consistent output
            max_tokens=800    # ✅ Reduced token limit
        )
        
        # Parse and process response
        insights_text = response.choices[0].message.content.strip()
        print(f"🔍 Raw AI Response: {insights_text[:200]}...")
        
        try:
            # Clean up response format
            if "```json" in insights_text:
                insights_text = insights_text.split("```json")[1].split("```")[0]
            elif "```" in insights_text:
                insights_text = insights_text.split("```")[1].split("```")[0]
            
            # Remove any leading/trailing whitespace and newlines
            insights_text = insights_text.strip()
            
            insights_data = json.loads(insights_text)
            
            # Convert to ProductInsight objects with validation
            insights = []
            for insight_data in insights_data:
                if isinstance(insight_data, dict):
                    insights.append(ProductInsight(
                        title=insight_data.get("title", "Product Management Insight"),
                        text=insight_data.get("text", "Analysis not available"),
                        recommendation=insight_data.get("recommendation"),
                        borderColor=insight_data.get("borderColor", "border-blue-500")
                    ))
            
            print(f"🟢 Successfully generated {len(insights)} AI insights")
            return insights[:3]  # Limit to 3 insights for UI
            
        except json.JSONDecodeError as e:
            print(f"🔴 JSON parsing error: {str(e)}")
            print(f"🔴 Raw response: {insights_text}")
            return get_product_fallback_insights(stats, top_sales)
            
    except Exception as e:
        print(f"🔴 Error generating product insights: {str(e)}")
        return get_product_fallback_insights(stats, top_sales)

def get_product_fallback_insights(stats: ProductStats, top_sales: List[TopSalesData]) -> List[ProductInsight]:
    """
    Fallback insights specifically for product management when AI generation fails
    """
    print("🔄 Using fallback insights...")
    insights = []
    
    # Critical stock management insight
    if stats.low_stock > 0:
        urgency_level = "KRITIS" if stats.low_stock > 10 else "PERHATIAN"
        border_color = "border-red-500" if stats.low_stock > 10 else "border-orange-500"
        
        insights.append(ProductInsight(
            title=f"Manajemen Stok - {urgency_level}",
            text=f"Terdeteksi {stats.low_stock} produk dengan stok rendah (<10 unit). Ini dapat menyebabkan stockout dan kehilangan penjualan.",
            recommendation=f"Segera review dan restok {stats.low_stock} produk tersebut. Implementasikan sistem reorder point otomatis.",
            borderColor=border_color
        ))
    
    # Top product performance insight
    if top_sales and len(top_sales) > 0:
        top_product = top_sales[0]
        
        insights.append(ProductInsight(
            title="Analisis Produk Terlaris",
            text=f"{top_product.name} mendominasi penjualan dengan {top_product.sales} unit terjual minggu ini.",
            recommendation=f"Pastikan stok {top_product.name} selalu tersedia dan pertimbangkan bundling dengan produk komplementer.",
            borderColor="border-green-500"
        ))
    
    # Portfolio composition insight
    supplement_ratio = (stats.total_supplements / stats.total_products) * 100 if stats.total_products > 0 else 0
    
    if supplement_ratio > 70:
        insights.append(ProductInsight(
            title="Diversifikasi Portfolio",
            text=f"Suplemen mendominasi {supplement_ratio:.1f}% dari total produk. Ketergantungan tinggi pada satu kategori dapat berisiko.",
            recommendation="Diversifikasi dengan menambah kategori alat fitness dan aksesori workout untuk memperluas target market.",
            borderColor="border-blue-500"
        ))
    else:
        insights.append(ProductInsight(
            title="Optimalisasi Penjualan",
            text=f"Portfolio seimbang dengan {supplement_ratio:.1f}% suplemen. Volume penjualan mingguan mencapai {stats.weekly_sales} unit.",
            recommendation="Fokus pada cross-selling dan bundling produk untuk meningkatkan average order value.",
            borderColor="border-blue-500"
        ))
    
    return insights[:3]  # Return maximum 3 insights

async def generate_product_notifications(groq_client, stats: ProductStats, top_sales: List[TopSalesData]) -> List[Dict[str, Any]]:
    """
    Generate AI-powered notifications for product management alerts
    """
    notifications = []
    
    # Critical stock alerts
    if stats.low_stock > 0:
        notifications.append({
            "type": "critical" if stats.low_stock > 10 else "warning",
            "title": "Stok Kritis" if stats.low_stock > 10 else "Stok Rendah",
            "message": f"{stats.low_stock} produk memerlukan restok segera",
            "action": "Review Inventory",
            "priority": "high" if stats.low_stock > 10 else "medium"
        })
    
    # Sales trend notifications
    if stats.weekly_sales > 500:  # High sales volume
        notifications.append({
            "type": "success",
            "title": "Penjualan Tinggi",
            "message": f"Volume penjualan mencapai {stats.weekly_sales} unit minggu ini",
            "action": "Monitor Stock",
            "priority": "medium"
        })
    
    # Product performance notifications
    if top_sales and top_sales[0].sales > 100:
        notifications.append({
            "type": "info",
            "title": "Produk Hot",
            "message": f"{top_sales[0].name} terjual {top_sales[0].sales} unit - pertimbangkan bundling",
            "action": "Create Bundle",
            "priority": "low"
        })
    
    return notifications[:5]  # Limit to 5 notifications
