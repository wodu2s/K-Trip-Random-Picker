"""한국관광공사 API 응답 → DestinationSchema 변환."""

from __future__ import annotations

import re
from typing import Any, Optional

from app.schemas.trip import DestinationDetailSchema, DestinationSchema, MockDestinationRecord
from app.services.kto_constants import (
    AREA_CODE_REGION,
    CAT1_THEME,
    CONTENT_TYPE_THEME,
    DEFAULT_EMOJI,
    THEME_EMOJI,
)

DataSource = str


def parse_kto_items(body: dict[str, Any]) -> list[dict[str, Any]]:
    """response.body에서 item 목록을 안전하게 추출."""
    if not body:
        return []
    items_wrapper = body.get("items")
    if not items_wrapper:
        return []
    item = items_wrapper.get("item")
    if not item:
        return []
    if isinstance(item, dict):
        return [item]
    if isinstance(item, list):
        return [i for i in item if isinstance(i, dict)]
    return []


def parse_kto_coords(mapx: Any, mapy: Any) -> tuple[Optional[float], Optional[float]]:
    """mapx/mapY → WGS84 (lng, lat)."""
    if mapx in (None, "", "0") or mapy in (None, "", "0"):
        return None, None
    try:
        x = float(mapx)
        y = float(mapy)
    except (TypeError, ValueError):
        return None, None

    if x > 1000 or y > 1000:
        return x / 10_000_000, y / 10_000_000
    return x, y


def _extract_region(item: dict[str, Any]) -> str:
    addr1 = str(item.get("addr1") or "").strip()
    if addr1:
        match = re.match(r"^([가-힣]+(?:특별자치도|광역시|특별시|도)?)", addr1)
        if match:
            return match.group(1)
        parts = addr1.split()
        if parts:
            return parts[0]

    area_code = str(item.get("areacode") or item.get("areaCode") or "").strip()
    if area_code in AREA_CODE_REGION:
        return AREA_CODE_REGION[area_code]

    return "대한민국"


def _infer_themes(item: dict[str, Any]) -> list[str]:
    themes: list[str] = []

    content_type = str(item.get("contenttypeid") or item.get("contentTypeId") or "")
    if content_type in CONTENT_TYPE_THEME:
        themes.append(CONTENT_TYPE_THEME[content_type])

    cat1 = str(item.get("cat1") or "")
    if cat1 in CAT1_THEME and CAT1_THEME[cat1] not in themes:
        themes.append(CAT1_THEME[cat1])

    title = str(item.get("title") or "")
    addr = str(item.get("addr1") or "")
    text = f"{title} {addr}"
    if any(k in text for k in ("해변", "바다", "해수욕장", "해안")) and "바다" not in themes:
        themes.append("바다")
    if any(k in text for k in ("산", "숲", "계곡", "공원", "자연")) and "자연" not in themes:
        themes.append("자연")
    if any(k in text for k in ("박물관", "미술", "문화", "전통")) and "문화" not in themes:
        themes.append("문화")

    return themes or ["자연"]


def _clean_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text).strip()


def _first_non_empty(data: dict[str, Any], keys: list[str]) -> Optional[str]:
    for key in keys:
        value = str(data.get(key) or "").strip()
        if value:
            return _clean_html(value)
    return None


def parse_intro_fields(intro: Optional[dict[str, Any]]) -> dict[str, Optional[str]]:
    if not intro:
        return {
            "infoCenter": None,
            "restDate": None,
            "useTime": None,
            "parking": None,
            "useFee": None,
        }

    return {
        "infoCenter": _first_non_empty(
            intro,
            [
                "infocenter",
                "infocentertourism",
                "infocenterculture",
                "infocenterfood",
                "infocenterleports",
                "infocenterlodging",
                "infocenterfestival",
                "infocentercamping",
            ],
        ),
        "restDate": _first_non_empty(
            intro,
            [
                "restdate",
                "restdateculture",
                "restdatefood",
                "restdateleports",
                "restdatelodging",
                "restdatefestival",
            ],
        ),
        "useTime": _first_non_empty(
            intro,
            [
                "usetime",
                "usetimeculture",
                "usetimefood",
                "usetimeleports",
                "usetimelodging",
                "useetimefestival",
            ],
        ),
        "parking": _first_non_empty(
            intro,
            ["parking", "parkingculture", "parkingfood", "parkingleports", "parkinglodging"],
        ),
        "useFee": _first_non_empty(
            intro,
            [
                "usefee",
                "usefeeculture",
                "usefeefood",
                "usefeeleports",
                "usefeelodging",
                "usefeefestival",
            ],
        ),
    }


