import { homepageOf, ktoImageByTitle, titlesMatch } from "./kto.js";

const TIMEOUT_MS = 5000;

/** 카카오 로컬 카테고리 → 프런트 태그 */
const CATEGORY_TAG = {
  AT4: "전망", // 관광명소
  CE7: "카페",
  FD6: "로컬", // 음식점
  CT1: "골목", // 문화시설
};

/**
 * 카카오 로컬 카테고리 검색 — REST 키는 서버에서만 사용한다.
 * size는 카카오 최대치(15)까지. 사진이 있는 장소를 고를 수 있게 후보를 넉넉히 받는다.
 */
async function searchCategory(code, lat, lng, radius = 5000, size = 15) {
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

/**
 * 장소명 + 좌표로 카카오 로컬에서 같은 곳을 찾아 place_url을 돌려준다.
 * 이름이 정확히 맞고 좌표가 maxMeters 안일 때만 — 엉뚱한 동명 장소로 보내지 않는다.
 */
export async function placeUrlByName(name, lat, lng, maxMeters = 700) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key || !name?.trim() || !Number.isFinite(lat) || !Number.isFinite(lng)) return "";

  const query = new URLSearchParams({
    query: name.trim(),
    x: String(lng),
    y: String(lat),
    radius: String(Math.max(maxMeters, 1000)),
    size: "10",
    sort: "distance",
  });

  try {
    const res = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${query}`, {
      headers: { Authorization: `KakaoAK ${key}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return "";

    const docs = (await res.json()).documents ?? [];
    const core = normalizeName(name);
    const hit = docs.find(
      (d) =>
        d.place_url &&
        Number(d.distance) <= maxMeters &&
        (normalizeName(d.place_name) === core ||
          normalizeName(d.place_name).includes(core) ||
          core.includes(normalizeName(d.place_name))),
    );
    return hit?.place_url ?? "";
  } catch {
    return "";
  }
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

/* ── 검색 이미지 품질 판정 ─────────────────────────────────────── */

/**
 * 장소 사진으로 쓸 수 없는 이미지 — 로고·메뉴판·배너·상품컷·스크린샷.
 * 출처(도메인)와 파일명에 남는 흔적으로만 거른다. 이미지 내용 자체는 판별하지 않는다.
 */
const BAD_IMAGE =
  /(로고|logo|ci_|bi_|symbol|poster|포스터|menu|메뉴판|banner|배너|coupon|쿠폰|product|상품|shopping|smartstore|coupang|11st|gmarket|auction|interpark|screenshot|스크린샷|thumb_?icon)/i;

/**
 * 지도 캡처·로드뷰·지도 UI. `mapo`, `sitemap`, `mapping`처럼 단어 일부에 map이 들어가는
 * 정상 문자열까지 막지 않도록, 붙여 쓰는 지도 서비스명은 전부 명시하고
 * 홀로 쓰인 map/maps만 경계로 잡는다.
 */
const MAP_IMAGE =
  /(kakaomap|navermap|googlemap|daummap|openstreetmap|staticmap|mapimg|map[._-]?capture|map[._-]kakao|maps?[._-]google|map[._-]naver|roadview|streetview|지도|약도|로드뷰|길찾기|맵캡처)|(^|[^0-9a-z])maps?([^0-9a-z]|$)/i;

/** 검색 문맥 문자열 — doc_url은 퍼센트 인코딩을 풀어 한글 경로도 비교한다 */
function docContext(doc) {
  let url = doc.doc_url ?? "";
  try {
    url = decodeURIComponent(url);
  } catch {
    /* 잘못된 인코딩이면 원문 그대로 */
  }
  return `${doc.display_sitename ?? ""} ${url} ${doc.image_url ?? ""}`;
}

/** 최소 조건 — 너무 작거나, 세로로 지나치게 길거나, 부적합 출처면 후보에서 뺀다 */
function usableImage(doc) {
  const w = Number(doc.width) || 0;
  const h = Number(doc.height) || 0;
  if (!doc.thumbnail_url || w < 500 || h < 300) return false;
  const ratio = w / h;
  if (ratio < 0.8 || ratio > 2.2) return false;
  const ctx = docContext(doc);
  return !BAD_IMAGE.test(ctx) && !MAP_IMAGE.test(ctx);
}

