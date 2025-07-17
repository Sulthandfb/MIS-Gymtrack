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
        
        insights = []
        
        # 1. Overview Insights - General Business Performance
        overview_insights = await self._generate_overview_insights(financial_summary, monthly_trends)
        insights.extend(overview_insights)
        
        # 2. Revenue/Income Insights
        income_insights = await self._generate_income_insights(income_breakdown, monthly_trends)
        insights.extend(income_insights)
        
        # 3. Cost/Expense Insights
        expense_insights = await self._generate_expense_insights(expense_breakdown, monthly_trends)
        insights.extend(expense_insights)
        
        return insights

    async def _generate_overview_insights(self, financial_summary: Dict[str, Any], monthly_trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate overview/general business insights"""
        insights = []
        
        # Cash Flow Health Insight
        cash_flow_insight = await self._generate_cash_flow_insight(financial_summary)
        if cash_flow_insight:
            insights.append(cash_flow_insight)
        
        # Profitability Trend Insight
        profitability_insight = await self._generate_profitability_insight(financial_summary, monthly_trends)
        if profitability_insight:
            insights.append(profitability_insight)
        
        return insights

    async def _generate_income_insights(self, income_breakdown: List[Dict[str, Any]], monthly_trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate income-specific insights"""
        insights = []
        
        # Revenue Optimization Insight
        revenue_insight = await self._generate_revenue_optimization_insight(income_breakdown)
        if revenue_insight:
            insights.append(revenue_insight)
        
        # Income Diversification Insight
        diversification_insight = await self._generate_income_diversification_insight(income_breakdown)
        if diversification_insight:
            insights.append(diversification_insight)
        
        return insights

    async def _generate_expense_insights(self, expense_breakdown: List[Dict[str, Any]], monthly_trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate expense-specific insights"""
        insights = []
        
        # Cost Optimization Insight
        cost_insight = await self._generate_cost_optimization_insight(expense_breakdown)
        if cost_insight:
            insights.append(cost_insight)
        
        # Budget Control Insight
        budget_insight = await self._generate_budget_control_insight(expense_breakdown, monthly_trends)
        if budget_insight:
            insights.append(budget_insight)
        
        return insights

    async def _generate_cash_flow_insight(self, financial_summary: Dict[str, Any]) -> Dict[str, Any]:
        """Generate cash flow analysis insight for overview"""
        profit_margin = financial_summary.get('profit_margin', 0)
        income_trend = financial_summary.get('income_trend', 0)
        expense_trend = financial_summary.get('expense_trend', 0)
        
        prompt = f"""
        Berdasarkan data keuangan gym:
        - Profit Margin: {profit_margin}%
        - Income Trend: {income_trend}%
        - Expense Trend: {expense_trend}%
        
        Format output:
        [Kondisi cash flow saat ini dalam 1 kalimat]

        [Rekomendasi aksi konkret dalam 1 kalimat]
        
        Langsung to the point, maksimal 40 kata total.
        """
        
        try:
            content = await generate_groq_insight(prompt)
            return {
                "id": "cash_flow_overview",
                "type": "recommendation",
                "title": "Cash Flow Health",
                "description": content.strip(),
                "impact": "high",
                "category": "overview"
            }
        except Exception as e:
            print(f"Error generating cash flow insight: {e}")
            return {
                "id": "cash_flow_fallback",
                "type": "recommendation", 
                "title": "Cash Flow Health",
                "description": f"Profit margin {profit_margin}% menunjukkan cash flow yang sehat dengan tren income positif.\n\nPertahankan efisiensi operasional dan monitor rasio income vs expenses secara bulanan.",
                "impact": "high",
                "category": "overview"
            }

    async def _generate_profitability_insight(self, financial_summary: Dict[str, Any], monthly_trends: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate profitability trend insight for overview"""
        profit_margin = financial_summary.get('profit_margin', 0)
        profit_trend = financial_summary.get('profit_margin_trend', 0)
        
        # Calculate average monthly profit from trends
        avg_monthly_profit = 0
        if monthly_trends:
            total_profit = sum(trend.get('income', 0) - trend.get('expenses', 0) for trend in monthly_trends[-3:])
            avg_monthly_profit = total_profit / len(monthly_trends[-3:]) if len(monthly_trends[-3:]) > 0 else 0
        
        prompt = f"""
        Data profitabilitas gym:
        - Profit Margin: {profit_margin}%
        - Trend Profit: {profit_trend}%
        - Rata-rata profit 3 bulan: Rp {avg_monthly_profit:,.0f}
        
        Format output:
        [Evaluasi performa profitabilitas saat ini dalam 1 kalimat]

        [Strategi konkret peningkatan profit dalam 1 kalimat]
        
        Langsung to the point, maksimal 40 kata total.
        """
        
        try:
            content = await generate_groq_insight(prompt)
            return {
                "id": "profitability_overview",
                "type": "opportunity" if profit_trend >= 0 else "warning",
                "title": "Profitability Analysis",
                "description": content.strip(),
                "impact": "high",
                "category": "overview"
            }
        except Exception as e:
            print(f"Error generating profitability insight: {e}")
            trend_status = "positif" if profit_trend >= 0 else "menurun"
            return {
                "id": "profitability_fallback",
                "type": "opportunity" if profit_trend >= 0 else "warning",
                "title": "Profitability Analysis", 
                "description": f"Profitabilitas menunjukkan tren {trend_status} dengan margin {profit_margin}% dari target optimal.\n\nFokus optimasi sumber revenue tertinggi dan kontrol biaya operasional untuk maksimalkan profit.",
                "impact": "high",
                "category": "overview"
            }

    async def _generate_revenue_optimization_insight(self, income_breakdown: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate revenue optimization insight for income tab"""
        if not income_breakdown:
            return None
            
        # Find top 2 revenue sources
        sorted_income = sorted(income_breakdown, key=lambda x: x.get('amount', 0), reverse=True)
        top_source = sorted_income[0] if sorted_income else {}
        second_source = sorted_income[1] if len(sorted_income) > 1 else {}
        
        prompt = f"""
        Breakdown revenue gym:
        - Sumber tertinggi: {top_source.get('name', 'N/A')} ({top_source.get('value', 0)}%)
        - Sumber kedua: {second_source.get('name', 'N/A')} ({second_source.get('value', 0)}%)
        
        Format output:
        [Kondisi sumber revenue utama saat ini dalam 1 kalimat]

        [Strategi konkret maksimalkan revenue dalam 1 kalimat]
        
        Langsung to the point, maksimal 40 kata total.
        """
        
        try:
            content = await generate_groq_insight(prompt)
            return {
                "id": "revenue_optimization",
                "type": "opportunity",
                "title": "Revenue Growth Strategy",
                "description": content.strip(),
                "impact": "high",
                "category": "income"
            }
        except Exception as e:
            print(f"Error generating revenue insight: {e}")
            top_name = top_source.get('name', 'Membership')
            top_percentage = top_source.get('value', 0)
            return {
                "id": "revenue_fallback",
                "type": "opportunity",
                "title": "Revenue Growth Strategy",
                "description": f"{top_name} mendominasi {top_percentage}% dari total revenue sebagai sumber utama.\n\nTingkatkan retention rate membership dan promosi cross-selling personal training untuk maksimalkan revenue.",
                "impact": "high",
                "category": "income"
            }

    async def _generate_income_diversification_insight(self, income_breakdown: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate income diversification insight"""
        if not income_breakdown:
            return None
            
        # Calculate diversification level
        total_sources = len(income_breakdown)
        top_source_percentage = max(item.get('value', 0) for item in income_breakdown) if income_breakdown else 0
        
        prompt = f"""
        Diversifikasi income gym:
        - Jumlah sumber revenue: {total_sources}
        - Dominasi sumber utama: {top_source_percentage}%
        
        Format output:
        [Kondisi diversifikasi revenue saat ini dalam 1 kalimat]

        [Rekomendasi diversifikasi revenue stream dalam 1 kalimat]
        
        Langsung to the point, maksimal 40 kata total.
        """
        
        try:
            content = await generate_groq_insight(prompt)
            return {
                "id": "income_diversification",
                "type": "recommendation",
                "title": "Revenue Diversification",
                "description": content.strip(),
                "impact": "medium",
                "category": "income"
            }
        except Exception as e:
            print(f"Error generating diversification insight: {e}")
            diversification_status = "baik" if top_source_percentage < 60 else "perlu diperbaiki"
            return {
                "id": "diversification_fallback",
                "type": "recommendation",
                "title": "Revenue Diversification",
                "description": f"Diversifikasi revenue {diversification_status} dengan {total_sources} sumber income aktif.\n\nKembangkan program kelas khusus dan penjualan produk supplement untuk stabilitas revenue jangka panjang.",
                "impact": "medium",
                "category": "income"
            }

    async def _generate_cost_optimization_insight(self, expense_breakdown: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate cost optimization insight for expense tab"""
        if not expense_breakdown:
            return None
            
        # Find highest expense categories
        sorted_expenses = sorted(expense_breakdown, key=lambda x: x.get('amount', 0), reverse=True)
        top_expense = sorted_expenses[0] if sorted_expenses else {}
        second_expense = sorted_expenses[1] if len(sorted_expenses) > 1 else {}
        
        prompt = f"""
        Breakdown biaya gym:
        - Biaya tertinggi: {top_expense.get('name', 'N/A')} ({top_expense.get('value', 0)}%)
        - Biaya kedua: {second_expense.get('name', 'N/A')} ({second_expense.get('value', 0)}%)
        
        Format output:
        [Kondisi struktur biaya saat ini dalam 1 kalimat]

        [Strategi konkret efisiensi biaya dalam 1 kalimat]
        
        Langsung to the point, maksimal 40 kata total.
        """
        
        try:
            content = await generate_groq_insight(prompt)
            return {
                "id": "cost_optimization",
                "type": "recommendation",
                "title": "Cost Efficiency Strategy",
                "description": content.strip(),
                "impact": "high",
                "category": "expense"
            }
        except Exception as e:
            print(f"Error generating cost insight: {e}")
            top_name = top_expense.get('name', 'Staff Salary')
            top_percentage = top_expense.get('value', 0)
            return {
                "id": "cost_fallback",
                "type": "recommendation",
                "title": "Cost Efficiency Strategy",
                "description": f"{top_name} mendominasi {top_percentage}% dari total expenses sebagai biaya terbesar.\n\nOptimasi jadwal kerja staff dan evaluasi produktivitas untuk meningkatkan efisiensi operasional.",
                "impact": "high",
                "category": "expense"
            }

    async def _generate_budget_control_insight(self, expense_breakdown: List[Dict[str, Any]], monthly_trends: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate budget control insight"""
        if not expense_breakdown or not monthly_trends:
            return None
            
        # Calculate expense trend from last 3 months
        recent_expenses = [trend.get('expenses', 0) for trend in monthly_trends[-3:]]
        expense_trend = 0
        if len(recent_expenses) >= 2:
            expense_trend = ((recent_expenses[-1] - recent_expenses[0]) / recent_expenses[0]) * 100 if recent_expenses[0] > 0 else 0
        
        total_expense_amount = sum(item.get('amount', 0) for item in expense_breakdown)
        
        prompt = f"""
        Kontrol budget gym:
        - Total expenses: Rp {total_expense_amount:,.0f}
        - Trend 3 bulan: {expense_trend:.1f}%
        - Kategori expenses: {len(expense_breakdown)}
        
        Format output:
        [Kondisi kontrol budget saat ini dalam 1 kalimat]

        [Rekomendasi budget management dalam 1 kalimat]
        
        Langsung to the point, maksimal 40 kata total.
        """
        
        try:
            content = await generate_groq_insight(prompt)
            return {
                "id": "budget_control",
                "type": "warning" if expense_trend > 10 else "recommendation",
                "title": "Budget Management",
                "description": content.strip(),
                "impact": "medium",
                "category": "expense"
            }
        except Exception as e:
            print(f"Error generating budget insight: {e}")
            trend_status = "terkendali" if expense_trend <= 10 else "meningkat"
            return {
                "id": "budget_fallback",
                "type": "warning" if expense_trend > 10 else "recommendation",
                "title": "Budget Management",
                "description": f"Budget expenses {trend_status} dengan tren {expense_trend:.1f}% dalam 3 bulan terakhir.\n\nImplementasi monthly budget review dan cost monitoring untuk menjaga sustainability keuangan.",
                "impact": "medium",
                "category": "expense"
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
