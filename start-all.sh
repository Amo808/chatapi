#!/bin/bash
cd "/c/gpt-pilot-main/gpt-pilot/workspace/api chat"

echo "🚀 Запуск API Chat..."
echo "📱 Адрес: http://192.168.110.143:3010"
echo "🔌 API: http://192.168.110.143:8000"
echo ""

# Запуск backend в фоне
echo "🔧 Запуск Backend..."
source venv/Scripts/activate
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "✅ Backend запущен (PID: $BACKEND_PID)"

# Небольшая пауза
sleep 3

# Запуск frontend
echo "🔧 Запуск Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend запущен (PID: $FRONTEND_PID)"

echo ""
echo "🌟 Сервисы запущены!"
echo "📱 Откройте: http://192.168.110.143:3010"
echo "🛑 Для остановки нажмите Ctrl+C"

# Функция для завершения процессов
cleanup() {
    echo ""
    echo "🛑 Остановка сервисов..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Все сервисы остановлены"
    exit 0
}

# Обработчик сигнала прерывания
trap cleanup INT

# Ожидание завершения
wait
