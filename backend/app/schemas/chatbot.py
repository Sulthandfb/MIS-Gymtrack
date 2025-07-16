from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

class ChatMessageBase(BaseModel):
    content: str
    message_type: str

class ChatMessageCreate(ChatMessageBase):
    session_id: Optional[int] = None

class ChatMessage(ChatMessageBase):
    message_id: int
    session_id: int
    timestamp: datetime
    context_data: Optional[str] = None
    
    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    user_id: Optional[str] = None

class ChatSessionCreate(ChatSessionBase):
    pass

class ChatSession(ChatSessionBase):
    session_id: int
    session_start: datetime
    last_activity: datetime
    is_active: int
    messages: List[ChatMessage] = []
    
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: int
    context_used: Optional[Dict[str, Any]] = None
    data_sources: Optional[List[str]] = None
