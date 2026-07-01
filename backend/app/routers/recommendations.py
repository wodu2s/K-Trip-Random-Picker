from fastapi import APIRouter, Query

from app.schemas.trip import RecommendationsResponseSchema
from app.services.recommendation import get_recommendations

router = APIRouter(prefix="/api", tags=["recommendations"])


@router.get("/recommendations", response_model=RecommendationsResponseSchema)
def recommendations(
    origin: str = Query(default="서울", description="출발지"),
    originLat: float = Query(default=None, description="현재 위치 위도"),
    originLng: float = Query(default=None, description="현재 위치 경도"),
    originMode: str = Query(default="preset", description="preset | current"),
    duration: str = Query(default="day", description="day | overnight"),
    maxDistanceKm: float = Query(default=150, ge=30, le=500),
    transportMode: str = Query(default="local", description="local | flightIncluded"),
    theme: str | None = Query(default=None, description="단일 테마"),
    themes: list[str] | None = Query(default=None, description="다중 테마 리스트"),
) -> RecommendationsResponseSchema:
    from app.services.kakao_local_api import coord2address
    from app.services.filters import normalize_theme, get_candidate_reject_reason
    import logging
    logger = logging.getLogger(__name__)

    # Normalize theme/themes
    selected_themes = []
    if theme:
        selected_themes.extend([t.strip() for t in theme.split(",") if t.strip()])
    if themes:
        for t in themes:
            selected_themes.extend([x.strip() for x in t.split(",") if x.strip()])
            
    selected_themes = list(dict.fromkeys(selected_themes)) # unique
    if not selected_themes:
        selected_themes = ["전체"]

    logger.info(
        "Recommendation Request: origin=%s, originMode=%s, duration=%s, maxDistanceKm=%s, transportMode=%s, raw theme=%s, raw themes=%s, normalized selectedThemes=%s",
        origin, originMode, duration, maxDistanceKm, transportMode, theme, themes, selected_themes
    )

    items, debug_logs = get_recommendations(
        origin=origin,
        origin_lat=originLat,
        origin_lng=originLng,
        origin_mode=originMode,
        duration=duration,
        max_distance_km=maxDistanceKm,
        transport_mode=transportMode,
        themes=selected_themes,
    )
    
    # Final guard: ensure no incorrectly filtered destinations are returned
    primary_theme = normalize_theme(selected_themes[0] if selected_themes else "전체")
    if primary_theme != "전체":
        items = [
            item for item in items
            if get_candidate_reject_reason(item, primary_theme, maxDistanceKm) is None
        ]

    resolved_origin = None
    if originMode == "current" and originLat is not None and originLng is not None:
        resolved_origin = coord2address(originLng, originLat)

    return RecommendationsResponseSchema(items=items, resolvedOrigin=resolved_origin, debugLogs=debug_logs)
