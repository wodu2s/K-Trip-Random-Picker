/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Destination } from './types';

export const DESTINATIONS: Destination[] = [
  {
    id: 'gangneung',
    name: '강릉',
    region: '강원도',
    keyword: '바다 감성',
    emojiHint: ['🌊', '☕', '🏖️', '🚶'],
    themes: ['바다', '감성'],
    description: '푸른 파도와 커피 향기가 가득한 낭만적인 해변 도시입니다.',
    travelType: ['day', 'overnight'],
    estimatedTravelTime: '서울역 기준 KTX 2시간',
    lastTransportTime: '상행 막차 22:30 (KTX)',
    canReturnToday: true,
    recommendedStayTime: '6~8시간',
    nearbySpots: [
      { name: '안목해변 커피거리', description: '바다 정취를 느끼며 즐기는 스페셜티 커피' },
      { name: '강문해변', description: '아기자기한 포토존이 가득한 감성 해변' },
      { name: '스테이 인터뷰', description: 'SNS에서 핫한 바다 전망 인생샷 명소' }
    ],
    dayTripCourse: ['강릉역 도착', '안목해변 카페 투어', '중앙시장 먹거리', '강문해변 산책', '강릉역 출발'],
    overnightCourse: ['1일차: 경포대 & 오죽헌', '2일차: 소금강 계곡 & 정동진'],
    accommodations: [
      { name: '세인트존스 호텔', type: '호텔', priceRange: '15~30만원' },
      { name: '강릉 게스트하우스', type: '게스트하우스', priceRange: '3~6만원' }
    ],
    mapQuery: '강릉시',
    image: 'https://images.unsplash.com/photo-1542240976-90426fe4f8b2?auto=format&fit=crop&q=80&w=800',
    distanceKm: 230,
    coords: { x: 55, y: 18 }
  },
  {
    id: 'jeju',
    name: '제주',
    region: '제주특별자치도',
    keyword: '힐링 자연',
    emojiHint: ['🌴', '🍊', '🧊', '🌋'],
    themes: ['자연'],
    description: '사계절 내내 숨멎게 하는 에메랄드빛 바다와 한라산의 경이로움.',
    travelType: ['overnight'],
    estimatedTravelTime: '김포공항 기준 비행기 1시간 10분',
    canReturnToday: false,
    recommendedStayTime: '2박 3일 이상',
    nearbySpots: [
      { name: '협재해수욕장', description: '에메랄드빛 바다 뒤로 비양도가 보이는 절경' },
      { name: '사려니숲길', description: '삼나무 가득한 숲에서 즐기는 피톤치드 샤워' },
      { name: '성산일출봉', description: '유네스코 세계자연유산, 장엄한 일출 명소' }
    ],
    overnightCourse: ['1일차: 서쪽 해안도로 드라이브', '2일차: 중문 단지 & 서귀포', '3일차: 성산일출봉 & 우도'],
    accommodations: [
      { name: '신라호텔 제주', type: '리조트', priceRange: '40~80만원' },
      { name: '제주 감성 숙소', type: '독채펜션', priceRange: '20~40만원' }
    ],
    mapQuery: '제주시',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800',
    distanceKm: 450,
    coords: { x: 25, y: 95 }
  },
  {
    id: 'jeonju',
    name: '전주',
    region: '전라북도',
    keyword: '전통 먹방',
    emojiHint: ['🍱', '🏮', '🥢', '🍚'],
    themes: ['맛집', '문화'],
    description: '한옥의 멋과 깊은 손맛이 살아있는 한국 대표 미식 도시.',
    travelType: ['day', 'overnight'],
    estimatedTravelTime: '용산역 기준 KTX 1시간 40분',
    lastTransportTime: '상행 막차 22:15 (KTX)',
    canReturnToday: true,
    recommendedStayTime: '5~7시간',
    nearbySpots: [
      { name: '전주 한옥마을', description: '700여 채의 한옥이 모여있는 한국 최대 한옥촌' },
      { name: '남부시장', description: '전주 피순대와 콩나물국밥의 성지' },
      { name: '경기전', description: '태조 이성계의 어진을 모신 역사적 공간' }
    ],
    dayTripCourse: ['전주역 도착', '한옥마을 산책', '남부시장 점심', '객리단길 카페', '전주역 출발'],
    mapQuery: '전주 한옥마을',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800',
    distanceKm: 210,
    coords: { x: 32, y: 65 }
  },
  {
    id: 'danyang',
    name: '단양',
    region: '충청북도',
    keyword: '스릴 산책',
    emojiHint: ['🪂', '⛰️', '🌉', '🥾'],
    themes: ['액티비티', '자연'],
    description: '패러글라이딩의 성지이자 남한강의 절경을 품은 액티비티 천국.',
    travelType: ['day', 'overnight'],
    estimatedTravelTime: '청량리역 기준 KTX 1시간 20분',
    lastTransportTime: '상행 막차 21:50 (KTX)',
    canReturnToday: true,
    recommendedStayTime: '6~9시간',
    nearbySpots: [
      { name: '카페 산', description: '패러글라이딩 활공장에서 즐기는 커피와 절경' },
      { name: '만천하 스카이워크', description: '남한강 위 공중을 걷는 아찔한 경험' },
      { name: '도담삼봉', description: '강 한가운데 솟은 세 가지 봉우리' }
    ],
    dayTripCourse: ['단양역 도착', '만천하 스카이워크', '점심(마늘정식)', '패러글라이딩 체험', '단양역 출발'],
    mapQuery: '단양군',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800',
    distanceKm: 140,
    coords: { x: 48, y: 35 }
  },
  {
    id: 'busan',
    name: '부산',
    region: '경상남도',
    keyword: '바다 야경',
    emojiHint: ['🎡', '🌉', '🐟', '🚆'],
    themes: ['바다', '감성'],
    description: '화려한 빌딩 숲과 시원한 바다가 조화를 이루는 제2의 수도.',
    travelType: ['overnight'],
    estimatedTravelTime: '서울역 기준 KTX 2시간 30분',
    canReturnToday: true,
    recommendedStayTime: '1박 2일 이상',
    nearbySpots: [
      { name: '광안리 해수욕장', description: '드론 쇼와 광안대교 야경이 어우러진 비치' },
      { name: '해운대 엘시티', description: '부산 최고의 전경을 자랑하는 99층 전망대' },
      { name: '흰여울문화마을', description: '바다 절벽 위 골목길에서 느끼는 산토리니 감성' }
    ],
    overnightCourse: ['1일차: 해운대 & 광안리 야경', '2일차: 영도 흰여울마을 & 남포동'],
    accommodations: [
      { name: '파라다이스 호텔 부산', type: '호텔', priceRange: '30~60만원' },
      { name: '해운대 라비드아틀란', type: '호텔', priceRange: '10~20만원' }
    ],
    mapQuery: '부산광역시',
    image: 'https://images.unsplash.com/photo-1590603740183-980e7f98e1ca?auto=format&fit=crop&q=80&w=800',
    distanceKm: 320,
    coords: { x: 70, y: 85 }
  },
  {
    id: 'gyeongju',
    name: '경주',
    region: '경상북도',
    keyword: '역사 야경',
    emojiHint: ['🌙', '🏺', '👑', '🏯'],
    themes: ['문화', '자연'],
    description: '천년의 역사가 밤이 되면 더욱 아름답게 빛나는 노천 박물관.',
    travelType: ['day', 'overnight'],
    estimatedTravelTime: '서울역 기준 KTX 2시간',
    lastTransportTime: '상행 막차 22:50 (KTX)',
    canReturnToday: true,
    recommendedStayTime: '7~10시간',
    nearbySpots: [
      { name: '동궁과 월지', description: '신라의 궁궐터, 환상적인 야경 반영 명소' },
      { name: '황리단길', description: '전통 가옥과 힙한 카페가 공존하는 핫플레이스' },
      { name: '교촌마을', description: '경주 최부자댁의 역사가 깃든 한옥 마을' }
    ],
    dayTripCourse: ['경주역 도착', '불국사', '황리단길 점심', '대릉원 & 동궁과 월지 야경', '경주역 출발'],
    mapQuery: '경주시',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    distanceKm: 280,
    coords: { x: 72, y: 65 }
  },
  {
    id: 'paju',
    name: '파주',
    region: '경기도',
    keyword: '독서 문화',
    emojiHint: ['📚', '🎨', '🏰', '🕊️'],
    themes: ['문화', '감성'],
    description: '예술가들의 숨결과 평화의 기운이 감도는 복합 문화 도시.',
    travelType: ['day'],
    estimatedTravelTime: '서울 중심 기준 차로 1시간',
    canReturnToday: true,
    recommendedStayTime: '5~8시간',
    nearbySpots: [
      { name: '파주 출판도시', description: '건축미 넘치는 도서관과 북카페가 가득한 책의 마을' },
      { name: '헤이리 예술마을', description: '다양한 갤러리와 체험 시설이 있는 예술가 공동체' },
      { name: '임진각 평화누리공원', description: '넓은 잔디 언덕 위로 많은 바람개비가 돌아가는 곳' }
    ],
    dayTripCourse: ['파주 출발', '출판도시 지혜의 숲', '헤이리 마늘빵 맛집', '임진각 노을 감상', '귀가'],
    mapQuery: '파주시',
    image: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&q=80&w=800',
    distanceKm: 40,
    coords: { x: 22, y: 15 }
  }
];
