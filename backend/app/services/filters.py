import re
from typing import Any, Optional

from app.schemas.trip import DestinationSchema


# =========================
# Theme normalization
# =========================

def normalize_theme(theme: str | None) -> str:
    if not theme:
        return "전체"

    theme = str(theme).strip()

    mapping = {
        "all": "전체",
        "전체": "전체",

        "sea": "바다",
        "ocean": "바다",
        "beach": "바다",
        "바다": "바다",

        "nature": "자연",
        "natural": "자연",
        "자연": "자연",

        "culture": "문화",
        "history": "문화",
        "문화": "문화",

        "food": "맛집",
        "restaurant": "맛집",
        "맛집": "맛집",

        "vibe": "감성",
        "vibes": "감성",
        "emotional": "감성",
        "감성": "감성",

        "activity": "액티비티",
        "activities": "액티비티",
        "액티비티": "액티비티",
    }

    return mapping.get(theme, theme)


# =========================
# Region-only filtering
# =========================

BANNED_REGIONS = {
    "서울", "서울시", "서울특별시",
    "부산", "부산시", "부산광역시",
    "인천", "인천시", "인천광역시",
    "대구", "대구시", "대구광역시",
    "광주", "광주시", "광주광역시",
    "대전", "대전시", "대전광역시",
    "울산", "울산시", "울산광역시",
    "세종", "세종시", "세종특별자치시",
    "제주", "제주시", "제주도", "제주특별자치도",
    "서귀포", "서귀포시",

    "춘천", "춘천시",
    "강릉", "강릉시",
    "속초", "속초시",
    "동해", "동해시",
    "삼척", "삼척시",
    "양양", "양양군",

    "여수", "여수시",
    "통영", "통영시",
    "거제", "거제시",
    "목포", "목포시",
    "순천", "순천시",

    "경주", "경주시",
    "전주", "전주시",
    "수원", "수원시",
    "성남", "성남시",
    "고양", "고양시",
    "용인", "용인시",
    "청주", "청주시",
    "천안", "천안시",
    "포항", "포항시",
    "창원", "창원시",
    "진주", "진주시",
    "안동", "안동시",
    "구미", "구미시",
    "김해", "김해시",
    "남원", "남원시",
}


ADMIN_SUFFIXES = (
    "특별자치도",
    "특별자치시",
    "특별시",
    "광역시",
    "자치구",
    "시",
    "군",
    "구",
)


def normalize_region_name(value: str | None) -> str:
    if not value:
        return ""

    value = str(value).strip()
    value = re.sub(r"\s+", "", value)

    for suffix in ADMIN_SUFFIXES:
        if value.endswith(suffix):
            value = value[: -len(suffix)]
            break

    return value


def is_region_name_only(title: str | None, addr: str = "") -> bool:
    if not title:
        return True

    clean_title = str(title).strip()
    compact_title = re.sub(r"\s+", "", clean_title)
    normalized_title = normalize_region_name(compact_title)

    if compact_title in BANNED_REGIONS:
        return True

    if normalized_title in BANNED_REGIONS:
        return True

    addr_parts = [p.strip() for p in str(addr or "").split() if p.strip()]

    if addr_parts:
        first = addr_parts[0]
        if compact_title == first or normalized_title == normalize_region_name(first):
            return True

    if len(addr_parts) >= 2:
        second = addr_parts[1]
        if compact_title == second or normalized_title == normalize_region_name(second):
            return True

    # 주의:
    # 단순히 title이 "도"로 끝난다고 지역명 처리하면
    # 대부도, 선재도, 우도 같은 섬 관광지가 잘못 제거됨.
    # 따라서 "도" suffix만으로는 제거하지 않음.

    return False


# =========================
# Safe field access
# =========================

def get_field(obj: Any, *names: str, default: Any = "") -> Any:
    for name in names:
        if isinstance(obj, dict):
            value = obj.get(name)
        else:
            value = getattr(obj, name, None)

        if value is not None and value != "":
            return value

    return default


