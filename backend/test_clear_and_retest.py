import urllib.request
import json

BASE = "http://localhost:8000"

def test_api(url):
    response = urllib.request.urlopen(url).read()
    return json.loads(response)

print("Clearing cache...")
print(test_api(f"{BASE}/api/debug/cache-clear"))

print("\nRe-testing Current Location Mode...")
import test_rec_debug
