from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.chatbot_service import ChatbotService
from app.schemas.chatbot import ChatRequest, ChatResponse, ChatMessage, ChatSession
from app.crud.chatbot import get_or_create_session, get_chat_history

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Process chat message and return AI response
    """
    try:
        # Get or create session
        session = get_or_create_session(db, request.user_id)
        
        # Initialize chatbot service
        chatbot_service = ChatbotService(db)
        
        # Process message
        result = await chatbot_service.process_message(request.message, session.session_id)
        
        return ChatResponse(**result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@router.get("/chat/history/{session_id}", response_model=List[ChatMessage])
async def get_chat_history_route(session_id: int, limit: int = 10, db: Session = Depends(get_db)):
    """
    Get chat history for a session
    """
    try:
        history = get_chat_history(db, session_id, limit)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting chat history: {str(e)}")

@router.get("/chat/session/{user_id}", response_model=ChatSession)
async def get_or_create_session_route(user_id: str, db: Session = Depends(get_db)):
    """
    Get or create chat session for user
    """
    try:
        session = get_or_create_session(db, user_id)
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting session: {str(e)}")
