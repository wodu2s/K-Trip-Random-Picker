"""K-Trip 백엔드 — TourAPI 프록시.

프론트엔드는 이 서버만 호출하고, TourAPI 서비스키는 여기에만 둔다.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from services.tour_api import TourApiError, fetch_candidates

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
load_dotenv(ROOT.parent / ".env")

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


def _float_or_none(value: str | None) -> float | None:
    if value is None or value.strip() == "":
        return None
    try:
        return float(value)
    except ValueError:
        return None


@app.get("/api/health")
def health() -> tuple[object, int]:
    configured = bool(os.getenv("TOUR_API_SERVICE_KEY", "").strip())
    return jsonify({"ok": True, "tourApiKeyConfigured": configured}), 200


@app.get("/api/tour/candidates")
def tour_candidates() -> tuple[object, int]:
    """관광지 후보 조회. 좌표가 있으면 주변 검색을 함께 수행한다."""
    service_key = os.getenv("TOUR_API_SERVICE_KEY", "")
    if not service_key.strip():
        return jsonify({"ok": False, "error": "config", "message": "TOUR_API_SERVICE_KEY가 없습니다."}), 500

    # 위도/경도를 반대로 넘기지 않도록 쿼리 이름을 명시한다.
    latitude = _float_or_none(request.args.get("latitude"))
    longitude = _float_or_none(request.args.get("longitude"))

    has_coords = latitude is not None and longitude is not None
    if (latitude is None) ^ (longitude is None):
        # 한쪽만 있으면 위치 검색을 쓰지 않고 지역 목록만 조회
        has_coords = False
        latitude = None
        longitude = None

    try:
        items, used_location = fetch_candidates(
            service_key,
            longitude=longitude if has_coords else None,
            latitude=latitude if has_coords else None,
        )
    except TourApiError as exc:
        status = 401 if exc.code == "auth" else 504 if exc.code == "timeout" else 502
        return jsonify({"ok": False, "error": exc.code, "message": exc.message}), status

    if not items:
        return jsonify({"ok": False, "error": "empty", "message": "TourAPI 관광지 응답이 비어 있습니다.", "items": []}), 200

    return jsonify(
        {
            "ok": True,
            "source": "tourapi",
            "usedLocation": used_location,
            "items": items,
        }
    ), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
