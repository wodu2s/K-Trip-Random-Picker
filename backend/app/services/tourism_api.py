"""
한국관광공사 국문 관광정보 OpenAPI 연동.

- areaBasedList2: 지역 기반 관광지 조회
- locationBasedList2: 좌표 반경 관광지 조회 (최대 20km)
- searchKeyword2: 키워드 검색
- detailCommon2: overview 보강
- detailIntro2: 이용시간, 쉬는날, 문의, 주차, 요금
- detailImage2: 추가 이미지

실패 시 None을 반환해 recommendation.py가 mock fallback을 사용한다.
"""

from __future__ import annotations

import logging
import math
import os
from dataclasses import dataclass
from typing import Any, Optional

import httpx

from app.schemas.trip import MockDestinationRecord, SpotSchema
from app.services.cache import build_recommendation_cache_key, get_kto_cache
from app.services.kto_constants import (
    CONTENT_TYPE_ATTRACTION,
    FLIGHT_EXTRA_AREA_CODES,
    KTO_SERVICE_PATH,
    ORIGIN_AREA_CODE,
    ORIGIN_NEARBY_AREA_CODES,
    AREA_NEARBY_AREA_CODES,
    ORIGIN_WGS84,
    THEME_CONTENT_TYPE,
    THEME_KEYWORDS,
)
from app.services.kto_normalize import (
    extract_detail_image_urls,
    kto_item_to_record,
    parse_intro_fields,
    parse_kto_items,
    resolve_image_url,
)

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT = 15.0
MAX_FETCH_PER_ENDPOINT = 30
DETAIL_ENRICH_LIMIT = 8


@dataclass
class KtoDetailBundle:
    overview: Optional[str] = None
    intro: Optional[dict[str, Any]] = None
    images: Optional[list[str]] = None
    extra_info: Optional[list[dict[str, Any]]] = None

    @property
    def has_intro(self) -> bool:
        if not self.intro:
            return False
        fields = parse_intro_fields(self.intro)
        return any(fields.values())

    @property
    def has_images(self) -> bool:
        return bool(self.images)


def _get_api_key() -> str:
    return os.getenv("KTO_API_KEY", "").strip()


def _get_base_url() -> str:
    return os.getenv("KTO_API_BASE_URL", "https://apis.data.go.kr").rstrip("/")


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _parse_response_json(response: httpx.Response) -> Optional[dict[str, Any]]:
    try:
        data = response.json()
    except ValueError:
        logger.warning("KTO API JSON parse failed (status=%s)", response.status_code)
        return None

    if not isinstance(data, dict):
        return None

    header = data.get("response", {}).get("header", {}) or {}
    result_code = str(header.get("resultCode") or "").strip()
    if result_code and result_code not in ("0000", "00"):
        logger.warning(
            "KTO API error code=%s msg=%s",
            result_code,
            header.get("resultMsg"),
        )
        return None

    return data


def _kto_request(endpoint: str, params: dict[str, Any]) -> Optional[list[dict[str, Any]]]:
    api_key = _get_api_key()
    if not api_key:
        logger.info("KTO_API_KEY is not set — using mock fallback")
        return None

    base_url = _get_base_url()
    url = f"{base_url}{KTO_SERVICE_PATH}/{endpoint}"

    query: dict[str, Any] = {
        "serviceKey": api_key,
        "MobileOS": "ETC",
        "MobileApp": "KTripRandomPicker",
        "_type": "json",
        "numOfRows": params.pop("numOfRows", 20),
        "pageNo": params.pop("pageNo", 1),
        **params,
    }

    try:
        with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
            response = client.get(url, params=query)
            response.raise_for_status()
            data = _parse_response_json(response)
            if not data:
                return None
            body = data.get("response", {}).get("body", {})
            return parse_kto_items(body)
    except httpx.TimeoutException:
        logger.warning("KTO API timeout: %s", endpoint)
        return None
    except httpx.HTTPError as exc:
        logger.warning("KTO API HTTP error (%s): %s", endpoint, exc)
        return None
    except Exception as exc:
        logger.error("KTO API unexpected error (%s): %s", endpoint, exc)
        return None


def fetch_area_based_list(
    area_code: str,
    *,
    content_type_id: str = CONTENT_TYPE_ATTRACTION,
    num_of_rows: int = 20,
) -> list[dict[str, Any]]:
    items = _kto_request(
        "areaBasedList2",
        {
            "areaCode": area_code,
            "contentTypeId": content_type_id,
            "arrange": "C",
            "numOfRows": num_of_rows,
        },
    )
    return items or []


