# 🚀 Пошаговый деплой на Render.com

## 📋 Быстрый старт:

### 1. Подготовка файлов
```bash
# Запустить подготовку
./prepare-deploy.bat
```

### 2. Создание GitHub репозитория
1. Зайти на [GitHub.com](https://github.com)
2. Создать новый репозиторий `api-chat`
3. Загрузить код:
```bash
git init
git add .
git commit -m "Initial commit: API Chat for Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/api-chat.git
git push -u origin main
```

### 3. Настройка на Render.com

#### 🖥️ Создание Backend сервиса:
1. Зайти на [render.com](https://render.com)
2. Подключить GitHub аккаунт
3. **New** → **Web Service**
4. Выбрать репозиторий `api-chat`
5. Настройки:
   - **Name**: `api-chat-backend`
   - **Language**: `Python 3`
   - **Branch**: `main`
   - **Root Directory**: оставить пустым
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
6. **Advanced** → **Environment Variables**:
   - `DEEPSEEK_API_KEY` = `ваш_ключ_от_deepseek`
7. **Create Web Service**

#### 🌐 Создание Frontend сервиса:
1. **New** → **Web Service**
2. Выбрать репозиторий `api-chat`
3. Настройки:
   - **Name**: `api-chat-frontend`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Advanced** → **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://api-chat-backend.onrender.com`
5. **Create Web Service**

## 🎯 Результат:
- **Backend**: `https://api-chat-backend.onrender.com`
- **Frontend**: `https://api-chat-frontend.onrender.com`

## ⚡ Автоматические обновления:
- Каждый `git push` автоматически запустит деплой
- Логи сборки доступны в панели Render
- Уведомления о статусе деплоя на email

## 💡 Полезные команды:
```bash
# Проверить статус локально
git status

# Отправить изменения
git add .
git commit -m "Update: описание изменений"
git push

# Просмотр логов (в панели Render)
```

## 🆓 Ограничения бесплатного плана:
- 750 часов/месяц
- "Засыпает" через 15 мин неактивности
- "Просыпается" автоматически при запросе
- Хостинг в США (может быть медленнее)

## 🔧 Если что-то не работает:
1. Проверить логи в панели Render
2. Убедиться что все переменные окружения заданы
3. Проверить что build commands правильные
4. Backend должен запуститься первым
