@echo off
echo 🚨 ЭКСТРЕННАЯ ДИАГНОСТИКА СЕТИ
echo ==============================
echo.

echo 🔍 Проверка портов:
netstat -an | findstr :3010 | findstr LISTENING
netstat -an | findstr :8000 | findstr LISTENING

echo.
echo 🔍 Проверка процессов:
tasklist | findstr node.exe
tasklist | findstr python.exe

echo.
echo 🔥 ОПАСНО! Временное отключение брандмауэра для теста
echo ⚠️ Это сделает ваш ПК уязвимым на 30 секунд!
echo.
set /p answer="Продолжить? (y/n): "

if /i "%answer%" NEQ "y" (
    echo ❌ Отменено
    pause
    exit
)

echo.
echo 🔥 Отключаю Windows Firewall...
netsh advfirewall set allprofiles state off

echo 🚀 Запускаю тестовый сервер...
start /b python simple-test.py

echo.
echo 📱 БЫСТРО! Откройте с другого устройства:
echo    http://192.168.110.143:9999
echo.
echo ⏰ Жду 30 секунд...

timeout /t 30 /nobreak

echo.
echo 🛡️ Включаю брандмауэр обратно...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq simple-test.py" >nul 2>&1
netsh advfirewall set allprofiles state on

echo.
echo ✅ Защита включена обратно!
echo.
echo 💬 РЕЗУЛЬТАТ ТЕСТА:
echo    - Если страница открылась → проблема в настройках брандмауэра
echo    - Если не открылась → проблема в роутере или антивирусе
echo.
echo 🔧 РЕШЕНИЯ:
echo 1. Если тест РАБОТАЛ:
echo    - Проблема в брандмауэре Windows
echo    - Нужно создать более точные правила для Node.js
echo.
echo 2. Если тест НЕ РАБОТАЛ:
echo    - Проблема в роутере (AP Isolation)
echo    - Или антивирус блокирует все подключения
echo    - Попробуйте другую сеть
echo.
pause
