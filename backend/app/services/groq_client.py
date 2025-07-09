import httpx
from app.config import settings

class GroqClientWrapper:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1"
    
    class ChatCompletions:
        def __init__(self, client):
            self.client = client
        
        async def create(self, model: str, messages: list, temperature: float = 0.7, max_tokens: int = 1000):
            headers = {
                "Authorization": f"Bearer {self.client.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            print(f"🔍 Groq Request Debug:")
            print(f"  Model: {model}")
            print(f"  Messages count: {len(messages)}")
            print(f"  API Key exists: {bool(self.client.api_key)}")
            
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        f"{self.client.base_url}/chat/completions",
                        headers=headers,
                        json=data
                    )
                    
                    print(f"🔍 Groq Response Status: {response.status_code}")
                    if response.status_code != 200:
                        print(f"🔍 Groq Response Text: {response.text}")
                    
                    response.raise_for_status()
                    response_data = response.json()
                    
                    print(f"🟢 Groq API Success!")
                    
                    class MockResponse:
                        def __init__(self, data):
                            self.choices = [MockChoice(data["choices"][0])]
                    
                    class MockChoice:
                        def __init__(self, choice_data):
                            self.message = MockMessage(choice_data["message"])
                    
                    class MockMessage:
                        def __init__(self, message_data):
                            self.content = message_data["content"]
                    
                    return MockResponse(response_data)
                    
            except httpx.HTTPStatusError as e:
                print(f"🔴 HTTP Error from Groq API: {e}")
                print(f"🔴 Response content: {e.response.text}")
                raise e
            except Exception as e:
                print(f"🔴 ERROR from Groq API: {e}")
                raise e
    
    @property
    def chat(self):
        return type('Chat', (), {'completions': self.ChatCompletions(self)})()

def get_groq_client():
    return GroqClientWrapper(api_key=settings.GROQ_API_KEY)

async def generate_groq_insight(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama-3.1-8b-instant",
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
            print("🟢 Groq Response:", res_data)
            return res_data["choices"][0]["message"]["content"]
    except Exception as e:
        print("🔴 ERROR from Groq API:", e)
        return "Gagal membaca respon dari Groq AI."

# ✅ Tambahan: fungsi yang dibutuhkan oleh finance.py
async def generate_ai_insights(
    db,
    date_filter,
    overview,
    revenue_breakdown,
    expense_breakdown,
    monthly_trend
):
    prompt = f"""
    Buat insight dan rekomendasi keuangan berdasarkan data berikut:
    - Statistik Umum: {overview}
    - Pendapatan: {revenue_breakdown}
    - Pengeluaran: {expense_breakdown}
    - Tren Bulanan (6 bulan): {monthly_trend}

    Berikan ringkasan dalam bentuk poin dan rekomendasi konkret untuk manajemen gym.
    """
    return await generate_groq_insight(prompt)
