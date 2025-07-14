# backend/app/services/sentiment_ai_analyzer.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text, and_
from datetime import datetime, date, timedelta
import json
import asyncio
from typing import List, Dict, Any, Optional, Tuple
import re

# Import models
from app.models.feedback import Feedback, FeedbackTopic, SentimentTrend
from app.models.member import Member
from app.models.trainer import Trainer
from app.models.class_model import Class

# Import CRUD functions
from app.crud import feedback as crud_feedback

# Import LLM client and utility
from app.services.llm import ask_groq # FIXED: Import ask_groq
# generate_insight_with_retry_local akan kita definisikan lokal di sini

# Import schemas for creating/updating data
from app.schemas.feedback import FeedbackUpdate, FeedbackTopicCreate, AIInsight

# --- NEW: Enhanced Local Retry Utility for ask_groq ---
async def generate_insight_with_retry_local(
    llm_client_func, # This will be ask_groq
    user_prompt_content: str, # ✅ FIXED: Hanya menerima string konten user prompt
    max_tokens: int, # Ini tidak akan digunakan oleh ask_groq saat ini, tapi biarkan di sini
    temperature: float, # Ini tidak akan digunakan oleh ask_groq saat ini, tapi biarkan di sini
    retries: int = 3,
    delay: int = 2
) -> str:
    """
    Calls the LLM client with retry logic and robust response validation.
    The LLM client (ask_groq) is assumed to have its own system prompt.
    """
    for i in range(retries):
        try:
            print(f"Attempt {i+1}: Calling LLM with prompt length: {len(user_prompt_content)}")
            
            # ask_groq hanya menerima string prompt, jadi kita langsung meneruskannya
            raw_response = await llm_client_func(user_prompt_content)
            
            print(f"Attempt {i+1}: Raw response received: {repr(raw_response[:200])}")
            
            # Basic validation for non-empty response
            if not raw_response or not raw_response.strip():
                raise ValueError("LLM returned empty or whitespace-only response.")
            
            # Clean the response - remove potential markdown formatting
            cleaned_response = raw_response.strip()
            
            # Try to extract JSON if wrapped in markdown code blocks
            json_match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', cleaned_response, re.DOTALL)
            if json_match:
                cleaned_response = json_match.group(1)
                print(f"Attempt {i+1}: Extracted JSON from markdown: {repr(cleaned_response[:200])}")
            
            # Try to find JSON array in the response
            json_array_match = re.search(r'(\[.*?\])', cleaned_response, re.DOTALL)
            if json_array_match:
                cleaned_response = json_array_match.group(1)
                print(f"Attempt {i+1}: Found JSON array: {repr(cleaned_response[:200])}")
            
            # Attempt to parse to validate JSON
            try:
                parsed_json = json.loads(cleaned_response)
                print(f"Attempt {i+1}: Successfully parsed JSON with {len(parsed_json)} items")
                return cleaned_response
            except json.JSONDecodeError as jde:
                print(f"Attempt {i+1}: JSON decode error: {jde}")
                print(f"Attempt {i+1}: Trying to fix common JSON issues...")
                
                # Try to fix common JSON issues
                fixed_response = cleaned_response
                
                # Fix single quotes to double quotes
                fixed_response = re.sub(r"'([^']*)':", r'"\1":', fixed_response)
                fixed_response = re.sub(r":\s*'([^']*)'", r': "\1"', fixed_response)
                
                # Try parsing again
                try:
                    parsed_json = json.loads(fixed_response)
                    print(f"Attempt {i+1}: Successfully parsed fixed JSON")
                    return fixed_response
                except json.JSONDecodeError:
                    raise ValueError(f"Could not parse JSON after fixes: {jde}")
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Attempt {i+1} failed due to JSON or Value Error: {e}")
            if i < retries - 1:
                print(f"Retrying in {delay} seconds...")
                await asyncio.sleep(delay)
            else:
                print(f"All retries failed for LLM call. Last error: {e}")
                raise ValueError(f"LLM call failed after multiple retries: {e}")
        except Exception as e:
            print(f"Attempt {i+1} failed due to unexpected error: {e}")
            if i < retries - 1:
                print(f"Retrying in {delay} seconds...")
                await asyncio.sleep(delay)
            else:
                print(f"All retries failed due to unexpected error: {e}")
                raise

    return ""