def to_float(value: Any) -> Optional[float]:
    if value is None or value == "":
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def get_candidate_id(destination: Any) -> str:
    value = get_field(
        destination,
        "contentId",
        "contentid",
        "content_id",
        "id",
        default="",
    )
    return str(value or "").strip()


def get_content_type_id(destination: Any) -> str:
    value = get_field(
        destination,
        "contentTypeId",
        "contenttypeid",
        "content_type_id",
        default="",
    )
    return str(value or "").strip()


def get_latitude(destination: Any) -> Optional[float]:
    return to_float(get_field(destination, "latitude", "lat", "mapy", default=None))


def get_longitude(destination: Any) -> Optional[float]:
    return to_float(get_field(destination, "longitude", "lng", "lon", "mapx", default=None))


def get_distance_km(destination: Any) -> Optional[float]:
    distance = get_field(destination, "distanceKm", "distance_km", default=None)

    if distance is None:
        distance = get_field(
            destination,
            "estimatedDistanceKm",
            "estimated_distance_km",
            default=None,
        )

    return to_float(distance)


def build_filter_text(destination: Any) -> str:
    parts = [
        get_field(destination, "title", default=""),
        get_field(destination, "address", "addr1", default=""),
        get_field(destination, "overview", default=""),
        get_field(destination, "category", default=""),
        get_field(destination, "cat1", default=""),
        get_field(destination, "cat2", default=""),
        get_field(destination, "cat3", default=""),
        get_field(destination, "areaName", "area_name", default=""),
        get_field(destination, "sigunguName", "sigungu_name", default=""),
    ]

    text = " ".join(str(p) for p in parts if p)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text.lower().strip()


# =========================
# Theme keywords
# =========================

THEME_REQUIRED_KEYWORDS = {
    "바다": [
        "바다", "해변", "해수욕장", "항구", "포구", "등대", "섬", "해안",
        "갯벌", "방파제", "선착장", "해수", "해양", "바닷가", "오션",
        "해변공원", "해안도로", "어촌", "요트", "마리나",
        "정동진", "경포", "안목", "주문진", "월미도", "을왕리", "대부도",
        "제부도", "오이도", "왕산", "무의도", "선재도", "영종도",
    ],
    "자연": [
        "자연", "숲", "산", "공원", "호수", "계곡", "수목원", "국립공원",
        "정원", "생태", "휴양림", "오름", "폭포", "동굴", "둘레길",
        "습지", "갈대", "강변", "하천", "전망대",
    ],
    "문화": [
        "역사", "문화재", "박물관", "미술관", "전시", "궁", "성", "향교",
        "사찰", "유적", "기념관", "고택", "터", "정자", "묘", "서원",
        "왕릉", "문화", "전시관", "기념", "유물", "한옥",
    ],
    "맛집": [
        "맛집", "음식", "시장", "카페", "먹거리", "식당", "골목",
        "베이커리", "빵집", "야시장", "푸드", "전통시장", "수산시장",
        "횟집", "분식", "국밥", "냉면", "갈비",
    ],
    "감성": [
        "거리", "골목", "마을", "카페", "사진", "풍경", "야경", "스튜디오",
        "분위기", "핫플", "카페거리", "공방", "벽화", "전망", "산책",
        "데이트", "광장", "거리문화",
    ],
    "액티비티": [
        "체험", "테마파크", "아쿠아리움", "수족관", "레저", "전시체험",
        "놀이공원", "캠핑", "스포츠", "짚라인", "루지", "서핑",
        "수상스키", "카트", "승마", "낚시", "요트", "래프팅", "클라이밍",
    ],
}


