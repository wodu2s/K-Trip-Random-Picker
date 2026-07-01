import { interpretEmojiHints } from '../utils/emojiHints';
import { Sparkles } from 'lucide-react';

interface EmojiHintSectionProps {
  emojiHints: string[];
}

export default function EmojiHintSection({ emojiHints }: EmojiHintSectionProps) {
  const hints = interpretEmojiHints(emojiHints);
  if (hints.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1 text-slate-500 text-xs font-bold mr-1">
        <Sparkles size={14} className="text-yellow-400" />
        추천 포인트
      </span>
      {hints.map((h, i) => (
        <div key={`${h.emoji}-${h.label}`} className="chip">
          <span>{h.emoji}</span>
          <span>{h.label}</span>
        </div>
      ))}
    </div>
  );
}
