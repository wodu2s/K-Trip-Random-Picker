import type { Destination, HiddenPlace } from "../types/travel";
import { registerDestinations, updateDestination } from "./registry";
import { toDestination, toHiddenPlace, type TourItem } from "./mappers";
import { fetchTravelTime } from "./kakao";

/** Vite dev 프록시 경유 (serviceKey는 프록시가 주입) */
const BASE = "/api/tour";

const COMMON_PARAMS = {
  MobileOS: "WEB",
  MobileApp: "PickAndGo",
  _type: "json",
} as const;

/** 전국 주요 지역코드 (TourAPI areaCode) */
const AREA_CODES = [1, 6, 4, 2, 3, 5, 7, 8, 31, 32, 33, 34, 35, 36, 37, 38, 39];

/** 여행지 성격의 콘텐츠 타입 (12 관광지 / 14 문화시설 / 28 레포츠) */
const CONTENT_TYPES = [12, 12, 12, 14, 28];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function callTour(operation: string, params: Record<string, string | number>): Promise<TourItem[]> {
  const qs = new URLSearchParams({
    ...COMMON_PARAMS,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });
  const res = await fetch(`${BASE}/${operation}?${qs.toString()}`);
  if (!res.ok) throw new Error(`TourAPI ${operation} ${res.status}`);
  const json = await res.json();
  const header = json?.response?.header;
  if (header && header.resultCode !== "0000") {
    throw new Error(`TourAPI ${operation} ${header.resultCode} ${header.resultMsg}`);
  }
  const items = json?.response?.body?.items;
  if (!items || items === "") return [];
  const item = items.item;
  return Array.isArray(item) ? item : item ? [item] : [];
}

/**
 * 전국 랜덤 여행지 풀을 한 배치 가져와 런타임 저장소에 등록한다.
 * 실패하면 조용히 빈 배열 반환 → 앱은 mock 데이터로 폴백.
 */
export async function fetchDestinationPool(rows = 30): Promise<Destination[]> {
  try {
    const items = await callTour("areaBasedList2", {
      arrange: "R", // 대표이미지 우선 + 랜덤 느낌
      contentTypeId: pick(CONTENT_TYPES),
      areaCode: pick(AREA_CODES),
      numOfRows: rows,
      pageNo: 1 + Math.floor(Math.random() * 5),
    });
    const dests = items
      .filter((it) => it.title && it.firstimage) // 이미지 있는 곳만 카드로
      .map(toDestination);
    registerDestinations(dests);
    return dests;
  } catch (err) {
    console.warn("[tour] fetchDestinationPool 실패, mock 폴백:", err);
    return [];
  }
}

/** 여러 지역을 동시에 받아 풀 다양성 확보 */
export async function prefetchPool(batches = 2): Promise<void> {
  await Promise.all(Array.from({ length: batches }, () => fetchDestinationPool()));
}

/** detailCommon2 개요 + locationBasedList2 주변 명소로 여행지 상세 보강 */
export async function fetchDestinationDetail(
  dest: Destination,
): Promise<{ story?: string; shortDescription?: string; hiddenPlaces?: HiddenPlace[]; travelTimeText?: string }> {
  const patch: {
    story?: string;
    shortDescription?: string;
    hiddenPlaces?: HiddenPlace[];
    travelTimeText?: string;
  } = {};

  if (dest.contentId) {
    try {
      const [common] = await callTour("detailCommon2", {
        contentId: dest.contentId,
      });
      const overview = (common as TourItem & { overview?: string })?.overview;
      if (overview) {
        const clean = overview.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        if (clean) {
          patch.story = clean;
          patch.shortDescription = clean.length > 60 ? clean.slice(0, 60) + "…" : clean;
        }
      }
    } catch (err) {
      console.warn("[tour] detailCommon2 실패:", err);
    }
  }

  if (dest.mapx && dest.mapy) {
    try {
      const nearby = await callTour("locationBasedList2", {
        mapX: dest.mapx,
        mapY: dest.mapy,
        radius: 10000,
        arrange: "E", // 거리순
        numOfRows: 8,
        pageNo: 1,
      });
      const places = nearby
        .filter((it) => it.title && it.contentid !== dest.contentId)
        .slice(0, 5)
        .map(toHiddenPlace);
      if (places.length) patch.hiddenPlaces = places;
    } catch (err) {
      console.warn("[tour] locationBasedList2 실패:", err);
    }

    // Kakao 길찾기로 실제 소요시간 (실패 시 mock 유지)
    const time = await fetchTravelTime(dest.mapx, dest.mapy);
    if (time) patch.travelTimeText = time;
  }

  if (Object.keys(patch).length) updateDestination(dest.id, patch);
  return patch;
}
