import { OriginLocation } from '../constants/origins';

export type Duration = 'day' | 'overnight';
export type TransportMode = 'local' | 'flightIncluded';
export type TravelTheme = '바다' | '자연' | '감성' | '맛집' | '문화' | '액티비티';

export interface TripPreference {
  originMode: 'preset' | 'current';
  origin: string;
  originLat?: number;
  originLng?: number;
  duration: Duration;
  maxDistanceKm: number;
  transportMode: TransportMode;
  themes: string[];
}

/** UI 폼 상태 — 테마는 단일 선택, API 호출 시 TripPreference로 변환 */
export interface TripFormState {
  originMode: 'preset' | 'current';
  origin: string;
  originCoords: OriginLocation;
  originLat?: number;
  originLng?: number;
  duration: Duration;
  maxDistanceKm: number;
  transportMode: TransportMode;
  theme: TravelTheme | 'all';
}
