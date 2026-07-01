"""End-to-end test: verify debug and actual recommendations use same filters."""
import urllib.request
import json

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
    print("1. Testing /api/recommendations (바다 테마)")
    print("=" * 60)

    rec_data = test_api(
        "recommendations",
        f"{BASE}/api/recommendations?origin=%EC%84%9C%EC%9A%B8&duration=overnight&transportMode=local&maxDistanceKm=150&theme=%EB%B0%94%EB%8B%A4"
    )

    if rec_data:
        items = rec_data.get("items", [])
        debug_logs = rec_data.get("debugLogs", [])
        print(f"  Items: {len(items)}")
        print(f"  Titles: {[d['title'] for d in items]}")
        print(f"  Debug logs: {len(debug_logs)}")

        passed = [d for d in debug_logs if d.get("finalPassed")]
        rejected = [d for d in debug_logs if not d.get("finalPassed")]
        print(f"  Passed: {len(passed)}, Rejected: {len(rejected)}")

        # Check banned places do NOT appear in items
        banned_titles = {"상수동 카페거리", "망원정 터", "경성 부민관 폭탄 의거지", "강릉", "춘천", "서울", "부산", "제주"}
        for item in items:
            if item["title"] in banned_titles:
                print(f"  [FAIL] Banned title found in items: {item['title']}")
            else:
                print(f"  [OK] {item['title']} — dataSource={item.get('dataSource')}, contentTypeId={item.get('contentTypeId')}")

        # Check no mock supplement when KTO succeeded
        for item in items:
            if item.get("dataSource") == "MOCK_FALLBACK":
                print(f"  [WARN] Mock fallback item found: {item['title']}")

    print()
    print("=" * 60)
    print("2. Testing /api/recommendations (전체 테마)")
    print("=" * 60)

    all_data = test_api(
        "all_theme",
        f"{BASE}/api/recommendations?origin=%EC%84%9C%EC%9A%B8&duration=overnight&transportMode=local&maxDistanceKm=150"
    )
    if all_data:
        items = all_data.get("items", [])
        print(f"  Items: {len(items)}")
        print(f"  Titles: {[d['title'] for d in items]}")

    print()
    print("=" * 60)
    print("3. Testing /api/recommendations (자연 테마)")
    print("=" * 60)

    nature_data = test_api(
        "nature_theme",
        f"{BASE}/api/recommendations?origin=%EC%84%9C%EC%9A%B8&duration=overnight&transportMode=local&maxDistanceKm=150&theme=%EC%9E%90%EC%97%B0"
    )
    if nature_data:
        items = nature_data.get("items", [])
        print(f"  Items: {len(items)}")
        print(f"  Titles: {[d['title'] for d in items]}")

    print()
    print("=" * 60)
    print("4. Checking KTO metadata preservation")
    print("=" * 60)

    if rec_data:
        items = rec_data.get("items", [])
        for item in items[:3]:
            print(f"  {item['title']}: contentId={item.get('contentId')}, contentTypeId={item.get('contentTypeId')}, cat1={item.get('cat1')}")

    print()
    print("=" * 60)
    print("DONE")
    print("=" * 60)


if __name__ == "__main__":
    main()
