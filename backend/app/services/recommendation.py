import math
import random
from copy import deepcopy

from typing import Any
from app.schemas.trip import DestinationSchema, MockDestinationRecord, KakaoPlaceSchema, DestinationDetailSchema
from app.services.kto_constants import ORIGIN_WGS84
from app.services.mock_data import MOCK_DESTINATIONS, ORIGIN_COORDS
from app.services.tourism_api import fetch_kto_destinations
from app.services.kakao_local_api import search_places_by_category
from app.services.cache import get_kto_cache, get_route_cache, build_route_cache_key
from app.services.filters import (
    normalize_theme,
    get_candidate_reject_reason,
    get_matched_theme_keywords,
    explain_candidate_filter,
)


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _calc_grid_distance_km(
    origin_coords: dict[str, float],
    dest_coords: dict[str, float],
) -> float:
    dx = (dest_coords["x"] - origin_coords["x"]) * 3
    dy = (dest_coords["y"] - origin_coords["y"]) * 5
    return math.sqrt(dx * dx + dy * dy)


def _record_distance_km(record: MockDestinationRecord, origin: str, origin_lat: float | None = None, origin_lng: float | None = None) -> float:
    dest = record.destination
    if dest.latitude is not None and dest.longitude is not None:
        if origin_lat is not None and origin_lng is not None:
            return _haversine_km(origin_lat, origin_lng, dest.latitude, dest.longitude)
        origin_geo = ORIGIN_WGS84.get(origin, ORIGIN_WGS84["서울"])
        return _haversine_km(
            origin_geo["lat"],
            origin_geo["lng"],
            dest.latitude,
            dest.longitude,
        )
    # mock fallback (no lat/lng on dest)
    origin_coords = ORIGIN_COORDS.get(origin, ORIGIN_COORDS["서울"])
    return _calc_grid_distance_km(origin_coords, record.coords)


def _matches_transport(
    record: MockDestinationRecord,
    distance_km: float,
    max_distance_km: float,
    transport_mode: str,
) -> bool:
    if transport_mode == "flightIncluded":
        return distance_km <= max_distance_km or record.requires_flight

    if record.requires_flight:
        return False
    return distance_km <= max_distance_km


def _build_mock_reason_badges(
    record: MockDestinationRecord,
    origin: str,
    duration: str,
    max_distance_km: float,
    transport_mode: str,
    themes: list[str],
    origin_lat: float | None = None,
    origin_lng: float | None = None,
) -> list[str]:
    badges = ["보조 데이터 기반"]

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

    if themes and any(t in record.destination.themes for t in themes):
        badges.append("선택 테마와 일치")
    elif record.destination.themes:
        badges.append(f"{record.destination.themes[0]} 테마")

    return badges[:6]


# ─── Record-level matching (uses common filters) ─────────────────────

def _record_matches(
    record: MockDestinationRecord,
    origin: str,
    duration: str,
    max_distance_km: float,
    transport_mode: str,
    themes: list[str],
    *,
    origin_lat: float | None = None,
    origin_lng: float | None = None,
    debug_logs: list[dict] | None = None
) -> bool:
    selected_theme = normalize_theme(themes[0] if themes else None)
    dest = record.destination

    # Duration check (mock records have travel_types)
    if duration not in record.travel_types:
        if debug_logs is not None:
            debug_logs.append({
                "title": dest.title,
                "selectedTheme": selected_theme,
                "matchedKeywords": [],
                "rejectReason": "duration_mismatch",
                "finalPassed": False
            })
        return False

    # Use common filter from filters.py (checks region, content type, theme keywords, excluded keywords)
    reject_reason = get_candidate_reject_reason(dest, selected_theme, max_distance_km=None)
    if reject_reason:
        if debug_logs is not None:
            debug_logs.append({
                "title": dest.title,
                "selectedTheme": selected_theme,
                "matchedKeywords": get_matched_theme_keywords(dest, selected_theme),
                "rejectReason": reject_reason,
                "finalPassed": False
            })
        return False

    # Distance check
    distance_km = _record_distance_km(record, origin, origin_lat, origin_lng)
    if not _matches_transport(record, distance_km, max_distance_km, transport_mode):
        if debug_logs is not None:
            debug_logs.append({
                "title": dest.title,
                "selectedTheme": selected_theme,
                "matchedKeywords": get_matched_theme_keywords(dest, selected_theme),
                "rejectReason": "distance_over_limit",
                "finalPassed": False
            })
        return False

    if debug_logs is not None:
        debug_logs.append({
            "title": dest.title,
            "selectedTheme": selected_theme,
            "matchedKeywords": get_matched_theme_keywords(dest, selected_theme),
            "rejectReason": None,
            "finalPassed": True
        })

    return True


