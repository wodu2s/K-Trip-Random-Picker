import { Destination } from '../types/destination';
import { TripFormState, Duration } from '../types/trip';
import { RecommendationType } from './recommendationType';

export interface PlaceProfile {
  isSea: boolean;
  isIsland: boolean;
  isBeach: boolean;
  isHarbor: boolean;
  isNature: boolean;
  isMountain: boolean;
  isLake: boolean;
  isCulture: boolean;
  isHistory: boolean;
  isIndoor: boolean;
  isAquarium: boolean;
  isFood: boolean;
  isCafeStreet: boolean;
  isCityWalk: boolean;
  isRemote: boolean;
  isTemple: boolean;
}

export function buildPlaceProfile(
  dest: Destination,
  prefs: TripFormState,
  recType: RecommendationType
): PlaceProfile {
  const text = (
    dest.title +
    ' ' +
    (dest.address ?? '') +
    ' ' +
    dest.summary +
    ' ' +
    (dest.detail?.overview ?? '') +
    ' ' +
    dest.themes.join(' ')
  ).toLowerCase(); // recType과 prefs.theme은 보조적인 힌트로만 사용

  const isSea = /바다|해변|해수욕장|항구|포구|등대|섬|해안|갯벌|해양|오션/.test(text);
  const isCafeStreet = /카페거리|카페|골목|거리|상수동|성수|연남|익선|감성/.test(text);
  const isCulture = /역사|문화재|유적|향교|사찰|궁|성|박물관|미술관|전시|기념관|서원|사지/.test(text);
  const isNature = /자연|숲|산|공원|호수|계곡|수목원|국립공원/.test(text);
  const isIndoor = /아쿠아리움|수족관|체험관|과학관|전시관|실내|테마파크/.test(text);
  const isTemple = /사찰|절|암자|정사|사지|고즈넉|조용|명상/.test(text) || text.endsWith('절') || text.endsWith('사');

  return {
    isSea,
    isIsland: /섬|선착장|배|여객선|도선/.test(text),
    isBeach: /해변|해수욕장|바닷가|백사장/.test(text),
    isHarbor: /항구|포구|선착장|방파제|어촌/.test(text),
    isNature,
    isMountain: /산|등산|봉우리|오름|계곡|국립공원/.test(text),
    isLake: /호수|저수지|강변|수변/.test(text),
    isCulture,
    isHistory: isCulture,
    isIndoor,
    isAquarium: /아쿠아리움|수족관|해양생물/.test(text),
    isFood: /맛집|음식|시장|먹거리|장터/.test(text) || isCafeStreet,
    isCafeStreet,
    isCityWalk: isCafeStreet || /도심|광장|쇼핑/.test(text),
    isRemote: /마을|숨은|한적한|조용한/.test(text) || (dest.distanceKm != null && dest.distanceKm > 100),
    isTemple,
  };
}

export function buildDynamicActivities(profile: PlaceProfile): string[] {
  const activities = new Set<string>();

  if (profile.isCafeStreet || profile.isCityWalk) {
    activities.add('카페 둘러보기');
    activities.add('골목 산책하기');
    activities.add('사진 남기기');
    activities.add('로컬 분위기 느끼기');
  } else if (profile.isCulture || profile.isHistory) {
    activities.add('역사 이야기 알아보기');
    activities.add('문화 공간 살펴보기');
    activities.add('조용히 산책하기');
    activities.add('사진 남기기');
  } else if (profile.isIndoor || profile.isAquarium) {
    activities.add('실내 전시 둘러보기');
    activities.add('체험 활동 즐기기');
    activities.add('가족 나들이');
    activities.add('근처 카페 들르기');
  } else if (profile.isHarbor) {
    activities.add('항구 산책');
    activities.add('바닷가 분위기 느끼기');
    activities.add('해산물 맛집 찾기');
    activities.add('근처 카페 들르기');
  } else if (profile.isBeach || profile.isSea) {
    activities.add('해변 산책하기');
    activities.add('바다 바람 쐬기');
    activities.add('노을 감상하기');
    activities.add('바다 사진 남기기');
  } else if (profile.isNature || profile.isMountain || profile.isLake) {
    activities.add('숲길 걷기');
    activities.add('자연 풍경 감상하기');
    activities.add('가볍게 트레킹하기');
    activities.add('사진 남기기');
  } else {
    // 기본 폴백
    activities.add('주변 명소 둘러보기');
    activities.add('로컬 먹거리 찾기');
    activities.add('사진 남기기');
    activities.add('가볍게 걷기');
  }

  // 중복 제거 후 3~4개만 선택
  return Array.from(activities).slice(0, 4);
}

