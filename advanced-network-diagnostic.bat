@echo off
echo === ADVANCED NETWORK DIAGNOSTICS ===
echo.

echo === Router and Network Information ===
ipconfig /all | findstr /i "gateway dhcp dns"
echo.

echo === Testing Router Connectivity ===
ping -n 1 192.168.110.1
echo.

echo === Advanced Firewall Check ===
netsh firewall show state
netsh firewall show config
echo.

echo === Windows Defender Status ===
sc query WinDefend
echo.

echo === Network Profile ===
netsh wlan show profiles
echo.

echo === Advanced Port Listening Check ===
netstat -an | findstr ":3010"
netstat -an | findstr ":8000"
echo.

echo === Testing External Access Simulation ===
echo Creating test from different IP perspective...
powershell -Command "Invoke-WebRequest -Uri 'http://192.168.110.143:3010' -UseBasicParsing -TimeoutSec 5" 2>nul || echo "External access test FAILED"
powershell -Command "Invoke-WebRequest -Uri 'http://192.168.110.143:8000' -UseBasicParsing -TimeoutSec 5" 2>nul || echo "Backend external access test FAILED"
echo.

echo === Telnet Test Ports ===
echo Testing if ports are reachable via telnet...
powershell -Command "Test-NetConnection -ComputerName 192.168.110.143 -Port 3010 -InformationLevel Detailed"
powershell -Command "Test-NetConnection -ComputerName 192.168.110.143 -Port 8000 -InformationLevel Detailed"
echo.

pause
