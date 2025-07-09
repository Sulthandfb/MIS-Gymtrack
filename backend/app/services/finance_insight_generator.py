import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.services.groq_client import generate_groq_insight

class FinanceInsightGenerator:
    def __init__(self, db: Session):
        self.db = db

    async def generate_comprehensive_insights(
        self,
        financial_summary: Dict[str, Any],
        income_breakdown: List[Dict[str, Any]],
        expense_breakdown: List[Dict[str, Any]],
        monthly_trends: List[Dict[str, Any]],
        recent_transactions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate comprehensive AI insights for finance dashboard"""

        data_summary = {
            "financial_summary": financial_summary,
            "income_sources": income_breakdown,
            "expense_categories": expense_breakdown,
            "monthly_performance": monthly_trends[-6:],  # Last 6 months
            "recent_activity": len(recent_transactions)
        }

        insights = []

        # 1. Cash Flow Analysis
        cash_flow_insight = await self._generate_cash_flow_insight(data_summary)
        if cash_flow_insight:
            insights.append(cash_flow_insight)

        # 2. Revenue Optimization
        revenue_insight = await self._generate_revenue_optimization_insight(data_summary)
        if revenue_insight:
            insights.append(revenue_insight)

        # 3. Cost Optimization
        cost_insight = await self._generate_cost_optimization_insight(data_summary)
        if cost_insight:
            insights.append(cost_insight)

        return insights

    async def _generate_cash_flow_insight(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate cash flow analysis insight"""
        prompt = f"""
        Berikan insight singkat tentang cash flow gym dalam 2-3 kalimat saja:
        
        Data: Income Rp {data['financial_summary'].get('total_income', 0):,}, 
        Expenses Rp {data['financial_summary'].get('total_expenses', 0):,}, 
        Profit Margin {data['financial_summary'].get('profit_margin', 0)}%
        
        Format: [Kondisi saat ini]. [Rekomendasi utama].
        Maksimal 60 kata, fokus actionable.
        """

        try:
            content = await generate_groq_insight(prompt)
            return {
                "id": "cash_flow_analysis",
                "type": "recommendation",
                "title": "Cash Flow Analysis",
                "description": content.strip(),
                "impact": "high",
                "category": "cash_flow"
            }
        except Exception as e:
            print(f"Error generating cash flow insight: {e}")
            return {
                "id": "cash_flow_fallback",
                "type": "recommendation",
                "title": "Cash Flow Analysis",
                "description": "Cash flow stabil bulan ini. Pertahankan rasio income vs expenses dan tingkatkan efisiensi operasional.",
                "impact": "high",
                "category": "cash_flow"
            }

    async def _generate_revenue_optimization_insight(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate revenue optimization insight"""
        income_sources = data.get("income_sources", [])
        income_summary = []
        for item in income_sources[:3]:
            name = item.get("name") or item.get("source", "Unknown")
            value = item.get("value")
            if value is not None:
                income_summary.append(f"{name} {value}%")
            else:
                # Handle missing value gracefully
                income_summary.append(f"{name} (value missing)")
        prompt = f"""
        Berikan rekomendasi singkat untuk optimasi revenue gym dalam 2-3 kalimat:
        
        Sumber Income: {income_summary}
        
        Format: [Sumber terbesar]. [Rekomendasi spesifik].
        Maksimal 60 kata, fokus actionable.
        """

        try:
            content = await generate_groq_insight(prompt)
            return {
                "id": "revenue_optimization",
                "type": "opportunity",
                "title": "Revenue Optimization",
                "description": content.strip(),
                "impact": "high",
                "category": "revenue_growth"
            }
        except Exception as e:
            print(f"Error generating revenue insight: {e}")
            return {
                "id": "revenue_fallback",
                "type": "opportunity",
                "title": "Revenue Optimization",
                "description": "Personal training menunjukkan potensi tinggi. Tambah slot dan promosi paket bundling untuk maksimalkan revenue.",
                "impact": "high",
                "category": "revenue_growth"
            }

    async def _generate_cost_optimization_insight(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate cost optimization insight"""
        expense_categories = data.get("expense_categories", [])
        expense_summary = []
        for item in expense_categories[:3]:
            name = item.get("name") or item.get("category", "Unknown")
            value = item.get("value")
            if value is not None:
                expense_summary.append(f"{name} {value}%")
            else:
                expense_summary.append(f"{name} (value missing)")

        prompt = f"""
        Berikan rekomendasi singkat untuk optimasi biaya gym dalam 2-3 kalimat:
        
        Kategori Expenses: {expense_summary}
        
        Format: [Kategori terbesar]. [Cara efisiensi].
        Maksimal 60 kata, fokus praktis.
        """

        try:
            content = await generate_groq_insight(prompt)
            return {
                "id": "cost_optimization",
                "type": "recommendation",
                "title": "Cost Optimization",
                "description": content.strip(),
                "impact": "medium",
                "category": "cost_optimization"
            }
        except Exception as e:
            print(f"Error generating cost insight: {e}")
            return {
                "id": "cost_fallback",
                "type": "recommendation",
                "title": "Cost Optimization",
                "description": "Biaya utilitas dan maintenance bisa dioptimalkan. Lakukan audit energi dan preventive maintenance rutin.",
                "impact": "medium",
                "category": "cost_optimization"
            }

# Helper function
async def generate_finance_insights(
    db: Session,
    financial_summary: Dict[str, Any],
    income_breakdown: List[Dict[str, Any]],
    expense_breakdown: List[Dict[str, Any]],
    monthly_trends: List[Dict[str, Any]],
    recent_transactions: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    generator = FinanceInsightGenerator(db)
    return await generator.generate_comprehensive_insights(
        financial_summary,
        income_breakdown,
        expense_breakdown,
        monthly_trends,
        recent_transactions
    )
