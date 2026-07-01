import { Destination } from '../types/destination';
import { TripFormState } from '../types/trip';

export type RecommendationType =
  // 대분류 (전체 테마)
  | '도심 산책형' | '문화 탐방형' | '자연 휴식형' | '사진 기록형'
  | '로컬 감성형' | '바다 드라이브형' | '가족 나들이형' | '숨은 명소형' | '실내 체험형'
  // 자연 서브
  | '숲길 산책형' | '국립공원형' | '풍경 사진형' | '호수·강변형' | '자연 가족나들이형'
  // 문화 서브
  | '역사 산책형' | '전시 관람형' | '고궁·유적형'
  // 바다 서브
  | '해변 산책형' | '항구 감성형' | '섬·갯벌 체험형' | '바다 사진형'
  // 맛집 서브
  | '로컬 맛집형' | '카페 투어형' | '시장 먹거리형' | '식사+산책형'
  // 감성 서브
  | '골목 산책형' | '카페 감성형' | '고즈넉한 산책형' | '사진 명소형' | '야경 감상형'
  // 액티비티 서브
  | '테마파크형' | '체험 활동형';

/* ── 대분류 목록 (전체 테마용) ── */
const MAIN_TYPES: RecommendationType[] = [
  '도심 산책형', '문화 탐방형', '자연 휴식형', '사진 기록형',
  '로컬 감성형', '바다 드라이브형', '가족 나들이형', '숨은 명소형', '실내 체험형',
];

/* ── 테마별 서브타입 풀 ── */
const THEME_SUBTYPES: Record<string, RecommendationType[]> = {
  '자연': ['자연 휴식형', '숲길 산책형', '국립공원형', '풍경 사진형', '호수·강변형', '자연 가족나들이형'],
  '문화': ['문화 탐방형', '역사 산책형', '전시 관람형', '고궁·유적형', '사진 기록형'],
  '바다': ['바다 드라이브형', '해변 산책형', '항구 감성형', '섬·갯벌 체험형', '바다 사진형'],
  '맛집': ['로컬 맛집형', '카페 투어형', '시장 먹거리형', '식사+산책형', '로컬 감성형'],
  '감성': ['로컬 감성형', '사진 명소형', '야경 감상형', '골목 산책형', '카페 감성형', '고즈넉한 산책형', '숨은 명소형'],
  '액티비티': ['실내 체험형', '가족 나들이형', '테마파크형', '체험 활동형', '자연 가족나들이형'],
};

/* ── 설명 ── */
const TYPE_DESCRIPTION: Record<string, string> = {
  '도심 산책형': '도심 속에서 가볍게 쉬는 코스',
  '문화 탐방형': '역사와 이야기를 따라 걷는 코스',
  '자연 휴식형': '숲과 풍경을 보며 쉬어가는 코스',
  '사진 기록형': '분위기 좋은 장면을 남기기 좋은 코스',
  '로컬 감성형': '동네 분위기와 주변 카페를 함께 즐기는 코스',
  '바다 드라이브형': '바다를 보러 가볍게 떠나는 코스',
  '가족 나들이형': '누구와 가도 부담 없는 나들이 코스',
  '숨은 명소형': '잘 알려지지 않은 조용한 장소',
  '실내 체험형': '실내에서 가볍게 즐기는 체험 코스',
  '숲길 산책형': '숲길을 천천히 걷기 좋은 코스',
  '국립공원형': '넓은 자연 풍경을 만나는 코스',
  '풍경 사진형': '자연 풍경을 사진으로 남기기 좋은 코스',
  '호수·강변형': '물가를 따라 여유롭게 걷는 코스',
  '자연 가족나들이형': '누구와 가도 부담 없는 자연 나들이 코스',
  '역사 산책형': '역사 유적지를 따라 걷는 코스',
  '전시 관람형': '전시와 문화 공간을 천천히 보는 코스',
  '고궁·유적형': '고궁과 유적을 둘러보는 코스',
  '해변 산책형': '해변을 따라 걷기 좋은 코스',
  '항구 감성형': '항구의 정취를 느끼는 코스',
  '섬·갯벌 체험형': '섬으로 떠나는 특별한 여행',
  '바다 사진형': '바다 풍경을 남기기 좋은 코스',
  '로컬 맛집형': '동네 숨은 맛집을 찾아가는 코스',
  '카페 투어형': '카페를 돌며 여유를 즐기는 코스',
  '시장 먹거리형': '시장 먹거리를 탐방하는 코스',
  '식사+산책형': '맛집과 산책을 함께 즐기는 코스',
  '골목 산책형': '골목 사이를 걸으며 감성을 채우는 코스',
  '카페 감성형': '분위기 좋은 카페에서 쉬는 코스',
  '고즈넉한 산책형': '조용하고 고즈넉한 분위기에서 걷는 코스',
  '사진 명소형': '인생 사진을 남기기 좋은 감성 코스',
  '야경 감상형': '해 질 녘이나 야경이 아름다운 코스',
  '테마파크형': '놀이와 체험을 즐기는 코스',
  '체험 활동형': '다양한 체험 프로그램을 즐기는 코스',
};

