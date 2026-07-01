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
items = data.get("items", [])
print("Items:", len(items))

debug = data.get("debugLogs", [])
passed = [d for d in debug if d.get("finalPassed")]
rejected = [d for d in debug if not d.get("finalPassed")]

print("Passed in rec:", len(passed))
for p in passed:
    print(f" - {p['title']}")

print("Rejected in rec:", len(rejected))
for r in rejected[:10]:
    print(f" - {r['title']}: {r['rejectReason']}")
