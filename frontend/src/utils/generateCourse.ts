import { Destination } from '../types/destination';
import { Duration, TravelTheme } from '../types/trip';
import { RecommendationType } from './recommendationType';

export interface CourseStep {
  time: string;
  title: string;
  description: string;
  placeName?: string;
  category: 'main' | 'food' | 'attraction' | 'cafe' | 'stay' | 'return';
  mapUrl?: string;
  tip?: string;
  day?: number;
}

function getThemeDescription(theme: TravelTheme | 'all', category: CourseStep['category'], fallbackDesc: string): string {
  if (category === 'main') {
    switch (theme) {
      case '바다': return '바다 전망을 보며 여행을 시작해요.';
      case '문화': return '역사적 의미가 있는 장소를 천천히 살펴보세요.';
      case '자연': return '숲과 풍경을 천천히 둘러보세요.';
      case '액티비티': return '실내에서 전시와 체험을 편하게 즐겨보세요.';
      case '맛집': return '주변 식사 장소를 중심으로 일정을 구성해보세요.';
    }
  }
  if (category === 'attraction') {
    switch (theme) {
      case '바다': return '해변이나 항구 근처를 함께 둘러보기 좋아요.';
      case '문화': return '주변 문화 명소를 이어서 둘러보기 좋아요.';
      case '자연': return '산책로나 전망 지점을 함께 둘러보기 좋아요.';
      case '액티비티': return '가족이나 친구와 함께 둘러보기 좋아요.';
    }
  }
  if (category === 'cafe') {
    if (theme === '바다') return '바다를 보며 쉬어갈 수 있는 카페를 찾아보세요.';
    if (theme === '맛집') return '식사 후 근처 카페나 산책 코스를 이어가세요.';
  }
  return fallbackDesc;
}

