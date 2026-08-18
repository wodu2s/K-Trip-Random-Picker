import type { Destination, HiddenPlace, ScheduleItem, SceneVariant, ThemeKey } from "../types/travel";
import { THEME_META } from "../data/destinations";

/** TourAPI 지역기반/위치기반 공통 아이템 (필요한 필드만) */
export type TourItem = {
  contentid?: string;
  contenttypeid?: string;
  title?: string;
  addr1?: string;
  addr2?: string;
  firstimage?: string;
  firstimage2?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  mapx?: string;
  mapy?: string;
  tel?: string;
};

/** 시·도 표기 축약 */
const SIDO_SHORT: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원도: "강원",
  강원특별자치도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전라북도: "전북",
  전북특별자치도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주도: "제주",
  제주특별자치도: "제주",
};

export function shortenRegion(addr1?: string): string {
  if (!addr1) return "대한민국";
  const [sido = "", sigungu = ""] = addr1.trim().split(/\s+/);
  return `${SIDO_SHORT[sido] ?? sido} ${sigungu}`.trim();
}

/** 제목 키워드 기반 테마 추론 (cat 코드만으로는 세분화가 어려워 제목을 보조로 사용) */
const THEME_KEYWORDS: { theme: ThemeKey; re: RegExp }[] = [
  { theme: "sea", re: /해수욕장|해변|해안|바다|섬|항\b|포구|등대|방파제/ },
  { theme: "nature", re: /산\b|계곡|폭포|수목원|숲|호수|공원|정원|습지|자연|둘레길|생태|동굴|온천/ },
  { theme: "history", re: /사찰|사\b|절\b|서원|향교|고택|한옥|박물관|미술관|유적|성지|왕릉|고분|성곽|문화재/ },
  { theme: "vibe", re: /카페|전망|야경|테마|전망대|타워|벽화/ },
  { theme: "food", re: /시장|맛집|먹거리|음식|거리\b/ },
  { theme: "activity", re: /레저|스키|캠핑|짚라인|체험|낚시|승마|서핑|레일/ },
];

/** cat1 대분류 → 기본 테마 */
function baseThemeFromCat(cat1?: string): ThemeKey {
  switch (cat1) {
    case "A01":
      return "nature";
    case "A02":
      return "history";
    case "A03":
      return "activity";
    case "A05":
      return "food";
    default:
      return "local";
  }
}

export function mapThemes(item: TourItem): ThemeKey[] {
  const themes = new Set<ThemeKey>();
  const title = item.title ?? "";
  for (const { theme, re } of THEME_KEYWORDS) {
    if (re.test(title)) themes.add(theme);
  }
  themes.add(baseThemeFromCat(item.cat1));
  if (themes.size === 0) themes.add("etc");
  return [...themes].slice(0, 3);
}

function sceneFromThemes(themes: ThemeKey[]): SceneVariant {
  if (themes.includes("sea")) return "sea";
  if (themes.includes("nature")) return "mountain";
  return "town";
}

/** 결정적 해시 (rating/reviewCount/숨은명소 여부를 안정적으로 생성) */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function tagsFromThemes(themes: ThemeKey[]): string[] {
  return themes.map((t) => THEME_META[t].label).slice(0, 3);
}

/** 상세 개요 도착 전까지 쓰는 임시 스케줄 (개요 API에는 코스 정보가 없어 일반 템플릿으로 생성) */
function synthSchedule(name: string, region: string): ScheduleItem[] {
  const sido = region.split(/\s+/)[0] ?? "현지";
  return [
    { period: "오전", title: `${name} 도착`, description: `${name}에 도착해 주변을 천천히 둘러보며 하루를 시작해요.` },
    { period: "점심", title: `${sido} 현지 밥상`, description: `${sido}에서만 맛볼 수 있는 향토 음식으로 든든하게 채워요.` },
    { period: "오후", title: "주변 명소 산책", description: "가까운 명소를 걸으며 이 지역만의 분위기를 느껴보세요." },
    { period: "저녁", title: "노을과 함께 마무리", description: "하루를 돌아보며 조용히 여행을 마무리해요." },
  ];
}

const TAGLINE: Record<ThemeKey, string> = {
  sea: "파도 소리와 함께하는 하루",
  nature: "자연이 건네는 초록빛 위로",
  food: "입이 즐거운 미식 여행",
  vibe: "감성이 머무는 순간",
  history: "시간이 쌓인 이야기 속으로",
  local: "현지의 온기를 만나는 길",
  activity: "몸이 먼저 반응하는 즐거움",
  etc: "오늘 발견한 특별한 장소",
};

/** TourAPI 아이템 → 앱 Destination */
export function toDestination(item: TourItem): Destination {
  const id = item.contentid ?? `tour-${hashString(item.title ?? "")}`;
  const name = item.title ?? "이름 없는 여행지";
  const region = shortenRegion(item.addr1);
  const themes = mapThemes(item);
  const h = hashString(id);
  const rating = Number((4.0 + (h % 10) / 10).toFixed(1));
  const reviewCount = 50 + (h % 4950);
  const isHiddenGem = h % 10 < 3;
  const primary = themes[0] ?? "etc";

  return {
    id,
    name,
    region,
    image: item.firstimage || item.firstimage2 || "",
    themes,
    tags: tagsFromThemes(themes),
    shortDescription: `${region}에서 만나는 ${name}.`,
    tagline: TAGLINE[primary],
    story: item.addr1 ? `${item.addr1}${item.addr2 ? " " + item.addr2 : ""}` : `${name}에서의 하루를 만들어보세요.`,
    travelTimeText: "약 2시간 30분",
    isHiddenGem,
    rating,
    reviewCount,
    scene: sceneFromThemes(themes),
    schedule: synthSchedule(name, region),
    hiddenPlaces: [],
    contentId: item.contentid,
    mapx: item.mapx ? Number(item.mapx) : undefined,
    mapy: item.mapy ? Number(item.mapy) : undefined,
  };
}

/** 위치기반 아이템 → 숨은 명소 카드 */
export function toHiddenPlace(item: TourItem): HiddenPlace {
  const themes = mapThemes(item);
  return {
    name: item.title ?? "주변 명소",
    tag: themes[0] ? THEME_META[themes[0]].label : "주변",
  };
}
