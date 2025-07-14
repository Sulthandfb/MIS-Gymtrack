import httpx
from app.config import settings

async def ask_groq(prompt: str) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are an AI that summarizes gym member data into insights."},
            {"role": "user", "content": prompt}
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()

            # Tambahkan validasi isi response
            if "choices" not in data or not data["choices"]:
                raise ValueError("No choices in Groq response")

            return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            print(f"[Groq Error] HTTP error: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            print(f"[Groq Error] Unexpected error: {e}")

        return ""  # fallback if error terjadi