async def analyze_and_process_feedback_batch(db: Session, limit: int = 10) -> int:
    """
    Fetches unprocessed feedback, analyzes it using AI, and updates the database.
    Returns the number of feedbacks processed.
    """
    unprocessed_feedbacks = db.query(Feedback).filter(Feedback.is_processed_by_ai == False).limit(limit).all()
    processed_count = 0

    for feedback_item in unprocessed_feedbacks:
        try:
            member_info = db.query(Member).filter(Member.member_id == feedback_item.member_id).first()
            member_context = f"Member ID: {member_info.member_id}, Name: {member_info.name}, Membership Type: {member_info.membership_type}, Status: {member_info.status}." if member_info else "Member info not available."

            additional_context = ""
            if feedback_item.feedback_type == 'Trainer' and feedback_item.content:
                trainer_name_guess = next((t.name for t in db.query(Trainer.name).all() if t.name.lower() in feedback_item.content.lower()), None)
                if trainer_name_guess:
                    trainer_info = db.query(Trainer).filter(Trainer.name.ilike(f"%{trainer_name_guess}%")).first()
                    if trainer_info:
                        additional_context += f"Feedback is about Trainer: {trainer_info.name} (Specialization: {trainer_info.specialization}, Status: {trainer_info.status})."
            elif feedback_item.feedback_type == 'Class' and feedback_item.content:
                class_name_guess = next((c.name for c in db.query(Class.name).all() if c.name.lower() in feedback_item.content.lower()), None)
                if class_name_guess:
                    class_info = db.query(Class).filter(Class.name.ilike(f"%{class_name_guess}%")).first()
                    if class_info:
                        additional_context += f"Feedback is about Class: {class_info.name} (Capacity: {class_info.capacity})."

            # Enhanced prompt with JSON format specification
            user_prompt_content = f"""Analisis feedback berikut dan berikan respons dalam format JSON yang valid:

Feedback ID: {feedback_item.feedback_id}
Tanggal: {feedback_item.feedback_date}
Tipe Feedback: {feedback_item.feedback_type}
Isi Feedback: "{feedback_item.content}"
Rating Pengguna: {feedback_item.rating}
{member_context}
{additional_context}

Berikan respons dalam format JSON berikut:
{{
  "sentiment": "Positive" | "Negative" | "Neutral",
  "sentiment_score": 0.0 to 1.0,
  "topics": [
    {{
      "topic": "string",
      "sentiment_score": 0.0 to 1.0,
      "confidence": 0.0 to 1.0
    }}
  ]
}}

Pastikan respons adalah JSON yang valid dan dapat di-parse."""
            
            raw_llm_response_text = await generate_insight_with_retry_local(
                ask_groq, # Meneruskan fungsi ask_groq
                user_prompt_content, # ✅ FIXED: Meneruskan user prompt sebagai string tunggal
                max_tokens=500, # Ini tidak akan digunakan oleh generate_insight_with_retry_local saat ini
                temperature=0.5 # Ini tidak akan digunakan oleh generate_insight_with_retry_local saat ini
            )
            
            llm_result = json.loads(raw_llm_response_text)

            feedback_update_data = FeedbackUpdate(
                sentiment=llm_result['sentiment'],
                sentiment_score=llm_result['sentiment_score'],
                is_processed_by_ai=True,
                processed_at=datetime.now(),
                raw_llm_response=raw_llm_response_text
            )
            crud_feedback.update_feedback(db, feedback_item.feedback_id, feedback_update_data)

            for topic_data in llm_result.get('topics', []):
                crud_feedback.create_feedback_topic(db, FeedbackTopicCreate(
                    feedback_id=feedback_item.feedback_id,
                    topic=topic_data['topic'],
                    sentiment_score=topic_data['sentiment_score'],
                    confidence=topic_data.get('confidence', 0.9)
                ))
            
            crud_feedback.recalculate_sentiment_trend_for_date(db, feedback_item.feedback_date, feedback_item.feedback_type)

            processed_count += 1

        except ValueError as ve:
            print(f"Failed to get valid LLM response for feedback {feedback_item.feedback_id}: {ve}")
            crud_feedback.update_feedback(db, feedback_item.feedback_id, FeedbackUpdate(
                is_processed_by_ai=False,
                processed_at=datetime.now(),
                raw_llm_response=f"Error: {ve}"
            ))
        except json.JSONDecodeError as jde:
            print(f"JSON Decode Error after retry for feedback {feedback_item.feedback_id}: {jde}")
            crud_feedback.update_feedback(db, feedback_item.feedback_id, FeedbackUpdate(
                is_processed_by_ai=False,
                processed_at=datetime.now(),
                raw_llm_response=f"Error processing: {jde}"
            ))
        except Exception as e:
            print(f"Error processing feedback {feedback_item.feedback_id}: {e}")
            crud_feedback.update_feedback(db, feedback_item.feedback_id, FeedbackUpdate(
                is_processed_by_ai=False,
                processed_at=datetime.now(),
                raw_llm_response=f"Error processing: {e}"
            ))
            
    return processed_count

