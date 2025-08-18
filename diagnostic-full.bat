@echo off
echo === DIAGNOSTIC REPORT ===
echo Current time: %date% %time%
echo.

echo === Windows Firewall Status ===
netsh advfirewall show allprofiles state
echo.

echo === Listening Ports ===
echo Frontend (3010):
netstat -ano | findstr ":3010"
echo Backend (8000):
netstat -ano | findstr ":8000"
echo.

echo === Process Information ===
echo Frontend processes:
tasklist | findstr "node"
echo Backend processes:
tasklist | findstr "python"
echo.

echo === Network Interface ===
ipconfig | findstr "192.168.110"
echo.

echo === Connectivity Test ===
echo Testing localhost...
curl -s -o nul -w "Frontend localhost: %%{http_code}\n" http://localhost:3010 || echo "Frontend localhost: FAILED"
curl -s -o nul -w "Backend localhost: %%{http_code}\n" http://localhost:8000 || echo "Backend localhost: FAILED"
echo.
echo Testing IP address...
curl -s -o nul -w "Frontend IP: %%{http_code}\n" http://192.168.110.143:3010 || echo "Frontend IP: FAILED"
curl -s -o nul -w "Backend IP: %%{http_code}\n" http://192.168.110.143:8000 || echo "Backend IP: FAILED"
echo.

echo === Services Status ===
echo Try accessing from external device:
echo Frontend: http://192.168.110.143:3010
echo Backend: http://192.168.110.143:8000
echo.
pause