/** 통과한 후보들 중 가장 좋은 한 장을 고르기 위한 점수 */
function scoreImage(doc, { exact, name }) {
  const w = Number(doc.width) || 0;
  const h = Number(doc.height) || 0;
  const ratio = w / h;
  let score = 0;
  if (w >= 800) score += 2;
  if (h >= 500) score += 2;
  if (ratio >= 1.1 && ratio <= 1.8) score += 2;
  if (exact) score += 3;
  /* 출처에 장소명이 그대로 남아 있으면 그 장소 사진일 가능성이 높다 */
  const core = normalizeName(name);
  if (core.length >= 2 && normalizeName(docContext(doc)).includes(core)) score += 2;
  if (doc.image_url) score += 1;
  return score;
}

/** 괄호·공백·특수문자를 뺀 비교용 이름 */
export function normalizeName(s = "") {
  return String(s)
    .replace(/<[^>]*>/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^0-9A-Za-z가-힣]/g, "")
    .toLowerCase();
}

/**
 * 다음 이미지 검색 — KTO 이미지가 없을 때만 쓰는 보조 수단.
 * 상위 후보를 모두 점수화해 좋은 순으로 돌려준다(빈 배열이면 텍스트 fallback).
 * REST 키는 서버에서만 사용한다.
 */
