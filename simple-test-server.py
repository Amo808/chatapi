import http.server
import socketserver
import socket

PORT = 9999

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Тест подключения</title>
            <meta charset="utf-8">
        </head>
        <body>
            <h1>🎉 ПОДКЛЮЧЕНИЕ РАБОТАЕТ!</h1>
            <p><strong>Если вы видите эту страницу с другого устройства - сетевое подключение настроено правильно!</strong></p>
            
            <h2>Информация о сервере:</h2>
            <ul>
                <li>Сервер: {hostname}</li>
                <li>IP: {local_ip}</li>
                <li>Порт: {PORT}</li>
                <li>Время: {self.date_time_string()}</li>
            </ul>
            
            <h2>Следующие шаги:</h2>
            <p>Теперь попробуйте основное приложение по адресу:</p>
            <a href="http://192.168.110.143:3010" target="_blank" style="
                background: #007bff; 
                color: white; 
                padding: 10px 20px; 
                text-decoration: none; 
                border-radius: 5px;
                display: inline-block;
                margin: 10px 0;
            ">🚀 Открыть API Chat</a>
            
            <h3>Если основное приложение не работает:</h3>
            <ol>
                <li>Проблема не в сети - она работает!</li>
                <li>Возможно Node.js блокируется антивирусом</li>
                <li>Попробуйте временно отключить антивирус</li>
                <li>Или добавьте Node.js в исключения</li>
            </ol>
        </body>
        </html>
        """
        self.wfile.write(html.encode('utf-8'))

if __name__ == "__main__":
    with socketserver.TCPServer(("0.0.0.0", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🌐 Тестовый сервер запущен на порту {PORT}")
        print(f"📱 Откройте на другом устройстве: http://192.168.110.143:{PORT}")
        print(f"⛔ Чтобы остановить, нажмите Ctrl+C")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 Сервер остановлен")