/* ── 키워드 매칭 ── */
const SUBTYPE_KEYWORDS: Record<string, RegExp> = {
  '자연 휴식형': /자연|숲|산|수목원|계곡|생태|수변|휴양림|정원/,
  '숲길 산책형': /숲|둘레길|산책로|산림|수목원|숲길|올레|트레킹/,
  '국립공원형': /국립공원|도립공원|자연공원|생태공원/,
  '풍경 사진형': /전망|경관|풍경|사진|출사|일출|일몰|노을|뷰/,
  '호수·강변형': /호수|강|강변|저수지|수변|하천|습지|폭포|계곡/,
  '자연 가족나들이형': /가족|체험|캠핑|피크닉|공원|식물원|동물원/,
  '역사 산책형': /역사|유적|향교|사찰|서원|고택|사지|묘|릉/,
  '전시 관람형': /전시|미술관|갤러리|전시관|아트/,
  '고궁·유적형': /궁|성|문화재|고궁|성곽|성벽/,
  '해변 산책형': /해변|해수욕장|백사장|모래/,
  '항구 감성형': /항구|포구|선착장|어항|등대/,
  '섬·갯벌 체험형': /섬|도서|연륙/,
  '바다 사진형': /해돋이|일출|해안|절벽|해상|갯벌/,
  '로컬 맛집형': /맛집|식당|음식|먹거리|밥/,
  '카페 투어형': /카페|커피|디저트|베이커리|제과|다방/,
  '시장 먹거리형': /시장|장터|5일장|전통시장/,
  '식사+산책형': /거리|로|가로수|상점가/,
  '골목 산책형': /골목|마을|동네|한옥|벽화/,
  '카페 감성형': /카페|커피|분위기|감성|디저트/,
  '고즈넉한 산책형': /사찰|절|암자|사|고즈넉|조용|정사|향교|서원|한적/,
  '사진 명소형': /사진|포토|전망|풍경|스냅|인생샷/,
  '야경 감상형': /야경|노을|일몰|낙조|밤|불빛|조명/,
  '테마파크형': /테마파크|놀이공원|랜드|월드|어드벤처/,
  '체험 활동형': /체험|레저|스포츠|캠핑|레크리에이션/,
};

/* ── 테마별 금지 타입 ── */
const THEME_BANNED: Record<string, Set<string>> = {
  '자연': new Set(['문화 탐방형', '로컬 감성형', '맛집 근처형', '실내 체험형',
    '역사 산책형', '전시 관람형', '고궁·유적형', '로컬 맛집형', '카페 투어형',
    '시장 먹거리형', '골목 산책형', '카페 감성형', '테마파크형']),
};

