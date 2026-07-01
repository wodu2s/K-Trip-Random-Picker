"""KTO 데이터 커버리지 분석 — 디버그 전용.

recommendation.py와 동일한 filters.py 함수를 사용하여
debug 결과와 actual 추천 결과가 일치하도록 보장.
"""

import logging
from typing import Any, Optional

from app.services.kto_constants import (
    ORIGIN_WGS84,
    ORIGIN_AREA_CODE,
    ORIGIN_NEARBY_AREA_CODES,
    FLIGHT_EXTRA_AREA_CODES,
    THEME_KEYWORDS,
    THEME_CONTENT_TYPE,
)
from app.services.tourism_api import (
    fetch_location_based_list,
    fetch_area_based_list,
    fetch_search_keyword,
    _is_valid_destination,
    MAX_FETCH_PER_ENDPOINT,
)
from app.services.kto_normalize import (
    parse_kto_coords,
    kto_item_to_destination,
)
from app.services.recommendation import _haversine_km
from app.services.filters import (
    normalize_theme,
    explain_candidate_filter,
)

logger = logging.getLogger(__name__)


def calculate_kto_coverage(
    origin: str,
    theme: str,
    max_distance_km: float,
    origin_lat: Optional[float] = None,
    origin_lng: Optional[float] = None,
    transport_mode: str = "local",
    origin_mode: str = "preset"
) -> dict[str, Any]:
    theme = normalize_theme(theme)

    origin_geo = ORIGIN_WGS84.get(origin, ORIGIN_WGS84["서울"])
    lat = origin_lat if origin_lat is not None else origin_geo["lat"]
    lng = origin_lng if origin_lng is not None else origin_geo["lng"]

    source_counts = {
        "locationBasedList": 0,
        "searchKeyword": 0,
        "mergedUnique": 0
    }

    raw_location: list[dict[str, Any]] = []
    raw_search: list[dict[str, Any]] = []

    if transport_mode == "flightIncluded":
        jeju = fetch_area_based_list("39", num_of_rows=MAX_FETCH_PER_ENDPOINT)
        if jeju:
            raw_location.extend(jeju)

    radius_m = int(min(max_distance_km, 20) * 1000)
    loc_items = fetch_location_based_list(lat, lng, radius_m=radius_m, num_of_rows=MAX_FETCH_PER_ENDPOINT)
    raw_location.extend(loc_items)

    if origin_mode == "current" and origin_lat is not None and origin_lng is not None:
        from app.services.kakao_local_api import coord2region
        from app.services.kto_constants import AREA_NEARBY_AREA_CODES
        region_info = coord2region(origin_lng, origin_lat)
        if region_info and region_info.get("areaCode"):
            base_area = region_info["areaCode"]
            area_codes = AREA_NEARBY_AREA_CODES.get(base_area, [base_area])
        else:
            area_codes = []
    else:
        area_codes = list(ORIGIN_NEARBY_AREA_CODES.get(origin, [ORIGIN_AREA_CODE.get(origin, "1")]))
        
    if transport_mode == "flightIncluded":
        for code in FLIGHT_EXTRA_AREA_CODES:
            if code not in area_codes:
                area_codes.append(code)

    for area_code in area_codes[:6]:
        raw_location.extend(fetch_area_based_list(area_code, num_of_rows=MAX_FETCH_PER_ENDPOINT))

    source_counts["locationBasedList"] = len(raw_location)

    search_areas = area_codes[:3] if area_codes else ["1"]
    
    if theme == "바다":
        sea_keywords = ["해수욕장", "해변", "항구", "방파제"]
        for area_code in search_areas:
            for kw in sea_keywords:
                raw_search.extend(fetch_search_keyword(kw, area_code=area_code, num_of_rows=5))
    elif theme != "전체":
        keyword = THEME_KEYWORDS.get(theme, theme)
        content_type = THEME_CONTENT_TYPE.get(theme)
        for area_code in search_areas:
            raw_search.extend(fetch_search_keyword(keyword, area_code=area_code, content_type_id=content_type, num_of_rows=8))

    if not theme or theme == "전체":
        for area_code in search_areas[:2]:
            raw_search.extend(fetch_search_keyword("여행", area_code=area_code, num_of_rows=10))

    source_counts["searchKeyword"] = len(raw_search)

    # Theme search results first (same priority as _collect_raw_items in tourism_api)
    all_raw = raw_search + raw_location

    # dedupe
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for item in all_raw:
        cid = str(item.get("contentid") or item.get("contentId") or "")
        key = cid or str(item.get("title") or "")
        if key and key not in seen:
            seen.add(key)
            deduped.append(item)

    source_counts["mergedUnique"] = len(deduped)

    stats: dict[str, Any] = {
        "origin": origin,
        "originMode": origin_mode,
        "originLat": origin_lat,
        "originLng": origin_lng,
        "resolvedAddress": region_info.get("addressText") if origin_mode == "current" and 'region_info' in locals() and region_info else None,
        "resolvedAreaCode": region_info.get("areaCode") if origin_mode == "current" and 'region_info' in locals() and region_info else None,
        "searchedAreaCodes": area_codes,
        "sourceCounts": source_counts,
        "theme": theme,
        "maxDistanceKm": max_distance_km,
        "rawCount": len(deduped),
        "afterRegionNameFilter": 0,
        "afterThemeFilter": 0,
        "afterDistanceFilter": 0,
        "finalCandidateCount": 0,
        "contentTypeCounts": {},
        "areaCounts": {},
        "keywordCounts": {},
        "imageStats": {
            "hasMainImage": 0,
            "hasAdditionalImages": 0,
            "noImage": 0
        },
        "samples": {
            "passed": [],
            "rejected": []
        },
        "sourceCounts": source_counts
    }

    passed_samples: list[dict[str, Any]] = []
    rejected_samples: list[dict[str, Any]] = []

    for item in deduped:
        cid = str(item.get("contentid") or "")
        title = str(item.get("title") or "").strip()
        addr = str(item.get("addr1") or "").strip()
        mapx = str(item.get("mapx") or "")
        mapy = str(item.get("mapy") or "")
        ctype = str(item.get("contenttypeid") or "unknown")
        firstimage = item.get("firstimage") or item.get("firstimage2")

        # update basic stats
        stats["contentTypeCounts"][ctype] = stats["contentTypeCounts"].get(ctype, 0) + 1

        addr_parts = addr.split()
        area_name = addr_parts[0] if len(addr_parts) > 0 else "unknown"
        stats["areaCounts"][area_name] = stats["areaCounts"].get(area_name, 0) + 1

        if firstimage:
            stats["imageStats"]["hasMainImage"] += 1
        else:
            stats["imageStats"]["noImage"] += 1

        # Validity check (coordinates)
        if not cid or not mapx or not mapy or not addr:
            rejected_samples.append({
                "title": title, "contentId": cid, "contentTypeId": ctype,
                "addr1": addr, "rejectReason": "no_coordinates",
            })
            continue

        if not _is_valid_destination(item):
            rejected_samples.append({
                "title": title, "contentId": cid, "contentTypeId": ctype,
                "addr1": addr, "rejectReason": "invalid_destination",
            })
            continue

        stats["afterRegionNameFilter"] += 1

        # Build a real DestinationSchema with KTO metadata preserved
        # so filters.py can use contentTypeId, cat1, cat2, cat3, overview
        item_lng, item_lat = parse_kto_coords(mapx, mapy)
        dist_km = 9999.0
        if item_lat and item_lng:
            dist_km = _haversine_km(lat, lng, item_lat, item_lng)

        dest = kto_item_to_destination(
            item,
            distance_km=dist_km,
        )

        # Use the SAME filter function as recommendation.py
        result = explain_candidate_filter(dest, theme, max_distance_km)

        if result["rejectReason"] is not None:
            reject_reason = result["rejectReason"]
            # Track which filter stage caused rejection for stats
            if reject_reason == "distance_over_limit":
                pass  # already counted afterRegionNameFilter and afterThemeFilter below
            else:
                pass

            rejected_samples.append({
                "title": title, "contentId": cid, "contentTypeId": ctype,
                "addr1": addr, "distanceKm": dist_km,
                "rejectReason": reject_reason,
                "matchedKeywords": result.get("matchedKeywords", []),
            })
            continue

        stats["afterThemeFilter"] += 1
        stats["afterDistanceFilter"] += 1
        stats["finalCandidateCount"] += 1
        passed_samples.append({
            "title": title, "contentId": cid, "contentTypeId": ctype, "addr1": addr,
            "areaName": area_name, "distanceKm": dist_km,
            "firstimage_exists": bool(firstimage),
            "matchedKeywords": result.get("matchedKeywords", []),
            "whyPassed": "all_filters_passed",
        })

    stats["samples"]["passed"] = passed_samples[:10]
    stats["samples"]["rejected"] = rejected_samples[:20]

    return stats
