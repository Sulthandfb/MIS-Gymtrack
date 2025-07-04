from fastapi import APIRouter
from app.services.llm import ask_groq

router = APIRouter()

@router.get("/test/groq")
async def test_groq():
    prompt = "Berikan insight singkat berdasarkan data: 100 total member, 70 aktif, retensi 70%."
    result = await ask_groq(prompt)
    return {"response": result}
