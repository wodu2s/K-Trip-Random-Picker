"""Test if we finally solved the parameter passing and mock data padding."""
import urllib.request
import json
import urllib.parse

BASE = "http://localhost:8000"

def test_api(label, url):
    try:
        response = urllib.request.urlopen(url).read()
        return json.loads(response)
    except Exception as e:
        print(f"[{label}] ERROR: {e}")
        return None

def main():
    print("=" * 60)
    print("1. Testing /api/recommendations?theme=바다 (Single Theme)")
    print("=" * 60)

    url1 = f"{BASE}/api/recommendations?origin=%EC%84%9C%EC%9A%B8&duration=overnight&transportMode=local&maxDistanceKm=150&theme=%EB%B0%94%EB%8B%A4"
    data1 = test_api("theme=바다", url1)

    if data1:
        items = data1.get("items", [])
        print(f"  Items: {len(items)}")
        for i in items:
            print(f"  - {i['title']} (dataSource: {i['dataSource']})")
            if i['title'] == "서울 경교장" or i['title'] == "상수동 카페거리":
                print("    [FAIL] Bad destination found!")

    print("\n" + "=" * 60)
    print("2. Testing /api/recommendations?themes=바다 (Multiple Theme Array)")
    print("=" * 60)

    url2 = f"{BASE}/api/recommendations?origin=%EC%84%9C%EC%9A%B8&duration=overnight&transportMode=local&maxDistanceKm=150&themes=%EB%B0%94%EB%8B%A4"
    data2 = test_api("themes=바다", url2)

    if data2:
        items = data2.get("items", [])
        print(f"  Items: {len(items)}")
        for i in items:
            print(f"  - {i['title']} (dataSource: {i['dataSource']})")
            if i['title'] == "서울 경교장" or i['title'] == "상수동 카페거리":
                print("    [FAIL] Bad destination found!")

if __name__ == "__main__":
    main()
