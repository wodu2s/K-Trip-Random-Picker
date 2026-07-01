import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import { RecommendationType } from './recommendationType';

export function buildRecommendationExplanation(
  destination: Destination,
  prefs: TripFormState,
): string[] {
  const lines: string[] = [];
  const themeText = prefs.theme === 'all' ? '' : prefs.theme;
  
  if (themeText) {
    lines.push(`선택한 ${themeText} 테마와 잘 맞는 곳인지 먼저 확인했어요.`);
  }

  if (destination.distanceKm != null) {
    const distText = destination.distanceKm < 30 ? '가까운' : `약 ${Math.round(destination.distanceKm)}km`;
    lines.push(`현재 위치에서 ${distText} 거리라 이동 가능한지 살펴봤어요.`);
  }

  if (destination.dataSource === 'KTO_OPEN_API') {
    const d = destination.detail;
    const hasInfo = !!(d?.useTime || d?.parking || d?.infoCenter || d?.restDate);
    if (hasInfo) {
      lines.push('관광공사 데이터에서 운영 시간이나 주차 등 기본 정보를 확인했어요.');
    } else {
      lines.push('관광공사 공식 정보에 등록된 여행지인지 확인했어요.');
    }
  }

  const d = destination.detail;
  const hasCourse = (d?.nearbyAttractions?.length ?? 0) > 0 || (d?.nearbyCafes?.length ?? 0) > 0 || (d?.nearbyRestaurants?.length ?? 0) > 0;
  
  if (hasCourse) {
    lines.push('지도 데이터에서 주변 식당이나 카페 등 코스를 묶어볼 수 있는지 확인했어요.');
  } else if (destination.latitude && destination.longitude) {
    lines.push('지도 데이터에서 위치와 주변 환경을 확인했어요.');
  }

  if (destination.imageUrl || (d?.images && d.images.length > 0)) {
    if (lines.length < 4) {
      lines.push('실제 사진이 있어 방문 전 분위기를 미리 볼 수 있는 곳을 골랐어요.');
    }
  }

  return lines.slice(0, 4);
}

export function buildTargetPersona(
  destination: Destination,
  prefs: TripFormState,
  recType: RecommendationType,
): string[] {
  const personas: string[] = [];

  if (prefs.transportMode === 'local') {
    if (prefs.duration === 'day') {
      personas.push('주말에 멀리 가지 않고 기분 전환하고 싶은 사람');
    } else {
      personas.push('가까운 곳에서 여유롭게 1박 2일 일정을 보내고 싶은 사람');
    }
  } else {
    personas.push('조금 멀더라도 새로운 풍경을 만나고 싶은 사람');
  }

  const typePersonas: Record<RecommendationType, string> = {
    '도심 산책형': '도심 속에서 가볍게 걸으며 빌딩 숲 속 여유를 맛보고 싶은 사람',
    '문화 탐방형': '역사와 이야기를 따라 걷는 역사·문화 공간을 좋아하는 사람',
    '자연 휴식형': '숲과 풍경을 보며 자연 속에서 머리를 식히고 싶은 사람',
    '사진 기록형': '분위기 좋은 스팟에서 인상적인 장면을 남기고 싶은 사람',
    '로컬 감성형': '동네의 아기자기한 골목과 예쁜 카페를 찾아다니기 좋아하는 사람',
    '바다 드라이브형': '탁 트인 바다 전망을 마주하며 드라이브로 힐링하고 싶은 사람',
    '가족 나들이형': '남녀노소 누구와 가도 부담 없이 웃으며 즐길 수 있는 코스를 찾는 사람',
    '숨은 명소형': '잘 알려지지 않은 한적하고 고요한 장소에서 사색을 즐기고 싶은 사람',
    '실내 체험형': '날씨와 상관없이 실내에서 다양하고 유익한 체험을 즐기고 싶은 사람',
    // 자연 서브
    '숲길 산책형': '나무 향기를 맡으며 숲길을 천천히 걷고 싶은 사람',
    '국립공원형': '장엄한 자연 풍경 속에서 가벼운 트레킹을 즐기고 싶은 사람',
    '풍경 사진형': '아름다운 풍경을 카메라에 온전히 담아내고 싶은 사람',
    '호수·강변형': '잔잔한 물결을 바라보며 평화롭게 산책하고 싶은 사람',
    '자연 가족나들이형': '가족들과 함께 탁 트인 자연 속에서 즐거운 하루를 보내고 싶은 사람',
    // 문화 서브
    '역사 산책형': '역사가 깃든 장소를 걸으며 과거의 이야기를 상상해보고 싶은 사람',
    '전시 관람형': '예술과 문화가 숨 쉬는 공간에서 영감을 얻고 싶은 사람',
    '고궁·유적형': '고즈넉한 고궁의 아름다움과 옛 정취를 느껴보고 싶은 사람',
    // 바다 서브
    '해변 산책형': '파도 소리를 들으며 모래사장을 맨발로 걷고 싶은 사람',
    '항구 감성형': '활기찬 항구의 분위기와 싱싱한 바다 내음을 좋아하는 사람',
    '섬·갯벌 체험형': '육지를 벗어나 섬만의 독특하고 신비로운 풍경을 만나고 싶은 사람',
    '바다 사진형': '끝없이 펼쳐진 바다와 붉은 노을을 사진으로 간직하고 싶은 사람',
    // 맛집 서브
    '로컬 맛집형': '그 지역에서만 맛볼 수 있는 숨은 찐 맛집을 찾아다니는 사람',
    '카페 투어형': '특색 있는 디저트와 향긋한 커피가 있는 카페를 순례하고 싶은 사람',
    '시장 먹거리형': '왁자지껄한 시장에서 길거리 음식을 이것저것 맛보고 싶은 사람',
    '식사+산책형': '맛있는 식사 후 기분 좋게 주변을 거닐며 소화시키고 싶은 사람',
    // 감성 서브
    '골목 산책형': '좁은 골목길 사이사이 숨겨진 아날로그 감성을 발견하고 싶은 사람',
    '카페 감성형': '분위기 있는 공간에서 음악을 들으며 나만의 시간을 보내고 싶은 사람',
    '고즈넉한 산책형': '한적하고 평화로운 분위기 속에서 조용히 거닐고 싶은 사람',
    '사진 명소형': '마음에 드는 인생 사진을 남기고 풍경을 즐기고 싶은 사람',
    '야경 감상형': '어둠이 내린 후 더 아름답게 빛나는 야경을 감상하고 싶은 사람',
    // 액티비티 서브
    '테마파크형': '놀이기구와 퍼레이드가 주는 환상적인 즐거움을 만끽하고 싶은 사람',
    '체험 활동형': '직접 몸으로 부딪히며 새롭고 활동적인 경험을 해보고 싶은 사람',
  };

  if (typePersonas[recType]) {
    personas.push(typePersonas[recType]);
  } else {
    personas.push('이곳만의 특별한 매력을 발견하고 싶은 사람');
  }

  return personas.slice(0, 3);
}