/* ── 기존 getRecommendationType (대분류 판별) ── */
export function getRecommendationType(destination: Destination): RecommendationType {
  const t = destination.title.toLowerCase();
  const a = (destination.address ?? destination.region ?? '').toLowerCase();
  const s = (destination.summary + ' ' + (destination.detail?.overview ?? '')).toLowerCase();
  const text = t + ' ' + a + ' ' + s;

  if (/아쿠아리움|아쿠아플라넷|수족관/.test(t)) return '실내 체험형';

  const hasHistory = /역사|문화재|유적|향교|사찰|궁|성|서원|고택|사지|묘|릉|원|전통/.test(text) ||
                     /절|궁|성|향교|서원|사/.test(t);
  const hasExperience = /체험|가족|실내|키즈|어린이|과학관|테마파크|아쿠아|놀이|체험관|전시관|미술관|박물관/.test(text);

  if (/체험관|과학관|테마파크|전시관|박물관|미술관|실내|체험|어린이|키즈/.test(text)) {
    if (hasExperience && !hasHistory) return '실내 체험형';
    if (hasExperience && hasHistory) {
      if (/체험|실내|어린이|키즈|수족관|아쿠아|가족/.test(t) || (!/궁|성|사찰|사지|역사|문화재|유적|릉|원/.test(t) && /체험|실내|과학관|어린이|가족/.test(s))) {
        return '실내 체험형';
      }
    }
  }

  if (/문화|역사|향교|사찰|궁|성|유적|박물관|미술관|전시|기념관|서원|고택|사지|묘|릉|원/.test(t) ||
    t.endsWith('절') || t.endsWith('궁') || t.endsWith('성') || t.endsWith('향교') || t.endsWith('서원') || t.endsWith('박물관') || t.endsWith('사')
  ) return '문화 탐방형';

  if (/바다|해변|해수욕장|항구|등대|섬|해안|갯벌|포구|해일|파도|해상|해돋이|일출|선착장/.test(text) ||
    destination.themes.includes('바다')
  ) return '바다 드라이브형';

  const hasNatureKeywords = /공원|숲|산|수목원|호수|계곡|생태|수변|휴양림|산책로|저수지|봉|폭포|강|바다|해안|길|로|거리/.test(text);
  if (/도심|광장|세종로|청계천|동대문|명동|강남|종로|시청|광화문/.test(text) ||
    ((a.includes('서울특별시') || a.includes('종로구') || a.includes('중구')) && (/공원|로|거리|길/.test(t)))
  ) {
    if (hasNatureKeywords || /공원|로|거리|길/.test(t)) return '도심 산책형';
  }

  if (/마을|골목|시장|거리|카페|상점|로컬|동네|맛집|식당|베이커리|디저트|제과|다방|가로수|커피|베이킹/.test(t + ' ' + s)) return '로컬 감성형';
  if (/체험|테마파크|동물원|식물원|어린이|가족|박람회|체험관|레저|스포츠|아쿠아|놀이|공원|랜드|캠핑|피크닉/.test(t + ' ' + s)) return '가족 나들이형';
  if (/전망대|포토|사진|야경|일몰|노을|경관|뷰|명소|스튜디오|촬영|출사|낙조/.test(t + ' ' + s)) return '사진 기록형';
  if (/자연|숲|산|국립공원|수목원|호수|계곡|생태|수변|휴양림|공원|산책로|저수지|봉|폭포/.test(t + ' ' + s)) {
    if (/공원|숲|산|수목원|호수|계곡|휴양림|산책로|저수지|봉|폭포/.test(text)) return '자연 휴식형';
  }
  if (/숨은|조용한|한적한|소규모|산책로|둘레길|비밀|사색|힐링|숨겨진/.test(text)) return '숨은 명소형';

  if (destination.themes.includes('문화')) return '문화 탐방형';
  if (destination.themes.includes('자연')) return '자연 휴식형';
  if (destination.themes.includes('바다')) return '바다 드라이브형';
  if (destination.themes.includes('맛집') || destination.themes.includes('감성')) return '로컬 감성형';
  if (destination.themes.includes('액티비티')) return '가족 나들이형';

  return '로컬 감성형';
}

