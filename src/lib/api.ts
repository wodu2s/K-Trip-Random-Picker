import type { Destination, HiddenPlace } from "../types/travel";

const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export type RecommendPayload = {
  duration: string | null;
  themes: string[];
  companion: string | null;
  mood: string | null;
  discovery: string | null;
};

export type NearbyPlace = {
  name: string;
  tag: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  distance: number | null;
  url: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) throw new Error("VITE_API_BASE_URL 미설정");
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return (await res.json()) as T;
}

/** 조건 설정값 → 실제 여행지 후보 5개 (실패 시 throw, 호출부에서 mock fallback) */
export async function fetchRecommendations(payload: RecommendPayload): Promise<Destination[]> {
  const data = await request<{ destinations: Destination[] }>("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!Array.isArray(data.destinations) || data.destinations.length === 0) {
    throw new Error("추천 결과가 비어 있습니다.");
  }
  return data.destinations;
}

/** 결과 페이지 — 목적지 주변 장소 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
): Promise<{ spots: NearbyPlace[]; foods: NearbyPlace[]; cafes: NearbyPlace[]; hiddenPlaces: HiddenPlace[] }> {
  return request(`/api/places/nearby?lat=${lat}&lng=${lng}`);
}
