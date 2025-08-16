# AI Chat Web

Веб-интерфейс для взаимодействия с различными моделями искусственного интеллекта через API. Создан как единый чат-центр для диалогов с разными AI моделями с сохранением истории и контекста.

## 🚀 Особенности

- **Потоковый чат**: Получение ответов от AI в реальном времени
- **История сообщений**: Хранение всех диалогов в формате JSONL
- **Контекст**: Передача истории сообщений в каждом запросе
- **Markdown/LaTeX**: Рендеринг математических формул и кода
- **Адаптеры**: Гибкая архитектура для подключения разных AI провайдеров

## 🏗️ Архитектура

```
ai-chat-web/
├── frontend/          # React фронтенд
├── backend/           # FastAPI бэкенд
├── data/             # Конфигурации и история
├── logs/             # Логи приложения
└── docker-compose.yml
```

## 🛠️ Технологии

### Frontend
- React 18
- Vite
- Axios для API запросов
- Markdown рендеринг

### Backend
- Python 3.11+
- FastAPI
- SSE (Server-Sent Events) для стриминга
- JSONL для хранения истории

### AI Провайдеры
- DeepSeek API (основной)
- Архитектура для добавления других провайдеров

## 🚀 Быстрый старт

### Предварительные требования
- Python 3.11+
- Node.js 18+
- DeepSeek API ключ

### Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/Amo808/chatapi.git
cd chatapi
```

2. Настройте окружение:
```bash
cp .env.sample .env
# Отредактируйте .env и добавьте DEEPSEEK_API_KEY
```

3. Запустите с Docker:
```bash
docker-compose up -d
```

Или запустите вручную:

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## 📡 API Endpoints

### `POST /chat/send`
Отправка сообщения и получение потокового ответа
```json
{
  "message": "Привет! Как дела?",
  "conversation_id": "optional_id"
}
```

### `GET /history`
Получение истории сообщений
```json
{
  "messages": [
    {
      "id": "msg_001",
      "role": "user|assistant", 
      "content": "текст сообщения",
      "timestamp": "2025-08-16T13:00:00Z"
    }
  ]
}
```

### `GET /health`
Проверка состояния сервиса
```json
{
  "status": "ok",
  "provider": "deepseek",
  "model": "deepseek-chat"
}
```

## 🗂️ Формат данных

### История сообщений (JSONL)
```json
{"id": "msg_001", "session_id": "chat_001", "timestamp": 1692187200, "role": "user", "content": "Привет!", "tokens": {"input": 5}}
{"id": "msg_002", "session_id": "chat_001", "timestamp": 1692187205, "role": "assistant", "content": "Привет! Как дела?", "model": "deepseek-chat", "tokens": {"input": 5, "output": 12}}
```

### Конфигурация
```json
{
  "provider": "deepseek",
  "model": "deepseek-chat",
  "max_tokens": 4000,
  "temperature": 0.7
}
```

## 🔄 Roadmap

- [x] **Этап 1**: Базовый чат с DeepSeek
- [ ] **Этап 2**: Выбор модели
- [ ] **Этап 3**: Новые провайдеры и импорт/экспорт
- [ ] **Этап 4**: Дебаты моделей
- [ ] **Этап 5**: Многопользовательский режим
- [ ] **Этап 6**: Аналитика и поиск

## 👥 Разработка

### Структура веток
- `main` - стабильная версия
- `develop` - разработка
- `feature/*` - новые функции

### Запуск в режиме разработки
```bash
# Backend (порт 8000)
cd backend && python main.py

# Frontend (порт 3000)
cd frontend && npm run dev
```

## 📝 Лицензия

MIT License - подробности в файле [LICENSE](LICENSE)

## 🤝 Contributing

1. Fork репозитория
2. Создайте feature ветку (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Создайте Pull Request

### 7. Критерии приемки
- Проверка базового диалога, длинной истории, устойчивости к ошибкам, корректного рендеринга математических формул и кода, а также работы потокового ответа.

### 8. Итоговые материалы
По завершении Этапа 1 необходимо подготовить:
- Исходный код с разделением на модули.
- README с инструкциями по установке и запуску.
- Пример конфигурации и истории.

### Заключение
Следуя этому плану, вы сможете успешно развернуть проект, соответствующий техническому заданию. Важно помнить о гибкости архитектуры, чтобы в будущем можно было легко добавлять новые функции и провайдеров.