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
    delay: int = 2,
    expect_object: bool = False  # NEW: Flag to indicate if we expect JSON object vs array
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
            json_match = re.search(r'```(?:json)?\s*(\{.*?\}|\[.*?\])\s*```', cleaned_response, re.DOTALL)
            if json_match:
                cleaned_response = json_match.group(1)
                print(f"Attempt {i+1}: Extracted JSON from markdown: {repr(cleaned_response[:200])}")
            else:
                # If no markdown blocks, try to find JSON structure in the response
                if expect_object:
                    # Look for JSON object structure
                    json_obj_match = re.search(r'(\{.*\})', cleaned_response, re.DOTALL)
                    if json_obj_match:
                        cleaned_response = json_obj_match.group(1)
                        print(f"Attempt {i+1}: Found JSON object: {repr(cleaned_response[:200])}")
                else:
                    # Look for JSON array structure
                    json_array_match = re.search(r'(\[.*?\])', cleaned_response, re.DOTALL)
                    if json_array_match:
                        cleaned_response = json_array_match.group(1)
                        print(f"Attempt {i+1}: Found JSON array: {repr(cleaned_response[:200])}")
            
            # Attempt to parse to validate JSON
            try:
                parsed_json = json.loads(cleaned_response)
                print(f"Attempt {i+1}: Successfully parsed JSON")
                
                # Additional validation based on expected structure
                if expect_object and not isinstance(parsed_json, dict):
                    raise ValueError(f"Expected JSON object but got {type(parsed_json)}")
                elif not expect_object and not isinstance(parsed_json, list):
                    raise ValueError(f"Expected JSON array but got {type(parsed_json)}")
                
                if expect_object:
                    print(f"Attempt {i+1}: Validated JSON object with keys: {list(parsed_json.keys())}")
                else:
                    print(f"Attempt {i+1}: Validated JSON array with {len(parsed_json)} items")
                
                return cleaned_response
                
            except json.JSONDecodeError as jde:
                print(f"Attempt {i+1}: JSON decode error: {jde}")
                print(f"Attempt {i+1}: Trying to fix common JSON issues...")
                
                # Try to fix common JSON issues
                fixed_response = cleaned_response
                
                # Fix single quotes to double quotes
                fixed_response = re.sub(r"'([^']*)':", r'"\1":', fixed_response)
                fixed_response = re.sub(r":\s*'([^']*)'", r': "\1"', fixed_response)
                
                # Fix trailing commas
                fixed_response = re.sub(r',\s*}', '}', fixed_response)
                fixed_response = re.sub(r',\s*]', ']', fixed_response)
                
                # Try parsing again
                try:
                    parsed_json = json.loads(fixed_response)
                    print(f"Attempt {i+1}: Successfully parsed fixed JSON")
                    
                    # Additional validation for fixed JSON
                    if expect_object and not isinstance(parsed_json, dict):
                        raise ValueError(f"Expected JSON object but got {type(parsed_json)}")
                    elif not expect_object and not isinstance(parsed_json, list):
                        raise ValueError(f"Expected JSON array but got {type(parsed_json)}")
                    
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

Berikan respons dalam format JSON object yang valid:
{{
  "sentiment": "Positive" atau "Negative" atau "Neutral",
  "sentiment_score": 0.0 sampai 1.0,
  "topics": [
    {{
      "topic": "string",
      "sentiment_score": 0.0 sampai 1.0,
      "confidence": 0.0 sampai 1.0
    }}
  ]
}}

Pastikan respons adalah JSON object yang valid dan dapat di-parse."""
            
            # Use the fixed retry function with expect_object=True
            raw_llm_response_text = await generate_insight_with_retry_local(
                ask_groq,
                user_prompt_content,
                max_tokens=500,
                temperature=0.5,
                expect_object=True  # Expecting JSON object
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

Berikan respons dalam format JSON array yang valid seperti ini:
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
        
        # Use the fixed retry function with expect_object=False (expecting array)
        raw_llm_response_text = await generate_insight_with_retry_local(
            ask_groq,
            user_prompt_content,
            max_tokens=1000,
            temperature=0.7,
            expect_object=False  # Expecting JSON array
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

async def generate_ai_recommendations(db: Session) -> Dict[str, Any]:
    """
    Generate AI-powered recommendations based on sentiment analysis and feedback data.
    Returns structured recommendations with priority actions, opportunities, and metrics.
    """
    try:
        # Get recent data for analysis
        summary = crud_feedback.get_sentiment_dashboard_summary(db)
        topic_analysis = crud_feedback.get_topic_analysis_data(db)
        recent_feedback = crud_feedback.get_feedback_list(db, limit=50)
        
        # Check if we have data
        if not summary or not topic_analysis:
            return {
                "priority_actions": [
                    {
                        "title": "Tidak Ada Data Feedback",
                        "description": "Belum ada data feedback yang cukup untuk menghasilkan rekomendasi. Mulai kumpulkan feedback dari member.",
                        "urgency": "medium"
                    }
                ],
                "opportunities": [
                    {
                        "title": "Mulai Sistem Feedback",
                        "description": "Implementasikan sistem pengumpulan feedback untuk mendapatkan insight tentang kepuasan member.",
                        "potential_impact": "high"
                    }
                ],
                "metrics_to_monitor": [
                    {
                        "metric": "Jumlah Feedback per Bulan",
                        "target": "Minimal 50 feedback per bulan",
                        "current_value": "0"
                    }
                ]
            }
        
        # Prepare data for AI analysis
        negative_topics = [topic for topic in topic_analysis if topic.sentiment_score < -0.3]
        positive_topics = [topic for topic in topic_analysis if topic.sentiment_score > 0.5]
        
        # Enhanced prompt for structured recommendations
        user_prompt_content = f"""Sebagai AI Business Advisor untuk gym, analisis data sentimen feedback berikut dan berikan rekomendasi yang terstruktur.

