import httpx
import json
from typing import List, Dict, Any, AsyncIterator
from ..core.base_provider import BaseProvider


class OpenAIProvider(BaseProvider):
    """Адаптер для OpenAI API"""
    
    def __init__(self, api_key: str, **config):
        super().__init__(api_key, **config)
        self.base_url = config.get('base_url', "https://api.openai.com/v1")
        self.client = httpx.AsyncClient(
            timeout=60.0,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
        )
    
    @property
    def provider_name(self) -> str:
        return "openai"
    
    def list_models(self) -> List[Dict[str, Any]]:
        """Возвращает список доступных моделей OpenAI"""
        return [
            {
                "id": "gpt-4",
                "name": "GPT-4",
                "context_length": 8192,
                "supports_streaming": True
            },
            {
                "id": "gpt-4-turbo",
                "name": "GPT-4 Turbo",
                "context_length": 128000,
                "supports_streaming": True
            },
            {
                "id": "gpt-3.5-turbo",
                "name": "GPT-3.5 Turbo", 
                "context_length": 4096,
                "supports_streaming": True
            }
        ]
    
    def estimate_tokens(self, messages: List[Dict[str, Any]]) -> int:
        """Приблизительная оценка токенов для OpenAI"""
        total_chars = 0
        for message in messages:
            if isinstance(message.get('content'), str):
                total_chars += len(message['content'])
        
        # OpenAI: примерно 1 токен = 4 символа для английского, 2-3 для русского
        return int(total_chars / 3) + len(messages) * 8
    
    async def stream_chat(self, messages: List[Dict[str, Any]], params: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
        """Потоковая генерация ответа от OpenAI"""
        
        request_data = {
            "model": params.get("model", "gpt-3.5-turbo"),
            "messages": messages,
            "temperature": params.get("temperature", 0.7),
            "max_tokens": params.get("max_tokens", 2048),
            "stream": True
        }
        
        try:
            async with self.client.stream("POST", f"{self.base_url}/chat/completions", 
                                        json=request_data) as response:
                if response.status_code != 200:
                    error_data = await response.aread()
                    yield {
                        "type": "error",
                        "error": f"OpenAI API Error {response.status_code}: {error_data.decode()}"
                    }
                    return
                
                buffer = ""
                tokens_generated = 0
                
                async for chunk in response.aiter_bytes():
                    buffer += chunk.decode('utf-8')
                    
                    while '\n' in buffer:
                        line, buffer = buffer.split('\n', 1)
                        line = line.strip()
                        
                        if not line or not line.startswith('data: '):
                            continue
                        
                        if line == 'data: [DONE]':
                            break
                            
                        try:
                            data_str = line[6:]  # Убираем 'data: '
                            data = json.loads(data_str)
                            
                            if 'choices' in data and len(data['choices']) > 0:
                                choice = data['choices'][0]
                                
                                if 'delta' in choice and 'content' in choice['delta']:
                                    content = choice['delta']['content']
                                    if content:
                                        tokens_generated += 1
                                        yield {
                                            "type": "content",
                                            "content": content
                                        }
                                
                                # Проверяем завершение
                                if choice.get('finish_reason'):
                                    yield {
                                        "type": "done",
                                        "meta": {
                                            "tokens_in": self.estimate_tokens(messages),
                                            "tokens_out": tokens_generated,
                                            "model": request_data["model"],
                                            "finish_reason": choice['finish_reason']
                                        }
                                    }
                                    return
                        
                        except (json.JSONDecodeError, KeyError) as e:
                            # Игнорируем неполные или невалидные JSON данные
                            continue
                
        except Exception as e:
            yield {
                "type": "error",
                "error": f"Ошибка при обращении к OpenAI API: {str(e)}"
            }
    
    async def close(self):
        """Закрытие ресурсов"""
        await self.client.aclose()
