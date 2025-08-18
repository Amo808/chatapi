from typing import List, Dict, Any
from ..models.schemas import ChatMessage
from .token_estimator import TokenEstimator


class PromptBuilder:
    """Сборка контекста для отправки в модель с учетом лимитов токенов"""
    
    def __init__(self, max_tokens: int = 4000):
        self.max_tokens = max_tokens
        self.token_estimator = TokenEstimator()
    
    def build_context(self, history: List[ChatMessage], new_message: str) -> List[Dict[str, Any]]:
        """
        Собирает контекст для отправки в модель.
        При превышении лимита токенов удаляет старые сообщения.
        """
        
        # Добавляем новое сообщение пользователя
        messages = []
        
        # Преобразуем историю в формат для API
        for msg in history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Добавляем новое сообщение
        messages.append({
            "role": "user", 
            "content": new_message
        })
        
        # Проверяем количество токенов и обрезаем если нужно
        while len(messages) > 1:  # Оставляем минимум 1 сообщение
            token_count = self.token_estimator.count_tokens_in_messages(messages)
            
            if token_count <= self.max_tokens:
                break
                
            # Удаляем самое старое сообщение (кроме системного)
            if messages[0].get("role") == "system" and len(messages) > 2:
                # Если первое сообщение системное, удаляем второе
                messages.pop(1)
            else:
                # Иначе удаляем первое
                messages.pop(0)
        
        return messages
    
    def estimate_tokens(self, messages: List[Dict[str, Any]]) -> int:
        """Оценивает количество токенов в сообщениях"""
        return self.token_estimator.count_tokens_in_messages(messages)
    
    def build_messages(self, messages: List[ChatMessage], system_message: str = None) -> List[Dict[str, Any]]:
        """
        Преобразует список ChatMessage в формат для API провайдера.
        Добавляет системное сообщение если указано.
        """
        result = []
        
        # Добавляем системное сообщение если есть
        if system_message:
            result.append({
                "role": "system",
                "content": system_message
            })
        
        # Преобразуем остальные сообщения
        for msg in messages:
            result.append({
                "role": msg.role,
                "content": msg.content
            })
        
        return result
