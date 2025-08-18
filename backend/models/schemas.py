from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime


class ChatMessage(BaseModel):
    role: str  # system, user, assistant
    content: str
    timestamp: Optional[str] = None
    name: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str = "deepseek-chat"
    temperature: float = 0.7
    max_tokens: int = 4000
    stream: bool = False
    system_message: Optional[str] = None
    conversation_id: Optional[str] = None
    save_history: bool = True
    tools: Optional[List[Dict[str, Any]]] = None


class ChatResponse(BaseModel):
    message: str
    model: str
    provider: str
    usage: Dict[str, Any] = {}
    reasoning: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    finish_reason: Optional[str] = None


class MessageRequest(BaseModel):
    message: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str
    meta: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    provider: Optional[str] = None
