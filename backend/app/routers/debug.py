import os

from fastapi import APIRouter, HTTPException

from app.services.tourism_api import probe_kto_api

router = APIRouter(prefix="/api", tags=["debug"])


def _debug_enabled() -> bool:
    return os.getenv("ENABLE_DEBUG_ENDPOINTS", "true").strip().lower() != "false"


@router.get("/health")
def api_health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/debug/kto")
def debug_kto() -> dict[str, object]:
    if not _debug_enabled():
        raise HTTPException(status_code=404, detail="Not found")
    return probe_kto_api()

@router.get("/debug/cache-clear")
def debug_cache_clear() -> dict[str, str]:
    if not _debug_enabled():
        raise HTTPException(status_code=404, detail="Not found")
    from app.services.cache import get_kto_cache, get_route_cache
    get_kto_cache().clear()
    get_route_cache().clear()
    return {"status": "cleared"}

@router.get("/debug/kto-coverage")
def debug_kto_coverage(
    origin: str,
    theme: str,
    maxDistanceKm: float,
    duration: str = "day",
    transportMode: str = "local",
    originLat: float | None = None,
    originLng: float | None = None,
    originMode: str = "preset",
) -> dict[str, object]:
    if not _debug_enabled():
        raise HTTPException(status_code=404, detail="Not found")
    
    from app.services.kto_coverage import calculate_kto_coverage
    
    try:
        return calculate_kto_coverage(
            origin=origin,
            theme=theme,
            max_distance_km=maxDistanceKm,
            origin_lat=originLat,
            origin_lng=originLng,
            transport_mode=transportMode,
            origin_mode=originMode,
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "message": "Failed to calculate coverage"}
