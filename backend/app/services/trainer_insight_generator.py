import json
import re
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.services.groq_client import generate_groq_insight
from app.schemas.trainer import TrainerInsightItem, TrainerAlertItem

# ✅ In-memory cache
_cached_result = None
_last_generated = None
CACHE_MINUTES = 10

async def generate_trainer_insights_and_alerts(
    trainer_performance_data: List[Dict[str, Any]],
    class_type_data: List[Dict[str, Any]]
) -> Dict[str, List[Dict[str, Any]]]:
    global _cached_result, _last_generated
    now = datetime.now()

    # ✅ Gunakan cache jika belum kedaluwarsa
    if _cached_result and _last_generated and (now - _last_generated) < timedelta(minutes=CACHE_MINUTES):
        return _cached_result

    # 🔧 Bangun prompt untuk Groq AI
    prompt_parts = []

    prompt_parts.append("Berikut adalah data kinerja beberapa trainer di gym kami:")
    for trainer in trainer_performance_data:
        prompt_parts.append(f"- Trainer {trainer['name']} ({trainer['specialization']}): "
                            f"Mengajar {trainer['classes']} kelas, rata-rata feedback {trainer['feedback']}/5, "
                            f"retensi {trainer['retention']}%, memiliki {trainer['activeMembers']} member aktif, "
                            f"pengalaman {trainer['experience']}.")

    prompt_parts.append("\nDistribusi partisipasi berdasarkan tipe kelas (diukur dari semua kelas):")
    for class_type in class_type_data:
        prompt_parts.append(f"- Kelas {class_type['name']}: {class_type['value']}% dari total partisipasi kelas.")

    prompt_parts.append("\n\nBerdasarkan data kinerja trainer dan partisipasi kelas di atas, berikanlah:")
    prompt_parts.append("1. Dua (2) 'insight' bisnis yang paling relevan. Insight harus ringkas dan relevan dengan kinerja trainer atau tren kelas.")
    prompt_parts.append("2. Dua (2) 'alert' atau 'saran tindakan' yang paling penting. Alert/saran harus menyoroti potensi masalah atau peluang peningkatan.")
    prompt_parts.append("Format output Anda sebagai JSON array dari objek. Setiap objek harus memiliki kunci 'type' ('insight' atau 'alert') dan 'data'.")
    prompt_parts.append("Untuk 'insight', 'data' harus memiliki 'title', 'message' (penjelasan detail), 'recommendation' (solusi), 'impact' ('positive', 'negative', 'neutral'), 'confidence' (0.0-1.0), dan 'type' ('trend', 'issue', 'strength', 'opportunity').")
    prompt_parts.append("Untuk 'alert', 'data' harus memiliki 'title', 'message' (penjelasan detail), 'action' (tindakan yang disarankan), dan 'priority' ('high', 'medium', 'low').")
    prompt_parts.append("Pastikan output JSON Anda valid dan hanya berisi array objek yang diminta. Jangan ada teks tambahan di luar JSON.")

    full_prompt = "\n".join(prompt_parts)

    # 🔍 Ambil respons dari Groq
    try:
        raw_ai_response = await generate_groq_insight(full_prompt)
    except Exception:
        return _fallback_response("Gagal terhubung dengan Groq API.")

    # 🧠 Parse hasil AI
    insights: List[TrainerInsightItem] = []
    recommendations: List[Dict[str, str]] = []
    alerts: List[TrainerAlertItem] = []

    try:
        match = re.search(r"\[.*\]", raw_ai_response, re.DOTALL)
        if not match:
            raise ValueError("Groq response tidak berisi array JSON.")

        parsed_response_list = json.loads(match.group(0))

        for item in parsed_response_list:
            if item.get("type") == "insight" and "data" in item:
                try:
                    insight_data = item["data"]
                    insight = TrainerInsightItem(
                        icon_name="Lightbulb",
                        title=insight_data.get("title", "Insight AI"),
                        message=insight_data.get("message", ""),
                        recommendation=insight_data.get("recommendation", ""),
                        type=insight_data.get("type", "info"),
                        impact=insight_data.get("impact", "neutral"),
                        confidence=insight_data.get("confidence", 0.8),
                        color=insight_data.get("color", "text-blue-600 bg-blue-100")
                    )
                    insights.append(insight)
                    recommendations.append({"title": insight_data.get("title", "Insight AI")})
                except Exception as e:
                    fallback_title = item.get("data", {}).get("title", "Insight AI Parsial")
                    recommendations.append({"title": fallback_title})
                    insights.append(TrainerInsightItem(
                        icon_name="Lightbulb",
                        title=fallback_title,
                        message="Data insight dari AI tidak lengkap/sesuai.",
                        recommendation="Periksa log backend untuk detail error",
                        type="warning",
                        impact="negative",
                        confidence=0.5,
                        color="text-orange-600 bg-orange-100"
                    ))
            elif item.get("type") == "alert" and "data" in item:
                try:
                    alert = TrainerAlertItem(icon_name="AlertTriangle", **item["data"])
                    alerts.append(alert)
                except Exception:
                    alerts.append(TrainerAlertItem(
                        icon_name="AlertTriangle",
                        title="Alert AI Parsial",
                        message="Data alert dari AI tidak lengkap/sesuai.",
                        action="Periksa",
                        priority="medium"
                    ))

        if not insights and not alerts:
            raise ValueError("Respon Groq valid tapi tidak berisi data yang bisa digunakan.")

    except Exception:
        return _fallback_response("Gagal memproses data dari Groq AI.")

    # ✅ Simpan ke cache dan return
    _cached_result = {
        "insights": insights,
        "recommendations": recommendations,
        "alerts": alerts
    }
    _last_generated = now
    return _cached_result


def _fallback_response(error_message: str) -> Dict[str, List[Dict[str, Any]]]:
    return {
        "insights": [
            TrainerInsightItem(
                icon_name="XCircle",
                title="Error Insight AI",
                message=error_message,
                recommendation="Coba refresh halaman atau periksa koneksi internet",
                type="error",
                impact="negative",
                confidence=1.0,
                color="text-red-600 bg-red-100"
            )
        ],
        "recommendations": [
            {"title": "Error saat memuat rekomendasi AI"}
        ],
        "alerts": [
            TrainerAlertItem(
                icon_name="XCircle",
                title="Error Alert AI",
                message=error_message,
                action="Periksa Log Backend",
                priority="high"
            )
        ]
    }
