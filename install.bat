@echo off
echo ========================================
echo   Установка зависимостей AI Chat
echo ========================================
echo.

echo Установка Python зависимостей...
python -m pip install fastapi uvicorn python-dotenv httpx pydantic python-multipart tiktoken
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось установить Python зависимости
    echo Убедитесь что Python установлен и доступен в PATH
    pause
    exit /b 1
)

echo.
echo Установка Node.js зависимостей...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ОШИБКА: Не удалось установить Node.js зависимости  
    echo Убедитесь что Node.js установлен и доступен в PATH
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Установка завершена успешно!
echo.
echo Теперь:
echo 1. Скопируйте .env.example в .env
echo 2. Укажите ваш DEEPSEEK_API_KEY в .env
echo 3. Запустите start.bat
echo ========================================
pause
