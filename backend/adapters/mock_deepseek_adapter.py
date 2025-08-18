import asyncio
import json
from typing import AsyncIterator, Dict, Any, List
from ..core.base_provider import BaseProvider


class MockDeepSeekAdapter(BaseProvider):
    """Mock адаптер для демонстрации без реального API"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    @property
    def provider_name(self) -> str:
        return "deepseek-mock"
        
    def list_models(self) -> List[Dict[str, Any]]:
        """Возвращает список доступных моделей"""
        return [
            {
                "id": "deepseek-chat",
                "name": "DeepSeek Chat (Mock)",
                "context_length": 32768,
                "supports_streaming": True
            }
        ]
    
    def estimate_tokens(self, messages: List[Dict[str, Any]]) -> int:
        """Приблизительная оценка токенов"""
        total_chars = sum(len(msg.get('content', '')) for msg in messages)
        return int(total_chars / 2.5) + len(messages) * 10
    
    async def stream_chat(self, messages: List[Dict[str, Any]], params: Dict[str, Any]) -> AsyncIterator[Dict[str, Any]]:
        """Эмуляция потоковой генерации ответа"""
        
        # Получаем последнее сообщение пользователя
        user_message = messages[-1].get('content', '') if messages else ''
        
        # Генерируем ответ на основе сообщения пользователя
        mock_response = self._generate_mock_response(user_message)
        
        # Имитируем потоковую передачу
        words = mock_response.split(' ')
        
        for i, word in enumerate(words):
            await asyncio.sleep(0.1)  # Имитация задержки сети
            
            if i == 0:
                yield {
                    "type": "content",
                    "content": word
                }
            else:
                yield {
                    "type": "content", 
                    "content": " " + word
                }
        
        # Завершение потока
        yield {
            "type": "done",
            "meta": {
                "tokens_in": self.estimate_tokens(messages),
                "tokens_out": len(words),
                "model": "deepseek-chat-mock"
            }
        }
    
    def _generate_mock_response(self, user_message: str) -> str:
        """Генерирует mock ответ на основе сообщения пользователя"""
        
        user_lower = user_message.lower()
        
        if any(word in user_lower for word in ['привет', 'hello', 'hi', 'здравствуй']):
            return """Привет! 👋 Я - DeepSeek AI (демо режим). 

Я могу помочь вам с:
- **Программированием** и написанием кода
- **Математическими** формулами: $E = mc^2$ 
- **Объяснением** сложных концепций
- **Творческими** задачами

Попробуйте спросить что-нибудь интересное!"""

        elif any(word in user_lower for word in ['код', 'code', 'программ', 'python', 'javascript']):
            return """Конечно! Вот пример кода на Python:

```python
def fibonacci(n):
    \"\"\"Генерация последовательности Фибоначчи\"\"\"
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Пример использования
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

Этот код демонстрирует рекурсивный подход к вычислению чисел Фибоначчи."""

        elif any(word in user_lower for word in ['математ', 'formula', 'уравнен']):
            return """Вот несколько интересных математических формул:

## Квадратное уравнение
$$ax^2 + bx + c = 0$$

Решение: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

## Формула Эйлера
$$e^{i\\pi} + 1 = 0$$

## Интеграл Гаусса
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

Эти формулы демонстрируют красоту математики! 🧮"""

        elif any(word in user_lower for word in ['помощь', 'help', 'что ты']):
            return """# Возможности DeepSeek AI (демо)

## 🤖 Что я умею:
1. **Отвечать на вопросы** любой сложности
2. **Писать и объяснять код** на разных языках
3. **Решать математические задачи**
4. **Рендерить Markdown** и LaTeX формулы
5. **Помогать с творческими задачами**

## 💡 Примеры запросов:
- "Объясни как работает React"
- "Напиши функцию сортировки"  
- "Покажи формулу производной"
- "Расскажи анекдот про программистов"

**Примечание**: Это демо-режим. Для реальных ответов нужен API ключ DeepSeek с положительным балансом."""

        else:
            # Общий ответ для любых других вопросов
            return f"""Интересный вопрос! В демо-режиме я могу сказать следующее:

Ваше сообщение: "{user_message[:100]}{'...' if len(user_message) > 100 else ''}"

## Анализ запроса:
- **Длина**: {len(user_message)} символов
- **Слов**: {len(user_message.split())}
- **Тип**: {"Вопрос" if "?" in user_message else "Утверждение"}

В реальном режиме DeepSeek AI дал бы развернутый и точный ответ на ваш запрос. 

🔧 **Для полной функциональности**: пополните баланс DeepSeek аккаунта."""

    async def close(self):
        """Закрытие ресурсов"""
        pass
