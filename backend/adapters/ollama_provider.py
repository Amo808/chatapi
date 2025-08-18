import httpx
import json
from typing import List, Dict, Any, AsyncIterator
from ..core.base_provider import BaseProvider


class OllamaProvider(BaseProvider):
    """Адаптер для Ollama (локальные модели)"""
    
    def __init__(self, api_key: str = "", **config):
        super().__init__(api_key, **config)
        self.base_url = config.get('base_url', "http://localhost:11434")
        self.client = httpx.AsyncClient(timeout=120.0)
    
    @property
    def provider_name(self) -> str:
        return "ollama"
    
    def list_models(self) -> List[Dict[str, Any]]:
        """Возвращает список доступных моделей Ollama"""
        return [
            {
                "id": "llama3.2:latest",
                "name": "Llama 3.2",
                "context_length": 32768,
                "supports_streaming": True
            },
            {
                "id": "qwen2.5:latest",
                "name": "Qwen 2.5",
                "context_length": 32768,
                "supports_streaming": True
            },
            {
                "id": "codellama:latest",
                "name": "Code Llama",
                "context_length": 16384,
                "supports_streaming": True
            }
        ]
    
    def estimate_tokens(self, messages: List[Dict[str, Any]]) -> int:
        """Приблизительная оценка токенов"""
        total_chars = 0
        for message in messages:
            if isinstance(message.get('content'), str):
                total_chars += len(message['content'])
        
        # Для локальных моделей используем консервативную оценку
        return int(total_chars / 3) + len(messages) * 10
    
    async def stream_chat(self, messages: List[Dict[str, Any]], params: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
        """Потоковая генерация ответа через Ollama"""
        
        request_data = {
            "model": params.get("model", "llama3.2:latest"),
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": params.get("temperature", 0.7),
                "num_predict": params.get("max_tokens", 2048)
            }
        }
        
        try:
            async with self.client.stream("POST", f"{self.base_url}/api/chat", 
                                        json=request_data) as response:
                if response.status_code != 200:
                    error_data = await response.aread()
                    yield {
                        "type": "error",
                        "error": f"Ollama API Error {response.status_code}: {error_data.decode()}"
                    }
                    return
                
                tokens_generated = 0
                
                async for line in response.aiter_lines():
                    if not line:
                        continue
                        
                    try:
                        data = json.loads(line)
                        
                        if 'message' in data and 'content' in data['message']:
                            content = data['message']['content']
                            if content:
                                tokens_generated += 1
                                yield {
                                    "type": "content",
                                    "content": content
                                }
                        
                        # Проверяем завершение
                        if data.get('done', False):
                            yield {
                                "type": "done",
                                "meta": {
                                    "tokens_in": self.estimate_tokens(messages),
                                    "tokens_out": tokens_generated,
                                    "model": request_data["model"],
                                    "total_duration": data.get('total_duration', 0),
                                    "load_duration": data.get('load_duration', 0)
                                }
                            }
                            return
                    
                    except (json.JSONDecodeError, KeyError) as e:
                        continue
                
        except httpx.ConnectError:
            yield {
                "type": "error",
                "error": "Не удается подключиться к Ollama. Убедитесь, что Ollama запущен на localhost:11434"
            }
        except Exception as e:
            yield {
                "type": "error",
                "error": f"Ошибка при обращении к Ollama API: {str(e)}"
            }
    
    async def close(self):
        """Закрытие ресурсов"""
        await self.client.aclose()
