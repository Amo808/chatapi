from typing import Dict, Any, Type, List
from .base_adapter import ProviderAdapter, ModelCard
from .deepseek_adapter import DeepSeekAdapter
from .openai_adapter import OpenAIAdapter


class ProviderFactory:
    """Фабрика для создания адаптеров провайдеров"""
    
    _providers: Dict[str, Type[ProviderAdapter]] = {
        'deepseek': DeepSeekAdapter,
        'openai': OpenAIAdapter,
    }
    
    @classmethod
    def create_provider(cls, provider_name: str, config: Dict[str, Any]) -> ProviderAdapter:
        """Создает адаптер провайдера по имени"""
        if provider_name not in cls._providers:
            available = ', '.join(cls._providers.keys())
            raise ValueError(f"Unknown provider '{provider_name}'. Available: {available}")
        
        provider_class = cls._providers[provider_name]
        return provider_class(config)
    
    @classmethod
    def get_available_providers(cls) -> List[str]:
        """Возвращает список доступных провайдеров"""
        return list(cls._providers.keys())
    
    @classmethod
    def get_all_models(cls, configs: Dict[str, Dict[str, Any]]) -> List[ModelCard]:
        """Получает все модели от всех настроенных провайдеров"""
        all_models = []
        
        for provider_name, provider_config in configs.items():
            try:
                if provider_config.get('enabled', False):
                    provider = cls.create_provider(provider_name, provider_config)
                    if provider.validate_config():
                        models = provider.list_models()
                        all_models.extend([m for m in models if m.enabled])
            except Exception as e:
                print(f"Error loading provider {provider_name}: {e}")
                continue
                
        return all_models
    
    @classmethod
    def register_provider(cls, name: str, provider_class: Type[ProviderAdapter]):
        """Регистрирует новый провайдер"""
        cls._providers[name] = provider_class
