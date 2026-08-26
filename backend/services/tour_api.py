"""한국관광공사 TourAPI KorService2 호출 계층.

서비스키는 이 모듈에서만 사용하며, 프론트엔드로 전달하지 않는다.
"""

from __future__ import annotations

import json
from typing import Any
from urllib.parse import unquote
from xml.etree import ElementTree

import requests

TOUR_API_BASE = "https://apis.data.go.kr/B551011/KorService2"
MOBILE_OS = "ETC"
MOBILE_APP = "KTrip"
REQUEST_TIMEOUT_SEC = 8
# locationBasedList2 반경 상한은 20km
MAX_RADIUS_METERS = 20000

# 이번 단계에서 추천 후보로 쓸 콘텐츠 타입 (숙박/쇼핑/축제/코스는 제외)
ALLOWED_CONTENT_TYPES = {"12", "14", "28", "39"}


class TourApiError(Exception):
    """TourAPI 호출/파싱 실패."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def _decode_service_key(raw: str) -> str:
    """포털에서 복사한 인코딩 키를 한 번만 디코딩한다. requests가 재인코딩한다."""
    key = raw.strip()
    if not key:
        raise TourApiError("config", "TOUR_API_SERVICE_KEY가 비어 있습니다.")
    return unquote(key)


def _as_item_list(items: Any) -> list[dict[str, Any]]:
    """items.item 이 단일 객체이거나 배열이거나 빈 값일 수 있다."""
    if items is None:
        return []
    if isinstance(items, str) and not items.strip():
        return []
    item = items.get("item") if isinstance(items, dict) else items
    if item is None or item == "":
        return []
    if isinstance(item, list):
        return [x for x in item if isinstance(x, dict)]
    if isinstance(item, dict):
        return [item]
    return []


def _parse_openapi_error_xml(text: str) -> TourApiError | None:
    """data.go.kr 인증 실패 시 XML(OpenAPI_ServiceResponse)이 올 수 있다."""
    stripped = text.lstrip()
    if not stripped.startswith("<"):
        return None
    try:
        root = ElementTree.fromstring(stripped)
    except ElementTree.ParseError:
        return None

    reason = ""
    msg = ""
    for el in root.iter():
        tag = el.tag.split("}")[-1]
        if tag in {"returnReasonCode", "returnAuthMsg", "errMsg", "resultCode", "resultMsg"}:
            if tag in {"returnReasonCode", "resultCode"}:
                reason = (el.text or "").strip()
            else:
                msg = (el.text or "").strip()
    if reason or msg:
        return TourApiError("auth" if reason in {"30", "20", "22"} else "malformed", msg or reason)
    return None


def parse_tour_response(payload: Any, raw_text: str) -> list[dict[str, Any]]:
    """TourAPI JSON 봉투를 검증하고 item 배열을 반환한다."""
    xml_err = _parse_openapi_error_xml(raw_text)
    if xml_err:
        raise xml_err

    if not isinstance(payload, dict):
        raise TourApiError("malformed", "TourAPI 응답이 JSON 객체가 아닙니다.")

    # 일부 오류는 최상위에 resultCode가 온다.
    top_code = str(payload.get("resultCode") or "")
    if top_code and top_code != "0000":
        raise TourApiError("auth" if top_code in {"30", "20", "22"} else "provider", str(payload.get("resultMsg") or top_code))

    response = payload.get("response")
    if not isinstance(response, dict):
        raise TourApiError("malformed", "response 필드가 없습니다.")

    header = response.get("header")
    if not isinstance(header, dict):
        raise TourApiError("malformed", "response.header가 없습니다.")

    result_code = str(header.get("resultCode") or "")
    result_msg = str(header.get("resultMsg") or "")
    if result_code != "0000":
        raise TourApiError("provider", result_msg or result_code)

    body = response.get("body")
    if not isinstance(body, dict):
        return []

    return _as_item_list(body.get("items"))


def _get(endpoint: str, service_key: str, extra: dict[str, str | int]) -> list[dict[str, Any]]:
    params: dict[str, str | int] = {
        "serviceKey": service_key,
        "MobileOS": MOBILE_OS,
        "MobileApp": MOBILE_APP,
        "_type": "json",
        **extra,
    }
    url = f"{TOUR_API_BASE}/{endpoint}"
    try:
        res = requests.get(url, params=params, timeout=REQUEST_TIMEOUT_SEC)
    except requests.Timeout as exc:
        raise TourApiError("timeout", f"{endpoint} 요청이 시간 초과되었습니다.") from exc
    except requests.RequestException as exc:
        raise TourApiError("network", f"{endpoint} 네트워크 오류: {exc}") from exc

    text = res.text or ""
    if res.status_code == 401 or res.status_code == 403:
        raise TourApiError("auth", f"TourAPI 인증 오류 (HTTP {res.status_code})")
    if res.status_code >= 400:
        xml_err = _parse_openapi_error_xml(text)
        if xml_err:
            raise xml_err
        raise TourApiError("network", f"TourAPI HTTP {res.status_code}")

    try:
        payload = res.json()
    except json.JSONDecodeError as exc:
        xml_err = _parse_openapi_error_xml(text)
        if xml_err:
            raise xml_err from exc
        raise TourApiError("malformed", f"{endpoint} JSON 파싱 실패") from exc

    return parse_tour_response(payload, text)


def fetch_area_based_list(service_key: str, *, num_of_rows: int = 100, page_no: int = 1) -> list[dict[str, Any]]:
    """전국 관광지 후보 (areaBasedList2). contentTypeId=12 관광지."""
    return _get(
        "areaBasedList2",
        service_key,
        {
            "numOfRows": num_of_rows,
            "pageNo": page_no,
            "arrange": "C",
            "contentTypeId": 12,
        },
    )


def fetch_location_based_list(
    service_key: str,
    *,
    map_x: float,
    map_y: float,
    radius: int = MAX_RADIUS_METERS,
    num_of_rows: int = 60,
    page_no: int = 1,
) -> list[dict[str, Any]]:
    """현재 위치 주변 관광지 (locationBasedList2). mapX=경도, mapY=위도."""
    clamped = max(1, min(int(radius), MAX_RADIUS_METERS))
    return _get(
        "locationBasedList2",
        service_key,
        {
            "numOfRows": num_of_rows,
            "pageNo": page_no,
            "arrange": "C",
            "contentTypeId": 12,
            "mapX": f"{map_x:.7f}",
            "mapY": f"{map_y:.7f}",
            "radius": clamped,
        },
    )


def _item_key(item: dict[str, Any]) -> str:
    return str(item.get("contentid") or item.get("contentId") or "").strip()


def _is_allowed(item: dict[str, Any]) -> bool:
    ctype = str(item.get("contenttypeid") or item.get("contentTypeId") or "12").strip()
    return ctype in ALLOWED_CONTENT_TYPES


def merge_candidates(*groups: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """contentid 기준 중복 제거 후 허용 타입만 남긴다."""
    seen: set[str] = set()
    merged: list[dict[str, Any]] = []
    for group in groups:
        for item in group:
            key = _item_key(item)
            if not key or key in seen:
                continue
            if not _is_allowed(item):
                continue
            seen.add(key)
            merged.append(item)
    return merged


def fetch_candidates(
    raw_service_key: str,
    *,
    longitude: float | None = None,
    latitude: float | None = None,
) -> tuple[list[dict[str, Any]], bool]:
    """areaBasedList2 필수 + 좌표가 있으면 locationBasedList2 보강.

    Returns:
        (items, used_location)
    """
    key = _decode_service_key(raw_service_key)
    area_items = fetch_area_based_list(key)

    used_location = False
    location_items: list[dict[str, Any]] = []
    if longitude is not None and latitude is not None:
        try:
            location_items = fetch_location_based_list(key, map_x=longitude, map_y=latitude)
            used_location = True
        except TourApiError:
            # 주변 검색 실패 시 전국 목록만으로 계속한다.
            used_location = False

    merged = merge_candidates(location_items, area_items)
    return merged, used_location