def extract_detail_image_urls(items: list[dict[str, Any]]) -> list[str]:
    """originimgurl 우선, 같은 base URL 중복 제거, smallimageurl 단독 시에만 포함."""
    urls: list[str] = []
    seen_base: set[str] = set()

    def _strip_qs(url: str) -> str:
        return url.split("?")[0]

    # Pass 1: origin(고화질) 이미지 우선 수집
    for item in items:
        origin_url = str(item.get("originimgurl") or "").strip()
        if origin_url.startswith("http"):
            base = _strip_qs(origin_url)
            if base not in seen_base:
                seen_base.add(base)
                urls.append(origin_url)

    # Pass 2: smallimageurl — origin이 없는 항목에서만 수집
    for item in items:
        origin_url = str(item.get("originimgurl") or "").strip()
        if origin_url.startswith("http"):
            continue  # 이미 origin이 있으므로 small 불필요
        small_url = str(item.get("smallimageurl") or item.get("imgurl") or "").strip()
        if small_url.startswith("http"):
            base = _strip_qs(small_url)
            if base not in seen_base:
                seen_base.add(base)
                urls.append(small_url)

    return urls


def build_kto_detail(
    item: dict[str, Any],
    *,
    overview: Optional[str] = None,
    intro: Optional[dict[str, Any]] = None,
    extra_images: Optional[list[str]] = None,
    extra_info: Optional[list[dict[str, Any]]] = None,
) -> DestinationDetailSchema:
    title = str(item.get("title") or "관광지").strip()
    intro_fields = parse_intro_fields(intro)
    images: list[str] = []
    seen: set[str] = set()

    def _strip_qs(u: str) -> str:
        return u.split("?")[0]

    for key in ("firstimage", "firstimage2"):
        url = str(item.get(key) or "").strip()
        if url.startswith("http"):
            base = _strip_qs(url)
            if base not in seen:
                seen.add(base)
                images.append(url)

    for url in extra_images or []:
        if url.startswith("http"):
            base = _strip_qs(url)
            if base not in seen:
                seen.add(base)
                images.append(url)

    cleaned_overview = _clean_html(overview) if overview else None
    
    parsed_extra: dict[str, str] = {}
    if extra_info:
        for ex in extra_info:
            name = str(ex.get("infoname") or "").strip()
            text = str(ex.get("infotext") or "").strip()
            if name and text:
                parsed_extra[name] = _clean_html(text)

    return DestinationDetailSchema(
        mapQuery=title,
        overview=cleaned_overview or None,
        infoCenter=intro_fields["infoCenter"],
        restDate=intro_fields["restDate"],
        useTime=intro_fields["useTime"],
        parking=intro_fields["parking"],
        useFee=intro_fields["useFee"],
        images=images,
        extraInfo=parsed_extra if parsed_extra else None,
    )


def _pick_image(item: dict[str, Any]) -> Optional[str]:
    for key in ("firstimage", "firstimage2", "firstImage", "firstImage2"):
        url = str(item.get(key) or "").strip()
        if url and url.startswith("http"):
            return url
    return None


def resolve_image_url(item: dict[str, Any], extra_images: Optional[list[str]] = None) -> Optional[str]:
    primary = _pick_image(item)
    if primary:
        return primary
    if extra_images:
        return extra_images[0]
    detail = build_kto_detail(item, extra_images=extra_images)
    if detail.images:
        return detail.images[0]
    return None


def _build_summary(item: dict[str, Any], overview: Optional[str] = None) -> str:
    if overview:
        cleaned = re.sub(r"<[^>]+>", "", overview).strip()
        if cleaned:
            return cleaned[:200] + ("…" if len(cleaned) > 200 else "")

    title = str(item.get("title") or "관광지").strip()
    addr = str(item.get("addr1") or "").strip()
    if addr:
        return f"{title} — {addr} 일대의 추천 관광지입니다."
    return f"{title} — 한국관광공사 데이터 기반 추천 관광지입니다."


