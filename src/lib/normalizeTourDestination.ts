import type { TourApiItem } from "../types/tourApi";
import type { Destination, DestinationCandidate, SceneVariant, ThemeKey } from "../types/travel";
import { THEME_META } from "../data/destinations";
import { formatStraightLineKm, haversineKm } from "../utils/distance";
import { mapTourThemes } from "../utils/tourThemeMapper";

function parseCoord(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function sceneFromThemes(themes: ThemeKey[]): SceneVariant {
  if (themes.includes("sea")) return "sea";
  if (themes.includes("nature")) return "mountain";
  return "town";
}

/**
 * TourAPI 원본 → 추천용 Candidate.
 * title/contentid 없는 항목은 버린다.
 */
export function normalizeTourDestination(
  item: TourApiItem,
  userCoords?: { latitude: number; longitude: number } | null,
): DestinationCandidate | null {
  const contentId = (item.contentid ?? "").trim();
  const name = (item.title ?? "").trim();
  if (!contentId || !name) return null;

  const latitude = parseCoord(item.mapy);
  const longitude = parseCoord(item.mapx);
  let distanceKm: number | undefined;
  if (userCoords && latitude != null && longitude != null) {
    distanceKm = haversineKm(userCoords.latitude, userCoords.longitude, latitude, longitude);
  }

  const address = [item.addr1, item.addr2]
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .join(" ");

  const image = (item.firstimage || item.firstimage2 || "").trim() || undefined;

  return {
    id: contentId,
    contentId,
    contentTypeId: (item.contenttypeid ?? "").trim() || undefined,
    name,
    address: address || undefined,
    latitude,
    longitude,
    image,
    themes: mapTourThemes(item),
    distanceKm,
  };
}

/** Candidate → 기존 카드/결과 UI가 기대하는 Destination. 상세 API 필드는 채우지 않는다. */
export function candidateToDestination(candidate: DestinationCandidate): Destination {
  const region = candidate.address ?? "위치 정보 없음";
  return {
    id: candidate.contentId,
    name: candidate.name,
    region,
    image: candidate.image ?? "",
    themes: candidate.themes.length ? candidate.themes : ["etc"],
    tags: candidate.themes.slice(0, 3).map((t) => THEME_META[t].label),
    shortDescription: region,
    tagline: "오늘의 탐험지",
    story: "상세 소개·코스·주변 정보는 다음 단계에서 제공됩니다.",
    travelTimeText: formatStraightLineKm(candidate.distanceKm),
    isHiddenGem: false,
    hiddenPlaces: [],
    schedule: [],
    scene: sceneFromThemes(candidate.themes),
    source: "tourapi",
  };
}