Data Sentimen:
- Total Feedback: {summary.total_feedback}
- Sentimen Positif: {summary.positive_percentage}%
- Sentimen Negatif: {summary.negative_percentage}%
- Rating Rata-rata: {summary.avg_rating}

Topik dengan Sentimen Negatif (perlu perhatian):
{json.dumps([{"topic": t.topic, "sentiment_score": float(t.sentiment_score), "frequency": t.frequency} for t in negative_topics[:5]], indent=2)}

Topik dengan Sentimen Positif (kekuatan):
{json.dumps([{"topic": t.topic, "sentiment_score": float(t.sentiment_score), "frequency": t.frequency} for t in positive_topics[:5]], indent=2)}

Berikan respons dalam format JSON object yang valid (bukan array). Respons harus dimulai dengan {{ dan berakhir dengan }}.

{{
  "priority_actions": [
    {{
      "title": "Judul Tindakan Prioritas",
      "description": "Deskripsi detail tindakan yang perlu segera dilakukan berdasarkan data sentimen negatif",
      "urgency": "high"
    }}
  ],
  "opportunities": [
    {{
      "title": "Judul Peluang",
      "description": "Deskripsi peluang peningkatan berdasarkan tren positif atau area yang bisa dioptimalkan",
      "potential_impact": "high"
    }}
  ],
  "metrics_to_monitor": [
    {{
      "metric": "Nama Metrik yang Spesifik",
      "target": "Target yang ingin dicapai (berikan angka konkret jika memungkinkan)",
      "current_value": "Nilai saat ini berdasarkan data"
    }}
  ]
}}

