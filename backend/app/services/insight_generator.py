from app.schemas.member import Insight, MemberStats, MemberActivity
from app.services.groq_client import generate_groq_insight
import json
import re
from datetime import datetime, timedelta

# In-memory cache
_cached_insight = None
_last_generated = None
CACHE_MINUTES = 10

async def generate_insights(stats: MemberStats, activity: list[MemberActivity]) -> list[Insight]:
    global _cached_insight, _last_generated
    now = datetime.now()

    # Gunakan cache jika belum kadaluarsa
    if _cached_insight and _last_generated and (now - _last_generated) < timedelta(minutes=CACHE_MINUTES):
        return _cached_insight

    # Prompt singkat & padat
    prompt = (
        f"Statistik gym:\n"
        f"- Total: {stats['total']}\n"
        f"- Aktif: {stats['active']}\n"
        f"- Retensi: {stats['retention']}%\n"
        f"- Baru bulan ini: {stats['new_members']}\n"
        f"Tren bulanan:\n" +
        "\n".join([f"{a['month']}: {a['value']} member" for a in activity]) +
        "\n\nBuat 3 insight singkat dalam format JSON berikut:\n"
        "[\n"
        "  {\n"
        '    "title": "Judul insight",\n'
        '    "text": "Penjelasan singkat insight",\n'
        '    "recommendation": "Rekomendasi konkret dan actionable",\n'
        '    "borderColor": "Tailwind border color class, contoh: border-blue-500"\n'
        "  }\n"
        "]\n"
        "Gunakan bahasa yang padat, profesional, dan menarik untuk pengguna dashboard bisnis gym."
    )

    # Ambil respon dari Groq AI
    insight_text = await generate_groq_insight(prompt)

    # Ekstrak bagian JSON dari string
    match = re.search(r"\[.*\]", insight_text, re.DOTALL)
    if match:
        try:
            insights = json.loads(match.group(0))
            _cached_insight = insights
            _last_generated = now
            return insights
        except json.JSONDecodeError:
            return [{"title": "Error", "text": "Format JSON tidak valid."}]
    else:
        return [{"title": "Error", "text": "Respon Groq tidak berformat JSON."}]
