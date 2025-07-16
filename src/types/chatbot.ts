export interface ChatMessage {
  message_id: number;
  session_id: number;
  message_type: 'user' | 'bot';
  content: string;
  timestamp: string;
  context_data?: string;
}

export interface ChatSession {
  session_id: number;
  user_id?: string;
  session_start: string;
  last_activity: string;
  is_active: number;
  messages: ChatMessage[];
}

export interface ChatRequest {
  message: string;
  session_id?: number;
  user_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: number;
  context_used?: Record<string, any>;
  data_sources?: string[];
}
