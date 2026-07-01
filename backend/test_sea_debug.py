"""Debug: check why sea theme returns 0 items."""
import urllib.request
import json

BASE = "http://localhost:8000"

response = urllib.request.urlopen(
    f"{BASE}/api/recommendations?origin=%EC%84%9C%EC%9A%B8&duration=overnight&transportMode=local&maxDistanceKm=150&theme=%EB%B0%94%EB%8B%A4"
).read()
data = json.loads(response)

debug_logs = data.get("debugLogs", [])
passed = [d for d in debug_logs if d.get("finalPassed")]
rejected = [d for d in debug_logs if not d.get("finalPassed")]

with open("debug_sea.txt", "w", encoding="utf-8") as f:
    f.write(f"Passed ({len(passed)}):\n")
    for d in passed:
        f.write(f"  {d['title']}: {d.get('matchedKeywords')}\n")

    f.write(f"\nRejected ({len(rejected)}):\n")
    for d in rejected:
        f.write(f"  {d['title']}: reason={d.get('rejectReason')}\n")
