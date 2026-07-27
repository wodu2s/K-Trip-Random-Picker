/** 이동 가능 시간 */
export type TravelTime = "30m" | "1h" | "half-day";

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

/** 숨겨진 로컬 명소 (여행지 하위 추천) */
export type HiddenPlace = {
  name: string;
  /** 표시용 태그 (자연 · 산책 · 로컬 · 전망 · 해변 · 카페 · 골목 등) */
  tag: string;
};

/** 샘플 여행지 데이터 */
export type Destination = {
  id: string;
  name: string;
  region: string;
  image: string;
  emojiHints: string[];
  themes: ThemeKey[];
  shortDescription: string;
  /** 감성 태그라인 (이름 아래 한 줄) */
  tagline: string;
  /** 장소 소개 한두 문장 */
  story: string;
  travelTimeText: string;
  isHiddenGem: boolean;
  hiddenPlaces: HiddenPlace[];
  /** 여행자 리뷰 평점 (5점 만점) — 실제로는 리뷰 API에서 받아올 값 */
  rating: number;
  /** 리뷰 수 */
  reviewCount: number;
};

/** 카드 선택 화면에 뿌리는 미스터리 카드 (여행지에 매핑) */
export type MysteryCardData = {
  id: string;
  destinationId: string;
  emojiHints: string[];
};
