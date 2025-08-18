# 🚀 Запуск API Chat через Git Bash

## Предварительные требования
- Node.js установлен
- Python 3.13+ установлен
- Git Bash установлен

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

### 1. Откройте Git Bash и перейдите в папку проекта
```bash
cd "/c/gpt-pilot-main/gpt-pilot/workspace/api chat"
```

### 2. Настройте Python окружение (один раз)
```bash
# Создайте виртуальное окружение
python -m venv venv

# Активируйте окружение
source venv/Scripts/activate

# Установите зависимости
pip install -r requirements.txt
```

### 3. Настройте Frontend (один раз)
```bash
# Перейдите в папку frontend
cd frontend

# Установите зависимости
npm install

# Вернитесь в корневую папку
cd ..
```

### 4. Настройте переменные окружения (один раз)
```bash
# Backend окружение
echo "DEEPSEEK_API_KEY=sk-your-key-here" > backend/.env

# Frontend окружение  
echo "NEXT_PUBLIC_API_URL=http://192.168.110.143:8000" > frontend/.env.local
```

---

## 🔥 ЕЖЕДНЕВНЫЙ ЗАПУСК

### Откройте ДВА окна Git Bash:

#### Окно 1: Backend
```bash
cd "/c/gpt-pilot-main/gpt-pilot/workspace/api chat"
source venv/Scripts/activate
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### Окно 2: Frontend  
```bash
cd "/c/gpt-pilot-main/gpt-pilot/workspace/api chat/frontend"
npm run dev
```

---

## 🛠️ Создание скриптов для автозапуска

### start-backend.sh
```bash
#!/bin/bash
cd "/c/gpt-pilot-main/gpt-pilot/workspace/api chat"
source venv/Scripts/activate
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### start-frontend.sh
```bash
#!/bin/bash
cd "/c/gpt-pilot-main/gpt-pilot/workspace/api chat/frontend"
npm run dev
```

### start-all.sh (для одновременного запуска)
```bash
#!/bin/bash
cd "/c/gpt-pilot-main/gpt-pilot/workspace/api chat"

# Запуск backend в фоне
source venv/Scripts/activate
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Переход в frontend и запуск
cd frontend
npm run dev &
FRONTEND_PID=$!

echo "🚀 Backend PID: $BACKEND_PID"
echo "🚀 Frontend PID: $FRONTEND_PID"
echo "📱 Доступ: http://192.168.110.143:3010"
echo "🛑 Для остановки: Ctrl+C"

# Ожидание завершения
wait
```

---

## 📱 БЫСТРЫЙ ТЕСТ СЕТИ

### simple-test.py (простой тестовый сервер)
```python
#!/usr/bin/env python3
import http.server
import socketserver

PORT = 9999
with socketserver.TCPServer(("0.0.0.0", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    print(f"🌐 Тестовый сервер: http://192.168.110.143:{PORT}")
    httpd.serve_forever()
```

### Запуск теста:
```bash
cd "/c/gpt-pilot-main/gpt-pilot/workspace/api chat"
source venv/Scripts/activate
python simple-test.py
```

---

## 🔧 ДИАГНОСТИКА СЕТИ

### Проверка портов:
```bash
# Проверить что порты слушаются
netstat -an | grep :3010
netstat -an | grep :8000
netstat -an | grep :9999
```

### Проверка доступности:
```bash
# Локальный тест
curl -I http://localhost:3010
curl -I http://192.168.110.143:3010

# Тест backend
curl -I http://192.168.110.143:8000
```

### Проверка брандмауэра:
```bash
# Проверить правила (в PowerShell)
netsh advfirewall firewall show rule name="API Chat Frontend"
```

---

## 🚨 РЕШЕНИЕ ПРОБЛЕМ

### Если Python не найден:
```bash
# Найти Python
which python
which python3

# Использовать полный путь
/c/Users/Amo/AppData/Local/Programs/Python/Python313/python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Если Node не найден:
```bash
# Добавить в PATH
export PATH="/c/Program Files/nodejs:$PATH"
node --version
npm --version
```

### Если порты заняты:
```bash
# Убить процессы на портах
taskkill //F //IM node.exe
taskkill //F //IM python.exe

# Или найти процесс по порту
netstat -ano | grep :3010
taskkill //F //PID <PID>
```

---

## ✅ ИТОГОВАЯ КОМАНДА ДЛЯ БЫСТРОГО ЗАПУСКА

```bash
# Скопируйте и вставьте одной командой:
cd "/c/gpt-pilot-main/gpt-pilot/workspace/api chat" && source venv/Scripts/activate && python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 & cd frontend && npm run dev
```

**📱 После запуска доступ по адресу:** `http://192.168.110.143:3010`
