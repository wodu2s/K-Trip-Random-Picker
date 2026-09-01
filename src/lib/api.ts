import type { Destination, HiddenPlace, ImageCredit } from "../types/travel";

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
  /** 카카오 로컬에는 사진이 없어, 앞쪽 몇 곳만 이미지 검색으로 채운다 (없으면 사진 생략) */
  image?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  imageCredit?: ImageCredit;
};

export type StayPlace = {
  contentId: string;
  name: string;
  tag: string;
  address: string;
  tel: string;
  lat: number | null;
  lng: number | null;
  distance: number | null;
  /** KTO 대표 이미지 — 없으면 빈 문자열 */
  image: string;
  url: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = BASE ? `${BASE}${path}` : path;
  const res = await fetch(url, {
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

/** 결과 페이지 — 목적지 주변 장소. 1박 이상일 때만 숙박까지 함께 받는다 */
export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  withStays = false,
  region = "",
): Promise<{
  spots: NearbyPlace[];
  foods: NearbyPlace[];
  cafes: NearbyPlace[];
  stays?: StayPlace[];
  hiddenPlaces: HiddenPlace[];
}> {
  const query = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (withStays) query.set("stay", "1");
  if (region) query.set("region", region);
  return request(`/api/places/nearby?${query}`);
}
