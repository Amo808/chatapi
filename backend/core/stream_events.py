from typing import Literal, Any, Dict, Optional, List
from datetime import datetime
from dataclasses import dataclass
import json


@dataclass
class StreamEvent:
    """Структурированное событие потока по образцу Lobe Chat"""
    
    type: Literal["text", "tool_calls", "reasoning", "usage", "error", "stop"]
    data: Any
    id: Optional[str] = None
    timestamp: Optional[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()
    
    def to_sse(self) -> str:
        """Конвертация в Server-Sent Events формат"""
        event_data = {
            "type": self.type,
            "data": self.data,
            "id": self.id,
            "timestamp": self.timestamp
        }
        return f"data: {json.dumps(event_data, ensure_ascii=False)}\n\n"
    
    @classmethod
    def text(cls, content: str, message_id: Optional[str] = None) -> "StreamEvent":
        """Создание текстового события"""
        return cls(type="text", data=content, id=message_id)
    
    @classmethod
    def tool_calls(cls, tools: List[Dict], message_id: Optional[str] = None) -> "StreamEvent":
        """Создание события вызова инструментов"""
        return cls(type="tool_calls", data=tools, id=message_id)
    
    @classmethod
    def reasoning(cls, thinking: str, message_id: Optional[str] = None) -> "StreamEvent":
        """Создание события рассуждения (для моделей с CoT)"""
        return cls(type="reasoning", data=thinking, id=message_id)
    
    @classmethod
    def usage(cls, tokens_in: int, tokens_out: int, model: str, message_id: Optional[str] = None) -> "StreamEvent":
        """Создание события использования токенов"""
        usage_data = {
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "model": model
        }
        return cls(type="usage", data=usage_data, id=message_id)
    
    @classmethod
    def error(cls, error_message: str, error_type: str = "unknown", message_id: Optional[str] = None) -> "StreamEvent":
        """Создание события ошибки"""
        error_data = {
            "message": error_message,
            "error_type": error_type
        }
        return cls(type="error", data=error_data, id=message_id)
    
    @classmethod
    def stop(cls, reason: str = "finished", message_id: Optional[str] = None) -> "StreamEvent":
        """Создание события завершения"""
        return cls(type="stop", data=reason, id=message_id)


class StreamEventBuilder:
    """Помощник для построения потока событий"""
    
    def __init__(self, message_id: str):
        self.message_id = message_id
        self.events = []
    
    def add_text(self, content: str) -> "StreamEventBuilder":
        """Добавить текстовое событие"""
        self.events.append(StreamEvent.text(content, self.message_id))
        return self
    
    def add_reasoning(self, thinking: str) -> "StreamEventBuilder":
        """Добавить событие рассуждения"""
        self.events.append(StreamEvent.reasoning(thinking, self.message_id))
        return self
    
    def add_usage(self, tokens_in: int, tokens_out: int, model: str) -> "StreamEventBuilder":
        """Добавить событие использования"""
        self.events.append(StreamEvent.usage(tokens_in, tokens_out, model, self.message_id))
        return self
    
    def add_error(self, error_message: str, error_type: str = "unknown") -> "StreamEventBuilder":
        """Добавить событие ошибки"""
        self.events.append(StreamEvent.error(error_message, error_type, self.message_id))
        return self
    
    def finish(self, reason: str = "completed") -> "StreamEventBuilder":
        """Добавить событие завершения"""
        self.events.append(StreamEvent.stop(reason, self.message_id))
        return self
    
    def build(self):
        """Получить все события"""
        return self.events
    
    async def stream(self):
        """Асинхронный генератор событий"""
        for event in self.events:
            yield event