export function buildActivities(
  recType: RecommendationType,
): string[] {
  const activities: Record<RecommendationType, string[]> = {
    '도심 산책형': ['도심 속 가볍게 걷기', '빌딩 숲 사이 녹지 찾기', '가볍게 쉬어가기'],
    '문화 탐방형': ['역사·문화 공간', '천천히 둘러보기', '가볍게 걷기'],
    '자연 휴식형': ['자연 풍경 감상하기', '여유롭게 쉬어가기', '가볍게 걷기'],
    '사진 기록형': ['사진 남기기', '풍경 감상하기', '분위기 보기'],
    '로컬 감성형': ['동네 분위기 느끼기', '주변 카페 찾기', '가볍게 걷기'],
    '바다 드라이브형': ['해변 산책하기', '바다 바람 쐬기', '해안도로 드라이브'],
    '가족 나들이형': ['누구와 가도 좋은 나들이', '체험 거리 즐기기', '가벼운 산책'],
    '숨은 명소형': ['조용히 둘러보기', '나만의 스팟 찾기', '사색의 시간 갖기'],
    '실내 체험형': ['해양 생물 전시 보기', '실내 전시 둘러보기', '가족 나들이', '근처 카페 들르기'],
    // 자연 서브
    '숲길 산책형': ['숲길 산책', '피톤치드 힐링', '가벼운 걷기'],
    '국립공원형': ['트레킹', '자연 경관 감상', '사진 촬영'],
    '풍경 사진형': ['멋진 뷰 감상', '인생 사진 찍기', '경치 즐기기'],
    '호수·강변형': ['물길 따라 산책', '물멍 하기', '여유로운 휴식'],
    '자연 가족나들이형': ['가족 피크닉', '자연 관찰', '야외 활동'],
    // 문화 서브
    '역사 산책형': ['역사 유적 탐방', '옛터 걷기', '전통 감상'],
    '전시 관람형': ['전시물 관람', '작품 감상', '문화 생활'],
    '고궁·유적형': ['고궁 거닐기', '전통 건축 감상', '역사 사진 남기기'],
    // 바다 서브
    '해변 산책형': ['해안가 걷기', '파도 소리 듣기', '바다 감상'],
    '항구 감성형': ['항구 풍경 감상', '갈매기 구경', '해산물 구경'],
    '섬·갯벌 체험형': ['섬 속 탐험', '배 타보기', '해안 절경 감상'],
    '바다 사진형': ['바다 풍경 촬영', '오션뷰 즐기기', '해돋이/일몰 감상'],
    // 맛집 서브
    '로컬 맛집형': ['동네 맛집 탐방', '특산물 맛보기', '식도락 즐기기'],
    '카페 투어형': ['시그니처 메뉴 맛보기', '카페 공간 즐기기', '인증샷 남기기'],
    '시장 먹거리형': ['시장 구경', '길거리 음식 먹기', '현지 분위기 느끼기'],
    '식사+산책형': ['맛있는 한 끼', '주변 가볍게 걷기', '가게 구경'],
    // 감성 서브
    '골목 산책형': ['골목 탐험', '아기자기한 숍 구경', '동네 감성 느끼기'],
    '카페 감성형': ['분위기 즐기기', '여유롭게 책 읽기', '감성 사진 찍기'],
    '고즈넉한 산책형': ['조용히 걷기', '한적함 느끼기', '차분하게 쉬어가기'],
    '사진 명소형': ['인생 사진 남기기', '풍경 감상하기', '예쁜 뷰 즐기기'],
    '야경 감상형': ['야경 구경하기', '불빛 감상하기', '밤 산책'],
    // 액티비티 서브
    '테마파크형': ['놀이기구 타기', '테마 존 즐기기', '퍼레이드 구경'],
    '체험 활동형': ['새로운 체험 해보기', '활동적으로 움직이기', '기념품 만들기'],
  };

  return activities[recType] || ['가볍게 걷기', '사진 남기기', '주변 카페 들르기'];
}

