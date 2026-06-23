/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Spot {
  name: string;
  description: string;
  image?: string;
}

export interface Review {
  id: string;
  nickname: string;
  rating: number;
  content: string;
  date: string;
  destinationId: string;
}

export type TravelTime = 'day' | 'overnight';
export type TravelTheme = '바다' | '자연' | '감성' | '맛집' | '문화' | '액티비티';

export interface Destination {
  id: string;
  name: string;
  region: string;
  keyword: string;
  emojiHint: string[];
  themes: TravelTheme[];
  description: string;
  travelType: TravelTime[];
  estimatedTravelTime: string;
  lastTransportTime?: string;
  canReturnToday: boolean;
  recommendedStayTime?: string;
  nearbySpots: Spot[];
  dayTripCourse?: string[];
  overnightCourse?: string[];
  accommodations?: { name: string; type: string; priceRange: string }[];
  mapQuery: string;
  image: string;
  distanceKm: number; // Distance from a central point (e.g. Seoul) or calculated from prefs
  coords: { x: number; y: number }; // Simplified percentage coordinates (0-100) for SVG map
}

export interface TravelPreferences {
  currentLocation: { name: string; x: number; y: number };
  travelTime: TravelTime;
  maxDistance: number;
  theme: TravelTheme | 'all';
}

export type AppState = 'landing' | 'picking' | 'result';
