import json
import os
from typing import Dict, Any, List, Optional
from dataclasses import asdict
from ..adapters import ProviderFactory, ModelCard


class ProviderManager:
    """Менеджер провайдеров AI для управления конфигурациями и моделями"""
    
    def __init__(self, config_file: str = "data/providers.json"):
        self.config_file = config_file
        self.providers_config = self._load_config()
        self._providers_cache = {}
    
    def _load_config(self) -> Dict[str, Any]:
        """Загружает конфигурацию провайдеров"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading providers config: {e}")
        
        # Дефолтная конфигурация
        default_config = {
            "deepseek": {
                "enabled": True,
                "api_key": os.getenv("DEEPSEEK_API_KEY", ""),
                "base_url": "https://api.deepseek.com",
                "models": {
                    "deepseek-chat": {"enabled": True},
                    "deepseek-reasoner": {"enabled": True},
                    "deepseek-coder": {"enabled": True}
                }
            },
            "openai": {
                "enabled": False,
                "api_key": os.getenv("OPENAI_API_KEY", ""),
                "base_url": "https://api.openai.com",
                "models": {
                    "gpt-4o": {"enabled": True},
                    "gpt-4o-mini": {"enabled": True},
                    "gpt-4-turbo": {"enabled": False},
                    "gpt-3.5-turbo": {"enabled": False},
                    "o1": {"enabled": False},
                    "o1-mini": {"enabled": False}
                }
            }
        }
        
        self._save_config(default_config)
        return default_config
    
    def _save_config(self, config: Dict[str, Any] = None):
        """Сохраняет конфигурацию провайдеров"""
        config = config or self.providers_config
        
        os.makedirs(os.path.dirname(self.config_file), exist_ok=True)
        
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
    
    def get_provider(self, provider_name: str):
        """Получает экземпляр провайдера"""
        if provider_name not in self._providers_cache:
            config = self.providers_config.get(provider_name, {})
            if not config.get('enabled', False):
                raise ValueError(f"Provider '{provider_name}' is not enabled")
            
            provider = ProviderFactory.create_provider(provider_name, config)
            if not provider.validate_config():
                raise ValueError(f"Invalid configuration for provider '{provider_name}'")
            
            self._providers_cache[provider_name] = provider
        
        return self._providers_cache[provider_name]
    
    def get_available_providers(self) -> List[str]:
        """Получает список доступных провайдеров"""
        return [
            name for name, config in self.providers_config.items() 
            if config.get('enabled', False)
        ]
    
    def get_all_models(self) -> List[Dict[str, Any]]:
        """Получает все доступные модели"""
        all_models = []
        
        for provider_name in self.get_available_providers():
            try:
                provider = self.get_provider(provider_name)
                models = provider.list_models()
                
                # Фильтруем модели по конфигурации
                provider_config = self.providers_config[provider_name]
                enabled_models = provider_config.get('models', {})
                
                for model in models:
                    model_config = enabled_models.get(model.id, {})
                    if model_config.get('enabled', True):
                        model_dict = asdict(model)
                        all_models.append(model_dict)
                        
            except Exception as e:
                print(f"Error loading models from {provider_name}: {e}")
                continue
        
        return all_models
    
    def get_model_by_id(self, model_id: str) -> Optional[Dict[str, Any]]:
        """Получает модель по ID"""
        models = self.get_all_models()
        return next((m for m in models if m['id'] == model_id), None)
    
    def update_provider_config(self, provider_name: str, config: Dict[str, Any]):
        """Обновляет конфигурацию провайдера"""
        if provider_name not in self.providers_config:
            self.providers_config[provider_name] = {}
        
        self.providers_config[provider_name].update(config)
        self._save_config()
        
        # Сбрасываем кеш провайдера
        if provider_name in self._providers_cache:
            del self._providers_cache[provider_name]
    
    def enable_provider(self, provider_name: str, enabled: bool = True):
        """Включает/выключает провайдера"""
        if provider_name not in self.providers_config:
            self.providers_config[provider_name] = {}
        
        self.providers_config[provider_name]['enabled'] = enabled
        self._save_config()
        
        # Сбрасываем кеш
        if provider_name in self._providers_cache:
            del self._providers_cache[provider_name]
    
    def enable_model(self, provider_name: str, model_id: str, enabled: bool = True):
        """Включает/выключает модель"""
        if provider_name not in self.providers_config:
            self.providers_config[provider_name] = {}
        
        if 'models' not in self.providers_config[provider_name]:
            self.providers_config[provider_name]['models'] = {}
        
        if model_id not in self.providers_config[provider_name]['models']:
            self.providers_config[provider_name]['models'][model_id] = {}
        
        self.providers_config[provider_name]['models'][model_id]['enabled'] = enabled
        self._save_config()
    
    def get_provider_config(self, provider_name: str) -> Dict[str, Any]:
        """Получает конфигурацию провайдера"""
        return self.providers_config.get(provider_name, {})
    
    def validate_all_providers(self) -> Dict[str, bool]:
        """Проверяет валидность конфигурации всех провайдеров"""
        results = {}
        
        for provider_name, config in self.providers_config.items():
            if not config.get('enabled', False):
                results[provider_name] = False
                continue
            
            try:
                provider = ProviderFactory.create_provider(provider_name, config)
                results[provider_name] = provider.validate_config()
            except Exception as e:
                print(f"Error validating {provider_name}: {e}")
                results[provider_name] = False
        
        return results
