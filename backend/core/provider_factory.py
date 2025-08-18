from typing import Dict, Type, List, Any
from .base_provider import BaseProvider
from ..adapters.deepseek_adapter import DeepSeekAdapter
from ..adapters.mock_deepseek_adapter import MockDeepSeekAdapter
from ..adapters.openai_provider import OpenAIProvider
from ..adapters.ollama_provider import OllamaProvider


class ProviderFactory:
    """Фабрика для создания AI провайдеров"""
    
    _providers: Dict[str, Type[BaseProvider]] = {
        "deepseek": DeepSeekAdapter,
        "deepseek-mock": MockDeepSeekAdapter,
        "openai": OpenAIProvider,
        "ollama": OllamaProvider,
    }
    
    @classmethod
    def register_provider(cls, name: str, provider_class: Type[BaseProvider]):
        """Регистрация нового провайдера"""
        cls._providers[name] = provider_class
    
    @classmethod
    def create_provider(cls, provider_name: str, api_key: str, **config) -> BaseProvider:
        """Создание экземпляра провайдера"""
        if provider_name not in cls._providers:
            available = ", ".join(cls._providers.keys())
            raise ValueError(f"Unknown provider: {provider_name}. Available: {available}")
        
        provider_class = cls._providers[provider_name]
        return provider_class(api_key, **config)
    
    @classmethod
    def list_available_providers(cls) -> List[str]:
        """Список доступных провайдеров"""
        return list(cls._providers.keys())
    
    @classmethod
    def get_provider_info(cls, provider_name: str) -> Dict[str, Any]:
        """Информация о провайдере"""
        if provider_name not in cls._providers:
            return None
            
        provider_class = cls._providers[provider_name]
        return {
            "name": provider_name,
            "class": provider_class.__name__,
            "description": provider_class.__doc__ or "No description"
        }
