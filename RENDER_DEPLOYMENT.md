# API Chat - Deployment Guide

## 🚀 Деплой на Render.com (бесплатно)

### Подготовка к деплою:

#### 1. Backend (Python API)
```bash
# Создать requirements.txt
pip freeze > requirements.txt

# Создать Dockerfile для backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ ./backend/
COPY data/ ./data/
EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. Frontend (Next.js)
```bash
# package.json должен содержать build команды
"scripts": {
  "build": "next build",
  "start": "next start -H 0.0.0.0 -p 3000"
}
```

### 🔧 Настройка на Render:

#### Backend Service:
- **Type**: Web Service
- **Environment**: Python 3.11
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- **Port**: Auto (Render установит)

#### Frontend Service:
- **Type**: Web Service  
- **Environment**: Node.js
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Port**: Auto (Render установит)

### 🔄 Автоматический деплой:
1. Подключить GitHub репозиторий
2. Каждый push автоматически запустит деплой
3. Render покажет логи сборки в реальном времени

### 💰 Бесплатный план:
- ✅ 750 часов/месяц бесплатно
- ⚠️ "Засыпает" после 15 мин неактивности
- 🔄 Автоматически "просыпается" при запросе

### 🌐 Результат:
- Backend: `https://your-backend.onrender.com`
- Frontend: `https://your-frontend.onrender.com`
