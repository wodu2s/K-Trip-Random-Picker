import urllib.request
import json
import urllib.parse

BASE = "http://localhost:8000"

def test_api(url):
    response = urllib.request.urlopen(url).read()
    return json.loads(response)

debug_url = f"{BASE}/api/debug/kto-coverage?origin=%ED%98%84%EC%9E%AC%20%EC%9C%84%EC%B9%98&originLat=37.444&originLng=127.137&theme=%EB%B0%94%EB%8B%A4&maxDistanceKm=300&originMode=current"
debug_data = test_api(debug_url)

print("Passed:", len(debug_data["samples"]["passed"]))
for i in debug_data["samples"]["passed"]:
    print(f" - {i['title']} ({i['areaName']})")

print("Rejected:")
for i in debug_data["samples"]["rejected"]:
    print(f" - {i['title']}: {i['rejectReason']}")
