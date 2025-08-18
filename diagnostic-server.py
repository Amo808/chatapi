import http.server
import socketserver
import os
import socket
from urllib.parse import urlparse

PORT = 8888

class DiagnosticHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # Главная страница - показываем диагностику
        if parsed_path.path == '/' or parsed_path.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            try:
                with open('network-diagnostic.html', 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            except FileNotFoundError:
                self.wfile.write(b'<h1>Error: network-diagnostic.html not found</h1>')
        
        # API для проверки статуса
        elif parsed_path.path == '/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            status = {
                "status": "ok",
                "server": socket.gethostname(),
                "ip": socket.gethostbyname(socket.gethostname()),
                "port": PORT,
                "message": "Диагностический сервер работает!"
            }
            
            import json
            self.wfile.write(json.dumps(status, ensure_ascii=False).encode('utf-8'))
        
        # Все остальное - стандартная обработка
        else:
            super().do_GET()
    
    def log_message(self, format, *args):
        # Логирование всех подключений
        client_ip = self.client_address[0]
        print(f"🌐 {self.date_time_string()} - Подключение с {client_ip}: {format % args}")

if __name__ == "__main__":
    try:
        with socketserver.TCPServer(("0.0.0.0", PORT), DiagnosticHandler) as httpd:
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            
            print("=" * 50)
            print("🔍 ДИАГНОСТИЧЕСКИЙ СЕРВЕР ЗАПУЩЕН")
            print("=" * 50)
            print(f"🖥️  Сервер: {hostname}")
            print(f"🌐 IP: {local_ip}")
            print(f"🔌 Порт: {PORT}")
            print()
            print("📱 ОТКРОЙТЕ НА ДРУГОМ УСТРОЙСТВЕ:")
            print(f"   http://192.168.110.143:{PORT}")
            print()
            print("🎯 Эта страница проведет автоматическую диагностику")
            print("   и покажет, что именно блокирует подключение")
            print()
            print("⛔ Для остановки нажмите Ctrl+C")
            print("=" * 50)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Диагностический сервер остановлен")
    except Exception as e:
        print(f"❌ Ошибка запуска сервера: {e}")