export function buildDynamicPersonas(profile: PlaceProfile): string[] {
  const personas = new Set<string>();

  if (profile.isCafeStreet || profile.isCityWalk) {
    personas.add('카페와 골목 분위기를 함께 즐기고 싶은 사람');
    personas.add('멀리 가지 않고 감성적인 산책을 하고 싶은 사람');
  } else if (profile.isCulture || profile.isHistory) {
    personas.add('조용히 의미 있는 장소를 둘러보고 싶은 사람');
    personas.add('역사와 문화 이야기를 좋아하는 사람');
  } else if (profile.isBeach || profile.isSea || profile.isHarbor) {
    personas.add('바다를 보며 쉬고 싶은 사람');
    personas.add('사진과 노을 분위기를 좋아하는 사람');
  } else if (profile.isNature || profile.isMountain) {
    personas.add('숲과 풍경 속에서 쉬고 싶은 사람');
    personas.add('복잡한 일정 없이 산책하고 싶은 사람');
  } else if (profile.isIndoor || profile.isAquarium) {
    personas.add('날씨와 상관없이 즐길 곳을 찾는 사람');
    personas.add('가족이나 친구와 함께 체험형 일정을 원하는 사람');
  }

  if (personas.size === 0) {
    personas.add('새로운 풍경을 만나고 싶은 사람');
    personas.add('소중한 사람과 함께 즐거운 시간을 보내고 싶은 사람');
  }

  return Array.from(personas).slice(0, 2);
}