export async function searchImageCandidates(query, { exact = false, name = "" } = {}) {
  const key = process.env.KAKAO_REST_API_KEY;
  if (!key || !query.trim()) return [];

  const params = new URLSearchParams({ query: query.trim(), size: "15", sort: "accuracy" });

  try {
    const res = await fetch(`https://dapi.kakao.com/v2/search/image?${params}`, {
      headers: { Authorization: `KakaoAK ${key}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return [];

    const docs = (await res.json()).documents ?? [];
    /* accuracy 상위 8건만 본다 — 더 내려가면 장소와 무관한 사진이 섞인다 */
    return docs
      .slice(0, 8)
      .filter(usableImage)
      .map((doc) => ({
        thumbnail: doc.thumbnail_url,
        // 원본이 막혀 있을 때를 대비해 썸네일도 같이 넘긴다
        image: doc.image_url || doc.thumbnail_url,
        // 원본 URL이 있는 경우에만 true — hero처럼 크게 쓰는 자리에서 저화질 확대를 막는다
        original: Boolean(doc.image_url),
        credit: { sitename: doc.display_sitename ?? "", docUrl: doc.doc_url ?? "" },
        score: scoreImage(doc, { exact, name }),
      }))
      .sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
}

/** 한 장만 필요할 때 (hero 대표 사진 등) */
export async function searchImage(query, opts) {
  const [best] = await searchImageCandidates(query, opts);
  return best ?? null;
}

/** 검색어용 지역 — 시·군·구만 써서 고유명사와 붙인다 */
export function regionWord(region = "") {
  const parts = region.trim().split(/\s+/).filter(Boolean);
  const city = [...parts].reverse().find((p) => /(시|군|구)$/.test(p));
  return city || parts.slice(0, 2).join(" ");
}

/* ── 장소 사진 해석 ──────────────────────────────────────────────
   우선순위를 이 한 곳에서만 관리한다. 나중에 장소 전용 사진 API를 넣을 때도
   resolvePlaceImage 안에 단계 하나만 추가하면 된다.
   ────────────────────────────────────────────────────────────── */

/** 유형 → 2차 Daum 검색에 붙일 말머리 */
const TYPE_KEYWORD = { spot: "관광", food: "음식점", cafe: "카페", stay: "숙박" };

/** 장소명에 이미 유형이 드러나면 말머리를 붙이지 않는다 */
const TYPE_ALREADY = {
  spot: /(관광|공원|해수욕장|전망대|박물관|미술관|사찰|해변)/,
  food: /(식당|음식|맛집|횟집|국밥|갈비|분식|restaurant)/i,
  cafe: /(카페|커피|cafe|coffee|roast)/i,
  stay: /(호텔|펜션|모텔|리조트|게스트하우스|민박|숙박|hotel|resort|stay)/i,
};

/** `유형|지역|장소명` → { kto, candidates }. 같은 목적지를 다시 열어도 재검색하지 않는다 */
const imageCache = new Map();
const CACHE_MAX = 500;

function cacheGet(key) {
  return imageCache.has(key) ? imageCache.get(key) : undefined;
}

function cacheSet(key, value) {
  if (imageCache.size >= CACHE_MAX) imageCache.delete(imageCache.keys().next().value);
  imageCache.set(key, value);
  return value;
}

/**
 * Daum 검색 예산 — 카테고리별로 따로 만들어 쓴다(가볼 곳 / 맛집·카페).
 * 한 장소는 1차·2차 검색을 합쳐 최대 1만 소비한다.
 */
export function createImageBudget(max = 4) {
  return { left: max };
}

/** 한 화면에서 같은 사진이 두 장소에 반복되지 않게 쓰인 URL을 모아 둔다 */
export function createImageDedupe() {
  return new Set();
}

function isTaken(seen, cand) {
  if (!seen) return false;
  return seen.has(cand.image) || seen.has(cand.thumbnail);
}

function take(seen, cand) {
  if (seen) {
    if (cand.image) seen.add(cand.image);
    if (cand.thumbnail) seen.add(cand.thumbnail);
  }
  return cand;
}

/** region("제주 제주시") → { sido, sigungu } */
function splitRegion(region = "") {
  const [sido = "", sigungu = ""] = region.trim().split(/\s+/);
  return { sido, sigungu };
}

/** 후보 하나에 찾은 사진을 붙인다 */
function applyImage(place, found) {
  place.image = found.image;
  if (found.thumbnail) place.thumbnail = found.thumbnail;
  if (found.credit) place.imageCredit = found.credit;
}

function byDistance(a, b) {
  return (a.distance ?? 1e9) - (b.distance ?? 1e9);
}

/** 장소별 캐시 엔트리 — kto/candidates는 각각 "아직 안 찾아봤음(undefined)"과 "없음"을 구분한다 */
function entryFor(type, region, name) {
  const { sido, sigungu } = splitRegion(region);
  const key = `${type}|${sido} ${sigungu}|${name}`;
  const hit = cacheGet(key);
  return hit ?? cacheSet(key, {});
}

/** 2단계 — KTO 제목 정확 일치 (searchKeyword2 → firstimage → detailImage2) */
async function ktoTitleImage(place, region, type) {
  const entry = entryFor(type, region, place.name);
  if (entry.kto === undefined) entry.kto = await ktoImageByTitle(place.name, region);
  return entry.kto;
}

/** 3단계 — Daum 이미지 검색. 한 장소당 예산은 1만 쓴다(1차가 비면 2차까지 같은 예산 안에서) */
async function daumImage(place, region, type, budget) {
  const entry = entryFor(type, region, place.name);
  if (entry.candidates === undefined) {
    if (budget && budget.left <= 0) return [];
    if (budget) budget.left -= 1;
    const { sido, sigungu } = splitRegion(region);
    const primary = [sido, sigungu, place.name].filter(Boolean).join(" ");
    let candidates = await searchImageCandidates(primary, { exact: true, name: place.name });

    /* 1차가 비었을 때만 2차 — 시도 + 장소명 + 유형 */
    if (candidates.length === 0) {
      const word = TYPE_ALREADY[type]?.test(place.name) ? "" : (TYPE_KEYWORD[type] ?? "");
      const secondary = [sido, place.name, word].filter(Boolean).join(" ");
      if (secondary !== primary) {
        candidates = await searchImageCandidates(secondary, { exact: false, name: place.name });
      }
    }
    entry.candidates = candidates;
  }
  return entry.candidates;
}

/**
 * 한 카테고리에서 "사진이 있는 실제 장소"를 need개까지 고른다.
 * 후보는 카카오가 거리순으로 준 것(같은 radius 안)만 쓰고, 좌표·이름·category는 손대지 않는다.
 * 단계별로 싼 것부터 — 추가 호출 0회(KTO 주변 목록) → KTO 제목 조회 → Daum 검색 —
 * 돌면서 need개를 채우면 즉시 멈춘다. 사진 없는 앞 후보가 Daum 예산을 먼저 태우지 않는다.
 * 반환은 [사진 확보(거리순), 나머지(거리순)] — 앞 need개가 화면에 쓰인다.
 */
async function pickWithImages(candidates, region, type, ktoPool, budget, seen, need, scanMax) {
  const found = [];
  const pending = [];

  /** 후보 하나의 사진 — KTO 주변목록 → KTO 제목 일치(firstimage → detailImage2) → Daum → null */
  const imageFor = async (place) => {
    const fromPool = ktoPool.find((k) => titlesMatch(k.name, place.name))?.image;
    if (fromPool && !isTaken(seen, { image: fromPool })) return { image: fromPool };

    const fromKto = await ktoTitleImage(place, region, type);
    if (fromKto && !isTaken(seen, { image: fromKto })) return { image: fromKto };

    /* KTO에 없는 후보만 Daum을 쓴다 */
    const list = await daumImage(place, region, type, budget);
    return list.find((c) => !isTaken(seen, c)) ?? null;
  };

  /* 가까운 후보부터 우선순위 체인을 끝까지 돌리고, need개를 채우면 즉시 멈춘다.
     거리순으로 훑기 때문에 고른 need개가 곧 "사진 있는 가장 가까운 장소"가 된다.
     보는 후보 수를 scanMax로 묶어야(예산이 아니라) 캐시가 데워져도 결과가 같다. */
  let examined = 0;
  for (const place of candidates) {
    if (found.length >= need || examined >= scanMax) {
      pending.push(place);
      continue;
    }
    examined += 1;
    const hit = await imageFor(place);
    if (hit) {
      applyImage(place, take(seen, hit));
      found.push(place);
    } else {
      pending.push(place);
    }
  }

  /* 창 안에서 못 채웠으면 남은 후보 중 KTO 주변목록에 사진이 있는 곳만 줍는다 (추가 호출 0회) */
  if (found.length < need) {
    for (const place of [...pending]) {
      if (found.length >= need) break;
      const image = ktoPool.find((k) => titlesMatch(k.name, place.name))?.image;
      if (!image || isTaken(seen, { image })) continue;
      applyImage(place, take(seen, { image }));
      found.push(place);
      pending.splice(pending.indexOf(place), 1);
    }
  }

  found.sort(byDistance);
  pending.sort(byDistance);
  return [...found, ...pending];
}

/** 응답에 담는 카테고리별 장소 수 — 앞쪽 3개가 목록, 나머지는 지도 마커용 */
const RESPONSE_MAX = 5;

/**
 * 주변 장소 사진 채우기 — 라우트(server.js / api/places/nearby.js)가 함께 쓴다.
 * 가볼 곳 3 → 맛집 2 → 카페 1 순서로 한 카테고리씩 처리해 실행마다 결과가 같다.
 * Daum 예산은 가볼 곳 / 맛집·카페로 나눠 서로 뺏지 않게 한다.
 * stays 사진까지 seen에 넣어 같은 사진이 두 번 쓰이지 않게 한다.
 */
export async function attachNearbyImages(places, region, ktoPool = [], stays = []) {
  /* 한 후보가 Daum을 쓰는 건 최대 1회고 후보는 scanMax개까지만 보므로,
     예산을 창 크기(spots 15 / foods 6 + cafes 4)와 같게 두면 정상 경로에서는 절대 걸리지 않는다.
     = 캐시가 데워져 있든 아니든 같은 장소만 검색하고 결과가 같다. 예산은 예외 상황의 상한. */
  const spotBudget = createImageBudget(15);
  const eatBudget = createImageBudget(10);
  const seen = createImageDedupe();
  for (const s of stays) if (s.image) seen.add(s.image);

  const order = [
    ["spots", "spot", 3, 15, spotBudget],
    ["foods", "food", 2, 6, eatBudget],
    ["cafes", "cafe", 1, 4, eatBudget],
  ];
  for (const [field, type, need, scanMax, budget] of order) {
    const ranked = await pickWithImages(
      places[field],
      region,
      type,
      ktoPool,
      budget,
      seen,
      need,
      scanMax,
    );
    places[field] = ranked.slice(0, RESPONSE_MAX);
  }
  return places;
}

/**
 * 주소가 실제로 열리는지 확인한다.
 * 연결 자체가 안 되거나(도메인 만료·서버 다운) 404/410일 때만 false —
 * 403 같은 봇 차단 응답은 살아 있는 사이트로 본다(멀쩡한 공식 홈페이지를 버리지 않게).
 */
async function isReachable(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(3000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PickAndGo/1.0)" },
    });
    res.body?.cancel?.();
    return res.status !== 404 && res.status !== 410;
  } catch {
    return false;
  }
}

/**
 * 숙소 카드 링크 — 실제로 열리는 주소만 채운다. 라우트 두 곳이 함께 쓴다.
 *   1) KTO detailCommon2의 공식 homepage (열리는지 확인)
 *   2) 없거나 죽은 주소면 숙소명 + 좌표로 찾은 카카오 로컬 place_url
 *   3) 둘 다 없으면 빈 문자열 → 프런트에서 링크 없는 카드로 보여 준다
 * 화면에 실제로 쓰는 앞쪽 몇 곳만 확인한다(추천·이미지·거리 로직은 건드리지 않는다).
 */
export async function resolveStayLinks(stays, limit = 4) {
  for (const stay of stays.slice(0, limit)) {
    if (stay.url) continue;
    const homepage = await homepageOf(stay.contentId);
    if (homepage && (await isReachable(homepage))) {
      stay.url = homepage;
      continue;
    }
    stay.url = await placeUrlByName(stay.name, stay.lat, stay.lng);
  }
  return stays;
}
