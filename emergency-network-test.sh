#!/bin/bash
echo "🚨 ЭКСТРЕННАЯ ДИАГНОСТИКА СЕТИ"
echo "=============================="

cd "/c/gpt-pilot-main/gpt-pilot/workspace/api chat"

# Проверим статус портов
echo "🔍 Проверка портов:"
netstat -an | grep :3010 | head -5
netstat -an | grep :8000 | head -5
netstat -an | grep :9999 | head -5

echo ""
echo "🔍 Проверка процессов:"
tasklist | grep node.exe || echo "Node.js не запущен"
tasklist | grep python.exe || echo "Python не запущен" 

echo ""
echo "🔥 ВРЕМЕННОЕ ОТКЛЮЧЕНИЕ ЗАЩИТЫ (30 сек):"
echo "⚠️  Это отключит брандмауэр Windows на 30 сек для тестирования!"
read -p "Продолжить? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔥 Отключаю брандмауэр..."
    netsh advfirewall set allprofiles state off
    
    echo "🚀 Запускаю простой тестовый сервер..."
    source venv/Scripts/activate
    python simple-test.py &
    TEST_PID=$!
    
    echo ""
    echo "📱 БЫСТРО! Откройте с другого устройства:"
    echo "   http://192.168.110.143:9999"
    echo ""
    echo "⏰ Жду 30 секунд..."
    
    for i in {30..1}; do
        echo -ne "\r⏰ Осталось: $i сек "
        sleep 1
    done
    
    echo ""
    echo "🛡️  Включаю брандмауэр обратно..."
    kill $TEST_PID 2>/dev/null
    netsh advfirewall set allprofiles state on
    
    echo ""
    echo "✅ Защита включена обратно"
    echo "💬 Работал ли тест? (Это покажет причину проблемы)"
else
    echo "❌ Отменено"
fi

echo ""
echo "🔧 ДРУГИЕ ВАРИАНТЫ ДИАГНОСТИКИ:"
echo "1. Проверьте антивирус - он мог заблокировать Node.js"
echo "2. Попробуйте другой браузер на другом устройстве"
echo "3. Попробуйте мобильные данные вместо WiFi"
echo "4. Проверьте настройки роутера (AP Isolation)"
echo ""
echo "📞 Если нужна помощь, сообщите:"
echo "   - Какое устройство используете для теста"
echo "   - Какую ошибку показывает браузер"
echo "   - Работал ли тест с отключенным брандмауэром"