def _filter_records(
    records: list[MockDestinationRecord],
    origin: str,
    duration: str,
    max_distance_km: float,
    transport_mode: str,
    themes: list[str],
    origin_lat: float | None = None,
    origin_lng: float | None = None,
    debug_logs: list[dict] | None = None
) -> list[MockDestinationRecord]:
    filtered: list[MockDestinationRecord] = []
    for record in records:
        if _record_matches(
            record,
            origin,
            duration,
            max_distance_km,
            transport_mode,
            themes,
            origin_lat=origin_lat,
            origin_lng=origin_lng,
            debug_logs=debug_logs
        ):
            filtered.append(record)
    return filtered


def _supplement_with_mock(
    records: list[MockDestinationRecord],
    origin: str,
    duration: str,
    max_distance_km: float,
    transport_mode: str,
    themes: list[str],
    limit: int,
    origin_lat: float | None = None,
    origin_lng: float | None = None,
    debug_logs: list[dict] | None = None
) -> list[MockDestinationRecord]:
    if len(records) >= limit:
        return records

    existing_ids = {r.destination.id for r in records}
    mock_pool = _filter_records(
        MOCK_DESTINATIONS,
        origin,
        duration,
        max_distance_km,
        transport_mode,
        themes,
        origin_lat=origin_lat,
        origin_lng=origin_lng,
        debug_logs=debug_logs
    )

    for record in mock_pool:
        if record.destination.id in existing_ids:
            continue
        copy = deepcopy(record)
        copy.destination.dataSource = "MOCK_FALLBACK"  # type: ignore[assignment]
        copy.destination.reasonBadges = _build_mock_reason_badges(
            copy,
            origin,
            duration,
            max_distance_km,
            transport_mode,
            themes,
            origin_lat=origin_lat,
            origin_lng=origin_lng,
        )
        records.append(copy)
        existing_ids.add(copy.destination.id)
        if len(records) >= limit:
            break

    return records


# ─── Kakao nearby enrichment ─────────────────────────────────────────

def _enrich_nearby_places_kakao(dest: DestinationSchema) -> None:
    if dest.latitude is None or dest.longitude is None:
        return
        
    if dest.detail is None:
        dest.detail = DestinationDetailSchema()

    cache = get_kto_cache()
    # 좌표 반올림 (소수점 3자리 = 약 111m 오차)으로 키 생성하여 인접 장소 요청 재사용률 극대화
    lat_key = round(dest.latitude, 3)
    lng_key = round(dest.longitude, 3)
    cache_key = f"kakao_nearby:{lat_key}:{lng_key}"
    
    cached = cache.get(cache_key)
    if cached is not None:
        dest.detail.nearbyAttractions = cached.get("attractions")
        dest.detail.nearbyRestaurants = cached.get("restaurants")
        dest.detail.nearbyCafes = cached.get("cafes")
        dest.detail.nearbyStays = cached.get("stays")
        return

    # Map function (shared)
    def to_place_schemas(raw_list: list[dict[str, Any]], limit: int = 5) -> list[KakaoPlaceSchema]:
        places: list[KakaoPlaceSchema] = []
        seen_names: set[str] = set()
        dest_title_clean = dest.title.strip()
        for doc in raw_list:
            name = str(doc.get("place_name") or "").strip()
            if not name or name == dest_title_clean or name in seen_names:
                continue
            seen_names.add(name)
            
            map_url = doc.get("place_url")
            lat_val = doc.get("y")
            lng_val = doc.get("x")
            address_name = doc.get("address_name") or doc.get("road_address_name")
            distance_str = doc.get("distance")
            
            if distance_str and distance_str.isdigit():
                dist_m = int(distance_str)
                if dist_m >= 1000:
                    distance = f"{dist_m/1000:.1f}km"
                else:
                    distance = f"{dist_m}m"
            else:
                distance = None
            
            places.append(
                KakaoPlaceSchema(
                    placeName=name,
                    mapUrl=map_url,
                    latitude=float(lat_val) if lat_val else None,
                    longitude=float(lng_val) if lng_val else None,
                    address=address_name,
                    distance=distance,
                )
            )
            if len(places) >= limit:
                break
        return places

    # 1. Attractions (AT4)
    raw_attractions = search_places_by_category("AT4", x=dest.longitude, y=dest.latitude, radius=1500, size=5) or []
    # 2. Restaurants (FD6)
    raw_restaurants = search_places_by_category("FD6", x=dest.longitude, y=dest.latitude, radius=1500, size=5) or []
    # 3. Cafes (CE7)
    raw_cafes = search_places_by_category("CE7", x=dest.longitude, y=dest.latitude, radius=1500, size=5) or []
    # 4. Stays (AD5)
    raw_stays = search_places_by_category("AD5", x=dest.longitude, y=dest.latitude, radius=1500, size=3) or []

    dest.detail.nearbyAttractions = to_place_schemas(raw_attractions, 5)
    dest.detail.nearbyRestaurants = to_place_schemas(raw_restaurants, 5)
    dest.detail.nearbyCafes = to_place_schemas(raw_cafes, 5)
    dest.detail.nearbyStays = to_place_schemas(raw_stays, 3)

    cache.set(
        cache_key,
        {
            "attractions": dest.detail.nearbyAttractions,
            "restaurants": dest.detail.nearbyRestaurants,
            "cafes": dest.detail.nearbyCafes,
            "stays": dest.detail.nearbyStays,
        },
        86400, # 1 day
    )


