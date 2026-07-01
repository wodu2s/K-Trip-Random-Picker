from __future__ import annotations

import logging
import os
import math
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)

KAKAO_LOCAL_BASE = "https://dapi.kakao.com/v2/local"
REQUEST_TIMEOUT = 10.0


def _get_api_key() -> str:
    return os.getenv("KAKAO_REST_API_KEY", "").strip()


def _auth_headers() -> dict[str, str]:
    return {"Authorization": f"KakaoAK {_get_api_key()}"}


def _log_kakao_failure(exc: Exception, context: str) -> None:
    if isinstance(exc, httpx.HTTPStatusError):
        status = exc.response.status_code

        if status == 403:
            logger.warning(
                "Kakao REST API 403 (%s) — REST API 키, 앱 상태, Local API 권한, "
                "Authorization 헤더 형식을 확인하세요. JavaScript 키가 아닌 REST API 키를 사용해야 합니다.",
                context,
            )
            return

        if status == 429:
            logger.warning("Kakao REST API quota exceeded (%s)", context)
            return

        logger.warning("Kakao REST API HTTP %s (%s)", status, context)
        return

    logger.warning("Kakao API failed (%s): %s", context, type(exc).__name__)


def coord2address(x: float, y: float) -> str | None:
    if not _get_api_key():
        return None

    try:
        url = f"{KAKAO_LOCAL_BASE}/geo/coord2address.json"
        params = {"x": str(x), "y": str(y)}
        with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
            resp = client.get(url, headers=_auth_headers(), params=params)
            resp.raise_for_status()
            data = resp.json()
            docs = data.get("documents", [])
            if not docs:
                return None
            doc = docs[0]
            road_address = doc.get("road_address")
            if road_address:
                return f"{road_address.get('region_1depth_name', '')} {road_address.get('region_2depth_name', '')} {road_address.get('region_3depth_name', '')}".strip()
            address = doc.get("address")
            if address:
                return f"{address.get('region_1depth_name', '')} {address.get('region_2depth_name', '')} {address.get('region_3depth_name', '')}".strip()
            return None
    except Exception as e:
        _log_kakao_failure(e, "coord2address")
        return None

def coord2region(lng: float, lat: float) -> Optional[dict[str, Any]]:
    """좌표를 입력받아 region1, region2, region3 및 KTO areaCode 반환"""
    if not _get_api_key():
        return None

    try:
        url = f"{KAKAO_LOCAL_BASE}/geo/coord2address.json"
        params = {"x": str(lng), "y": str(lat)}
        with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
            resp = client.get(url, headers=_auth_headers(), params=params)
            resp.raise_for_status()
            data = resp.json()
            docs = data.get("documents", [])
            if not docs:
                return None
            doc = docs[0]
            
            # Extract region names from road_address or address
            addr = doc.get("road_address") or doc.get("address") or {}
            
            r1 = addr.get("region_1depth_name", "")
            r2 = addr.get("region_2depth_name", "")
            r3 = addr.get("region_3depth_name", "")
            
            address_text = f"{r1} {r2} {r3}".strip()
            
            # Map region_1depth_name to KTO areaCode
            # KTO Area Codes: 서울(1), 인천(2), 대전(3), 대구(4), 광주(5), 부산(6), 울산(7), 세종(8), 경기(31), 강원(32), 충북(33), 충남(34), 경북(35), 경남(36), 전북(37), 전남(38), 제주(39)
            area_code = None
            r1_norm = r1.replace("특별시", "").replace("광역시", "").replace("특별자치시", "").replace("특별자치도", "").replace("도", "")
            
            mapping = {
                "서울": "1", "인천": "2", "대전": "3", "대구": "4", "광주": "5",
                "부산": "6", "울산": "7", "세종": "8", "경기": "31", "강원": "32",
                "충북": "33", "충남": "34", "경북": "35", "경남": "36",
                "전북": "37", "전남": "38", "제주": "39"
            }
            # Handle special cases like '충청북도' -> '충북'
            if r1 == "충청북도": area_code = "33"
            elif r1 == "충청남도": area_code = "34"
            elif r1 == "경상북도": area_code = "35"
            elif r1 == "경상남도": area_code = "36"
            elif r1 == "전라북도": area_code = "37"
            elif r1 == "전라남도": area_code = "38"
            else: area_code = mapping.get(r1_norm)
            
            return {
                "addressText": address_text,
                "region1": r1,
                "region2": r2,
                "region3": r3,
                "areaCode": area_code
            }
    except Exception as e:
        _log_kakao_failure(e, "coord2region")
        return None

