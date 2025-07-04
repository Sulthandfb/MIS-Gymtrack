# app/services/groq_client.py

import httpx
from app.config import settings

async def generate_groq_insight(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are an expert in gym member behavior analytics."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=data
            )
            response.raise_for_status()
            res_data = response.json()

            # ✅ Tambahkan print/cek struktur respons
            print("🟢 Groq Response:", res_data)

            return res_data["choices"][0]["message"]["content"]
    except Exception as e:
        print("🔴 ERROR from Groq API:", e)
        return "Gagal membaca respon dari Groq AI."
