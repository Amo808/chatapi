@echo off
echo ========================================
echo      AI Chat - DeepSeek Interface
echo ========================================
echo.

REM Проверяем наличие .env файла
if not exist ".env" (
    echo ОШИБКА: Файл .env не найден!
    echo Создайте .env файл на основе .env.example
    echo и укажите ваш DEEPSEEK_API_KEY
    pause
    exit /b 1
)

echo Запуск Backend сервера...
start "AI Chat Backend" cmd /k "python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

echo Ожидание запуска Backend...
timeout /t 3 /nobreak > nul

echo Запуск Frontend...
cd frontend
start "AI Chat Frontend" cmd /k "npx vite --port 3000"

echo.
echo ========================================
echo Приложение запускается...
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Откройте http://localhost:3000 в браузере
echo ========================================
echo.
echo Нажмите любую клавишу для выхода...
pause > nul