def _emoji_for_themes(themes: list[str]) -> list[str]:
    for theme in themes:
        if theme in THEME_EMOJI:
            return THEME_EMOJI[theme]
    return DEFAULT_EMOJI


def is_jeju_destination(item: dict[str, Any], lat: Optional[float], lng: Optional[float]) -> bool:
    text = f"{item.get('addr1', '')} {item.get('addr2', '')} {item.get('title', '')}"
    if "제주" in text:
        return True
    area = str(item.get("areacode") or item.get("areaCode") or "")
    if area == "39":
        return True
    if lat is not None and lng is not None and lat < 33.2 and lng < 127.0:
        return True
    return False


def kto_item_to_destination(
    item: dict[str, Any],
    *,
    data_source: DataSource = "KTO_OPEN_API",
    overview: Optional[str] = None,
    intro: Optional[dict[str, Any]] = None,
    extra_images: Optional[list[str]] = None,
    extra_info: Optional[list[dict[str, Any]]] = None,
    distance_km: Optional[float] = None,
    reason_badges: Optional[list[str]] = None,
) -> DestinationSchema:
    content_id = str(item.get("contentid") or item.get("contentId") or "").strip()
    title = str(item.get("title") or "관광지").strip()
    addr1 = str(item.get("addr1") or "").strip()
    addr2 = str(item.get("addr2") or "").strip()
    address = f"{addr1} {addr2}".strip() or None

    lng, lat = parse_kto_coords(item.get("mapx"), item.get("mapy"))
    themes = _infer_themes(item)
    region = _extract_region(item)
    image_url = resolve_image_url(item, extra_images)

    badges = list(reason_badges or [])
    if data_source == "KTO_OPEN_API" and "관광공사 데이터 기반" not in badges:
        badges.insert(0, "관광공사 데이터 기반")

    cleaned_overview = _clean_html(overview) if overview else None

    return DestinationSchema(
        id=f"kto-{content_id}" if content_id else f"kto-{title[:20]}",
        title=title,
        region=region,
        address=address,
        latitude=lat,
        longitude=lng,
        imageUrl=image_url,
        themes=themes,
        distanceKm=round(distance_km, 1) if distance_km is not None else None,
        summary=_build_summary(item, overview),
        reasonBadges=badges[:6],
        emojiHints=_emoji_for_themes(themes),
        dataSource=data_source,  # type: ignore[arg-type]
        detail=build_kto_detail(
            item,
            overview=overview,
            intro=intro,
            extra_images=extra_images,
            extra_info=extra_info,
        ),
        # KTO raw metadata for filtering
        contentId=content_id or None,
        contentTypeId=str(item.get("contenttypeid") or "") or None,
        cat1=str(item.get("cat1") or "") or None,
        cat2=str(item.get("cat2") or "") or None,
        cat3=str(item.get("cat3") or "") or None,
        overview=cleaned_overview,
    )


def kto_item_to_record(
    item: dict[str, Any],
    *,
    origin: str,
    overview: Optional[str] = None,
    intro: Optional[dict[str, Any]] = None,
    extra_images: Optional[list[str]] = None,
    extra_info: Optional[list[dict[str, Any]]] = None,
    distance_km: Optional[float] = None,
    reason_badges: Optional[list[str]] = None,
) -> MockDestinationRecord:
    """추천 필터용 MockDestinationRecord 호환 구조로 변환."""
    lng, lat = parse_kto_coords(item.get("mapx"), item.get("mapy"))
    requires_flight = is_jeju_destination(item, lat, lng) and origin != "제주"
    travel_types = ["overnight"] if requires_flight else ["day", "overnight"]

    destination = kto_item_to_destination(
        item,
        overview=overview,
        intro=intro,
        extra_images=extra_images,
        extra_info=extra_info,
        distance_km=distance_km,
        reason_badges=reason_badges,
    )

    coords = {"x": lng or 0.0, "y": lat or 0.0}
    return MockDestinationRecord(
        destination=destination,
        coords=coords,
        travel_types=travel_types,
        requires_flight=requires_flight,
    )
