import tiktoken
from typing import List, Dict, Any


class TokenEstimator:
    """Оценка количества токенов для сообщений"""
    
    def __init__(self, model_name: str = "gpt-3.5-turbo"):
        try:
            # Используем стандартную кодировку для большинства моделей чата
            self.encoding = tiktoken.get_encoding("cl100k_base")
        except:
            # Fallback если tiktoken недоступен
            self.encoding = None
    
    def count_tokens_in_text(self, text: str) -> int:
        """Подсчет токенов в тексте"""
        if self.encoding:
            return len(self.encoding.encode(text))
        else:
            # Приблизительная оценка: 1 токен ≈ 4 символа
            return len(text) // 4
    
    def count_tokens_in_messages(self, messages: List[Dict[str, Any]]) -> int:
        """Подсчет токенов для списка сообщений"""
        total_tokens = 0
        
        for message in messages:
            # Добавляем токены за структуру сообщения
            total_tokens += 4  # За role и другие метаданные
            
            # Добавляем токены за содержимое
            if isinstance(message.get('content'), str):
                total_tokens += self.count_tokens_in_text(message['content'])
        
        # Добавляем токены за общую структуру запроса
        total_tokens += 2
        
        return total_tokens
