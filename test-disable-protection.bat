@echo off
echo =================================
echo ВРЕМЕННОЕ ОТКЛЮЧЕНИЕ ВСЕХ ЗАЩИТ
echo (только для тестирования сети!)
echo =================================
echo.

echo ⚠️  ВНИМАНИЕ: Это отключит защиту на 2 минуты!
echo 🕐 Будет автоматически включено обратно
echo.
pause

echo 🔥 Отключаю Windows Defender Firewall...
netsh advfirewall set allprofiles state off

echo 🔥 Отключаю Windows Defender Real-time Protection...
powershell -command "Set-MpPreference -DisableRealtimeMonitoring $true" 2>nul

echo.
echo ✅ Защита временно отключена!
echo 📱 БЫСТРО попробуйте зайти с другого устройства:
echo    http://192.168.110.143:3010
echo    http://192.168.110.143:9999
echo.
echo ⏰ Жду 120 секунд, затем включу защиту обратно...

timeout /t 120 /nobreak

echo.
echo 🛡️  Включаю защиту обратно...
netsh advfirewall set allprofiles state on
powershell -command "Set-MpPreference -DisableRealtimeMonitoring $false" 2>nul

echo.
echo ✅ Защита включена!
echo.

if %ERRORLEVEL% == 0 (
    echo ✅ Если сайт работал - проблема в брандмауэре/антивирусе
    echo 💡 Нужно добавить Node.js и Python в исключения
) else (
    echo ❌ Если не работало - проблема в роутере/сети
    echo 💡 Проверьте настройки роутера (AP Isolation)
)

echo.
pause
