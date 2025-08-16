# AI Chat Bot 🤖

Полнофункциональное React + TypeScript веб-приложение — минималистичный AI chat-бот с левой панелью истории чатов. Интерфейс вдохновлён ChatGPT/Claude: простая, понятная структура, акцент на комфортном чтении и удобной переписке.

## ✨ Особенности

- 🎨 **Стильный минимализм** в тёмно-коричневых тонах
- 💬 **Полнофункциональный чат** с поддержкой стриминга ответов
- 📱 **Адаптивный дизайн** для всех устройств
- 🔄 **История чатов** с возможностью закрепления и экспорта
- 🚀 **Быстрая разработка** на Vite + React + TypeScript
- 🎯 **TypeScript** для типобезопасности
- 🎨 **TailwindCSS** для стилизации
- 🧪 **Тестирование** с Jest + Testing Library

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- npm или yarn

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone <your-repo-url>
   cd ai-chat-bot
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**
   ```bash
   cp env.example .env.local
   # Отредактируйте .env.local, добавив ваши API ключи
   ```

4. **Запустите в режиме разработки**
   ```bash
   npm run dev
   ```

5. **Откройте браузер**
   ```
   http://localhost:3000
   ```

## 🛠️ Доступные команды

```bash
# Разработка
npm run dev          # Запуск dev сервера
npm run build        # Сборка для продакшена
npm run preview      # Предварительный просмотр сборки

# Тестирование
npm run test         # Запуск тестов
npm run test:watch   # Тесты в режиме наблюдения
npm run test:coverage # Тесты с покрытием

# Линтинг
npm run lint         # Проверка ESLint
```

## 🏗️ Структура проекта

```
src/
├── components/          # React компоненты
│   ├── Header/         # Верхняя панель
│   ├── Sidebar/        # Левая панель с историей
│   ├── ChatWindow/     # Окно чата
│   ├── Message/        # Компонент сообщения
│   └── Composer/       # Поле ввода сообщений
├── context/            # React Context
│   └── ChatProvider.tsx # Управление состоянием чатов
├── hooks/              # Кастомные хуки
│   └── useChat.ts      # Хук для работы с API
├── lib/                # Утилиты и API клиент
│   └── api.ts          # API клиент для бэкенда
├── types/              # TypeScript типы
│   └── index.ts        # Интерфейсы и типы
├── styles/             # Стили
│   └── index.css       # Основные CSS + Tailwind
├── App.tsx             # Главный компонент
└── main.tsx            # Точка входа
```

## 🎨 Дизайн и UI

### Цветовая палитра

- **Background**: `#1F1A17` (очень тёмный коричневый)
- **Surface**: `#2B221F` (карточки и панели)
- **Accent**: `#B08668` (теплый бежево-коричневый)
- **Accent Dark**: `#9A6B4F` (hover состояния)
- **Text Primary**: `#EFE6E0` (основной текст)
- **Text Muted**: `#CFC2BA` (вторичный текст)
- **Divider**: `rgba(255,255,255,0.06)` (разделители)

### Компоненты

- **Chat Bubbles**: Стильные "пузыри" для сообщений
- **Sidebar**: Левая панель с историей чатов
- **Responsive Design**: Адаптация под мобильные устройства
- **Smooth Animations**: Плавные переходы и анимации

## 🔌 API интеграция

### Конфигурация

Создайте файл `.env.local` с вашими настройками:

```env
VITE_API_BASE_URL=https://api.openai.com/v1
VITE_API_KEY=sk-your-openai-api-key
```

### API Endpoints

Приложение ожидает следующие endpoints:

#### POST `/api/chat`

**Request:**
```json
{
  "chatId": "string",
  "messages": [
    {
      "role": "user|assistant|system",
      "content": "string"
    }
  ],
  "model": "gpt-3.5-turbo",
  "stream": false
}
```

**Response (non-stream):**
```json
{
  "reply": "string",
  "finishReason": "stop",
  "meta": {
    "usage": {
      "prompt_tokens": 10,
      "completion_tokens": 20,
      "total_tokens": 30
    }
  }
}
```

**Response (stream):**
```
data: {"type": "delta", "delta": "Привет"}
data: {"type": "delta", "delta": "! Как"}
data: {"type": "delta", "delta": " дела?"}
data: {"type": "done", "meta": {...}}
```

