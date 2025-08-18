#!/bin/bash

echo "🚀 Подготовка к деплою на Render.com"
echo

# 1. Генерируем requirements.txt
echo "📦 Генерация requirements.txt..."
cd "c:\gpt-pilot-main\gpt-pilot\workspace\api chat"

# Создаем requirements.txt вручную (базовые зависимости)
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-dotenv==1.0.0
pydantic==2.5.0
httpx==0.25.2
aiofiles==23.2.1
EOF

echo "✅ requirements.txt создан"

# 2. Создаем .gitignore если его нет
if [ ! -f .gitignore ]; then
    echo "📝 Создание .gitignore..."
    cat > .gitignore << EOF
# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Next.js
.next/
out/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF
    echo "✅ .gitignore создан"
fi

echo
echo "✅ Подготовка завершена!"
echo
echo "🌐 Следующие шаги:"
echo "1. Создать GitHub репозиторий"
echo "2. Загрузить код: git add . && git commit -m 'Initial commit' && git push"
echo "3. Зайти на https://render.com"
echo "4. Подключить GitHub репозиторий"
echo "5. Создать два сервиса: Backend (Python) и Frontend (Node.js)"
echo

read -p "Нажмите Enter для продолжения..."