# 강한 제외어: 해당 테마에서 거의 무조건 제외
THEME_STRONG_EXCLUDE_PATTERNS = {
    "바다": [
        r"의거지",
        r"문화재",
        r"유적",
        r"향교",
        r"사찰",
        r"박물관",
        r"미술관",
        r"전시관",
        r"기념관",
        r"고택",
        r"사당",
        r"정자",
        r"왕릉",
        r"묘역",
        r"묘\b",
        r"궁\b",
        r"성곽",
        r"성지",
        r"도심",
        r"카페거리",
        r"골목",
        r"한강",
        r"강변",
        r"뚝섬",
        r"노들섬",
        r"여의도",
        r"수영장",
        r"워터파크",
        # "터"는 해안쉼터 같은 오탐이 있어 단순 포함 금지
        # 단독 단어 또는 역사 맥락에서만 제외
        r"(?<!쉼)터\b",
    ],
    "자연": [
        r"카페거리",
        r"의거지",
        r"문화재",
        r"유적",
        r"향교",
        r"사찰",
        r"박물관",
        r"미술관",
        r"기념관",
        r"도심",
    ],
}


# 조건부 제외어:
# contentTypeId가 음식점/숙박/쇼핑이면 메인 관광지로 제외
CONDITIONAL_NON_MAIN_CONTENT_TYPES = {"32", "38", "39"}


# =========================
# Content type filtering
# =========================

CONTENT_TYPE_LABELS = {
    "12": "관광지",
    "14": "문화시설",
    "15": "축제/공연/행사",
    "25": "여행코스",
    "28": "레포츠",
    "32": "숙박",
    "38": "쇼핑",
    "39": "음식점",
}

MAIN_TRAVEL_CONTENT_TYPES = {"12", "14", "15", "25", "28"}

# 전체 테마에서는 맛집/시장도 나올 수 있게 38, 39 허용.
# 숙박 32는 메인 추천지로는 제외.
ALL_THEME_CONTENT_TYPES = {"12", "14", "15", "25", "28", "38", "39"}

FOOD_THEME_CONTENT_TYPES = {"12", "14", "15", "25", "28", "38", "39"}


def is_allowed_main_content_type(destination: Any, theme: str) -> bool:
    theme = normalize_theme(theme)
    content_type_id = get_content_type_id(destination)

    # contentTypeId가 비어 있으면 KTO raw 변환 전 객체일 수 있으므로 일단 통과
    if not content_type_id:
        return True

    if theme == "전체":
        return content_type_id in ALL_THEME_CONTENT_TYPES

    if theme == "맛집":
        return content_type_id in FOOD_THEME_CONTENT_TYPES

    return content_type_id in MAIN_TRAVEL_CONTENT_TYPES


# =========================
# Theme matching
# =========================

def get_matched_theme_keywords(destination: Any, theme: str) -> list[str]:
    theme = normalize_theme(theme)
    if theme == "전체":
        return []

    text = build_filter_text(destination)
    required = THEME_REQUIRED_KEYWORDS.get(theme, [])

    return [keyword for keyword in required if keyword.lower() in text]


def has_required_theme_keyword(text: str, theme: str) -> bool:
    theme = normalize_theme(theme)

    if theme == "전체":
        return True

    required = THEME_REQUIRED_KEYWORDS.get(theme)
    if not required:
        return True

    text = str(text or "").lower()

    return any(keyword.lower() in text for keyword in required)


def has_strong_excluded_theme_keyword(text: str, theme: str) -> bool:
    theme = normalize_theme(theme)
    patterns = THEME_STRONG_EXCLUDE_PATTERNS.get(theme, [])

    if not patterns:
        return False

    text = str(text or "").lower()

    return any(re.search(pattern, text) for pattern in patterns)


def has_excluded_theme_keyword(text: str, theme: str, content_type_id: str = "") -> bool:
    theme = normalize_theme(theme)

    if has_strong_excluded_theme_keyword(text, theme):
        return True

    # 바다/자연/문화/감성/액티비티에서 숙박/음식점/쇼핑은 메인 추천지로 부적절
    if theme not in {"전체", "맛집"} and content_type_id in CONDITIONAL_NON_MAIN_CONTENT_TYPES:
        return True

    # 바다 테마에서 음식점/숙소성 단어는 contentTypeId가 없을 때 보조적으로 한 번 더 방어
    if theme == "바다" and not content_type_id:
        conditional_words = [
            "호텔", "모텔", "펜션", "리조트",
            "식당", "음식점", "횟집", "베이커리", "카페",
        ]
        if any(word in text for word in conditional_words):
            return True

    return False


