import { ktoFirstImageByTitle, titlesMatch } from "./kto.js";

const TIMEOUT_MS = 5000;

/** 카카오 로컬 카테고리 → 프런트 태그 */
const CATEGORY_TAG = {
  AT4: "전망", // 관광명소
  CE7: "카페",
  FD6: "로컬", // 음식점
  CT1: "골목", // 문화시설
};

/** 카카오 로컬 카테고리 검색 — REST 키는 서버에서만 사용한다 */
async function searchCategory(code, lat, lng, radius = 5000, size = 5) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) throw new Error("KAKAO_REST_API_KEY 미설정");

  const query = new URLSearchParams({
    category_group_code: code,
    x: String(lng),
    y: String(lat),
    radius: String(radius),
    size: String(size),
    sort: "distance",
  });

  const res = await fetch(`https://dapi.kakao.com/v2/local/search/category.json?${query}`, {
    headers: { Authorization: `KakaoAK ${key}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Kakao local HTTP ${res.status}`);

  const json = await res.json();
  return (json.documents ?? []).map((d) => ({
    name: d.place_name,
    tag: CATEGORY_TAG[code] ?? "로컬",
    category: d.category_group_code,
    address: d.road_address_name || d.address_name,
    lat: Number(d.y),
    lng: Number(d.x),
    distance: Number(d.distance) || null,
    url: d.place_url,
  }));
}

/** 목적지 주변 장소 (관광명소·음식점·카페) */
export async function nearbyPlaces(lat, lng) {
  const results = await Promise.allSettled([
    searchCategory("AT4", lat, lng),
    searchCategory("FD6", lat, lng),
    searchCategory("CE7", lat, lng),
  ]);
  const [spots, foods, cafes] = results.map((r) => (r.status === "fulfilled" ? r.value : []));
  if (!spots.length && !foods.length && !cafes.length) throw new Error("Kakao 주변 장소 없음");
  return { spots, foods, cafes };
}

/** 주변 장소로 하루 코스(오전·점심·오후·저녁) 구성 */
export function buildSchedule({ spots, foods, cafes }, destinationName) {
  const schedule = [];
  if (spots[0]) {
    schedule.push({
      period: "오전",
      title: spots[0].name,
      description: `${destinationName} 도착 후 가장 가까운 명소부터 둘러보세요.`,
    });
  }
  if (foods[0]) {
    schedule.push({
      period: "점심",
      title: foods[0].name,
      description: "근처에서 평이 좋은 식당에서 점심을 해결해요.",
    });
  }
  if (cafes[0] || spots[1]) {
    const place = cafes[0] ?? spots[1];
    schedule.push({
      period: "오후",
      title: place.name,
      description: "느긋하게 쉬어가며 오후를 보내기 좋은 곳이에요.",
    });
  }
  if (spots[2] || foods[1]) {
    const place = spots[2] ?? foods[1];
    schedule.push({
      period: "저녁",
      title: place.name,
      description: "해질 무렵 마지막 일정으로 들러보세요.",
    });
  }
  return schedule;
}

/** 숨겨진 장소 메모용 목록 */
export function toHiddenPlaces({ spots, foods, cafes }) {
  return [...spots.slice(0, 2), ...cafes.slice(0, 2), ...foods.slice(0, 1)].map((p) => ({
    name: p.name,
    tag: p.tag,
  }));
}

/**
 * 다음 이미지 검색 — KTO 이미지가 없을 때만 쓰는 보조 수단.
 * REST 키는 서버에서만 사용하고, 결과가 없으면 null(프런트에서 이미지 영역 생략).
 */
/** 썸네일로 쓰기에 너무 작거나 극단적인 비율인 사진은 버린다 */
function usableImage(doc) {
  const w = Number(doc.width) || 0;
  const h = Number(doc.height) || 0;
  if (!doc.thumbnail_url || w < 400 || h < 260) return false;
  const ratio = w / h;
  return ratio >= 0.75 && ratio <= 2.0;
}

/**
 * 다음 이미지 검색 — KTO 이미지가 없을 때만 쓰는 보조 수단.
 * REST 키는 서버에서만 사용하고, 쓸 만한 결과가 없으면 null(프런트에서 이미지 영역 생략).
 */
export async function searchImage(query) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key || !query.trim()) return null;

  const params = new URLSearchParams({ query: query.trim(), size: "10", sort: "accuracy" });

  try {
    const res = await fetch(`https://dapi.kakao.com/v2/search/image?${params}`, {
      headers: { Authorization: `KakaoAK ${key}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const docs = (await res.json()).documents ?? [];
    const doc = docs.slice(0, 3).find(usableImage);
    if (!doc) return null;

    return {
      thumbnail: doc.thumbnail_url,
      // 원본이 막혀 있을 때를 대비해 썸네일도 같이 넘긴다
      image: doc.image_url || doc.thumbnail_url,
      credit: { sitename: doc.display_sitename ?? "", docUrl: doc.doc_url ?? "" },
    };
  } catch {
    return null;
  }
}

/** 검색어용 지역 — 시·군·구만 써서 고유명사와 붙인다 */
export function regionWord(region = "") {
  const parts = region.trim().split(/\s+/).filter(Boolean);
  const city = [...parts].reverse().find((p) => /(시|군|구)$/.test(p));
  return city || parts.slice(0, 2).join(" ");
}

/**
 * 썸네일: KTO 근처 firstimage → searchKeyword2 제목 일치 → Daum(지역+상호+유형).
 * 쓸 만한 사진이 없으면 필드를 비워 프런트에서 텍스트만 보여 준다.
 */
export async function attachThumbnails(places, region, count, keyword = "", ktoPool = []) {
  const targets = places.slice(0, count);
  const area = regionWord(region);
  await Promise.all(
    targets.map(async (place) => {
      const fromPool = ktoPool.find((k) => titlesMatch(k.name, place.name))?.image;
      if (fromPool) {
        place.image = fromPool;
        return;
      }
      const query = [area, place.name, keyword].filter(Boolean).join(" ");
      const [fromKto, hit] = await Promise.all([
        ktoFirstImageByTitle(place.name),
        searchImage(query),
      ]);
      if (fromKto) {
        place.image = fromKto;
        return;
      }
      if (!hit) return;
      place.image = hit.image;
      place.thumbnail = hit.thumbnail;
      place.imageCredit = hit.credit;
    }),
  );
  return places;
}