def get_directions_info(
    origin_lng: float, origin_lat: float, dest_lng: float, dest_lat: float
) -> Optional[dict[str, Any]]:
    """Kakao Mobility API를 사용해 자동차 경로 이동 정보 반환"""
    if not _get_api_key():
        return None

    try:
        url = "https://apis-navi.kakaomobility.com/v1/directions"
        params = {
            "origin": f"{origin_lng},{origin_lat}",
            "destination": f"{dest_lng},{dest_lat}",
            "priority": "RECOMMEND"
        }
        with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
            resp = client.get(url, headers=_auth_headers(), params=params)
            resp.raise_for_status()
            data = resp.json()
            routes = data.get("routes")
            if not routes:
                return None
            summary = routes[0].get("summary", {})
            distance = summary.get("distance", 0)  # in meters
            duration = summary.get("duration", 0)  # in seconds
            return {
                "distanceText": f"{round(distance / 1000, 1)}km",
                "carDurationText": f"{math.ceil(duration / 60)}분"
            }
    except Exception as e:
        _log_kakao_failure(e, "get_directions_info")
        return None


def search_places_by_keyword(
    keyword: str,
    *,
    x: Optional[float] = None,
    y: Optional[float] = None,
    radius: int = 2000,
    size: int = 5,
) -> Optional[list[dict[str, Any]]]:
    """
    키워드 장소 검색.
    x=경도(longitude), y=위도(latitude)
    """
    api_key = _get_api_key()
    keyword = keyword.strip()

    if not api_key:
        logger.debug("KAKAO_REST_API_KEY not set — keyword search skipped")
        return None

    if not keyword:
        return None

    params: dict[str, Any] = {
        "query": keyword,
        "size": max(1, min(size, 15)),
    }

    if x is not None and y is not None:
        params["x"] = x
        params["y"] = y
        params["radius"] = max(100, min(radius, 20000))

    try:
        with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
            response = client.get(
                f"{KAKAO_LOCAL_BASE}/search/keyword.json",
                headers=_auth_headers(),
                params=params,
            )
            response.raise_for_status()
            data = response.json()

        documents = data.get("documents", [])
        return documents if isinstance(documents, list) else None

    except Exception as exc:
        _log_kakao_failure(exc, f"keyword:{keyword[:20]}")
        return None


def search_place_by_keyword(keyword: str) -> Optional[list[dict[str, Any]]]:
    """하위 호환 alias."""
    return search_places_by_keyword(keyword)


def geocode_address(address: str) -> Optional[dict[str, float]]:
    """
    주소 → 좌표 변환.
    """
    api_key = _get_api_key()
    address = address.strip()

    if not api_key:
        logger.debug("KAKAO_REST_API_KEY not set — geocode skipped")
        return None

    if not address:
        return None

    try:
        with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
            response = client.get(
                f"{KAKAO_LOCAL_BASE}/search/address.json",
                headers=_auth_headers(),
                params={"query": address},
            )
            response.raise_for_status()
            data = response.json()

        documents = data.get("documents", [])
        if not documents:
            return None

        doc = documents[0]
        x_value = doc.get("x")
        y_value = doc.get("y")

        if not x_value or not y_value:
            return None

        return {
            "latitude": float(y_value),
            "longitude": float(x_value),
        }

    except Exception as exc:
        _log_kakao_failure(exc, f"geocode:{address[:30]}")
        return None


def find_nearby_place_name(
    keyword: str,
    latitude: float,
    longitude: float,
    *,
    radius: int = 1500,
) -> Optional[str]:
    """좌표 기준 주변 장소 1건 이름 반환."""
    results = search_places_by_keyword(
        keyword,
        x=longitude,
        y=latitude,
        radius=radius,
        size=1,
    )

    if not results:
        return None

    return str(results[0].get("place_name") or "").strip() or None


def search_places_by_category(
    category_group_code: str,
    x: float,
    y: float,
    *,
    radius: int = 1500,
    size: int = 5,
) -> Optional[list[dict[str, Any]]]:
    """
    카테고리 장소 검색.
    category_group_code: FD6(식당), CE7(카페), AT4(관광지) 등
    """
    api_key = _get_api_key()
    if not api_key:
        return None

    # 1. 1차 검색 (기본 1500m)
    params: dict[str, Any] = {
        "category_group_code": category_group_code,
        "x": x,
        "y": y,
        "radius": radius,
        "size": size,
    }

    try:
        with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
            response = client.get(
                f"{KAKAO_LOCAL_BASE}/search/category.json",
                headers=_auth_headers(),
                params=params,
            )
            response.raise_for_status()
            data = response.json()
        documents = data.get("documents", [])
        
        # 2. 결과가 없으면 반경을 3000m로 확장하여 1회 재검색
        if not documents and radius < 3000:
            params["radius"] = 3000
            with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
                response = client.get(
                    f"{KAKAO_LOCAL_BASE}/search/category.json",
                    headers=_auth_headers(),
                    params=params,
                )
                response.raise_for_status()
                data = response.json()
            documents = data.get("documents", [])
            
        return documents if isinstance(documents, list) else None
    except Exception as exc:
        _log_kakao_failure(exc, f"category:{category_group_code}")
        return None