export function buildPreVisitTips(
  destination: Destination,
): string[] {
  // TODO(Future Enhancement): 기상청 단기예보 API 연동
  // 바다/자연/야외 여행지 방문 팁 강화를 위해 향후 기상청 API 연동 고려
  // - 강수확률, 바람, 기온 기반 방문 팁 동적 생성
  // - 위경도 좌표를 기상청 XY 격자로 변환하는 로직 필요
  // - 현재 작업에서는 구현하지 않음 (API 연동 없이 고정 팁만 반환)

  const tips: string[] = [];
  const text = (destination.title + ' ' + destination.summary + ' ' + (destination.detail?.overview ?? '')).toLowerCase();

  if (/바다|해변|해수욕장|항구/.test(text)) {
    tips.push('노을 시간대에 맞추면 바다 분위기가 더 좋아요.');
    tips.push('바람이 강한 날에는 체감 온도가 달라질 수 있어요.');
    if (!destination.detail?.parking) {
      tips.push('해안 주변 주차 위치를 미리 확인해보세요.');
    }
  } else if (/사찰|문화재|유적|고궁/.test(text)) {
    if (!destination.detail?.useTime || !destination.detail?.restDate) {
      tips.push('운영 시간과 휴무일을 먼저 확인해보세요.');
    }
    tips.push('조용한 공간일 수 있어 방문 예절을 확인하면 좋아요.');
    tips.push('주변 문화 공간이나 산책지와 함께 묶어보세요.');
  } else if (/자연|숲|산|국립공원|수목원/.test(text)) {
    tips.push('걷는 시간이 길 수 있으니 편한 신발을 준비하세요.');
    tips.push('날씨에 따라 체감 난이도가 달라질 수 있어요.');
    if (!destination.detail?.parking) {
      tips.push('산책로 입구와 주차 위치를 미리 확인해보세요.');
    }
  } else if (/도심|카페거리|시장|맛집/.test(text) || destination.themes.includes('로컬 감성형')) {
    tips.push('주말에는 혼잡할 수 있어 시간대를 조절해보세요.');
    tips.push('근처 카페나 맛집을 함께 저장해보세요.');
    tips.push('대중교통 접근성을 먼저 확인해보세요.');
  } else {
    // 기본 폴백
    tips.push('방문 전 지도에서 위치와 동선을 한 번 더 점검해보세요.');
    if (!destination.detail?.parking) {
      tips.push('주차 공간이 협소할 수 있으니 대중교통 이용도 고려해보세요.');
    }
    tips.push('주말에는 사람이 많을 수 있어 여유 있게 방문하세요.');
  }

  // API 데이터 기반 보조 팁 (KtoDetailInfo와 중복 방지)
  const d = destination.detail;
  if (d?.useTime && d.useTime.includes('상시')) {
    tips.push('상시 개방되는 곳이라 일정에 맞게 방문하기 편해요.');
  } else if (d?.useTime && !d.useTime.includes('없음')) {
    // tips.push('운영 시간이 정해져 있으니 방문 전 한 번 더 확인하세요.');
  }
  
  if (d?.restDate && d.restDate.includes('연중무휴')) {
    tips.push('연중무휴로 운영되어 언제든 방문하기 좋아요.');
  }
  
  if (d?.parking && d.parking.includes('가능')) {
    tips.push('주차가 가능해 차로 방문하기 좋아요.');
  }

  return Array.from(new Set(tips)).slice(0, 4);
}
