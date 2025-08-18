import os
import json
import asyncio
from typing import List, Dict, Any, AsyncIterator
import httpx
from .base_adapter import ProviderAdapter, ModelCard, ModelAbilities, ModelType, StreamChunk


class DeepSeekAdapter(ProviderAdapter):
    """Адаптер для DeepSeek AI"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get('api_key') or os.getenv('DEEPSEEK_API_KEY')
        self.base_url = config.get('base_url', 'https://api.deepseek.com')
        if not self.api_key:
            raise ValueError("DeepSeek API key is required")
    
    def list_models(self) -> List[ModelCard]:
        """Возвращает список доступных моделей DeepSeek"""
        return [
            ModelCard(
                id="deepseek-chat",
                name="DeepSeek Chat",
                provider="deepseek",
                type=ModelType.CHAT,
                abilities=ModelAbilities(
                    function_call=True,
                    vision=False,
                    reasoning=True,
                    streaming=True
                ),
                context_window=32768,
                enabled=True,
                description="DeepSeek's flagship conversational model with reasoning capabilities",
                pricing={"input": 0.14, "output": 0.28}  # per 1M tokens
            ),
            ModelCard(
                id="deepseek-reasoner",
                name="DeepSeek Reasoner", 
                provider="deepseek",
                type=ModelType.CHAT,
                abilities=ModelAbilities(
                    function_call=True,
                    vision=False,
                    reasoning=True,
                    streaming=True
                ),
                context_window=64000,
                enabled=True,
                description="Advanced reasoning model for complex problem solving",
                pricing={"input": 0.55, "output": 2.19}  # per 1M tokens
            ),
            ModelCard(
                id="deepseek-coder",
                name="DeepSeek Coder",
                provider="deepseek", 
                type=ModelType.CHAT,
                abilities=ModelAbilities(
                    function_call=True,
                    vision=False,
                    reasoning=False,
                    streaming=True
                ),
                context_window=16384,
                enabled=True,
                description="Specialized model for code generation and programming tasks",
                pricing={"input": 0.14, "output": 0.28}
            )
        ]
    
    def validate_config(self) -> bool:
        """Проверяет валидность конфигурации"""
        return bool(self.api_key)
    
    async def stream_chat(
        self,
        messages: List[Dict[str, Any]],
        model: str = "deepseek-chat",
        temperature: float = 0.7,
        max_tokens: int = 4000,
        **kwargs
    ) -> AsyncIterator[StreamChunk]:
        """Потоковый чат с DeepSeek API"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
            **kwargs
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/v1/chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        raise httpx.HTTPError(f"DeepSeek API error: {response.status_code} - {error_text}")
                    
                    buffer = ""
                    async for chunk_bytes in response.aiter_bytes():
                        if not chunk_bytes:
                            continue
                            
                        buffer += chunk_bytes.decode('utf-8', errors='ignore')
                        
                        while '\n' in buffer:
                            line, buffer = buffer.split('\n', 1)
                            line = line.strip()
                            
                            if not line or not line.startswith('data: '):
                                continue
                                
                            if line == 'data: [DONE]':
                                yield StreamChunk(delta="", finished=True)
                                return
                            
                            try:
                                data = json.loads(line[6:])  # Remove 'data: ' prefix
                                if 'choices' in data and data['choices']:
                                    choice = data['choices'][0]
                                    delta = choice.get('delta', {})
                                    
                                    if 'content' in delta and delta['content']:
                                        yield StreamChunk(
                                            delta=delta['content'],
                                            finished=False
                                        )
                                    
                                    # Handle reasoning if present
                                    if 'reasoning_content' in delta and delta['reasoning_content']:
                                        yield StreamChunk(
                                            delta="",
                                            finished=False,
                                            reasoning=delta['reasoning_content']
                                        )
                                    
                                    # Handle usage information
                                    if 'usage' in data and data['usage']:
                                        yield StreamChunk(
                                            delta="",
                                            finished=False,
                                            usage=data['usage']
                                        )
                                        
                                    # Check if finished
                                    if choice.get('finish_reason'):
                                        yield StreamChunk(delta="", finished=True)
                                        return
                                        
                            except json.JSONDecodeError:
                                # Skip invalid JSON lines
                                continue
                                
            except httpx.HTTPError as e:
                yield StreamChunk(delta=f"Error: {str(e)}", finished=True)
            except Exception as e:
                yield StreamChunk(delta=f"Unexpected error: {str(e)}", finished=True)
    
    def estimate_tokens(self, messages: List[Dict[str, Any]]) -> int:
        """Простая оценка токенов (4 символа = 1 токен)"""
        total_chars = sum(len(str(msg.get('content', ''))) for msg in messages)
        return total_chars // 4
    
    def usage_supported(self) -> bool:
        """DeepSeek поддерживает точный учет токенов"""
        return True