export function buildDynamicChecklistHints(
  profile: PlaceProfile,
  duration: Duration,
  distanceKm?: number
): { travelTime: string; stayTime: string; returnCheck: string; stayCheck: string; extraTips: string[] } {
  // 기본값 (폴백)
  let travelTime = '카카오맵에서 이동 경로를 확인해보세요.';
  let stayTime = '가볍게 다녀오기 좋은 일정이에요.';
  let returnCheck = '주변 명소를 함께 둘러보세요.';
  let stayCheck = '호텔, 펜션 등 숙소를 미리 검색해 보세요.';
  let extraTips: string[] = [];

  // 거리/기간에 따른 기본 stayTime/travelTime 설정
  if (duration === 'day') {
    if (distanceKm != null && distanceKm >= 100) {
      travelTime = '이동 시간을 먼저 확인하고 여유 있게 출발해보세요.';
      stayTime = '당일 일정이니 귀가 시간을 고려해 계획하세요.';
    } else {
      travelTime = '가까운 거리라 부담 없이 다녀올 수 있어요.';
      stayTime = '가볍게 다녀오기 좋은 일정이에요.';
    }
  } else {
    // 1박 2일
    if (distanceKm != null && distanceKm >= 100) {
      stayTime = '1박 2일로 여유롭게 다녀오기 좋아요.';
    } else {
      stayTime = '근처에서 여유로운 1박 2일을 보내기 좋아요.';
    }
    stayCheck = '숙소 위치와 체크인 시간을 확인해보세요.';
  }

  // 장소 특성별 가이드 적용 (우선순위: 도심 > 바다 > 문화 > 실내 > 자연)
  if (duration === 'overnight') {
    if (profile.isTemple || profile.isCulture || profile.isHistory) {
      travelTime = '첫날 이동 시간을 확인하고 주변 문화 공간과 함께 동선을 잡아보세요.';
      stayTime = '조용한 분위기와 장소의 이야기를 함께 살펴보세요.';
      returnCheck = '근처 산책지나 카페를 함께 묶으면 일정이 더 자연스러워요.';
      extraTips = ['운영 시간, 휴무일, 예절이 필요한 공간인지 확인해보세요.'];
    } else if (profile.isCafeStreet || profile.isCityWalk || profile.isRemote) {
      travelTime = '너무 빡빡한 일정 대신 여유 있는 동선으로 잡아보세요.';
      stayTime = '사진을 남기기 좋은 시간대와 주변 분위기를 함께 살펴보세요.';
      returnCheck = '근처 카페나 조용한 산책 장소를 함께 저장해보세요.';
      extraTips = ['주말 혼잡도와 운영 시간을 확인해보세요.'];
    } else if (profile.isBeach || profile.isSea || profile.isHarbor) {
      travelTime = '해안 주변 주차 위치와 이동 시간을 먼저 확인해보세요.';
      stayTime = '노을 시간대에 맞추면 바다 분위기가 더 좋아요.';
      returnCheck = '근처 카페나 해변 산책 코스를 함께 묶어보세요.';
      extraTips = ['바람이나 날씨에 따라 체감이 달라질 수 있어요.'];
    } else if (profile.isNature || profile.isMountain || profile.isLake) {
      travelTime = '산책로 입구와 주차 위치를 미리 확인해보세요.';
      stayTime = '걷는 시간이 길 수 있으니 여유 있게 일정을 잡아보세요.';
      returnCheck = '주변 전망지나 카페를 함께 묶어보세요.';
      extraTips = ['날씨와 신발, 물을 챙기면 좋아요.'];
    } else if (profile.isIndoor || profile.isAquarium) {
      travelTime = '방문 시간대와 대기 시간을 미리 확인해보세요.';
      stayTime = '전시나 체험 프로그램을 함께 확인해보세요.';
      returnCheck = '근처 실내 공간이나 식당을 함께 묶어보세요.';
      extraTips = ['사전 예약이 필요한지 확인해보세요.'];
    }
  } else {
    if (profile.isCafeStreet || profile.isCityWalk) {
      travelTime = '카카오맵에서 가까운 이동 경로를 확인해보세요.';
      stayTime = '카페와 골목길을 함께 둘러보면 좋아요.';
      returnCheck = '근처 맛집이나 카페를 함께 저장해보세요.';
      extraTips.push('주말에는 사람이 많을 수 있어요.');
    } else if (profile.isBeach || profile.isSea || profile.isHarbor) {
      travelTime = '해안도로와 주차 위치를 미리 확인해보세요.';
      stayTime = '노을 시간대에 맞추면 분위기가 더 좋아요.';
      returnCheck = '근처 카페나 해변 산책 코스를 함께 묶어보세요.';
      extraTips.push('바람이나 날씨에 따라 체감이 달라질 수 있어요.');
    } else if (profile.isCulture || profile.isHistory) {
      travelTime = '주변 문화 공간과 함께 동선을 잡아보세요.';
      stayTime = '장소의 역사적 배경을 알고 가면 더 의미 있어요.';
      extraTips.push('운영 시간과 휴관일을 확인해보세요.');
    } else if (profile.isIndoor || profile.isAquarium) {
      travelTime = '방문 시간대와 대기 시간을 미리 확인해보세요.';
      stayTime = '전시나 체험 프로그램을 함께 확인해보세요.';
      extraTips.push('사전 예약이 필요한지 확인해보세요.');
    } else if (profile.isNature || profile.isMountain) {
      travelTime = '카카오맵에서 주차장 위치를 확인해보세요.';
      stayTime = '편안한 신발을 신고 여유롭게 둘러보세요.';
      returnCheck = '근처 자연 경관을 따라 걷는 코스를 추천해요.';
    }
  }

  // 배편 등 추가 예외 팁
  if (profile.isIsland) {
    extraTips.push('방문 전 확인: 배편이나 운항 여부를 반드시 확인하세요.');
  }

  return { travelTime, stayTime, returnCheck, stayCheck, extraTips };
}

