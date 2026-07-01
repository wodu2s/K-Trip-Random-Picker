import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';
import { getCardDataSourceLabel } from './dataSource';
import {
  RecommendationType,
  assignDiverseRecommendationTypes,
  generateEmojiHints,
  getTypeDescription,
} from './recommendationType';

export interface CardPresentation {
  recommendationType: RecommendationType;
  typeDescription: string;
  emojiHints: string[];
  shortTag: string;
  recommendationCriteria: string;
  dataSourceLabel: string;
}

const TYPE_SHORT_TAG: Record<RecommendationType, string> = {
  // 메인
  '도심 산책형': '#도심산책',
  '문화 탐방형': '#문화나들이',
  '자연 휴식형': '#자연휴식',
  '사진 기록형': '#사진명소',
  '로컬 감성형': '#로컬감성',
  '바다 드라이브형': '#바다드라이브',
  '가족 나들이형': '#가족나들이',
  '숨은 명소형': '#숨은명소',
  '실내 체험형': '#실내체험',
  // 자연 서브
  '숲길 산책형': '#숲길산책',
  '국립공원형': '#국립공원',
  '풍경 사진형': '#풍경사진',
  '호수·강변형': '#물가산책',
  '자연 가족나들이형': '#자연나들이',
  // 문화 서브
  '역사 산책형': '#역사산책',
  '전시 관람형': '#전시관람',
  '고궁·유적형': '#고궁나들이',
  // 바다 서브
  '해변 산책형': '#해변산책',
  '항구 감성형': '#항구감성',
  '섬·갯벌 체험형': '#섬여행',
  '바다 사진형': '#바다사진',
  // 맛집 서브
  '로컬 맛집형': '#동네맛집',
  '카페 투어형': '#카페투어',
  '시장 먹거리형': '#시장투어',
  '식사+산책형': '#맛집산책',
  // 감성 서브
  '골목 산책형': '#골목산책',
  '카페 감성형': '#감성카페',
  '고즈넉한 산책형': '#고즈넉',
  '사진 명소형': '#인생샷',
  '야경 감상형': '#야경명소',
  // 액티비티 서브
  '테마파크형': '#테마파크',
  '체험 활동형': '#체험여행',
};

export function getCardShortTag(type: RecommendationType): string {
  return TYPE_SHORT_TAG[type] ?? '#여행추천';
}

export function buildCardPresentations(
  destinations: Destination[],
  prefs: TripFormState,
): CardPresentation[] {
  const types = assignDiverseRecommendationTypes(destinations, prefs);

  return destinations.map((dest, index) => {
    const type = types[index];
    const themeName = prefs.theme !== 'all' ? prefs.theme : '테마';
    const tag = getCardShortTag(type).replace('#', '');
    const criteria = `기준: ${themeName} 키워드 + ${tag} 요소 + 이동거리`;

    return {
      recommendationType: type,
      typeDescription: getTypeDescription(type),
      emojiHints: generateEmojiHints(dest, type),
      shortTag: getCardShortTag(type),
      recommendationCriteria: criteria,
      dataSourceLabel: getCardDataSourceLabel(dest.dataSource),
    };
  });
}
