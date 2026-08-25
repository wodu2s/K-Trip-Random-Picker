import type { CompanionKey, Destination, DiscoveryKey, MoodKey, ThemeKey } from "../types/travel";

/** 테마 표시용 라벨/이모지 (조건 선택·태그에서 재사용) */
export const THEME_META: Record<ThemeKey, { label: string; emoji: string }> = {
  sea: { label: "바다", emoji: "🌊" },
  nature: { label: "자연", emoji: "⛰️" },
  vibe: { label: "감성", emoji: "📷" },
  history: { label: "역사/문화", emoji: "🏛️" },
  activity: { label: "액티비티", emoji: "🚴" },
};

export const THEME_ORDER: ThemeKey[] = ["sea", "nature", "vibe", "history", "activity"];

/** 동행 표시용 라벨 (조건 선택에서 재사용) */
export const COMPANION_META: Record<CompanionKey, { label: string }> = {
  alone: { label: "혼자" },
  couple: { label: "연인" },
  friends: { label: "친구" },
  family: { label: "가족" },
};

export const COMPANION_ORDER: CompanionKey[] = ["alone", "couple", "friends", "family"];

/** 분위기 표시용 라벨 */
export const MOOD_META: Record<MoodKey, { label: string }> = {
  calm: { label: "조용한" },
  lively: { label: "활기찬" },
  emotional: { label: "감성적인" },
};

export const MOOD_ORDER: MoodKey[] = ["calm", "lively", "emotional"];

/** 발견 성향 표시용 라벨 */
export const DISCOVERY_META: Record<DiscoveryKey, { label: string }> = {
  popular: { label: "유명 명소" },
  balanced: { label: "적당히 알려진 곳" },
  hidden: { label: "숨은 로컬" },
};

export const DISCOVERY_ORDER: DiscoveryKey[] = ["popular", "balanced", "hidden"];

/** 동행 → 테마 힌트 (추천 시 부드러운 가중치로 사용, 하드 필터 아님) */
export const COMPANION_THEME_HINTS: Record<CompanionKey, ThemeKey[]> = {
  alone: ["nature", "vibe"],
  couple: ["vibe", "sea"],
  friends: ["activity", "sea"],
  family: ["history", "nature"],
};

/** 분위기 → 테마 힌트 */
export const MOOD_THEME_HINTS: Record<MoodKey, ThemeKey[]> = {
  calm: ["nature", "history"],
  lively: ["activity", "sea"],
  emotional: ["vibe", "history"],
};

/**
 * 샘플 여행지 데이터.
 * 실제 API 없이 로컬 데이터로 카드 뽑기/공개를 시연한다.
 */
