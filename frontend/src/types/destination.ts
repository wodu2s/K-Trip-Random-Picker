export type DataSource = 'KTO_OPEN_API' | 'MOCK_FALLBACK';

export interface Spot {
  name: string;
  description: string;
  image?: string;
}

export interface Accommodation {
  name: string;
  type: string;
  priceRange: string;
}

export interface KakaoPlace {
  placeName: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  distance?: string;
}

export interface DestinationDetail {
  mapQuery?: string;
  overview?: string;
  infoCenter?: string;
  restDate?: string;
  useTime?: string;
  parking?: string;
  useFee?: string;
  images?: string[];
  estimatedTravelTime?: string;
  canReturnToday?: boolean;
  recommendedStayTime?: string;
  nearbySpots?: Spot[];
  dayTripCourse?: string[];
  overnightCourse?: string[];
  accommodations?: Accommodation[];
  nearbyAttractions?: KakaoPlace[];
  nearbyRestaurants?: KakaoPlace[];
  nearbyCafes?: KakaoPlace[];
  nearbyStays?: KakaoPlace[];
  extraInfo?: Record<string, string>;
}

export interface TravelInfo {
  carDurationText?: string;
  transitDurationText?: string;
  distanceText?: string;
  routeMapUrl?: string;
  provider?: 'kakao' | 'tmap' | 'none';
}

export interface Destination {
  id: string;
  title: string;
  region: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  themes: string[];
  distanceKm?: number;
  summary: string;
  reasonBadges: string[];
  emojiHints: string[];
  dataSource: DataSource;
  travelInfo?: TravelInfo;
  detail?: DestinationDetail;
  overview?: string;
}

export interface RecommendationsResponse {
  items: Destination[];
}
