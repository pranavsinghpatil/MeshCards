import requests

url = "http://localhost:8005/generate"
data = {
    "text": "The mitochondria is the powerhouse of the cell. Photosynthesis converts light energy into chemical energy.",
    "deck_name": "Test Deck",
    "provider": "gemini"
}

try:
    response = requests.post(url, data=data)
    if response.status_code == 200:
        with open("debug_deck.apkg", "wb") as f:
            f.write(response.content)
        print("Deck generated successfully.")
    else:
        print(f"Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