def fetch_location_based_list(
    lat: float,
    lng: float,
    *,
    radius_m: int = 20_000,
    content_type_id: str = CONTENT_TYPE_ATTRACTION,
    num_of_rows: int = 20,
) -> list[dict[str, Any]]:
    radius_m = max(1000, min(radius_m, 20_000))
    items = _kto_request(
        "locationBasedList2",
        {
            "mapY": lat,
            "mapX": lng,
            "radius": radius_m,
            "contentTypeId": content_type_id,
            "arrange": "E",
            "numOfRows": num_of_rows,
        },
    )
    return items or []


def fetch_search_keyword(
    keyword: str,
    *,
    area_code: Optional[str] = None,
    content_type_id: Optional[str] = None,
    num_of_rows: int = 15,
) -> list[dict[str, Any]]:
    params: dict[str, Any] = {
        "keyword": keyword,
        "arrange": "C",
        "numOfRows": num_of_rows,
    }
    if area_code:
        params["areaCode"] = area_code
    if content_type_id:
        params["contentTypeId"] = content_type_id

    items = _kto_request("searchKeyword2", params)
    return items or []


def fetch_detail_common(content_id: str) -> Optional[dict[str, Any]]:
    items = _kto_request(
        "detailCommon2",
        {
            "contentId": content_id,
            "defaultYN": "Y",
            "addrinfoYN": "Y",
            "mapinfoYN": "Y",
            "overviewYN": "Y",
            "numOfRows": 1,
        },
    )
    if items:
        return items[0]
    return None


def _is_valid_destination(item: dict[str, Any]) -> bool:
    from app.services.filters import is_region_name_only
    cid = str(item.get("contentid") or item.get("contentId") or "")
    title = str(item.get("title") or "").strip()
    addr = str(item.get("addr1") or "").strip()
    mapx = str(item.get("mapx") or "").strip()
    mapy = str(item.get("mapy") or "").strip()

    if not cid or not title or not mapx or not mapy or not addr:
        return False

    if is_region_name_only(title, addr):
        return False

    return True