Berikan 2-3 item untuk setiap kategori. Fokus pada tindakan yang dapat diukur dan spesifik berdasarkan data sentimen yang tersedia. Urgency: "high", "medium", atau "low". Potential_impact: "high", "medium", atau "low"."""

        # Use the fixed retry function with expect_object=True
        raw_llm_response_text = await generate_insight_with_retry_local(
            ask_groq,
            user_prompt_content,
            max_tokens=1200,
            temperature=0.6,
            expect_object=True  # NEW: Tell the function we expect a JSON object
        )
        
        # Parse the JSON response (should be clean now)
        try:
            llm_result = json.loads(raw_llm_response_text)
            print(f"Successfully parsed JSON response")
        except json.JSONDecodeError as jde:
            print(f"Final JSON parsing failed: {jde}")
            raise ValueError(f"Could not parse JSON response: {jde}")
        
        # Validate that llm_result is a dict (JSON object)
        if not isinstance(llm_result, dict):
            raise ValueError(f"Expected JSON object but got {type(llm_result)}")
        
        # Validate and structure the response with defaults
        recommendations = {
            "priority_actions": llm_result.get("priority_actions", []),
            "opportunities": llm_result.get("opportunities", []),
            "metrics_to_monitor": llm_result.get("metrics_to_monitor", [])
        }
        
        # Validate each section and fix any issues
        for section in ['priority_actions', 'opportunities', 'metrics_to_monitor']:
            if not isinstance(recommendations[section], list):
                print(f"Warning: {section} is not a list, converting to empty list")
                recommendations[section] = []
        
        # Validate individual items in priority_actions
        valid_priority_actions = []
        for action in recommendations['priority_actions']:
            if isinstance(action, dict):
                # Ensure required fields and valid values
                valid_action = {
                    "title": action.get("title", "Tindakan Prioritas"),
                    "description": action.get("description", "Deskripsi tidak tersedia"),
                    "urgency": action.get("urgency", "medium")
                }
                # Validate urgency value
                if valid_action["urgency"] not in ["high", "medium", "low"]:
                    valid_action["urgency"] = "medium"
                valid_priority_actions.append(valid_action)
        recommendations['priority_actions'] = valid_priority_actions
        
        # Validate individual items in opportunities
        valid_opportunities = []
        for opportunity in recommendations['opportunities']:
            if isinstance(opportunity, dict):
                valid_opportunity = {
                    "title": opportunity.get("title", "Peluang"),
                    "description": opportunity.get("description", "Deskripsi tidak tersedia"),
                    "potential_impact": opportunity.get("potential_impact", "medium")
                }
                # Validate potential_impact value
                if valid_opportunity["potential_impact"] not in ["high", "medium", "low"]:
                    valid_opportunity["potential_impact"] = "medium"
                valid_opportunities.append(valid_opportunity)
        recommendations['opportunities'] = valid_opportunities
        
        # Validate individual items in metrics_to_monitor
        valid_metrics = []
        for metric in recommendations['metrics_to_monitor']:
            if isinstance(metric, dict):
                valid_metric = {
                    "metric": metric.get("metric", "Metrik"),
                    "target": metric.get("target", "Target tidak tersedia"),
                    "current_value": metric.get("current_value", "Nilai tidak tersedia")
                }
                valid_metrics.append(valid_metric)
        recommendations['metrics_to_monitor'] = valid_metrics
        
        # If any section is empty, provide default content
        if not recommendations['priority_actions']:
            recommendations['priority_actions'] = [
                {
                    "title": "Monitoring Sentimen Feedback",
                    "description": "Lakukan monitoring rutin terhadap sentimen feedback untuk mengidentifikasi area yang perlu diperbaiki.",
                    "urgency": "medium"
                }
            ]
        
        if not recommendations['opportunities']:
            recommendations['opportunities'] = [
                {
                    "title": "Optimasi Berdasarkan Feedback Positif",
                    "description": "Manfaatkan area dengan sentimen positif sebagai kekuatan untuk meningkatkan kepuasan member secara keseluruhan.",
                    "potential_impact": "high"
                }
            ]
        
        if not recommendations['metrics_to_monitor']:
            recommendations['metrics_to_monitor'] = [
                {
                    "metric": "Persentase Sentimen Positif",
                    "target": "Minimal 70% feedback positif",
                    "current_value": f"{summary.positive_percentage}%"
                }
            ]
        
        print(f"Successfully generated recommendations with {len(recommendations['priority_actions'])} priority actions, {len(recommendations['opportunities'])} opportunities, and {len(recommendations['metrics_to_monitor'])} metrics")
        
        return recommendations
        
    except ValueError as ve:
        print(f"ValueError in AI recommendations: {ve}")
        return {
            "priority_actions": [
                {
                    "title": "Error Parsing AI Response",
                    "description": f"Tidak dapat memproses respons AI: {str(ve)[:200]}...",
                    "urgency": "low"
                }
            ],
            "opportunities": [
                {
                    "title": "Coba Ulang Rekomendasi",
                    "description": "Silakan coba refresh halaman untuk menghasilkan rekomendasi baru.",
                    "potential_impact": "medium"
                }
            ],
            "metrics_to_monitor": [
                {
                    "metric": "Status Sistem AI",
                    "target": "Sistem AI berfungsi normal",
                    "current_value": "Error"
                }
            ]
        }
    except json.JSONDecodeError as je:
        print(f"JSON decode error in AI recommendations: {je}")
        return {
            "priority_actions": [
                {
                    "title": "Error Format Response AI",
                    "description": "Respons AI tidak dalam format yang valid. Sistem sedang mencoba memperbaiki masalah ini.",
                    "urgency": "low"
                }
            ],
            "opportunities": [
                {
                    "title": "Perbaikan Sistem AI",
                    "description": "Tim teknis sedang mengoptimalkan sistem AI untuk memberikan respons yang lebih konsisten.",
                    "potential_impact": "high"
                }
            ],
            "metrics_to_monitor": [
                {
                    "metric": "Tingkat Keberhasilan AI",
                    "target": "95% respons valid",
                    "current_value": "Error"
                }
            ]
        }
    except Exception as e:
        print(f"Unexpected error generating AI recommendations: {e}")
        return {
            "priority_actions": [
                {
                    "title": "Error Sistem",
                    "description": f"Terjadi error sistem: {str(e)[:100]}...",
                    "urgency": "low"
                }
            ],
            "opportunities": [
                {
                    "title": "Stabilitas Sistem",
                    "description": "Pastikan sistem berjalan dengan stabil untuk hasil yang optimal.",
                    "potential_impact": "medium"
                }
            ],
            "metrics_to_monitor": [
                {
                    "metric": "Uptime Sistem",
                    "target": "99.5% uptime",
                    "current_value": "Error"
                }
            ]
        }