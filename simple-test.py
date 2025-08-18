#!/usr/bin/env python3
import http.server
import socketserver
import socket

PORT = 9999

class TestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>🧪 Сетевой тест</title>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; background: #f0f8ff; }}
                .container {{ background: white; padding: 30px; border-radius: 10px; }}
                .success {{ color: #28a745; }}
                .info {{ color: #17a2b8; }}
                button {{ padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎉 СЕТЬ РАБОТАЕТ!</h1>
                <p class="success">✅ Если вы видите эту страницу с другого устройства - сетевое подключение настроено правильно!</p>
                
                <h2>📊 Информация:</h2>
                <ul>
                    <li><strong>IP сервера:</strong> 192.168.110.143</li>
                    <li><strong>Тестовый порт:</strong> {PORT}</li>
                    <li><strong>Статус:</strong> <span class="success">Онлайн</span></li>
                </ul>
                
                <h2>🔗 Тест основного приложения:</h2>
                <button onclick="window.open('http://192.168.110.143:3010', '_blank')">
                    🚀 Открыть API Chat
                </button>
                
                <button onclick="testAPI()">
                    🔌 Проверить Backend API
                </button>
                
                <div id="result"></div>
                
                <h2>💡 Если основное приложение не работает:</h2>
                <ol>
                    <li>Проблема не в сети - она работает!</li>
                    <li>Возможно Node.js блокируется антивирусом</li>
                    <li>Попробуйте временно отключить антивирус на сервере</li>
                    <li>Или добавьте Node.js в исключения антивируса</li>
                </ol>
            </div>
            
            <script>
                function testAPI() {{
                    const result = document.getElementById('result');
                    result.innerHTML = '<p class="info">⏳ Тестирую API...</p>';
                    
                    fetch('http://192.168.110.143:8000/')
                        .then(response => {{
                            if (response.ok) {{
                                result.innerHTML = '<p class="success">✅ Backend API доступен!</p>';
                            }} else {{
                                result.innerHTML = '<p style="color: red;">❌ API вернул ошибку: ' + response.status + '</p>';
                            }}
                        }})
                        .catch(error => {{
                            result.innerHTML = '<p style="color: red;">❌ API недоступен: ' + error.message + '</p>';
                        }});
                }}
            </script>
        </body>
        </html>
        """
        self.wfile.write(html.encode('utf-8'))

if __name__ == "__main__":
    with socketserver.TCPServer(("0.0.0.0", PORT), TestHandler) as httpd:
        print(f"🌐 Тестовый сервер запущен на порту {PORT}")
        print(f"📱 Откройте на другом устройстве: http://192.168.110.143:{PORT}")
        print(f"⛔ Для остановки нажмите Ctrl+C")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 Тестовый сервер остановлен")
