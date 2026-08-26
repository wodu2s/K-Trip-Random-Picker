import type { TourApiItem } from "../types/tourApi";

const DEFAULT_TIMEOUT_MS = 15000;

function apiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw === "string" && raw.trim()) return raw.replace(/\/$/, "");
  return "";
}

export class TravelApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "TravelApiError";
    this.code = code;
  }
}

export type UserCoords = {
  latitude: number;
  longitude: number;
};

/**
 * K-Trip 백엔드에서 TourAPI 후보를 가져온다. 서비스키는 프론트에 두지 않는다.
 * 한 추천 세션에서 재사용하도록 recommend 계층에서 캐시한다.
 */
export async function fetchTourCandidates(coords?: UserCoords | null): Promise<TourApiItem[]> {
  const params = new URLSearchParams();
  if (coords && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude)) {
    params.set("latitude", String(coords.latitude));
    params.set("longitude", String(coords.longitude));
  }

  const qs = params.toString();
  const url = `${apiBase()}/api/tour/candidates${qs ? `?${qs}` : ""}`;

  const ac = new AbortController();
  const timer = window.setTimeout(() => ac.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: ac.signal,
    });

    let body: unknown;
    try {
      body = await res.json();
    } catch {
      throw new TravelApiError("malformed", "백엔드 응답이 JSON이 아닙니다.");
    }

    if (!body || typeof body !== "object") {
      throw new TravelApiError("malformed", "백엔드 응답 형식이 올바르지 않습니다.");
    }

    const data = body as { ok?: boolean; error?: string; message?: string; items?: unknown };

    if (!data.ok) {
      const code = data.error || (res.status === 401 ? "auth" : "network");
      throw new TravelApiError(code, data.message || "TourAPI 후보 조회에 실패했습니다.");
    }

    const items = data.items;
    if (!Array.isArray(items)) {
      throw new TravelApiError("malformed", "items 배열이 없습니다.");
    }

    const parsed: TourApiItem[] = [];
    for (const raw of items) {
      if (raw && typeof raw === "object") parsed.push(raw as TourApiItem);
    }
    if (parsed.length === 0) {
      throw new TravelApiError("empty", "TourAPI 관광지 목록이 비어 있습니다.");
    }
    return parsed;
  } catch (err) {
    if (err instanceof TravelApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new TravelApiError("timeout", "TourAPI 요청이 시간 초과되었습니다.");
    }
    throw new TravelApiError("network", "네트워크 오류로 관광지 목록을 가져오지 못했습니다.");
  } finally {
    window.clearTimeout(timer);
  }
}
