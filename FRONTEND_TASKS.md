# 🎯 Frontend Development Tasks

## 📋 Описание
Нужно создать React фронтенд для AI Chat Web приложения. Фронтенд должен взаимодействовать с FastAPI бэкендом через REST API и SSE для потокового чата.

## 🛠️ Технические требования

### Основной стек:
- **React 18** (hooks, functional components)
- **Vite** для сборки
- **Axios** для HTTP запросов  
- **EventSource** для SSE
- **CSS/SCSS** для стилизации

### Необходимые пакажи:
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0", 
  "axios": "^1.6.0",
  "react-markdown": "^9.0.0",
  "rehype-katex": "^7.0.0",
  "remark-math": "^6.0.0"
}
```

## 📐 Компоненты для создания

### 1. `App.jsx` - главный компонент
- Layout приложения
- Routing (если нужен)
- Глобальное состояние

### 2. `components/Chat/ChatWindow.jsx`
- Основное окно чата
- Отображение списка сообщений  
- Поле ввода
- Кнопки управления

### 3. `components/Chat/MessageList.jsx`
- Список всех сообщений
- Автоскролл к последнему сообщению
- Разделение на пользователя/ассистента

### 4. `components/Chat/StreamingMessage.jsx`  
- Отображение потокового сообщения от AI
- Typing анимация
- Поддержка Markdown рендеринга

### 5. `components/Chat/MessageInput.jsx`
- Поле ввода сообщения
- Кнопка отправки
- Кнопка остановки потока
- Валидация ввода

### 6. `hooks/useChat.js`
- Кастомный хук для управления чатом
- SSE соединение
- История сообщений
- Отправка сообщений

### 7. `services/chatApi.js`
- API клиент для общения с бэкендом
- HTTP запросы
- Обработка ошибок

## 🔌 API Endpoints

### Backend URL: `http://localhost:8000`

#### `POST /chat/send`
```javascript
// Request
{
  message: "Привет! Как дела?",
  conversation_id: "optional_id"
}

// Response (SSE Stream)
data: {"type": "token", "content": "Привет"}
data: {"type": "token", "content": "!"}  
data: {"type": "done", "usage": {"tokens": 150}}
```

#### `GET /history`
```javascript
// Response  
{
  messages: [
    {
      id: "msg_001",
      role: "user|assistant",
      content: "текст сообщения",
      timestamp: "2025-08-16T13:00:00Z"
    }
  ]
}
```

#### `GET /health`
```javascript
// Response
{
  status: "ok", 
  provider: "deepseek",
  model: "deepseek-chat"
}
```

## 📝 Пример использования SSE

```javascript
const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const sendMessage = async (message) => {
    setIsStreaming(true);
    
    // Добавляем сообщение пользователя
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Создаем SSE соединение
    const eventSource = new EventSource('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    let streamingMessage = '';
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'token') {
        streamingMessage += data.content;
        // Обновляем состояние потокового сообщения
      } else if (data.type === 'done') {
        setIsStreaming(false);
        eventSource.close();
      }
    };
  };
  
  return { messages, sendMessage, isStreaming };
};
```

## 🎨 UI/UX Требования

### Дизайн:
- **Минималистичный** современный интерфейс
- **Темная тема** (по умолчанию)
- **Адаптивный** дизайн (мобильные устройства)
- **Плавные анимации** для лучшего UX

### Цветовая схема:
- Фон: `#1a1a1a` 
- Панели: `#2d2d2d`
- Текст: `#ffffff`
- Акценты: `#4a9eff` (синий)
- Пользователь: `#dcf8c6` (светло-зеленый)
- AI: `#e5e5ea` (светло-серый)

### Функции:
- ✅ Отправка сообщения по Enter
- ✅ Автоскролл к последнему сообщению
- ✅ Индикатор набора текста AI
- ✅ Кнопка остановки потока
- ✅ Копирование сообщений
- ✅ Очистка истории чата

## 🚀 Markdown/LaTeX Support

### Необходимые пакеты:
```bash
npm install react-markdown rehype-katex remark-math katex
```

### Пример компонента:
```jsx
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MessageContent = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={[remarkMath]}
    rehypePlugins={[rehypeKatex]}
    components={{
      code: ({ node, inline, className, children, ...props }) => (
        <code className={`${className} ${inline ? 'inline-code' : 'code-block'}`} {...props}>
          {children}
        </code>
      )
    }}
  >
    {content}
  </ReactMarkdown>
);
```

## 📂 Структура файлов

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageList.jsx  
│   │   │   ├── MessageInput.jsx
│   │   │   └── StreamingMessage.jsx
│   │   └── Common/
│   │       ├── LoadingSpinner.jsx
│   │       └── ErrorBoundary.jsx
│   ├── hooks/
│   │   └── useChat.js
│   ├── services/  
│   │   └── chatApi.js
│   ├── styles/
│   │   └── main.css
│   ├── utils/
│   │   └── markdown.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## ✅ Критерии готовности

- [ ] Компонент чата отображается корректно
- [ ] Сообщения отправляются и получаются  
- [ ] Потоковый ответ работает в реальном времени
- [ ] Markdown и LaTeX рендерятся правильно
- [ ] Адаптивный дизайн работает на мобильных
- [ ] Обработка ошибок реализована
- [ ] История сообщений сохраняется
- [ ] CORS настроен правильно

## 🐛 Тестирование

### Локальная разработка:
```bash
# В папке frontend
npm install
npm run dev  # порт 3000

# Убедитесь что backend работает на порту 8000
```

### Интеграционное тестирование:
- Отправка простых сообщений
- Длинные сообщения с потоковым ответом
- Markdown/LaTeX рендеринг
- Обработка ошибок сети
- Мобильная адаптивность

## 📞 Коммуникация

- **GitHub Issues**: для технических вопросов
- **Pull Requests**: для код-ревью
- **Telegram/Discord**: для срочных вопросов

**Удачи с разработкой!** 🚀