def get_theme_reject_reason(destination: DestinationSchema | Any, theme: str) -> Optional[str]:
    theme = normalize_theme(theme)

    if theme == "전체":
        return None

    title = get_field(destination, "title", default="")
    address = get_field(destination, "address", "addr1", default="")
    text = build_filter_text(destination)
    content_type_id = get_content_type_id(destination)

    if is_region_name_only(title, address):
        return "region_name_only"

    if not is_allowed_main_content_type(destination, theme):
        label = CONTENT_TYPE_LABELS.get(content_type_id, "unknown")
        return f"invalid_content_type:{content_type_id}:{label}"

    if not has_required_theme_keyword(text, theme):
        return f"{theme}_keyword_missing"

    if has_excluded_theme_keyword(text, theme, content_type_id):
        return "excluded_keyword_found"

    return None


def is_valid_for_theme(destination: DestinationSchema | Any, theme: str) -> bool:
    return get_theme_reject_reason(destination, theme) is None


# =========================
# Candidate-level filtering
# =========================

def get_candidate_reject_reason(
    destination: DestinationSchema | Any,
    theme: str,
    max_distance_km: float | None = None,
) -> Optional[str]:
    candidate_id = get_candidate_id(destination)
    title = get_field(destination, "title", default="")
    address = get_field(destination, "address", "addr1", default="")

    if not candidate_id:
        return "missing_content_id"

    if not title:
        return "missing_title"

    lat = get_latitude(destination)
    lng = get_longitude(destination)

    if lat is None or lng is None:
        return "no_coordinates"

    if is_region_name_only(title, address):
        return "region_name_only"

    theme_reason = get_theme_reject_reason(destination, theme)
    if theme_reason:
        return theme_reason

    distance = get_distance_km(destination)
    if (
        max_distance_km is not None
        and distance is not None
        and distance > float(max_distance_km)
    ):
        return "distance_over_limit"

    return None


def filter_candidates_for_recommendation(
    candidates: list[DestinationSchema],
    theme: str,
    max_distance_km: float | None,
) -> list[DestinationSchema]:
    theme = normalize_theme(theme)

    filtered: list[DestinationSchema] = []
    seen: set[str] = set()

    for destination in candidates:
        unique_key = get_candidate_id(destination)

        if not unique_key:
            unique_key = f"{get_field(destination, 'title', default='')}|{get_field(destination, 'address', 'addr1', default='')}"

        if unique_key in seen:
            continue

        reject_reason = get_candidate_reject_reason(
            destination=destination,
            theme=theme,
            max_distance_km=max_distance_km,
        )

        if reject_reason is not None:
            continue

        seen.add(unique_key)
        filtered.append(destination)

    return filtered


# =========================
# Debug helper
# =========================

def explain_candidate_filter(
    destination: DestinationSchema | Any,
    theme: str,
    max_distance_km: float | None = None,
) -> dict[str, Any]:
    theme = normalize_theme(theme)
    reject_reason = get_candidate_reject_reason(destination, theme, max_distance_km)

    distance = get_distance_km(destination)
    content_type_id = get_content_type_id(destination)

    return {
        "title": get_field(destination, "title", default=""),
        "contentId": get_candidate_id(destination),
        "contentTypeId": content_type_id,
        "contentTypeLabel": CONTENT_TYPE_LABELS.get(content_type_id, "unknown"),
        "addr1": get_field(destination, "address", "addr1", default=""),
        "distanceKm": distance,
        "matchedKeywords": get_matched_theme_keywords(destination, theme),
        "filterResult": "passed" if reject_reason is None else "rejected",
        "rejectReason": reject_reason,
        "whyPassed": "all_filters_passed" if reject_reason is None else None,
    }
