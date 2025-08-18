@echo off
echo 🚀 Подготовка к деплою на Render.com
echo.

cd /d "c:\gpt-pilot-main\gpt-pilot\workspace\api chat"

echo 📦 Создание requirements.txt...
(
echo fastapi==0.104.1
echo uvicorn[standard]==0.24.0
echo python-multipart==0.0.6
echo python-dotenv==1.0.0
echo pydantic==2.5.0
echo httpx==0.25.2
echo aiofiles==23.2.1
) > requirements.txt

echo ✅ requirements.txt создан

echo 📝 Создание .gitignore...
(
echo # Python
echo __pycache__/
echo *.pyc
echo *.pyo
echo *.pyd
echo .Python
echo build/
echo develop-eggs/
echo dist/
echo downloads/
echo eggs/
echo .eggs/
echo lib/
echo lib64/
echo parts/
echo sdist/
echo var/
echo wheels/
echo *.egg-info/
echo .installed.cfg
echo *.egg
echo MANIFEST
echo.
echo # Node.js
echo node_modules/
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
echo pnpm-debug.log*
echo lerna-debug.log*
echo.
echo # Next.js
echo .next/
echo out/
echo build/
echo.
echo # Environment variables
echo .env
echo .env.local
echo .env.development.local
echo .env.test.local
echo .env.production.local
echo.
echo # IDE
echo .vscode/
echo .idea/
echo.
echo # OS
echo .DS_Store
echo Thumbs.db
) > .gitignore

echo ✅ .gitignore создан
echo.
echo ✅ Подготовка завершена!
echo.
echo 🌐 Следующие шаги:
echo 1. Создать GitHub репозиторий
echo 2. Загрузить код: git add . ^&^& git commit -m "Initial commit" ^&^& git push
echo 3. Зайти на https://render.com
echo 4. Подключить GitHub репозиторий  
echo 5. Создать два сервиса: Backend ^(Python^) и Frontend ^(Node.js^)
echo.
pause
