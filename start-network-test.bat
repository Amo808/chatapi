@echo off
echo Starting network access test server...
echo.

cd /d "c:\gpt-pilot-main\gpt-pilot\workspace\api chat"
call venv\Scripts\activate.bat

echo Activated virtual environment
echo Starting test server on port 9999...
python external-access-test.py
