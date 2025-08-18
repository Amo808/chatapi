import requests
import json

def test_api():
    print("Тестируем API...")
    
    # Тест health endpoint
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Ошибка health check: {e}")
    
    # Тест history endpoint
    try:
        response = requests.get("http://localhost:8000/history")
        print(f"History: {response.status_code}")
        if response.ok:
            history = response.json()
            print(f"Количество сообщений в истории: {len(history)}")
    except Exception as e:
        print(f"Ошибка history: {e}")
    
    # Тест chat endpoint
    try:
        print("\nОтправляем тестовое сообщение...")
        response = requests.post(
            "http://localhost:8000/chat/send",
            json={"message": "Привет! Это тестовое сообщение."},
            stream=True
        )
        print(f"Chat response status: {response.status_code}")
        
        if response.ok:
            print("Получаем потоковый ответ:")
            for line in response.iter_lines(decode_unicode=True):
                if line:
                    print(f"Received: {line}")
                    if line == "data: [DONE]":
                        break
    except Exception as e:
        print(f"Ошибка chat: {e}")

if __name__ == "__main__":
    test_api()
