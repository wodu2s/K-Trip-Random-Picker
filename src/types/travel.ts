/** 여행 기간 */
export type Duration = "day-trip" | "overnight";

/** 여행 테마 키 */
export type ThemeKey =
  | "sea"
  | "nature"
  | "food"
  | "vibe"
  | "history"
  | "local"
  | "activity"
  | "etc";

/** 동행 유형 */
export type CompanionKey = "alone" | "couple" | "friends" | "family";

/** 원하는 분위기 */
export type MoodKey = "calm" | "lively" | "emotional";

/** 발견 성향 — 유명 명소 ~ 숨은 로컬 */
export type DiscoveryKey = "popular" | "balanced" | "hidden";

/** 카드 힌트 종류 — 분위기 · 장소 · 경험 순서로 정확히 3개를 만든다 */
export type CardHintType = "atmosphere" | "place" | "experience";

/** 백엔드가 조건값 + KTO 분류코드로 생성한 카드 힌트 */
export type CardHint = {
  type: CardHintType;
  /** 힌트 의미 키 (예: beach, trail) — 표기는 emoji만 사용한다 */
  key: string;
  emoji: string;
};

/** 이미지 출처 — 다음 이미지 검색으로 채운 사진에만 붙는다 */
export type ImageCredit = {
  sitename: string;
  docUrl: string;
};

/** 숨겨진 로컬 명소 (여행지 하위 추천) */
export type HiddenPlace = {
  name: string;
  /** 표시용 태그 (자연 · 산책 · 로컬 · 전망 · 해변 · 카페 · 골목 등) */
  tag: string;
};

/** 히어로 일러스트 배경 분위기 (이미지 로드 실패 시 대체 그라디언트에도 사용) */
export type SceneVariant = "sea" | "mountain" | "town";

/** 하루 코스 타임라인 구간 */
export type DayPeriod = "오전" | "점심" | "오후" | "저녁";

export type ScheduleItem = {
  period: DayPeriod;
  title: string;
  description: string;
};

/** 여행지 데이터 */
export type Destination = {
  id: string;
  name: string;
  region: string;
  /** 카드 앞면 상단 58% 영역에 쓰이는 실제 관광지 이미지 경로 (로드 실패 시 테마 그라디언트로 대체) */
  image: string;
  themes: ThemeKey[];
  /** 카드 앞면에 표시하는 큐레이션 태그 (최대 3개 사용) */
  tags: string[];
  shortDescription: string;
  /** 감성 태그라인 (이름 아래 한 줄) */
  tagline: string;
  /** 장소 소개 한두 문장 */
  story: string;
  travelTimeText: string;
  isHiddenGem: boolean;
  hiddenPlaces: HiddenPlace[];
  /** 오전 · 점심 · 오후 · 저녁 하루 코스 */
  schedule: ScheduleItem[];
  /** 여행자 리뷰 평점 (5점 만점) */
  rating: number;
  /** 리뷰 수 */
  reviewCount: number;
  /** 여행지 공개 화면 히어로 일러스트(이미지 대체용) 분위기 */
  scene: SceneVariant;
  /** 카드 힌트 3개 (atmosphere · place · experience). API·mock 모두 동일 구조 */
  hints?: CardHint[];
  /** 실제 API 응답에만 있는 좌표 (지도·주변 장소용) */
  lat?: number | null;
  lng?: number | null;
  /** KTO 이미지가 없어 이미지 검색으로 채운 경우의 출처 */
  imageCredit?: ImageCredit;
  /** KTO detailCommon2에서 함께 채우는 연락 정보 */
  address?: string;
  tel?: string;
  homepage?: string;
  /** TourAPI 콘텐츠 ID (상세조회 키). 실데이터일 때만 존재 */
  contentId?: string;
  /** TourAPI 좌표 (주변 명소 조회용). mapx=경도, mapy=위도 */
  mapx?: number;
  mapy?: number;
};

/** 카드 선택 화면에 뿌리는 미스터리 카드. 실제 정보는 destinationId로 조회한다. */
export type MysteryCardData = {
  id: string;
  destinationId: string;
};

/** 서비스 진행 페이지(단계) */
export type FlowPage = "landing" | "conditions" | "shuffle" | "cards" | "destination" | "guestbook";

/**
 * 카드 드로우 단계 상태 머신 — 단일 phase가 UI·애니메이션의 유일한 상태 원천.
 */
export type CardPhase =
  | "ready"
  | "gathering"
  | "fanOut"
  | "crossing"
  | "mixing"
  | "restacking"
  | "selectable"
  | "selected"
  | "revealing"
  | "complete"
  | "error";