/* ── 서브타입 판별 (특정 테마 선택 시) ── */
function getSubtype(dest: Destination, pool: RecommendationType[]): RecommendationType {
  const t = dest.title.toLowerCase();
  const s = (dest.summary + ' ' + (dest.detail?.overview ?? '')).toLowerCase();
  const text = t + ' ' + s;

  let best = pool[0];
  let bestScore = 0;

  for (const subtype of pool) {
    const regex = SUBTYPE_KEYWORDS[subtype];
    if (!regex) continue;
    const matches = (text.match(new RegExp(regex.source, 'g')) || []).length;
    const titleBonus = regex.test(t) ? 10 : 0;
    const score = matches + titleBonus;
    if (score > bestScore) {
      bestScore = score;
      best = subtype;
    }
  }

  return best;
}

/* ── 매칭 점수 ── */
function getMatchScore(dest: Destination, type: RecommendationType, prefs: TripFormState): number {
  const title = dest.title.toLowerCase();
  const address = (dest.address ?? dest.region ?? '').toLowerCase();
  const summary = (dest.summary + ' ' + (dest.detail?.overview ?? '')).toLowerCase();
  const text = title + ' ' + address + ' ' + summary;

  let score = 0;

  const regex = SUBTYPE_KEYWORDS[type];
  if (regex) {
    if (regex.test(title)) score += 50;
    if (regex.test(address)) score += 15;
    score += (text.match(new RegExp(regex.source, 'g')) || []).length * 2;
  }

  // 금지 목록 체크
  const banned = THEME_BANNED[prefs.theme];
  if (banned?.has(type)) score = -9999;

  // 바다 타입인데 바다 키워드 없으면 제외 (테마가 바다라고 해도 억지로 포장 금지)
  if (['바다 드라이브형', '해변 산책형', '항구 감성형', '섬·갯벌 체험형', '바다 사진형'].includes(type)) {
    if (!/바다|해변|해수욕장|항구|등대|섬|해안|갯벌|포구|파도|해상|해돋이|일출|선착장|해양|바닷가|오션|요트|마리나|정동진|경포|안목|주문진/.test(text)) {
      score = -9999;
    }
  }

  return score;
}

/* ── 다양화 할당 ── */
export function assignDiverseRecommendationTypes(
  destinations: Destination[],
  prefs: TripFormState,
): RecommendationType[] {
  const n = destinations.length;
  if (n === 0) return [];

  const theme = prefs.theme;
  const pool = (theme !== 'all' && THEME_SUBTYPES[theme]) ? THEME_SUBTYPES[theme] : MAIN_TYPES;

  // 점수 계산
  const scores: number[][] = Array.from({ length: n }, () => Array(pool.length).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < pool.length; j++) {
      scores[i][j] = getMatchScore(destinations[i], pool[j], prefs);
    }
  }

  // 탐색 (고유 타입 배정)
  let bestScore = -Infinity;
  let bestAssignment: RecommendationType[] = [];

  function search(idx: number, current: RecommendationType[], curScore: number, used: Set<RecommendationType>) {
    if (idx === n) {
      if (curScore > bestScore) {
        bestScore = curScore;
        bestAssignment = [...current];
      }
      return;
    }
    for (let j = 0; j < pool.length; j++) {
      const type = pool[j];
      if (used.has(type)) continue;
      const s = scores[idx][j];
      if (s < -5000) continue;
      used.add(type);
      current.push(type);
      search(idx + 1, current, curScore + s, used);
      current.pop();
      used.delete(type);
    }
  }

  search(0, [], 0, new Set());

  // Fallback
  if (bestAssignment.length < n) {
    const usedCounts = new Map<RecommendationType, number>();
    bestAssignment = [];
    for (let i = 0; i < n; i++) {
      let bestT = pool[0];
      let bestS = -Infinity;
      for (let j = 0; j < pool.length; j++) {
        const type = pool[j];
        let s = scores[i][j];
        if (s < -5000) continue;
        s -= (usedCounts.get(type) ?? 0) * 200;
        if (s > bestS) { bestS = s; bestT = type; }
      }
      bestAssignment.push(bestT);
      usedCounts.set(bestT, (usedCounts.get(bestT) ?? 0) + 1);
    }
  }

  return bestAssignment;
}