def _dedupe_items(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    seen: set[str] = set()
    result: list[dict[str, Any]] = []
    for item in items:
        if not _is_valid_destination(item):
            continue
        cid = str(item.get("contentid") or item.get("contentId") or "")
        key = cid or str(item.get("title") or "")
        if not key or key in seen:
            continue
        seen.add(key)
        result.append(item)
    return result


def _collect_raw_items(
    origin: str,
    themes: list[str],
    transport_mode: str,
    max_distance_km: float,
    *,
    origin_lat: Optional[float] = None,
    origin_lng: Optional[float] = None,
    origin_mode: str = "preset",
) -> list[dict[str, Any]]:
    origin_geo = ORIGIN_WGS84.get(origin, ORIGIN_WGS84["서울"])
    lat = origin_lat if origin_lat is not None else origin_geo["lat"]
    lng = origin_lng if origin_lng is not None else origin_geo["lng"]

    collected: list[dict[str, Any]] = []

    if transport_mode == "flightIncluded":
        jeju_items = fetch_area_based_list("39", num_of_rows=MAX_FETCH_PER_ENDPOINT)
        if jeju_items:
            collected.extend(jeju_items)

    radius_m = int(min(max_distance_km, 20) * 1000)
    collected.extend(
        fetch_location_based_list(lat, lng, radius_m=radius_m, num_of_rows=MAX_FETCH_PER_ENDPOINT)
    )

    if origin_mode == "current" and origin_lat is not None and origin_lng is not None:
        from app.services.kakao_local_api import coord2region
        region_info = coord2region(origin_lng, origin_lat)
        if region_info and region_info.get("areaCode"):
            base_area = region_info["areaCode"]
            area_codes = AREA_NEARBY_AREA_CODES.get(base_area, [base_area])
        else:
            area_codes = [] # Nationwide/Fallback
    else:
        area_codes = list(ORIGIN_NEARBY_AREA_CODES.get(origin, [ORIGIN_AREA_CODE.get(origin, "1")]))
        
    if transport_mode == "flightIncluded":
        for code in FLIGHT_EXTRA_AREA_CODES:
            if code not in area_codes:
                area_codes.append(code)

    for area_code in area_codes[:6]:
        collected.extend(
            fetch_area_based_list(area_code, num_of_rows=MAX_FETCH_PER_ENDPOINT)
        )

    theme_collected: list[dict[str, Any]] = []
    
    # Use top 3 area codes for theme searches to ensure we get nearby results (e.g. Incheon/Gyeonggi for Seoul)
    search_areas = area_codes[:3] if area_codes else ["1"]

    for theme in themes:
        if theme == "바다":
            sea_keywords = ["해수욕장", "해변", "항구", "방파제"]
            for area_code in search_areas:
                for keyword in sea_keywords:
                    theme_collected.extend(
                        fetch_search_keyword(
                            keyword,
                            area_code=area_code,
                            num_of_rows=5,
                        )
                    )
        else:
            keyword = THEME_KEYWORDS.get(theme, theme)
            content_type = THEME_CONTENT_TYPE.get(theme)
            for area_code in search_areas:
                theme_collected.extend(
                    fetch_search_keyword(
                        keyword,
                        area_code=area_code,
                        content_type_id=content_type,
                        num_of_rows=8,
                    )
                )

    if not themes:
        for area_code in search_areas[:2]:
            theme_collected.extend(
                fetch_search_keyword("여행", area_code=area_code, num_of_rows=10)
            )

    # Put theme specific items first
    collected = theme_collected + collected

    return _dedupe_items(collected)[:100]


def _get_cache_ttl() -> int:
    try:
        return max(60, int(os.getenv("CACHE_TTL_SECONDS", "600")))
    except ValueError:
        return 600


def fetch_detail_intro(content_id: str, content_type_id: str) -> Optional[dict[str, Any]]:
    items = _kto_request(
        "detailIntro2",
        {
            "contentId": content_id,
            "contentTypeId": content_type_id,
            "numOfRows": 1,
        },
    )
    if items:
        return items[0]
    return None


def fetch_detail_images(content_id: str) -> list[str]:
    items = _kto_request(
        "detailImage2",
        {
            "contentId": content_id,
            "imageYN": "Y",
            "numOfRows": 10,
        },
    )
    if not items:
        return []
    return extract_detail_image_urls(items)


def fetch_detail_info(content_id: str, content_type_id: str) -> Optional[list[dict[str, Any]]]:
    """반복 정보(detailInfo2) 조회."""
    items = _kto_request(
        "detailInfo2",
        {
            "contentId": content_id,
            "contentTypeId": content_type_id,
            "numOfRows": 5,
        },
    )
    return items

def _enrich_item_details(items: list[dict[str, Any]], limit: int = DETAIL_ENRICH_LIMIT) -> dict[str, KtoDetailBundle]:
    bundles: dict[str, KtoDetailBundle] = {}

    for item in items[:limit]:
        cid = str(item.get("contentid") or "")
        if not cid or cid in bundles:
            continue

        content_type_id = str(item.get("contenttypeid") or CONTENT_TYPE_ATTRACTION)
        bundle = KtoDetailBundle()

        common = fetch_detail_common(cid)
        if common:
            overview = str(common.get("overview") or "").strip()
            if overview:
                bundle.overview = overview

        intro = fetch_detail_intro(cid, content_type_id)
        if intro:
            bundle.intro = intro

        images = fetch_detail_images(cid)
        if images:
            bundle.images = images

        extra = fetch_detail_info(cid, content_type_id)
        if extra:
            bundle.extra_info = extra

        bundles[cid] = bundle

    return bundles


def _build_reason_badges(
    *,
    origin: str,
    transport_mode: str,
    max_distance_km: float,
    duration: str,
    themes: list[str],
    item_themes: list[str],
    has_intro: bool = False,
    has_images: bool = False,
) -> list[str]:
    badges: list[str] = ["관광공사 데이터 기반"]

    if has_intro:
        badges.append("상세 관광정보 제공")
    if has_images:
        badges.append("관광 이미지 제공")

    if transport_mode == "flightIncluded":
        badges.append("항공권역 여행지")
        if duration == "overnight":
            badges.append("1박 2일 이상 추천")
        else:
            badges.append("당일치기 일정 적합")
    else:
        badges.append(f"{origin} 출발 기준 {int(max_distance_km)}km 이내")
        if duration == "day":
            badges.append("당일치기 일정 적합")
        else:
            badges.append("1박 2일 이상 추천")

    if themes and any(t in item_themes for t in themes):
        badges.append("선택 테마와 일치")
    elif item_themes:
        badges.append(f"{item_themes[0]} 테마")

    return badges[:6]


def _apply_kakao_enrichment(record: MockDestinationRecord, *, enrich_nearby: bool = False) -> None:
    """좌표 보완 및 주변 장소 1건 보강 (실패해도 무시)."""
    try:
        from app.services.kakao_local_api import find_nearby_place_name, geocode_address

        dest = record.destination
        if dest.latitude is None or dest.longitude is None:
            query = dest.address or dest.title
            if query:
                coords = geocode_address(query)
                if coords:
                    dest.latitude = coords["latitude"]
                    dest.longitude = coords["longitude"]

        if (
            enrich_nearby
            and dest.latitude is not None
            and dest.longitude is not None
            and dest.detail is not None
        ):
            cafe_name = find_nearby_place_name(
                "카페",
                dest.latitude,
                dest.longitude,
            )
            if cafe_name:
                spots = list(dest.detail.nearbySpots or [])
                if not any(s.name == cafe_name for s in spots):
                    spots.append(
                        SpotSchema(
                            name=cafe_name,
                            description="카카오맵 기준 주변 인기 카페",
                        )
                    )
                    dest.detail.nearbySpots = spots[:5]
    except Exception as exc:
        logger.debug("Kakao enrichment skipped: %s", exc)


def _fetch_kto_destinations_uncached(
    origin: str,
    duration: str,
    max_distance_km: float,
    transport_mode: str,
    themes: Optional[list[str]],
    *,
    origin_lat: Optional[float] = None,
    origin_lng: Optional[float] = None,
    origin_mode: str = "preset",
) -> Optional[list[MockDestinationRecord]]:
    if not _get_api_key():
        return None

    theme_list = themes or []

    try:
        raw_items = _collect_raw_items(
            origin, theme_list, transport_mode, max_distance_km,
            origin_lat=origin_lat, origin_lng=origin_lng, origin_mode=origin_mode,
        )
        if not raw_items:
            logger.warning("KTO API returned no items")
            return []

        origin_geo = ORIGIN_WGS84.get(origin, ORIGIN_WGS84["서울"])
        ref_lat = origin_lat if origin_lat is not None else origin_geo["lat"]
        ref_lng = origin_lng if origin_lng is not None else origin_geo["lng"]
        detail_bundles = _enrich_item_details(raw_items, limit=DETAIL_ENRICH_LIMIT)

        records: list[MockDestinationRecord] = []
        for idx, item in enumerate(raw_items):
            from app.services.kto_normalize import parse_kto_coords

            lng, lat = parse_kto_coords(item.get("mapx"), item.get("mapy"))
            distance_km: Optional[float] = None
            if lat is not None and lng is not None:
                distance_km = _haversine_km(
                    ref_lat,
                    ref_lng,
                    lat,
                    lng,
                )

            cid = str(item.get("contentid") or "")
            bundle = detail_bundles.get(cid, KtoDetailBundle())

            record = kto_item_to_record(
                item,
                origin=origin,
                overview=bundle.overview,
                intro=bundle.intro,
                extra_images=bundle.images,
                extra_info=bundle.extra_info,
                distance_km=distance_km,
            )
            record.destination.reasonBadges = _build_reason_badges(
                origin=origin,
                transport_mode=transport_mode,
                max_distance_km=max_distance_km,
                duration=duration,
                themes=theme_list,
                item_themes=record.destination.themes,
                has_intro=bundle.has_intro,
                has_images=bundle.has_images or bool(resolve_image_url(item, bundle.images)),
            )
            _apply_kakao_enrichment(record, enrich_nearby=idx < 3)
            records.append(record)

        logger.info("KTO API fetched %d records for origin=%s", len(records), origin)
        return records

    except Exception as exc:
        logger.error("fetch_kto_destinations failed: %s", exc)
        return None


def fetch_kto_destinations(
    origin: str,
    duration: str = "day",
    max_distance_km: float = 150,
    transport_mode: str = "local",
    themes: Optional[list[str]] = None,
    *,
    origin_lat: Optional[float] = None,
    origin_lng: Optional[float] = None,
    origin_mode: str = "preset",
) -> Optional[list[MockDestinationRecord]]:
    """
    KTO OpenAPI에서 관광지를 조회해 MockDestinationRecord 호환 목록으로 반환.

    Returns:
        None  — API 키 없음 / 요청 실패 (mock fallback 트리거)
        []    — API 성공했으나 유효 항목 없음
        list  — 변환된 레코드
    """
    theme_list = themes or []
    cache_key = build_recommendation_cache_key(
        origin, duration, max_distance_km, transport_mode, theme_list,
        origin_lat=origin_lat, origin_lng=origin_lng, origin_mode=origin_mode,
    )
    cache = get_kto_cache()
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info("KTO cache hit for %s", cache_key)
        return cached

    result = _fetch_kto_destinations_uncached(
        origin=origin,
        duration=duration,
        max_distance_km=max_distance_km,
        transport_mode=transport_mode,
        themes=theme_list,
        origin_lat=origin_lat,
        origin_lng=origin_lng,
        origin_mode=origin_mode,
    )

    if result is not None:
        cache.set(cache_key, result, _get_cache_ttl())

    return result


def probe_kto_api() -> dict[str, Any]:
    """디버그용 — 키 존재 여부와 샘플 호출 성공 여부만 반환."""
    has_key = bool(_get_api_key())
    if not has_key:
        return {"hasKey": False, "requestSuccess": False, "itemCount": 0}

    items = fetch_area_based_list("1", num_of_rows=5)
    success = len(items) > 0
    return {
        "hasKey": True,
        "requestSuccess": success,
        "itemCount": len(items),
    }
