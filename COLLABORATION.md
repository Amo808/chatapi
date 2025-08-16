# Инструкции для совместной работы

## 📋 Настройка проекта

### Клонирование репозитория
```bash
git clone https://github.com/Amo808/chatapi.git
cd chatapi
```

### Настройка окружения
```bash
# Скопируйте файл окружения
cp .env.sample .env
# Отредактируйте .env и добавьте DEEPSEEK_API_KEY
```

## 🌿 Структура веток

- **`main`** - стабильная продакшн версия
- **`develop`** - основная ветка разработки 
- **`feature/backend`** - разработка бэкенда (ваша работа)
- **`feature/frontend`** - разработка фронтенда (коллега в Cursor)

## 🔄 Workflow разработки

### Для бэкенда (VS Code):
1. Переключайтесь на ветку feature/backend
```bash
git checkout feature/backend
git pull origin feature/backend
```

2. Работайте с файлами backend/*
3. Коммитьте изменения:
```bash
git add .
git commit -m "feat: добавлен FastAPI endpoint для чата"
git push origin feature/backend
```

### Для фронтенда (Cursor):
1. Переключайтесь на ветку feature/frontend
```bash
git checkout -b feature/frontend  # при первом создании
git checkout feature/frontend     # при переключении
git pull origin feature/frontend
```

2. Работайте с файлами frontend/*
3. Коммитьте изменения аналогично

## 🔄 Синхронизация изменений

### Ежедневно:
1. Забирайте изменения из develop:
```bash
git checkout develop
git pull origin develop
git checkout feature/backend  # или feature/frontend
git merge develop
```

2. При конфликтах - решайте их вместе

### Еженедельно (или по готовности фичи):
1. Создавайте Pull Request из feature/* в develop
2. Ревьюим код друг друга
3. Мержим в develop
4. Тестируем интеграцию

## 📡 API Контракт

### Backend endpoints (ваша ответственность):

#### `POST /chat/send`
```json
Request:
{
  "message": "string",
  "conversation_id": "string (optional)"
}

Response (SSE stream):
data: {"type": "token", "content": "Hello"}
data: {"type": "done", "usage": {"tokens": 150}}
```

#### `GET /history`
```json
Response:
{
  "messages": [
    {
      "id": "string",
      "role": "user|assistant",
      "content": "string", 
      "timestamp": "ISO string"
    }
  ]
}
```

#### `GET /health`
```json
Response:
{
  "status": "ok",
  "provider": "deepseek",
  "model": "deepseek-chat"
}
```

### Frontend responsibilities:
- React компоненты для чата
- SSE клиент для получения потокового ответа
- Рендеринг Markdown
- UI/UX интерфейса

## 🐛 Тестирование интеграции

### Локальное тестирование:
```bash
# Backend (порт 8000)
cd backend
python main.py

# Frontend (порт 3000) 
cd frontend
npm run dev
```

### С Docker:
```bash
docker-compose up -d
```

## 📞 Коммуникация

- **Срочные вопросы**: Telegram/Discord
- **API изменения**: GitHub Issues
- **Код-ревью**: GitHub Pull Requests
- **Ежедневные синхронизации**: 15-30 минут в день

## 🚨 Важные правила

1. **НЕ коммитьте** `.env` файлы (только `.env.sample`)
2. **НЕ мержите** напрямую в main
3. **ВСЕГДА тестируйте** интеграцию перед мержем в develop
4. **Пишите понятные** commit messages
5. **Синхронизируйтесь** каждый день

## 📝 Commit Messages

- `feat:` - новая функция
- `fix:` - исправление бага  
- `docs:` - обновление документации
- `style:` - форматирование кода
- `refactor:` - рефакторинг
- `test:` - добавление тестов

Примеры:
- `feat: добавлен DeepSeek адаптер с поддержкой streaming`
- `fix: исправлена ошибка CORS при отправке сообщений`
- `docs: обновлена документация API endpoints`

## 🎯 Текущие приоритеты

### Backend (ваши задачи):
- [ ] Базовый FastAPI сервер
- [ ] DeepSeek адаптер
- [ ] SSE стриминг для чата
- [ ] Сохранение истории в JSONL
- [ ] CORS конфигурация

### Frontend (задачи коллеги):
- [ ] React компоненты чата
- [ ] SSE клиент
- [ ] Markdown рендеринг
- [ ] Базовый UI/UX

### Интеграция (совместно):
- [ ] Тестирование API
- [ ] Обработка ошибок
- [ ] Docker конфигурация
