import {
  AREA_CODES,
  THEME_LABEL,
  THEME_QUERY,
  areaPool,
  buildHints,
  discoveryQuery,
  pickRandom,
  scoreDestination,
  themePool,
} from "./mapping.js";

const TIMEOUT_MS = 7000;

const KTO_PATH = "/B551011/KorService2";

/** 숙박(contentTypeId=32) cat3 → 숙박 유형 */
const LODGING_TAG = {
  B02010100: "관광호텔",
  B02010500: "콘도미니엄",
  B02010600: "유스호스텔",
  B02010700: "펜션",
  B02010900: "모텔",
  B02011000: "민박",
  B02011100: "게스트하우스",
  B02011200: "홈스테이",
  B02011300: "레지던스",
  B02011600: "한옥",
};

function baseUrl() {
  const raw = (process.env.KTO_API_BASE_URL || "").replace(/\/$/, "");
  if (!raw) return `https://apis.data.go.kr${KTO_PATH}`;
  // 호스트만 넣은 경우에도 동작하도록 서비스 경로를 보정한다
  return raw.includes("/KorService") ? raw : `${raw}${KTO_PATH}`;
}

/** TourAPI 공통 호출 — 인증키는 서버에서만 사용한다 */
async function callKto(operation, params, timeoutMs = TIMEOUT_MS) {
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
    signal: AbortSignal.timeout(timeoutMs),
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
  const query = THEME_QUERY[theme] ?? THEME_QUERY.etc;

  return {
    id: `kto-${item.contentid}`,
    contentId: String(item.contentid),
    contentTypeId: String(item.contenttypeid ?? query.contentTypeId),
    areaCode: String(item.areacode ?? ""),
    cat1: item.cat1 ?? query.cat1 ?? "",
    cat2: item.cat2 ?? query.cat2 ?? "",
    cat3: item.cat3 ?? query.cat3 ?? "",
    name: stripHtml(item.title),
    region: stripHtml(item.addr1) || area.name,
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
  const query = THEME_QUERY[theme] ?? THEME_QUERY.etc;
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
    destination.address = stripHtml(detail?.addr1 ?? "") || destination.region;
    destination.tel = stripHtml(detail?.tel ?? "");
    destination.homepage = (stripHtml(detail?.homepage ?? "").match(/https?:[^ "]+/) ?? [""])[0];
  } catch {
    destination.shortDescription = `${destination.region}의 오늘 추천 여행지.`;
    destination.story = `${destination.name}에서 오늘 하루를 천천히 보내보세요.`;
  }
  return destination;
}

/** 목적지 주변 KTO 숙박 정보 — 거리순(arrange=E), 실패 시 호출부에서 무시한다 */
export async function lodgingNearby(lat, lng, radius = 10000) {
  const items = await callKto("locationBasedList2", {
    numOfRows: "10",
    pageNo: "1",
    arrange: "E",
    mapX: String(lng),
    mapY: String(lat),
    radius: String(radius),
    contentTypeId: "32",
  });

  return items
    .filter((i) => i.title && i.contentid)
    .map((i) => ({
      contentId: String(i.contentid),
      name: stripHtml(i.title),
      tag: LODGING_TAG[i.cat3] ?? "숙박",
      address: stripHtml(i.addr1 ?? ""),
      tel: stripHtml(i.tel ?? ""),
      lat: Number(i.mapy) || null,
      lng: Number(i.mapx) || null,
      distance: Math.round(Number(i.dist)) || null,
      // KTO 대표 이미지가 실제 있을 때만 채운다 (없으면 프런트에서 사진 영역 생략)
      image: i.firstimage || i.firstimage2 || "",
      url: `https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=${i.contentid}`,
    }));
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

  // 조건 점수가 높은 후보가 앞에 오도록 정렬 (동점은 앞선 무작위 순서 유지)
  const conditions = { duration, themes, companion, mood, discovery };
  merged.sort((a, b) => scoreDestination(b, conditions) - scoreDestination(a, conditions));

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
    d.hints = buildHints(d, conditions);
  });

  await Promise.all(chosen.map(fillOverview));
  return chosen;
}

function coreName(s = "") {
  return stripHtml(s)
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/** 괄호·공백을 뺀 고유명이 같을 때만 같은 장소로 본다 */
export function titlesMatch(a, b) {
  const ca = coreName(a);
  const cb = coreName(b);
  return ca.length >= 2 && ca === cb;
}

/** 주변 KTO 관광지·음식점의 firstimage — Kakao 장소명과 맞춰 쓴다 */
export async function ktoPlaceImagesNear(lat, lng, radius = 5000) {
  const params = {
    numOfRows: "20",
    pageNo: "1",
    arrange: "E",
    mapX: String(lng),
    mapY: String(lat),
    radius: String(radius),
  };
  const groups = await Promise.all([
    callKto("locationBasedList2", { ...params, contentTypeId: "12" }, 4000).catch(() => []),
    callKto("locationBasedList2", { ...params, contentTypeId: "39" }, 4000).catch(() => []),
  ]);
  const out = [];
  for (const items of groups) {
    for (const i of items) {
      const image = i.firstimage || i.firstimage2 || "";
      const name = stripHtml(i.title);
      if (name && image) out.push({ name, image });
    }
  }
  return out;
}

/** searchKeyword2에서 제목이 일치하는 항목의 firstimage만 쓴다 */
export async function ktoFirstImageByTitle(name) {
  const keyword = stripHtml(name);
  if (keyword.length < 2) return "";
  try {
    const items = await callKto(
      "searchKeyword2",
      {
        keyword,
        numOfRows: "8",
        pageNo: "1",
      },
      4000,
    );
    const hit = items.find((i) => titlesMatch(keyword, i.title) && (i.firstimage || i.firstimage2));
    return hit ? hit.firstimage || hit.firstimage2 : "";
  } catch {
    return "";
  }
}

/** 대표 이미지가 없는 목적지용 — detailImage2의 첫 장. 실패하면 빈 문자열 */
export async function detailImageUrl(contentId) {
  if (!contentId) return "";
  try {
    const [img] = await callKto("detailImage2", {
      contentId: String(contentId),
      imageYN: "Y",
      numOfRows: "1",
      pageNo: "1",
    });
    return img?.originimgurl || img?.smallimageurl || "";
  } catch {
    return "";
  }
}