### Подключение к OpenAI

1. **Получите API ключ** на [platform.openai.com](https://platform.openai.com)
2. **Настройте переменные окружения**:
   ```env
   VITE_API_BASE_URL=https://api.openai.com/v1
   VITE_API_KEY=sk-your-key-here
   ```
3. **Измените API клиент** в `src/lib/api.ts`:
   ```typescript
   // Замените mock API на реальный
   const response = await fetch('https://api.openai.com/v1/chat/completions', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${API_KEY}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       model: 'gpt-3.5-turbo',
       messages: request.messages,
       stream: request.stream,
     }),
   });
   ```

### Подключение к другим провайдерам

#### Anthropic Claude
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-3-sonnet-20240229',
    messages: request.messages,
    max_tokens: 4096,
  }),
});
```

#### Google Gemini
```typescript
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: request.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
  }),
});
```

## 📱 Адаптивность

- **Desktop**: Полная панель слева + чат справа
- **Tablet**: Адаптивная сетка
- **Mobile**: Sidebar скрыт в drawer, кнопка меню в header

## ⌨️ Горячие клавиши

- **Ctrl/Cmd + K**: Создать новый чат
- **Ctrl/Cmd + Enter**: Отправить сообщение
- **Shift + Enter**: Новая строка в сообщении
- **Esc**: Закрыть модалы/drawer

## 🧪 Тестирование

### Запуск тестов
```bash
npm run test              # Все тесты
npm run test:watch        # Тесты в режиме наблюдения
npm run test:coverage     # Тесты с покрытием кода
```

### Структура тестов
- **Unit тесты**: Отдельные компоненты и функции
- **Integration тесты**: Взаимодействие компонентов
- **Mock API**: Имитация API для тестирования

## 🚀 Деплой

### Vercel
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой автоматический при push в main

### Netlify
1. Создайте новый сайт из Git
2. Настройте build команду: `npm run build`
3. Настройте publish directory: `dist`
4. Добавьте переменные окружения

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔧 Настройка

### TailwindCSS
Кастомные цвета и анимации в `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      'bg-very-dark': '#1F1A17',
      'surface': '#2B221F',
      'accent': '#B08668',
      // ... другие цвета
    },
    animation: {
      'typing': 'typing 1.4s infinite',
      'fade-in': 'fadeIn 0.3s ease-in-out'
    }
  }
}
```

### ESLint + Prettier
- **ESLint**: Проверка качества кода
- **Prettier**: Автоматическое форматирование
- **Pre-commit hooks**: Автоматическая проверка перед коммитом

## 🐛 Отладка

### Логирование
```typescript
// Включите подробное логирование
console.log('API Request:', request);
console.log('API Response:', response);
```

### DevTools
- **React DevTools**: Для отладки компонентов
- **Redux DevTools**: Для отладки состояния (если добавите Redux)
- **Network Tab**: Для отладки API запросов

## 📈 Производительность

### Оптимизации
- **Code Splitting**: Автоматическое разделение кода
- **Lazy Loading**: Ленивая загрузка компонентов
- **Memoization**: Кэширование вычислений
- **Bundle Analysis**: Анализ размера бандла

### Мониторинг
```bash
npm run build -- --analyze  # Анализ бандла
npm run lighthouse          # Тест производительности
```

## 🤝 Вклад в проект

1. **Fork** репозитория
2. **Создайте** feature branch (`git checkout -b feature/amazing-feature`)
3. **Зафиксируйте** изменения (`git commit -m 'Add amazing feature'`)
4. **Push** в branch (`git push origin feature/amazing-feature`)
5. **Откройте** Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🙏 Благодарности

- [React](https://reactjs.org/) - UI библиотека
- [Vite](https://vitejs.dev/) - Сборщик
- [TailwindCSS](https://tailwindcss.com/) - CSS фреймворк
- [TypeScript](https://www.typescriptlang.org/) - Типизированный JavaScript

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

1. **Issues**: Создайте issue в GitHub
2. **Discussions**: Используйте GitHub Discussions
3. **Email**: [your-email@example.com]

---

**Сделано с ❤️ для сообщества разработчиков**
