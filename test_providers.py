import requests

def test_providers():
    try:
        response = requests.get("http://localhost:8000/providers")
        print(f"Providers endpoint: {response.status_code}")
        
        if response.ok:
            data = response.json()
            print(f"Current provider: {data['current']}")
            print(f"Demo mode: {data['demo_mode']}")
            print("\nAvailable providers:")
            for provider in data['providers']:
                print(f"  - {provider['name']}: {provider['description']}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Error testing providers: {e}")

if __name__ == "__main__":
    test_providers()