async def generate_overall_ai_insights(db: Session) -> List[AIInsight]:
    """
    Generates high-level AI insights for the dashboard based on aggregated sentiment data.
    These are the "AI Insights" cards.
    """
    current_year = datetime.now().year
    current_month = datetime.now().month
    today = date.today()
    last_7_days = today - timedelta(days=7)

    try:
        recent_trends = crud_feedback.get_sentiment_trends(db, start_date=last_7_days, end_date=today)
        overall_distribution = crud_feedback.get_sentiment_distribution_data(db)
        
        print(f"Recent trends count: {len(recent_trends)}")
        print(f"Overall distribution count: {len(overall_distribution)}")
        
        # Fallback jika tidak ada data
        if not recent_trends and not overall_distribution:
            return [
                AIInsight(
                    insight_type="issue",
                    title="Tidak Ada Data Feedback",
                    description="Belum ada data feedback yang cukup untuk menghasilkan insight AI. Pastikan ada feedback yang sudah diproses dalam sistem.",
                    impact="Neutral",
                    recommendation="Kumpulkan lebih banyak feedback dari member atau proses feedback yang sudah ada.",
                    confidence=1.0
                )
            ]

        # Enhanced prompt with clearer JSON format specification
        user_prompt_content = f"""Anda adalah AI Business Advisor yang memberikan insight tingkat tinggi berdasarkan data sentimen feedback. 

PENTING: Respons harus dalam format JSON array yang valid seperti ini:
[
  {{
    "insight_type": "trend",
    "title": "Judul Insight Singkat",
    "description": "Penjelasan detail insight dengan data pendukung.",
    "impact": "Positive",
    "recommendation": "Saran tindakan yang spesifik.",
    "confidence": 0.85
  }}
]

Insight types yang valid: "trend", "issue", "strength", "opportunity"
Impact yang valid: "Positive", "Negative", "Neutral"
Confidence harus berupa angka antara 0.0 dan 1.0

Data sentimen feedback:

Tren Sentimen 7 Hari Terakhir:
{json.dumps([t.model_dump(mode='json') for t in recent_trends], indent=2) if recent_trends else "Tidak ada data tren terbaru"}

Distribusi Sentimen Keseluruhan:
{json.dumps([d.model_dump(mode='json') for d in overall_distribution], indent=2) if overall_distribution else "Tidak ada data distribusi"}

Berikan 3-5 insight dalam format JSON array yang valid. Fokus pada isu yang perlu perhatian, tren positif/negatif signifikan, atau area kekuatan."""
        
        raw_llm_response_text = await generate_insight_with_retry_local(
            ask_groq, # Meneruskan fungsi ask_groq
            user_prompt_content, # ✅ FIXED: Meneruskan user prompt sebagai string tunggal
            max_tokens=1000,
            temperature=0.7
        )
        
        llm_results = json.loads(raw_llm_response_text)
        
        # Validate that it's a list
        if not isinstance(llm_results, list):
            raise ValueError("LLM response is not a JSON array")
        
        # Validate and create AIInsight objects
        validated_insights = []
        for item in llm_results:
            try:
                insight = AIInsight(**item)
                validated_insights.append(insight)
            except Exception as e:
                print(f"Error creating AIInsight from item {item}: {e}")
                continue
        
        if not validated_insights:
            raise ValueError("No valid insights generated from LLM response")
        
        return validated_insights

    except ValueError as ve:
        print(f"Failed to get valid LLM response for overall insights: {ve}")
        return [
            AIInsight(
                insight_type="issue",
                title="Gagal Memuat Insight AI (LLM Error)",
                description=f"Tidak dapat menghasilkan insight AI karena respons LLM tidak valid: {str(ve)[:200]}...",
                impact="Negative",
                recommendation="Periksa koneksi LLM atau coba lagi nanti. Jika masalah berlanjut, periksa log backend.",
                confidence=0.0
            )
        ]
    except json.JSONDecodeError as jde:
        print(f"JSON Decode Error for overall insights: {jde}")
        return [
            AIInsight(
                insight_type="issue",
                title="Gagal Memuat Insight AI (Format Error)",
                description=f"Tidak dapat memproses respons LLM karena format JSON tidak valid: {str(jde)[:200]}...",
                impact="Negative",
                recommendation="Periksa format respons LLM atau coba lagi nanti.",
                confidence=0.0
            )
        ]
    except Exception as e:
        print(f"Error generating overall AI insights: {e}")
        return [
            AIInsight(
                insight_type="issue",
                title="Gagal Memuat Insight AI (Error Sistem)",
                description=f"Terjadi error sistem saat menghasilkan insight AI: {str(e)[:200]}...",
                impact="Negative",
                recommendation="Periksa log sistem dan coba lagi nanti.",
                confidence=0.0
            )
        ]


# Example usage (for testing, not part of the service itself)
if __name__ == '__main__':
    # This block is for local testing of the AI generation, assuming you have a local DB session
    # and app.services.groq_client/llm setup
    # from app.database import SessionLocal
    # db_session = SessionLocal()
    # try:
    #     print("Processing feedbacks...")
    #     # await analyze_and_process_feedback_batch(db_session, limit=5)
    #     print("\nGenerating overall AI insights...")
    #     # insights = await generate_overall_ai_insights(db_session)
    #     # for insight in insights:
    #     #     print(insight.model_dump_json(indent=2))
    # finally:
    #     # db_session.close()
    pass