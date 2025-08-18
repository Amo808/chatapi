@echo off
echo ============================================
echo Starting API Chat Demo
echo ============================================
echo.

echo Starting Backend (FastAPI)...
start "Backend" cmd /k "python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Frontend (Next.js)...
cd frontend
start "Frontend" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo Demo is starting...
echo ============================================
echo Frontend: http://192.168.110.143:3010
echo Backend API: http://192.168.110.143:8000
echo.
echo Share this URL with your client:
echo http://192.168.110.143:3010
echo ============================================

pause