export const DESTINATIONS: Destination[] = [
  {
    id: "ulleungdo",
    name: "울릉도",
    region: "경상북도 울릉군",
    image: "/images/destinations/ulleungdo.jpg",
    themes: ["nature", "sea"],
    tags: ["섬", "절벽", "트레킹"],
    shortDescription: "아직 많이 알려지지 않은, 시간이 느리게 흐르는 섬.",
    tagline: "숨겨진 자연의 보석",
    story: "푸른 바다, 웅장한 절벽, 그리고 조용한 마을. 오늘은 울릉도에서 나만의 하루를 만들어보세요.",
    travelTimeText: "약 3시간 30분",
    isHiddenGem: true,
    rating: 4.7,
    reviewCount: 1284,
    scene: "sea",
    schedule: [
      { period: "오전", title: "저동항 산책", description: "항구를 따라 걸으며 섬의 아침 공기를 느껴보세요." },
      { period: "점심", title: "울릉도 홍합밥", description: "명이나물과 함께하는 든든한 섬 음식 한 상." },
      { period: "오후", title: "나리분지 트레킹", description: "화산이 만든 분지를 가볍게 걸으며 자연을 만나요." },
      { period: "저녁", title: "도동항 노을", description: "방파제에 앉아 섬 너머로 지는 해를 바라보세요." },
    ],
    hiddenPlaces: [
      { name: "통구미 향나무 자생지", tag: "자연" },
      { name: "남양 해안 산책로", tag: "산책" },
      { name: "울릉도 둘레길", tag: "로컬" },
      { name: "나리분지 전망대", tag: "전망" },
      { name: "현포 해변", tag: "해변" },
    ],
  },
  {
    id: "gangneung-beach",
    name: "강릉 안목해변",
    region: "강원도 강릉시",
    image: "/images/destinations/gangneung-beach.jpg",
    themes: ["sea", "vibe"],
    tags: ["바다", "카페", "감성"],
    shortDescription: "파도 소리와 커피 향이 함께 흐르는 바닷가.",
    tagline: "커피 향 가득한 바닷가",
    story: "파도 소리를 들으며 커피 한 잔. 안목해변에서 느긋한 하루를 보내보세요.",
    travelTimeText: "약 2시간 40분",
    isHiddenGem: false,
    rating: 4.5,
    reviewCount: 3562,
    scene: "sea",
    schedule: [
      { period: "오전", title: "안목해변 산책", description: "모래사장을 따라 걸으며 바닷바람을 맞아보세요." },
      { period: "점심", title: "초당순두부", description: "강릉을 대표하는 부드러운 순두부 한 그릇." },
      { period: "오후", title: "커피거리 투어", description: "바다를 보며 즐기는 스페셜티 커피 한 잔." },
      { period: "저녁", title: "안목해변 노을", description: "해변 전망대에서 붉게 물드는 하늘을 감상하세요." },
    ],
    hiddenPlaces: [
      { name: "안목 커피거리", tag: "카페" },
      { name: "강문 솟대다리", tag: "전망" },
      { name: "송정 솔숲길", tag: "산책" },
      { name: "순긋해변", tag: "해변" },
      { name: "사천 물회마을", tag: "로컬" },
    ],
  },
  {
    id: "jeonju-hanok",
    name: "전주 한옥마을",
    region: "전라북도 전주시",
    image: "/images/destinations/jeonju-hanok.jpg",
    themes: ["history", "vibe"],
    tags: ["한옥", "전통", "골목"],
    shortDescription: "골목마다 전통의 온기가 배어 있는 마을.",
    tagline: "골목마다 스민 전통의 온기",
    story: "기와 지붕 사이 좁은 골목을 걸으며 전주의 하루를 담아보세요.",
    travelTimeText: "약 2시간 20분",
    isHiddenGem: false,
    rating: 4.6,
    reviewCount: 5210,
    scene: "town",
    schedule: [
      { period: "오전", title: "한옥마을 골목 산책", description: "기와지붕이 이어지는 골목을 천천히 걸어보세요." },
      { period: "점심", title: "전주비빔밥", description: "전주에서만 느낄 수 있는 정갈한 비빔밥 한 상." },
      { period: "오후", title: "경기전 · 전동성당", description: "역사와 근대 건축이 함께 있는 풍경을 둘러보세요." },
      { period: "저녁", title: "남부시장 청년몰", description: "야시장 불빛 아래 다양한 먹거리를 즐겨보세요." },
    ],
    hiddenPlaces: [
      { name: "자만벽화마을", tag: "골목" },
      { name: "오목대", tag: "전망" },
      { name: "남부시장 청년몰", tag: "로컬" },
      { name: "향교 은행나무길", tag: "산책" },
      { name: "전동성당", tag: "전망" },
    ],
  },
  {
    id: "seoraksan",
    name: "설악산 울산바위",
    region: "강원도 속초시",
    image: "/images/destinations/seoraksan.jpg",
    themes: ["nature", "activity"],
    tags: ["산", "트레킹", "전망"],
    shortDescription: "능선을 타고 오르면 만나는 압도적인 풍경.",
    tagline: "구름 위로 오르는 능선",
    story: "가파른 계단 끝에서 만나는 탁 트인 풍경. 오늘은 설악의 바람을 느껴보세요.",
    travelTimeText: "약 2시간 50분",
    isHiddenGem: false,
    rating: 4.8,
    reviewCount: 2740,
    scene: "mountain",
    schedule: [
      { period: "오전", title: "신흥사 숲길", description: "울창한 숲길을 지나며 산의 기운을 느껴보세요." },
      { period: "점심", title: "속초 산채정식", description: "산에서 나는 재료로 차린 건강한 한 끼." },
      { period: "오후", title: "울산바위 등반", description: "가파른 계단을 올라 압도적인 전망을 만나보세요." },
      { period: "저녁", title: "속초해변 노을", description: "산행 후 바다를 보며 하루를 마무리해보세요." },
    ],
    hiddenPlaces: [
      { name: "흔들바위", tag: "전망" },
      { name: "비룡폭포", tag: "자연" },
      { name: "신흥사 숲길", tag: "산책" },
      { name: "권금성 전망대", tag: "전망" },
      { name: "울산바위 능선", tag: "자연" },
    ],
  },
  {
    id: "taean-beach",
    name: "태안 청포대 해변",
    region: "충청남도 태안군",
    image: "/images/destinations/taean-beach.jpg",
    themes: ["sea", "nature"],
    tags: ["해변", "노을", "한적함"],
    shortDescription: "인파 없이 조용히 노을을 담을 수 있는 해변.",
    tagline: "노을이 조용히 지는 해변",
    story: "인파 없는 백사장에서 노을을 담아보세요. 태안의 하루가 천천히 흘러갑니다.",
    travelTimeText: "약 2시간",
    isHiddenGem: true,
    rating: 4.4,
    reviewCount: 986,
    scene: "sea",
    schedule: [
      { period: "오전", title: "청포대 갯벌 체험", description: "조용한 갯벌을 걸으며 여유를 즐겨보세요." },
      { period: "점심", title: "태안 꽃게탕", description: "싱싱한 서해안 꽃게로 끓인 얼큰한 한 그릇." },
      { period: "오후", title: "신두리 사구", description: "국내 최대 규모의 해안사구를 둘러보세요." },
      { period: "저녁", title: "청포대 노을", description: "인파 없는 백사장에서 붉은 노을을 담아보세요." },
    ],
    hiddenPlaces: [
      { name: "청포대 갯벌", tag: "자연" },
      { name: "몽산포 솔숲", tag: "산책" },
      { name: "안면도 꽃지해변", tag: "해변" },
      { name: "바람아래 해변", tag: "해변" },
      { name: "신두리 사구", tag: "전망" },
    ],
  },
  {
    id: "damyang-forest",
    name: "담양 죽녹원",
    region: "전라남도 담양군",
    image: "/images/destinations/damyang-forest.jpg",
    themes: ["nature", "vibe"],
    tags: ["대숲", "산책", "힐링"],
    shortDescription: "대숲 사이로 바람이 지나는 초록빛 산책길.",
    tagline: "바람이 지나는 초록빛 대숲",
    story: "대나무 사이로 스미는 햇살을 따라 걷다 보면 마음이 맑아져요.",
    travelTimeText: "약 3시간",
    isHiddenGem: true,
    rating: 4.6,
    reviewCount: 1830,
    scene: "mountain",
    schedule: [
      { period: "오전", title: "죽녹원 산책", description: "빽빽한 대숲 사이로 난 길을 천천히 걸어보세요." },
      { period: "점심", title: "담양 떡갈비", description: "숯불에 구운 담양 대표 떡갈비 한 상." },
      { period: "오후", title: "관방제림", description: "오래된 나무들이 늘어선 제방길을 걸어보세요." },
      { period: "저녁", title: "메타세쿼이아길", description: "가로수길을 따라 걸으며 하루를 마무리해요." },
    ],
    hiddenPlaces: [
      { name: "메타세쿼이아길", tag: "산책" },
      { name: "관방제림", tag: "산책" },
      { name: "죽녹원 전망대", tag: "전망" },
      { name: "창평 슬로시티 골목", tag: "골목" },
      { name: "담양 국수거리", tag: "로컬" },
    ],
  },
  {
    id: "yeosu-night",
    name: "여수 이순신광장",
    region: "전라남도 여수시",
    image: "/images/destinations/yeosu-night.jpg",
    themes: ["vibe", "sea"],
    tags: ["밤바다", "야경", "낭만"],
    shortDescription: "밤바다 위로 반짝이는 불빛이 낭만을 더하는 항구.",
    tagline: "밤바다에 스며드는 낭만",
    story: "야경이 물드는 바닷가를 걸으며 여수의 밤을 만끽해보세요.",
    travelTimeText: "약 3시간 10분",
    isHiddenGem: false,
    rating: 4.5,
    reviewCount: 4120,
    scene: "sea",
    schedule: [
      { period: "오전", title: "종포해양공원", description: "바다를 바라보며 여유로운 아침을 시작해보세요." },
      { period: "점심", title: "여수 갓김치 백반", description: "여수의 향토 밥상을 든든하게 즐겨보세요." },
      { period: "오후", title: "고소동 벽화마을", description: "알록달록한 벽화 골목을 산책해보세요." },
      { period: "저녁", title: "낭만포차 야경", description: "밤바다 불빛과 함께 여수의 밤을 즐겨보세요." },
    ],
    hiddenPlaces: [
      { name: "고소동 벽화마을", tag: "골목" },
      { name: "장군도 산책로", tag: "산책" },
      { name: "종포해양공원", tag: "전망" },
      { name: "여수 낭만포차", tag: "로컬" },
      { name: "돌게 방파제", tag: "해변" },
    ],
  },
  {
    id: "boseong-tea",
    name: "보성 대한다원",
    region: "전라남도 보성군",
    image: "/images/destinations/boseong-tea.jpg",
    themes: ["nature", "vibe"],
    tags: ["차밭", "초록", "고요함"],
    shortDescription: "초록빛 차밭 능선이 끝없이 펼쳐지는 고요한 아침.",
    tagline: "초록빛 능선의 고요한 아침",
    story: "가지런히 물결치는 차밭 사이를 걸으며 마음의 속도를 늦춰보세요.",
    travelTimeText: "약 3시간 20분",
    isHiddenGem: true,
    rating: 4.7,
    reviewCount: 1502,
    scene: "mountain",
    schedule: [
      { period: "오전", title: "대한다원 차밭길", description: "물결치는 초록 능선 사이를 걸으며 하루를 열어요." },
      { period: "점심", title: "보성 녹차 삼합", description: "녹차로 키운 돼지고기와 함께하는 특별한 한 상." },
      { period: "오후", title: "봇재 다향각", description: "차밭 전경을 한눈에 담을 수 있는 전망대." },
      { period: "저녁", title: "율포 해수녹차탕", description: "녹차 성분이 담긴 해수탕에서 여독을 풀어보세요." },
    ],
    hiddenPlaces: [
      { name: "율포solar해수녹차탕", tag: "로컬" },
      { name: "봇재 다향각", tag: "전망" },
      { name: "삼나무 숲길", tag: "산책" },
      { name: "제암산 자연휴양림", tag: "자연" },
      { name: "보성 녹차밭 전망대", tag: "전망" },
    ],
  },
];

/** API로 받아온 실제 여행지 — 조회 시 mock보다 먼저 사용한다 */
const runtimeDestinations = new Map<string, Destination>();

export function registerDestinations(list: Destination[]): void {
  list.forEach((d) => runtimeDestinations.set(d.id, d));
}

export function updateDestination(id: string, patch: Partial<Destination>): void {
  const current = runtimeDestinations.get(id) ?? DESTINATIONS.find((d) => d.id === id);
  if (current) runtimeDestinations.set(id, { ...current, ...patch });
}

export function getDestinationById(id: string): Destination | undefined {
  return runtimeDestinations.get(id) ?? DESTINATIONS.find((d) => d.id === id);
}