export function getDestinationStory(
  dest: Destination,
  prefs: TripFormState,
  recType: RecommendationType
): string {
  // 우선순위 1, 2: overview (detail.overview)
  // 우선순위 3: summary
  const rawText = dest.overview || dest.detail?.overview || dest.summary;
  
  let validOverview = '';
  if (rawText && rawText.length > 20 && !rawText.includes('추천 관광지입니다')) {
    const cleanOverview = rawText
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z]+;/g, '')
      .replace(/[^\w\s가-힣.,!?()~-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const sentences = cleanOverview.split(/(?<=[.!?])\s+/).filter((s: string) => s.length > 5);
    
    if (sentences.length > 0) {
      const snippet = sentences.slice(0, 3).join(' ');
      validOverview = snippet.length > 200 ? snippet.slice(0, 197) + '...' : snippet;
    }
  }

  if (validOverview) return validOverview;

  const profile = buildPlaceProfile(dest, prefs, recType);
  const locationText = dest.address ? `${dest.address}에 있는` : '매력적인';

  if (profile.isIsland) {
    return `${dest.title}은(는) 섬과 바다 풍경을 함께 느낄 수 있는 여행지예요. 이동 시간이 길거나 배편 확인이 필요할 수 있어 방문 전 교통편과 복귀 시간을 먼저 확인하는 것이 좋아요.`;
  }
  if (profile.isSea || profile.isBeach || profile.isHarbor) {
    return `${dest.title}은(는) ${locationText} 해변 여행지예요. 바다 풍경과 해안 산책을 함께 즐기기 좋고, 탁 트인 풍경을 선호하는 사람에게 잘 맞아요. 방문 전 날씨와 이동 동선을 함께 확인하면 더 안정적으로 다녀올 수 있어요.`;
  }
  if (profile.isTemple) {
    return `${dest.title}은(는) 조용히 둘러보며 차분한 분위기를 느끼기 좋은 장소예요. 도심에서 멀지 않지만 잠시 일상에서 벗어난 느낌을 받을 수 있고, 주변 산책지나 카페와 함께 묶기 좋아요.`;
  }
  if (profile.isCulture || profile.isHistory) {
    return `${dest.title}은(는) 지역의 역사와 이야기를 살펴볼 수 있는 장소예요. 조용히 둘러보며 의미 있는 시간을 보내기 좋고, 주변 문화 공간과 함께 여유롭게 보기 좋아요.`;
  }
  if (profile.isNature || profile.isMountain || profile.isLake) {
    return `${dest.title}은(는) 자연 풍경을 천천히 둘러보기 좋은 여행지예요. 숲길이나 산책로를 따라 걷고, 주변 명소와 함께 여유롭게 쉬어가기 좋아요. 편안한 신발을 준비하시면 더 좋습니다.`;
  }
  if (profile.isCafeStreet || profile.isCityWalk || profile.isRemote) {
    return `${dest.title}은(는) 잘 알려진 관광지보다 조용한 분위기를 즐기기 좋은 장소예요. 사람이 많은 곳보다 한적한 동네 산책이나 사진을 남기는 여행을 좋아하는 사람에게 잘 어울려요.`;
  }
  if (profile.isIndoor || profile.isAquarium) {
    return `${dest.title}은(는) 실내에서 전시나 체험을 즐길 수 있는 장소예요. 날씨와 상관없이 방문하기 좋고, 가족이나 친구와 함께 둘러보기 좋아요.`;
  }

  return `${dest.title} 주변의 분위기를 느끼며 가볍게 쉬어갈 수 있는 여행지예요. 카카오맵에서 주변 식당과 카페를 찾아 함께 동선을 구성해보세요.`;
}