/* ── 이모지 힌트 ── */
export function generateEmojiHints(destination: Destination, type: RecommendationType): string[] {
  const t = destination.title.toLowerCase();
  const s = destination.summary.toLowerCase();
  const text = t + ' ' + s;
  const hasNature = /공원|숲|산|수목원|호수|계곡|휴양림|산책로|저수지|봉|폭포/.test(text);

  const map: Record<string, string[]> = {
    '도심 산책형': ['🏙️', hasNature ? '🌳' : '✨', '🚶', '📷'],
    '문화 탐방형': ['🏛️', '📚', '🚶', '📷'],
    '자연 휴식형': ['🌿', '🌲', '🧘', '📷'],
    '사진 기록형': ['📷', '🌅', '🏞️', '✨'],
    '로컬 감성형': ['🏘️', '☕', '🚶', '🛍️'],
    '바다 드라이브형': ['🌊', '🚗', '🌅', '📷'],
    '가족 나들이형': ['👨‍👩‍👧‍👦', '🎡', hasNature ? '🌳' : '🎒', '🍱'],
    '숨은 명소형': ['🔍', '🌿', '🏞️', '🚶'],
    '실내 체험형': ['🐠', '🎟️', '👨‍👩‍👧‍👦', '☕'],
    // 자연 서브
    '숲길 산책형': ['🌲', '🚶', '🌿', '🧘'],
    '국립공원형': ['🏞️', '🌲', '🥾', '📷'],
    '풍경 사진형': ['📷', '🏞️', '🌅', '✨'],
    '호수·강변형': ['🌊', '🚶', '🌿', '📷'],
    '자연 가족나들이형': ['👨‍👩‍👧‍👦', '🌳', '🍱', '🚶'],
    // 문화 서브
    '역사 산책형': ['🏛️', '🚶', '📜', '📷'],
    '전시 관람형': ['🎨', '🖼️', '📷', '☕'],
    '고궁·유적형': ['🏯', '📜', '🚶', '📷'],
    // 바다 서브
    '해변 산책형': ['🏖️', '🚶', '🌊', '📷'],
    '항구 감성형': ['⚓', '🌅', '🐟', '📷'],
    '섬 여행형': ['🏝️', '⛴️', '🌊', '📷'],
    '바다 사진형': ['📷', '🌊', '🌅', '✨'],
    // 맛집 서브
    '로컬 맛집형': ['🍽️', '🥘', '🚶', '📷'],
    '카페 투어형': ['☕', '🍰', '📷', '🚶'],
    '시장 먹거리형': ['🏪', '🍢', '🛍️', '📷'],
    '식사+산책형': ['🍽️', '🚶', '🌳', '📷'],
    // 감성 서브
    '골목 산책형': ['🏘️', '🚶', '📷', '✨'],
    '카페 감성형': ['☕', '📷', '✨', '🎵'],
    '고즈넉한 산책형': ['🎐', '🚶', '🍃', '🧘'],
    '사진 명소형': ['📷', '✨', '🖼️', '🌅'],
    '야경 감상형': ['🌃', '✨', '🌙', '📷'],
    // 액티비티 서브
    '테마파크형': ['🎢', '🎡', '🎠', '📷'],
    '체험 활동형': ['🎯', '🧗', '🎒', '📷'],
  };

  return map[type] ?? ['🌿', '🚶', '📷', '✨'];
}

export function getTypeDescription(type: RecommendationType): string {
  return TYPE_DESCRIPTION[type] ?? '';
}
