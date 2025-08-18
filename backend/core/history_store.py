import json
import os
from typing import List, Dict, Any
from datetime import datetime
from pathlib import Path

from ..models.schemas import ChatMessage


class HistoryStore:
    """Управление историей чата в формате JSONL"""
    
    def __init__(self, history_file: str = "data/history.jsonl"):
        self.history_file = Path(history_file)
        self.history_file.parent.mkdir(exist_ok=True)
        
        # Создаем пустой файл если его нет
        if not self.history_file.exists():
            self.history_file.touch()
    
    def load_history(self) -> List[ChatMessage]:
        """Загружает историю из JSONL файла"""
        history = []
        
        if not self.history_file.exists():
            return history
            
        try:
            with open(self.history_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        data = json.loads(line)
                        history.append(ChatMessage(**data))
        except Exception as e:
            print(f"Ошибка загрузки истории: {e}")
            
        return history
    
    def save_message(self, message: ChatMessage):
        """Сохраняет одно сообщение в JSONL файл"""
        try:
            with open(self.history_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(message.model_dump(), ensure_ascii=False) + '\n')
        except Exception as e:
            print(f"Ошибка сохранения сообщения: {e}")
    
    def clear_history(self):
        """Очищает историю"""
        if self.history_file.exists():
            self.history_file.unlink()
        self.history_file.touch()
