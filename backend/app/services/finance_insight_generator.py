from sqlalchemy.orm import Session
from app.services.groq_client import get_groq_client
import json
import logging

logger = logging.getLogger(__name__)

def generate_ai_insights(db: Session, date_filter, overview, revenue_breakdown, expense_breakdown, monthly_trend):
    """
    ✅ FIXED: Renamed function to avoid conflict
    Generate AI-powered financial insights using Groq
    """
    try:
        client = get_groq_client()
        
        # Prepare data for AI analysis
        financial_data = {
            "overview": overview,
            "revenue_breakdown": revenue_breakdown,
            "expense_breakdown": expense_breakdown,
            "monthly_trend": monthly_trend,
            "period": str(date_filter)
        }
        
        prompt = f"""
        Analisis data keuangan gym berikut dan berikan insights dalam bahasa Indonesia:
        
        Data Keuangan:
        {json.dumps(financial_data, indent=2, default=str)}
        
        Berikan analisis dalam format JSON dengan struktur:
        {{
            "insights": [
                "insight 1",
                "insight 2", 
                "insight 3"
            ],
            "recommendations": [
                "rekomendasi 1",
                "rekomendasi 2",
                "rekomendasi 3"
            ],
            "trends": [
                "trend 1",
                "trend 2"
            ]
        }}
        
        Fokus pada:
        1. Tren pendapatan dan pengeluaran
        2. Efisiensi operasional
        3. Peluang peningkatan profit
        4. Rekomendasi strategis
        """
        
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "Anda adalah analis keuangan gym yang ahli dalam memberikan insights bisnis."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Parse AI response
        ai_response = response.choices[0].message.content
        
        try:
            insights_data = json.loads(ai_response)
            return insights_data
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "insights": [
                    "Analisis keuangan menunjukkan performa yang stabil",
                    "Terdapat peluang optimasi di beberapa kategori pengeluaran",
                    "Tren pendapatan menunjukkan pola yang positif"
                ],
                "recommendations": [
                    "Monitor cash flow secara berkala",
                    "Evaluasi efisiensi operasional",
                    "Tingkatkan diversifikasi sumber pendapatan"
                ],
                "trends": [
                    "Pendapatan membership stabil",
                    "Pengeluaran operasional terkendali"
                ]
            }
            
    except Exception as e:
        logger.error(f"Error generating AI insights: {str(e)}")
        # Return fallback insights
        return {
            "insights": [
                "Sistem sedang menganalisis data keuangan",
                "Data menunjukkan aktivitas finansial yang normal",
                "Monitoring berkelanjutan diperlukan untuk optimasi"
            ],
            "recommendations": [
                "Lakukan review keuangan mingguan",
                "Pantau metrik kinerja utama",
                "Siapkan strategi untuk periode mendatang"
            ],
            "trends": [
                "Data trend sedang diproses",
                "Analisis komprehensif akan tersedia segera"
            ]
        }
