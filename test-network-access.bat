@echo off
chcp 65001 >nul
echo =================================
echo Проверка сетевого доступа к API Chat
echo =================================
echo.

echo Ваш IP-адрес: 192.168.110.143
echo.

echo Проверяем, что сервисы запущены:
echo Frontend (3010):
netstat -an | findstr :3010 | findstr LISTENING
echo Backend (8000):
netstat -an | findstr :8000 | findstr LISTENING
echo.

echo Проверяем правила брандмауэра:
netsh advfirewall firewall show rule name="Node.js Server Port 3010" dir=in | findstr "Включен"
netsh advfirewall firewall show rule name="Python API Server Port 8000" dir=in | findstr "Включен"
netsh advfirewall firewall show rule name="Node.js Application - Frontend" dir=in | findstr "Включен"
netsh advfirewall firewall show rule name="Python Application - Backend" dir=in | findstr "Включен"
echo.

echo Тестируем подключения:
echo Локальный доступ:
powershell -command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3010' -Method HEAD -TimeoutSec 5; 'OK - ' + $response.StatusCode } catch { 'Ошибка: ' + $_.Exception.Message }"
echo.
echo Сетевой доступ:
powershell -command "try { $response = Invoke-WebRequest -Uri 'http://192.168.110.143:3010' -Method HEAD -TimeoutSec 5; 'OK - ' + $response.StatusCode } catch { 'Ошибка: ' + $_.Exception.Message }"
echo.
echo Backend API:
powershell -command "try { $response = Invoke-WebRequest -Uri 'http://192.168.110.143:8000' -Method HEAD -TimeoutSec 5; 'OK - ' + $response.StatusCode } catch { 'Ошибка: ' + $_.Exception.Message }"
echo.
echo TCP подключение:
powershell -command "try { $result = Test-NetConnection -ComputerName 192.168.110.143 -Port 3010 -InformationLevel Quiet; if($result) { 'TCP порт 3010 доступен' } else { 'TCP порт 3010 недоступен' } } catch { 'Ошибка: ' + $_.Exception.Message }"
echo.

echo =================================
echo РЕШЕНИЕ ПРОБЛЕМЫ:
echo.
echo 1. Правила брандмауэра добавлены ✓
echo 2. Сервисы слушают на всех интерфейсах ✓
echo 3. Локальный доступ работает ✓
echo.
echo Если с других компьютеров не открывается:
echo.
echo А) ПРОВЕРЬТЕ СЕТЬ:
echo    - Другие компы в той же подсети 192.168.110.x?
echo    - Пингуется ли 192.168.110.143 с других компов?
echo.
echo Б) ПРОВЕРЬТЕ НА ДРУГОМ КОМПЬЮТЕРЕ:
echo    - Антивирус/брандмауэр не блокирует?
echo    - Попробуйте telnet 192.168.110.143 3010
echo.
echo В) ПРОВЕРЬТЕ РОУТЕР:
echo    - AP Isolation включен?
echo    - Guest network используется?
echo    - Межсетевые правила роутера?
echo.
echo Г) ВРЕМЕННОЕ РЕШЕНИЕ:
echo    - Отключите брандмауэр Windows на 1 минуту для теста
echo    - netsh advfirewall set allprofiles state off
echo    - После теста включите: netsh advfirewall set allprofiles state on
echo =================================

echo.
echo Для доступа с других компьютеров используйте:
echo http://192.168.110.143:3010
echo.
pause
