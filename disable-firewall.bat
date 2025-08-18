@echo off
echo Disabling Windows Firewall and security restrictions...
echo.

echo === Disabling Windows Firewall ===
netsh advfirewall set allprofiles state off
echo.

echo === Disabling Windows Defender Real-time Protection ===
powershell -Command "Set-MpPreference -DisableRealtimeMonitoring $true"
echo.

echo === Stopping Windows Defender Service ===
net stop WinDefend
echo.

echo === Disabling Windows Defender Network Protection ===
powershell -Command "Set-MpPreference -EnableNetworkProtection Disabled"
echo.

echo === Checking current firewall status ===
netsh advfirewall show allprofiles state
echo.

echo === Checking which processes are listening on ports ===
netstat -ano | findstr ":3010"
netstat -ano | findstr ":8000"
echo.

echo === Testing if ports are open ===
powershell -Command "Test-NetConnection -ComputerName 192.168.110.143 -Port 3010"
powershell -Command "Test-NetConnection -ComputerName 192.168.110.143 -Port 8000"
echo.

echo All security restrictions have been disabled.
echo Now try accessing from external device:
echo Frontend: http://192.168.110.143:3010
echo Backend: http://192.168.110.143:8000
echo.
pause
