import urllib.request
import json
import urllib.parse

BASE = "http://localhost:8000"

def test_api(url):
    response = urllib.request.urlopen(url).read()
    return json.loads(response)

print("Testing Current Location Mode (Gyeonggi-do 성남시, lat=37.4, lng=127.1, 300km, theme=바다)")
url = f"{BASE}/api/recommendations?origin=%ED%98%84%EC%9E%AC%20%EC%9C%84%EC%B9%98&originMode=current&originLat=37.444&originLng=127.137&duration=day&transportMode=local&maxDistanceKm=300&theme=%EB%B0%94%EB%8B%A4"

data = test_api(url)
print("Resolved Origin:", data.get("resolvedOrigin"))
items = data.get("items", [])
print("Items:", len(items))
for i in items:
    print(f" - {i['title']}")

print("\nTesting debug coverage:")
debug_url = f"{BASE}/api/debug/kto-coverage?origin=%ED%98%84%EC%9E%AC%20%EC%9C%84%EC%B9%98&originLat=37.444&originLng=127.137&theme=%EB%B0%94%EB%8B%A4&maxDistanceKm=300&originMode=current"
debug_data = test_api(debug_url)
print("resolvedAreaCode:", debug_data.get("resolvedAreaCode"))
print("searchedAreaCodes:", debug_data.get("searchedAreaCodes"))
print("sourceCounts:", debug_data.get("sourceCounts"))

