#!/usr/bin/env python3
import http.server
import socketserver
import socket

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        client_ip = self.client_address[0]
        local_ip = get_local_ip()
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Network Access Test</title>
            <meta charset="utf-8">
        </head>
        <body>
            <h1>🎉 SUCCESS! Network Access Working!</h1>
            <h2>Connection Details:</h2>
            <ul>
                <li><strong>Server IP:</strong> {local_ip}</li>
                <li><strong>Your IP:</strong> {client_ip}</li>
                <li><strong>Server Port:</strong> 9999</li>
                <li><strong>Time:</strong> {self.date_time_string()}</li>
            </ul>
            
            <h2>Now test the main app:</h2>
            <ul>
                <li><a href="http://{local_ip}:3010" target="_blank">Frontend: http://{local_ip}:3010</a></li>
                <li><a href="http://{local_ip}:8000" target="_blank">Backend: http://{local_ip}:8000</a></li>
            </ul>
            
            <h2>If main app doesn't work:</h2>
            <p>The issue is with Node.js/Python binding, not network/firewall.</p>
            
            <script>
                console.log('Test server accessible from:', '{client_ip}');
                console.log('Server running on:', '{local_ip}:9999');
            </script>
        </body>
        </html>
        """
        
        self.wfile.write(html.encode('utf-8'))
        print(f"✅ Connection from {client_ip} successful!")

if __name__ == "__main__":
    PORT = 7777
    local_ip = get_local_ip()
    
    print(f"🌐 Starting test server on ALL interfaces (0.0.0.0:{PORT})")
    print(f"🔗 Access from external device: http://{local_ip}:{PORT}")
    print(f"🔗 Access from localhost: http://localhost:{PORT}")
    print("=" * 60)
    
    with socketserver.TCPServer(("0.0.0.0", PORT), MyHandler) as httpd:
        print(f"✅ Server running on port {PORT}")
        print("Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
