from abc import ABC, abstractmethod
from typing import Dict, Any, List, AsyncIterator
from ..models.schemas import ChatMessage


class BaseProvider(ABC):
    """Базовый интерфейс для всех AI провайдеров"""
    
    def __init__(self, api_key: str, **config):
        self.api_key = api_key
        self.config = config
    
    @abstractmethod
    def list_models(self) -> List[Dict[str, Any]]:
        """Возвращает список доступных моделей"""
        pass
    
    @abstractmethod
    def estimate_tokens(self, messages: List[Dict[str, Any]]) -> int:
        """Оценка количества токенов"""
        pass
    
    @abstractmethod
    async def stream_chat(self, messages: List[Dict[str, Any]], params: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
        """Потоковая генерация ответа"""
        pass
    
    @abstractmethod
    async def close(self):
        """Закрытие ресурсов"""
        pass
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Имя провайдера"""
        pass
