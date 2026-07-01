from typing import Literal, Optional, Any

from pydantic import BaseModel, Field


class SpotSchema(BaseModel):
    name: str
    description: str
    image: Optional[str] = None


class KakaoPlaceSchema(BaseModel):
    placeName: str
    mapUrl: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    distance: Optional[str] = None


class TravelInfoSchema(BaseModel):
    carDurationText: Optional[str] = None
    transitDurationText: Optional[str] = None
    distanceText: Optional[str] = None
    routeMapUrl: Optional[str] = None
    provider: Literal["kakao", "tmap", "none"]

class AccommodationSchema(BaseModel):
    name: str
    type: str
    priceRange: str


class DestinationDetailSchema(BaseModel):
    mapQuery: Optional[str] = None
    overview: Optional[str] = None
    infoCenter: Optional[str] = None
    restDate: Optional[str] = None
    useTime: Optional[str] = None
    parking: Optional[str] = None
    useFee: Optional[str] = None
    images: Optional[list[str]] = None
    estimatedTravelTime: Optional[str] = None
    canReturnToday: Optional[bool] = None
    recommendedStayTime: Optional[str] = None
    nearbySpots: Optional[list[SpotSchema]] = None
    dayTripCourse: Optional[list[str]] = None
    overnightCourse: Optional[list[str]] = None
    accommodations: Optional[list[AccommodationSchema]] = None
    nearbyAttractions: Optional[list[KakaoPlaceSchema]] = None
    nearbyRestaurants: Optional[list[KakaoPlaceSchema]] = None
    nearbyCafes: Optional[list[KakaoPlaceSchema]] = None
    nearbyStays: Optional[list[KakaoPlaceSchema]] = None
    extraInfo: Optional[dict[str, str]] = None


class DestinationSchema(BaseModel):
    id: str
    title: str
    region: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    imageUrl: Optional[str] = None
    themes: list[str]
    distanceKm: Optional[float] = None
    summary: str
    reasonBadges: list[str]
    emojiHints: list[str]
    dataSource: Literal["KTO_OPEN_API", "MOCK_FALLBACK"]
    travelInfo: Optional[TravelInfoSchema] = None
    detail: Optional[DestinationDetailSchema] = None
    # KTO raw metadata — preserved for stricter theme filtering
    contentId: Optional[str] = None
    contentTypeId: Optional[str] = None
    cat1: Optional[str] = None
    cat2: Optional[str] = None
    cat3: Optional[str] = None
    overview: Optional[str] = None


class RecommendationsResponseSchema(BaseModel):
    items: list[DestinationSchema]
    resolvedOrigin: Optional[str] = None
    debugLogs: Optional[list[Any]] = None


class MockDestinationRecord(BaseModel):
    """내부 추천 로직용 — API 응답 전 필터에 사용"""

    destination: DestinationSchema
    coords: dict[str, float]
    travel_types: list[str] = Field(default_factory=list)
    requires_flight: bool = False
