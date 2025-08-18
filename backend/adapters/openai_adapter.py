import os
import json
from typing import List, Dict, Any, AsyncIterator
import httpx
from .base_adapter import ProviderAdapter, ModelCard, ModelAbilities, ModelType, StreamChunk


class OpenAIAdapter(ProviderAdapter):
    """Адаптер для OpenAI API"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get('api_key') or os.getenv('OPENAI_API_KEY')
        self.base_url = config.get('base_url', 'https://api.openai.com')
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
    
    def list_models(self) -> List[ModelCard]:
        """Возвращает список доступных моделей OpenAI"""
        return [
            ModelCard(
                id="gpt-4o",
                name="GPT-4o",
                provider="openai",
                type=ModelType.CHAT,
                abilities=ModelAbilities(
                    function_call=True,
                    vision=True,
                    reasoning=False,
                    streaming=True
                ),
                context_window=128000,
                enabled=True,
                description="OpenAI's most capable multimodal model",
                pricing={"input": 2.50, "output": 10.00}
            ),
            ModelCard(
                id="gpt-4o-mini",
                name="GPT-4o Mini",
                provider="openai",
                type=ModelType.CHAT,
                abilities=ModelAbilities(
                    function_call=True,
                    vision=True,
                    reasoning=False,
                    streaming=True
                ),
                context_window=128000,
                enabled=True,
                description="Affordable and intelligent small model for lightweight tasks",
                pricing={"input": 0.15, "output": 0.60}
            ),
            ModelCard(
                id="gpt-4-turbo",
                name="GPT-4 Turbo",
                provider="openai",
                type=ModelType.CHAT,
                abilities=ModelAbilities(
                    function_call=True,
                    vision=True,
                    reasoning=False,
                    streaming=True
                ),
                context_window=128000,
                enabled=True,
                description="High-intelligence model for complex, multi-step tasks",
                pricing={"input": 10.00, "output": 30.00}
            ),
            ModelCard(
                id="gpt-3.5-turbo",
                name="GPT-3.5 Turbo",
                provider="openai",
                type=ModelType.CHAT,
                abilities=ModelAbilities(
                    function_call=True,
                    vision=False,
                    reasoning=False,
                    streaming=True
                ),
                context_window=16385,
                enabled=True,
                description="Fast, inexpensive model for simple tasks",
                pricing={"input": 0.50, "output": 1.50}
            ),
            ModelCard(
                id="o1",
                name="o1",
                provider="openai",
                type=ModelType.CHAT,
                abilities=ModelAbilities(
                    function_call=False,
                    vision=False,
                    reasoning=True,
                    streaming=False
                ),
                context_window=200000,
                enabled=True,
                description="Reasoning model designed to solve hard problems across domains",
                pricing={"input": 15.00, "output": 60.00}
            ),
            ModelCard(
                id="o1-mini",
                name="o1 Mini",
                provider="openai",
                type=ModelType.CHAT,
                abilities=ModelAbilities(
                    function_call=False,
                    vision=False,
                    reasoning=True,
                    streaming=False
                ),
                context_window=128000,
                enabled=True,
                description="Faster and cheaper reasoning model particularly good at coding, math, and science",
                pricing={"input": 3.00, "output": 12.00}
            )
        ]
    
    def validate_config(self) -> bool:
        """Проверяет валидность конфигурации"""
        return bool(self.api_key)
    
    async def stream_chat(
        self,
        messages: List[Dict[str, Any]],
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: int = 4000,
        **kwargs
    ) -> AsyncIterator[StreamChunk]:
        """Потоковый чат с OpenAI API"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # o1 models don't support streaming
        is_reasoning_model = model.startswith("o1")
        stream = not is_reasoning_model
        
        payload = {
            "model": model,
            "messages": messages,
            "stream": stream,
            **kwargs
        }
        
        # o1 models have specific parameter restrictions
        if not is_reasoning_model:
            payload["temperature"] = temperature
            payload["max_tokens"] = max_tokens
        else:
            # o1 models use max_completion_tokens instead of max_tokens
            payload["max_completion_tokens"] = max_tokens
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                if stream:
                    async with client.stream(
                        "POST",
                        f"{self.base_url}/v1/chat/completions",
                        headers=headers,
                        json=payload
                    ) as response:
                        if response.status_code != 200:
                            error_text = await response.aread()
                            raise httpx.HTTPError(f"OpenAI API error: {response.status_code} - {error_text}")
                        
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
                                        
                                        # Handle function calls
                                        if 'function_call' in delta:
                                            yield StreamChunk(
                                                delta="",
                                                finished=False,
                                                tool_calls=[{"function": delta['function_call']}]
                                            )
                                        
                                        # Handle tool calls
                                        if 'tool_calls' in delta:
                                            yield StreamChunk(
                                                delta="",
                                                finished=False,
                                                tool_calls=delta['tool_calls']
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
                                    continue
                else:
                    # Non-streaming request for o1 models
                    response = await client.post(
                        f"{self.base_url}/v1/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    
                    if response.status_code != 200:
                        error_text = response.text
                        raise httpx.HTTPError(f"OpenAI API error: {response.status_code} - {error_text}")
                    
                    data = response.json()
                    if 'choices' in data and data['choices']:
                        choice = data['choices'][0]
                        message = choice.get('message', {})
                        content = message.get('content', '')
                        
                        # For reasoning models, we might have reasoning content
                        if 'reasoning' in message:
                            yield StreamChunk(
                                delta="",
                                finished=False,
                                reasoning=message['reasoning']
                            )
                        
                        # Send the full response at once
                        yield StreamChunk(
                            delta=content,
                            finished=False
                        )
                        
                        # Handle usage information
                        if 'usage' in data:
                            yield StreamChunk(
                                delta="",
                                finished=False,
                                usage=data['usage']
                            )
                        
                        yield StreamChunk(delta="", finished=True)
                        
            except httpx.HTTPError as e:
                yield StreamChunk(delta=f"Error: {str(e)}", finished=True)
            except Exception as e:
                yield StreamChunk(delta=f"Unexpected error: {str(e)}", finished=True)
    
    def estimate_tokens(self, messages: List[Dict[str, Any]]) -> int:
        """Простая оценка токенов (4 символа = 1 токен)"""
        total_chars = sum(len(str(msg.get('content', ''))) for msg in messages)
        return total_chars // 4
    
    def usage_supported(self) -> bool:
        """OpenAI поддерживает точный учет токенов"""
        return True