# ─── Response item construction ──────────────────────────────────────

def _to_response_items(
    records: list[MockDestinationRecord],
    origin: str,
    origin_lat: float | None = None,
    origin_lng: float | None = None,
) -> list[DestinationSchema]:
    from app.services.kakao_local_api import get_directions_info
    from app.schemas.trip import TravelInfoSchema
    items: list[DestinationSchema] = []

    route_cache = get_route_cache()

    for record in records:
        dest = deepcopy(record.destination)
        dest.distanceKm = round(_record_distance_km(record, origin, origin_lat, origin_lng), 1)
        try:
            _enrich_nearby_places_kakao(dest)
        except Exception:
            pass
            
        if dest.latitude is not None and dest.longitude is not None:
            o_lat, o_lng = origin_lat, origin_lng
            if o_lat is None or o_lng is None:
                origin_geo = ORIGIN_WGS84.get(origin, ORIGIN_WGS84["서울"])
                o_lat, o_lng = origin_geo["lat"], origin_geo["lng"]
            
            dest_name = dest.title.replace(" ", "")
            route_map_url = f"https://map.kakao.com/link/to/{dest_name},{dest.latitude},{dest.longitude}"
            
            travel_info_dict: dict[str, Any] = {
                "routeMapUrl": route_map_url,
                "provider": "none"
            }
            
            # Route cache for Kakao directions
            route_key = build_route_cache_key(o_lat, o_lng, dest.latitude, dest.longitude)
            cached_route = route_cache.get(route_key)

            if cached_route is not None:
                travel_info_dict.update(cached_route)
            else:
                dir_info = get_directions_info(o_lng, o_lat, dest.longitude, dest.latitude)
                if dir_info:
                    route_data = {
                        "carDurationText": dir_info["carDurationText"],
                        "distanceText": dir_info["distanceText"],
                        "provider": "kakao"
                    }
                    travel_info_dict.update(route_data)
                    route_cache.set(route_key, route_data, 86400)
                
            dest.travelInfo = TravelInfoSchema(**travel_info_dict)

        items.append(dest)

    return items


# ─── Main entry point ────────────────────────────────────────────────

def get_recommendations(
    origin: str,
    duration: str,
    max_distance_km: float,
    transport_mode: str,
    themes: list[str],
    limit: int = 5,
    origin_lat: float | None = None,
    origin_lng: float | None = None,
    origin_mode: str = "preset",
) -> tuple[list[DestinationSchema], list[dict]]:
    # Pass origin_lat/origin_lng to KTO fetch so locationBasedList uses actual coordinates
    kto_records = fetch_kto_destinations(
        origin=origin,
        duration=duration,
        max_distance_km=max_distance_km,
        transport_mode=transport_mode,
        themes=themes,
        origin_lat=origin_lat,
        origin_lng=origin_lng,
        origin_mode=origin_mode,
    )

    debug_logs: list[dict] = []

    if kto_records is None:
        # KTO API unavailable (no key or request failed) → use mock fallback
        records = _filter_records(
            MOCK_DESTINATIONS,
            origin,
            duration,
            max_distance_km,
            transport_mode,
            themes,
            origin_lat=origin_lat,
            origin_lng=origin_lng,
            debug_logs=debug_logs,
        )
        for record in records:
            record.destination.dataSource = "MOCK_FALLBACK"  # type: ignore[assignment]
            record.destination.reasonBadges = _build_mock_reason_badges(
                record,
                origin,
                duration,
                max_distance_km,
                transport_mode,
                themes,
                origin_lat=origin_lat,
                origin_lng=origin_lng,
            )
    else:
        # KTO API succeeded — filter strictly, do NOT supplement with mock
        records = _filter_records(
            kto_records,
            origin,
            duration,
            max_distance_km,
            transport_mode,
            themes,
            origin_lat=origin_lat,
            origin_lng=origin_lng,
            debug_logs=debug_logs,
        )
        # No _supplement_with_mock call here.
        # Accurate 2-3 results are better than padded 5 with wrong ones.

    random.shuffle(records)

    # 이미지나 상세정보(overview)가 있는 후보 우선 정렬
    records.sort(key=lambda r: (bool(r.destination.imageUrl), bool(r.destination.summary)), reverse=True)

    selected = records[:limit]

    if transport_mode == "flightIncluded":
        has_flight_region = any(r.requires_flight for r in selected)
        flight_candidates = [r for r in records if r.requires_flight]
        if flight_candidates and not has_flight_region:
            selected[-1] = flight_candidates[0]

    items = _to_response_items(selected, origin=origin, origin_lat=origin_lat, origin_lng=origin_lng)
    return items, debug_logs
