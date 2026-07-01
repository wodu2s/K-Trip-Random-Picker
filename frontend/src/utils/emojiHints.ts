import { RecommendationType } from './recommendationType';

export interface EmojiHintInterpretation {
  emoji: string;
  label: string;
}

const EMOJI_LABELS: Record<string, string> = {
  '🏙️': '도심 속 쉼표',
  '🌳': '공원 산책',
  '🏛️': '역사·문화 공간',
  '📚': '천천히 둘러보기',
  '🚶': '가볍게 걷기',
  '📷': '사진 남기기',
  '🏘️': '동네 분위기',
  '☕': '주변 카페',
  '🌿': '자연 분위기',
  '🌲': '숲길 느낌',
  '🧘': '쉬어가기',
  '🌊': '바다 보기',
  '🏖️': '해변 산책',
  '🌅': '노을 감상',
  '🍽️': '맛집 들르기',
  '🥐': '디저트',
  '🎒': '체험하기',
  '🚴': '활동적인 하루',
  '✨': '분위기 좋은 곳',
  '🔍': '숨은 장소 찾기',
};

export function interpretEmojiHints(emojis: string[]): EmojiHintInterpretation[] {
  const seenLabel = new Set<string>();
  const result: EmojiHintInterpretation[] = [];

  for (const emoji of emojis) {
    const label = EMOJI_LABELS[emoji] ?? '여행';
    if (!seenLabel.has(label)) {
      seenLabel.add(label);
      result.push({ emoji, label });
    }
  }
  return result;
}
