from dotenv import load_dotenv
load_dotenv()
import urllib.request
import json
for theme in ['%EC%A0%84%EC%B2%B4', '%EC%9E%90%EC%97%B0']: # 전체, 자연
    try:
        response = urllib.request.urlopen(f'http://localhost:8000/api/recommendations?origin=%EC%84%9C%EC%9A%B8&duration=overnight&transportMode=local&maxDistanceKm=150&theme={theme}').read()
        data = json.loads(response)
        print(f"Theme: {urllib.parse.unquote(theme)}")
        print("Items:", len(data.get('items', [])))
        print("Titles:", [d['title'] for d in data.get('items', [])])
    except Exception as e:
        print(e)
