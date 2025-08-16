# 🚀 Инструкция по развертыванию AI Chat Bot

## 📋 Предварительные требования

- Node.js 18+ установлен
- Git репозиторий настроен
- API ключи для выбранного LLM провайдера

## 🎯 Варианты развертывания

### 1. Vercel (Рекомендуется)

#### Шаги развертывания:

1. **Подключение репозитория**
   ```bash
   # Перейдите на vercel.com и войдите в аккаунт
   # Нажмите "New Project"
   # Подключите ваш GitHub/GitLab репозиторий
   ```

2. **Настройка проекта**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Переменные окружения**
   ```env
   VITE_API_BASE_URL=https://api.openai.com/v1
   VITE_API_KEY=sk-your-openai-api-key
   VITE_DEFAULT_MODEL=gpt-3.5-turbo
   ```

4. **Деплой**
   - Нажмите "Deploy"
   - Дождитесь завершения сборки
   - Получите URL вашего приложения

#### Преимущества Vercel:
- ✅ Автоматический деплой при push
- ✅ SSL сертификаты
- ✅ CDN по всему миру
- ✅ Preview деплои для PR
- ✅ Аналитика и мониторинг

### 2. Netlify

#### Шаги развертывания:

1. **Подключение репозитория**
   ```bash
   # Перейдите на netlify.com
   # Нажмите "New site from Git"
   # Подключите ваш репозиторий
   ```

2. **Настройка сборки**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18

3. **Переменные окружения**
   - Перейдите в **Site settings** → **Environment variables**
   - Добавьте все необходимые переменные

4. **Деплой**
   - Нажмите "Deploy site"
   - Получите URL вашего приложения

#### Преимущества Netlify:
- ✅ Простота настройки
- ✅ Формы и функции
- ✅ A/B тестирование
- ✅ Интеграция с Git

### 3. GitHub Pages

#### Шаги развертывания:

1. **Настройка Vite для GitHub Pages**
   ```typescript
   // vite.config.ts
   export default defineConfig({
     base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
     // ... остальные настройки
   });
   ```

2. **Создание GitHub Action**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

3. **Настройка GitHub Pages**
   - Перейдите в **Settings** → **Pages**
   - Выберите **GitHub Actions** как источник
   - Настройте переменные окружения в репозитории

### 4. Docker

#### Создание Dockerfile:

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx конфигурация:

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API проксирование (если нужно)
        location /api/ {
            proxy_pass http://your-backend:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

#### Сборка и запуск:

```bash
# Сборка образа
docker build -t ai-chat-bot .

# Запуск контейнера
docker run -p 80:80 ai-chat-bot

# Docker Compose
docker-compose up -d
```

### 5. Локальный сервер

#### Простой HTTP сервер:

```bash
# После сборки
npm run build

# Python 3
cd dist && python -m http.server 8000

# Node.js
npx serve dist -p 8000

# PHP
cd dist && php -S localhost:8000
```

## 🔧 Настройка переменных окружения

### Обязательные переменные:

```env
# API Configuration
VITE_API_BASE_URL=https://api.openai.com/v1
VITE_API_KEY=sk-your-api-key-here
```

### Опциональные переменные:

```env
# Model Configuration
VITE_DEFAULT_MODEL=gpt-3.5-turbo
VITE_MAX_TOKENS=4096
VITE_TEMPERATURE=0.7

# Feature Flags
VITE_ENABLE_STREAMING=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_CHAT_HISTORY=true

# UI Configuration
VITE_APP_TITLE=AI Chat Bot
VITE_APP_DESCRIPTION=Интеллектуальный чат-бот
```

## 🚨 Безопасность

### Защита API ключей:

1. **Никогда не коммитьте** `.env` файлы
2. **Используйте** переменные окружения на сервере
3. **Ограничьте** доступ к API ключам
4. **Мониторьте** использование API

### CORS настройки:

```typescript
// Если у вас есть бэкенд
app.use(cors({
  origin: ['https://yourdomain.com', 'http://localhost:3000'],
  credentials: true
}));
```

## 📊 Мониторинг и аналитика

### Vercel Analytics:

```typescript
// main.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Google Analytics:

```typescript
// index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔄 CI/CD Pipeline

### GitHub Actions (полный пример):

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: dist
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

## 🐛 Отладка деплоя

### Частые проблемы:

1. **Build ошибки**:
   ```bash
   # Проверьте логи сборки
   npm run build
   
   # Проверьте зависимости
   npm ls
   ```

2. **Переменные окружения**:
   ```bash
   # Убедитесь, что переменные доступны
   echo $VITE_API_KEY
   ```

3. **CORS ошибки**:
   ```bash
   # Проверьте настройки CORS на бэкенде
   # Убедитесь, что домен добавлен в разрешенные
   ```

### Логи и мониторинг:

```bash
# Vercel
vercel logs

# Netlify
netlify logs

# Docker
docker logs container-name
```

## 📈 Масштабирование

### Вертикальное масштабирование:

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

### Горизонтальное масштабирование:

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
```

## 🎉 Поздравляем!

Ваш AI Chat Bot успешно развернут! 

### Следующие шаги:

1. **Настройте** мониторинг и аналитику
2. **Добавьте** SSL сертификаты (если нужно)
3. **Настройте** резервное копирование
4. **Добавьте** CDN для статических файлов
5. **Настройте** автоматическое обновление

### Полезные ссылки:

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [GitHub Pages](https://pages.github.com/)
- [Docker Documentation](https://docs.docker.com/)

---

**Удачи с вашим AI Chat Bot! 🚀**
