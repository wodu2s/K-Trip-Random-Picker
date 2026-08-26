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

/** 여행지 데이터 출처 */
export type DestinationSource = "sample" | "tourapi";

/** 추천 단계용 정규화 모델. TourAPI 원본과 UI Destination을 분리한다. */
export type DestinationCandidate = {
  id: string;
  contentId: string;
  contentTypeId?: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  image?: string;
  themes: ThemeKey[];
  /** 사용자 위치 기준 직선거리(km). 자동차 이동거리가 아니다. */
  distanceKm?: number;
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
  /** 표시용 거리/이동 문구. TourAPI 단계에서는 직선거리만 담는다. */
  travelTimeText: string;
  isHiddenGem: boolean;
  hiddenPlaces: HiddenPlace[];
  /** 오전 · 점심 · 오후 · 저녁 하루 코스 */
  schedule: ScheduleItem[];
  /** 여행자 리뷰 평점 (5점 만점). TourAPI 목록만으로는 알 수 없어 생략할 수 있다. */
  rating?: number;
  /** 리뷰 수. 임의 값을 만들지 않는다. */
  reviewCount?: number;
  /** 여행지 공개 화면 히어로 일러스트(이미지 대체용) 분위기 */
  scene: SceneVariant;
  /** tourapi 항목은 LocgoHub 연동 전까지 discovery 필터를 적용하지 않는다 */
  source?: DestinationSource;
};

/** 카드 선택 화면에 뿌리는 미스터리 카드. 실제 정보는 destinationId로 조회한다. */
export type MysteryCardData = {
  id: string;
  destinationId: string;
};

/** 서비스 진행 페이지(단계) */
export type FlowPage = "landing" | "conditions" | "shuffle" | "cards" | "destination";

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
