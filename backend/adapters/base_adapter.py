from abc import ABC, abstractmethod
from typing import List, Dict, Any, AsyncIterator, Optional
from dataclasses import dataclass
from enum import Enum


class ModelType(Enum):
    CHAT = "chat"
    COMPLETION = "completion"
    EMBEDDING = "embedding"
    IMAGE_GENERATION = "image_generation"


@dataclass
class ModelAbilities:
    function_call: bool = False
    vision: bool = False
    reasoning: bool = False
    streaming: bool = True


@dataclass
class ModelCard:
    id: str
    name: str
    provider: str
    type: ModelType
    abilities: ModelAbilities
    context_window: int
    enabled: bool = True
    description: Optional[str] = None
    pricing: Optional[Dict[str, float]] = None


@dataclass
class StreamChunk:
    delta: str
    finished: bool = False
    tool_calls: Optional[List[Dict]] = None
    usage: Optional[Dict[str, int]] = None
    reasoning: Optional[str] = None


class ProviderAdapter(ABC):
    """Базовый интерфейс для адаптеров провайдеров AI"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.provider_name = self.__class__.__name__.replace('Adapter', '').lower()
    
    @abstractmethod
    def list_models(self) -> List[ModelCard]:
        """Возвращает список доступных моделей"""
        pass
        
    @abstractmethod
    async def stream_chat(
        self, 
        messages: List[Dict[str, Any]], 
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 4000,
        **kwargs
    ) -> AsyncIterator[StreamChunk]:
        """Потоковый чат с AI"""
        pass
        
    @abstractmethod
    def validate_config(self) -> bool:
        """Проверяет валидность конфигурации"""
        pass
        
    def get_model_by_id(self, model_id: str) -> Optional[ModelCard]:
        """Получает модель по ID"""
        models = self.list_models()
        return next((m for m in models if m.id == model_id), None)
    
    def supports_streaming(self, model_id: str) -> bool:
        """Проверяет поддержку стриминга для модели"""
        model = self.get_model_by_id(model_id)
        return model.abilities.streaming if model else False
