"""간단한 in-memory TTL 캐시."""

from __future__ import annotations

import logging
import time
from typing import Any, Optional

logger = logging.getLogger(__name__)


class MemoryCache:
    def __init__(self) -> None:
        self._store: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        try:
            entry = self._store.get(key)
            if entry is None:
                return None
            expires_at, value = entry
            if time.time() > expires_at:
                del self._store[key]
                return None
            return value
        except Exception as exc:
            logger.warning("Cache get failed (%s): %s", key, exc)
            return None

    def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        try:
            self._store[key] = (time.time() + ttl_seconds, value)
        except Exception as exc:
            logger.warning("Cache set failed (%s): %s", key, exc)

    def clear(self) -> None:
        self._store.clear()


_kto_cache = MemoryCache()
_route_cache = MemoryCache()


def get_kto_cache() -> MemoryCache:
    return _kto_cache


def get_route_cache() -> MemoryCache:
    return _route_cache


def build_recommendation_cache_key(
    origin: str,
    duration: str,
    max_distance_km: float,
    transport_mode: str,
    themes: list[str],
    *,
    origin_lat: float | None = None,
    origin_lng: float | None = None,
    origin_mode: str = "preset",
) -> str:
    """Build a cache key that separates preset-city vs current-location requests.

    When origin_mode == "current", lat/lng are rounded to 3 decimal places
    (~111 m precision) so that nearby coordinates share a cache slot.
    """
    theme_key = ",".join(sorted(themes)) if themes else "_all_"

    if origin_mode == "current" and origin_lat is not None and origin_lng is not None:
        lat_r = round(origin_lat, 3)
        lng_r = round(origin_lng, 3)
        return f"kto:current:{lat_r}:{lng_r}:{duration}:{int(max_distance_km)}:{transport_mode}:{theme_key}"

    return f"kto:{origin}:{duration}:{int(max_distance_km)}:{transport_mode}:{theme_key}"


def build_route_cache_key(
    origin_lat: float,
    origin_lng: float,
    dest_lat: float,
    dest_lng: float,
) -> str:
    """Build a cache key for Kakao directions info."""
    return f"route:{round(origin_lat, 3)}:{round(origin_lng, 3)}:{round(dest_lat, 3)}:{round(dest_lng, 3)}"