export function generateStructuredCourse(
  destination: Destination,
  duration: Duration,
  theme: TravelTheme | 'all',
): CourseStep[] {
  const title = destination.title;
  const detail = destination.detail;

  const attractions = detail?.nearbyAttractions ?? [];
  const restaurants = detail?.nearbyRestaurants ?? [];
  const cafes = detail?.nearbyCafes ?? [];
  const stays = detail?.nearbyStays ?? [];

  const safeAttraction = (idx: number) => attractions[idx];
  const safeRestaurant = (idx: number) => restaurants[idx];
  const safeCafe = (idx: number) => cafes[idx];

  if (duration === 'day') {
    return [
      {
        time: '10:00',
        title: '메인 여행지 방문',
        description: getThemeDescription(theme, 'main', '대표 여행지의 멋진 경관을 가볍게 둘러보세요.'),
        placeName: title,
        category: 'main',
      },
      {
        time: '12:30',
        title: safeRestaurant(0)?.placeName ? `[${safeRestaurant(0)!.placeName}]` : '주변 맛집',
        description: getThemeDescription(theme, 'food', '맛있는 음식으로 점심 식사를 즐겨보세요.'),
        placeName: safeRestaurant(0)?.placeName,
        mapUrl: safeRestaurant(0)?.mapUrl,
        category: 'food',
        tip: safeRestaurant(0) ? '근처 인기 맛집을 추천해 드려요.' : '카카오맵에서 현지 맛집을 찾아보세요.',
      },
      {
        time: '14:00',
        title: safeAttraction(0)?.placeName ? `${safeAttraction(0)!.placeName} 산책` : '주변 명소',
        description: getThemeDescription(theme, 'attraction', '주변의 흥미로운 산책로나 문화 시설을 구경해보세요.'),
        placeName: safeAttraction(0)?.placeName,
        mapUrl: safeAttraction(0)?.mapUrl,
        category: 'attraction',
      },
      {
        time: '15:30',
        title: safeCafe(0)?.placeName ? `[${safeCafe(0)!.placeName}]` : '근처 카페',
        description: getThemeDescription(theme, 'cafe', '근처 조용한 분위기의 카페에서 쉬어가세요.'),
        placeName: safeCafe(0)?.placeName,
        mapUrl: safeCafe(0)?.mapUrl,
        category: 'cafe',
      },
      {
        time: '17:00',
        title: '귀가 경로 확인',
        description: '최적의 복귀 경로 및 소요 시간을 확인하세요.',
        category: 'return',
      },
    ];
  }

  // overnight (1박 2일)
  return [
    // DAY 1
    {
      day: 1,
      time: '10:00',
      title: '메인 여행지 방문',
      description: getThemeDescription(theme, 'main', '여유롭게 첫 대표 여행지를 방문하여 여행을 시작합니다.'),
      placeName: title,
      category: 'main',
    },
    {
      day: 1,
      time: '12:30',
      title: safeRestaurant(0)?.placeName ? `[${safeRestaurant(0)!.placeName}]` : '주변 맛집',
      description: getThemeDescription(theme, 'food', '맛있는 음식으로 점심 식사를 즐겨보세요.'),
      placeName: safeRestaurant(0)?.placeName,
      mapUrl: safeRestaurant(0)?.mapUrl,
      category: 'food',
    },
    {
      day: 1,
      time: '14:00',
      title: safeAttraction(0)?.placeName ? `${safeAttraction(0)!.placeName} 산책` : '주변 명소',
      description: getThemeDescription(theme, 'attraction', '주변의 흥미로운 산책로나 문화 시설을 구경해보세요.'),
      placeName: safeAttraction(0)?.placeName,
      mapUrl: safeAttraction(0)?.mapUrl,
      category: 'attraction',
    },
    {
      day: 1,
      time: '16:00',
      title: safeCafe(0)?.placeName ? `[${safeCafe(0)!.placeName}]` : '근처 카페',
      description: getThemeDescription(theme, 'cafe', '일정을 마치기 전 카페에서 푹 쉬어가세요.'),
      placeName: safeCafe(0)?.placeName,
      mapUrl: safeCafe(0)?.mapUrl,
      category: 'cafe',
    },
    {
      day: 1,
      time: '18:00',
      title: stays[0]?.placeName ? `[${stays[0]!.placeName}] 체크인` : '숙소 체크인',
      description: '예약한 숙소로 이동해 일정을 마무리해보세요.',
      placeName: stays[0]?.placeName,
      mapUrl: stays[0]?.mapUrl,
      category: 'stay',
      tip: stays[0] ? '근처에서 접근성 좋은 숙소 후보입니다.' : undefined,
    },
    // DAY 2
    {
      day: 2,
      time: '09:30',
      title: safeCafe(1)?.placeName ? `[${safeCafe(1)!.placeName}]` : '가벼운 산책 또는 근처 카페',
      description: '여유롭게 아침을 시작하며 기분 전환을 해보세요.',
      placeName: safeCafe(1)?.placeName,
      mapUrl: safeCafe(1)?.mapUrl,
      category: 'cafe',
    },
    {
      day: 2,
      time: '11:00',
      title: safeAttraction(1)?.placeName ? `${safeAttraction(1)!.placeName} 산책` : '추가 명소',
      description: getThemeDescription(theme, 'attraction', '어제 가보지 못한 또 다른 매력의 장소를 방문해보세요.'),
      placeName: safeAttraction(1)?.placeName,
      mapUrl: safeAttraction(1)?.mapUrl,
      category: 'attraction',
    },
    {
      day: 2,
      time: '12:30',
      title: safeRestaurant(1)?.placeName ? `[${safeRestaurant(1)!.placeName}]` : '점심',
      description: '여행의 마지막을 든든한 식사로 채워보세요.',
      placeName: safeRestaurant(1)?.placeName,
      mapUrl: safeRestaurant(1)?.mapUrl,
      category: 'food',
    },
    {
      day: 2,
      time: '15:00',
      title: '귀가 경로 확인',
      description: '최적의 복귀 경로 및 소요 시간을 확인하세요.',
      category: 'return',
    },
  ];
}
