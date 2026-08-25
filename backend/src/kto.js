import {
  AREA_CODES,
  DEFAULT_THEME,
  THEME_LABEL,
  THEME_QUERY,
  areaPool,
  discoveryQuery,
  pickRandom,
  themePool,
} from "./mapping.js";
import { normalizeRegion } from "./region.js";

const TIMEOUT_MS = 7000;

const KTO_PATH = "/B551011/KorService2";

function baseUrl() {
  const raw = (process.env.KTO_API_BASE_URL || "").replace(/\/$/, "");
  if (!raw) return `https://apis.data.go.kr${KTO_PATH}`;
  // 호스트만 넣은 경우에도 동작하도록 서비스 경로를 보정한다
  return raw.includes("/KorService") ? raw : `${raw}${KTO_PATH}`;
}

/** TourAPI 공통 호출 — 인증키는 서버에서만 사용한다 */
async function callKto(operation, params) {
  const key = process.env.KTO_API_KEY;
  if (!key) throw new Error("KTO_API_KEY 미설정");

  const query = new URLSearchParams({
    serviceKey: key,
    MobileOS: "ETC",
    MobileApp: "PickAndGo",
    _type: "json",
    ...params,
  });

  const res = await fetch(`${baseUrl()}/${operation}?${query}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`KTO ${operation} HTTP ${res.status}`);

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`KTO ${operation} 응답 파싱 실패: ${text.slice(0, 120)}`);
  }

  const header = json?.response?.header;
  if (header && header.resultCode !== "0000") {
    throw new Error(`KTO ${operation} ${header.resultCode} ${header.resultMsg}`);
  }

  const items = json?.response?.body?.items?.item;
  if (!items) return [];
  return Array.isArray(items) ? items : [items];
}

function stripHtml(text = "") {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstSentences(text, count) {
  const clean = stripHtml(text);
  if (!clean) return "";
  const parts = clean.split(/(?<=[.!?])\s+/).slice(0, count).join(" ");
  return parts.length > 220 ? `${parts.slice(0, 219)}…` : parts;
}

/** TourAPI 항목 → 프런트 Destination 형태 (부족한 필드는 조건·지역에서 파생) */
function toDestination(item, theme) {
  const area = AREA_CODES[Number(item.areacode)] ?? { name: "전국", time: "약 2시간" };
  const themeLabel = THEME_LABEL[theme] ?? "여행";
  const query = THEME_QUERY[theme] ?? THEME_QUERY[DEFAULT_THEME];

  return {
    id: `kto-${item.contentid}`,
    contentId: String(item.contentid),
    contentTypeId: String(item.contenttypeid ?? query.contentTypeId),
    name: stripHtml(item.title),
    region: normalizeRegion(stripHtml(item.addr1), area.name),
    image: item.firstimage || item.firstimage2 || "",
    themes: [theme],
    tags: [themeLabel, area.name, item.cat3 ? "추천" : "탐험"].slice(0, 3),
    shortDescription: "",
    tagline: `${area.name}에서 만나는 ${themeLabel}`,
    story: "",
    travelTimeText: area.time,
    isHiddenGem: false,
    hiddenPlaces: [],
    schedule: [],
    rating: 0,
    reviewCount: 0,
    scene: query.scene,
    lat: Number(item.mapy) || null,
    lng: Number(item.mapx) || null,
  };
}

/** 지역·테마별 목록 조회 */
async function listByTheme(theme, areaCode, discovery) {
  const query = THEME_QUERY[theme] ?? THEME_QUERY[DEFAULT_THEME];
  const { arrange, pageNo } = discoveryQuery(discovery);

  const items = await callKto("areaBasedList2", {
    numOfRows: "20",
    pageNo: String(pageNo),
    arrange,
    areaCode: String(areaCode),
    contentTypeId: query.contentTypeId,
    ...(query.cat1 ? { cat1: query.cat1 } : {}),
    ...(query.cat2 ? { cat2: query.cat2 } : {}),
    ...(query.cat3 ? { cat3: query.cat3 } : {}),
  });

  return items.filter((i) => i.title && i.mapx && i.mapy).map((i) => toDestination(i, theme));
}

/** 해당 테마가 없는 지역(예: 서울의 해수욕장)이면 다음 지역으로 넘어간다 */
async function listByThemeAcrossAreas(theme, areas, discovery) {
  for (const areaCode of areas.slice(0, 3)) {
    const items = await listByTheme(theme, areaCode, discovery);
    if (items.length) return items;
  }
  return [];
}

/** 상세 소개(overview) 채우기 */
async function fillOverview(destination) {
  try {
    const [detail] = await callKto("detailCommon2", {
      contentId: destination.contentId,
      numOfRows: "1",
      pageNo: "1",
    });
    const overview = detail?.overview ?? "";
    destination.shortDescription =
      firstSentences(overview, 1) || `${destination.region}의 오늘 추천 여행지.`;
    destination.story =
      firstSentences(overview, 3) || `${destination.name}에서 오늘 하루를 천천히 보내보세요.`;
    if (!destination.image && detail?.firstimage) destination.image = detail.firstimage;
  } catch {
    destination.shortDescription = `${destination.region}의 오늘 추천 여행지.`;
    destination.story = `${destination.name}에서 오늘 하루를 천천히 보내보세요.`;
  }
  return destination;
}

/**
 * 조건값으로 실제 여행지 후보 5개 생성.
 * 테마별로 서로 다른 지역을 조회해 중복 없이 섞는다.
 */
export async function recommendDestinations({ duration, themes, companion, mood, discovery }) {
  const pool = themePool(themes, companion, mood);
  const areas = pickRandom(areaPool(duration));

  const results = await Promise.allSettled(
    pool.map((theme, i) =>
      listByThemeAcrossAreas(theme, [...areas.slice(i), ...areas.slice(0, i)], discovery),
    ),
  );

  const seen = new Set();
  const merged = [];
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const d of pickRandom(r.value)) {
      if (seen.has(d.id)) continue;
      seen.add(d.id);
      merged.push(d);
    }
  }

  if (merged.length === 0) {
    const reason = results.find((r) => r.status === "rejected")?.reason;
    throw new Error(reason ? String(reason.message ?? reason) : "TourAPI 후보 없음");
  }

  // 테마가 섞이도록 라운드로빈으로 5개 선택
  const byTheme = new Map();
  for (const d of merged) {
    const list = byTheme.get(d.themes[0]) ?? [];
    list.push(d);
    byTheme.set(d.themes[0], list);
  }
  const picked = [];
  while (picked.length < 5) {
    let added = false;
    for (const list of byTheme.values()) {
      const next = list.shift();
      if (!next) continue;
      picked.push(next);
      added = true;
      if (picked.length === 5) break;
    }
    if (!added) break;
  }

  const chosen = picked.slice(0, 5);
  chosen.forEach((d) => {
    d.isHiddenGem = discovery === "hidden" || !d.image;
  });

  await Promise.all(chosen.map(fillOverview));
  return chosen;
}

/**
 * detailIntro2 필드명은 contentTypeId마다 다르다.
 * (관광지 usetime / 문화시설 usetimeculture / 레포츠 usetimeleports …)
 * 타입별 분기 대신 후보 키를 순서대로 훑어 처음 채워진 값을 쓴다.
 */
const INTRO_FIELDS = {
  usetime: ["usetime", "usetimeculture", "usetimeleports", "usetimefestival", "opentime"],
  restdate: ["restdate", "restdateculture", "restdateleports"],
  fee: ["usefee", "usefeeculture", "usefeeleports", "admission"],
  parking: ["parking", "parkingculture", "parkingleports"],
  infocenter: ["infocenter", "infocenterculture", "infocenterleports"],
};

/** 후보 키 중 처음으로 값이 있는 것을 반환 (없으면 빈 문자열) */
function pickField(item, keys) {
  for (const key of keys) {
    const value = stripHtml(item?.[key] ?? "");
    if (value) return value;
  }
  return "";
}

/** 이용 정보 — 운영시간·휴무일·요금·주차·문의 (KTO에 평점이 없어 이 값들로 대체한다) */
async function fetchIntro(contentId, contentTypeId) {
  const [item] = await callKto("detailIntro2", {
    contentId: String(contentId),
    contentTypeId: String(contentTypeId),
    numOfRows: "1",
    pageNo: "1",
  });
  if (!item) return {};

  const info = {};
  for (const [field, keys] of Object.entries(INTRO_FIELDS)) {
    const value = pickField(item, keys);
    if (value) info[field] = value;
  }
  return info;
}

/** 추가 사진 — 대표 이미지(firstimage) 외 갤러리용 */
async function fetchImages(contentId) {
  const items = await callKto("detailImage2", {
    contentId: String(contentId),
    imageYN: "Y",
    numOfRows: "10",
    pageNo: "1",
  });
  return items
    .map((i) => i.originimgurl || i.smallimageurl || "")
    .filter(Boolean)
    .slice(0, 8);
}

/**
 * 카드를 고른 뒤 선택한 한 곳에만 호출한다.
 * 둘 중 하나가 실패해도 나머지는 그대로 반환한다.
 */
export async function fetchDestinationDetail(contentId, contentTypeId) {
  const [intro, images] = await Promise.allSettled([
    fetchIntro(contentId, contentTypeId),
    fetchImages(contentId),
  ]);

  return {
    info: intro.status === "fulfilled" ? intro.value : {},
    gallery: images.status === "fulfilled" ? images.value : [],
  };
}
