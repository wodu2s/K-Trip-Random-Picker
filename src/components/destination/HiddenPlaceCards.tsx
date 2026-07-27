import type { HiddenPlace } from "@/types/travel";

/** 태그별 스타일 (썸네일 그라데이션 + 이모지 + 칩 색상) */
const TAG_STYLE: Record<
  string,
  { emoji: string; grad: string; chip: string }
> = {
  자연: { emoji: "🌿", grad: "from-[#7bbf8a] to-[#3f7d5a]", chip: "bg-[#e3f4e8] text-[#2f7a52]" },
  산책: { emoji: "🚶", grad: "from-[#9fd0a8] to-[#5aa06e]", chip: "bg-[#e6f4ea] text-[#3f8b5c]" },
  전망: { emoji: "🔭", grad: "from-[#8fb6e6] to-[#3f6fb0]", chip: "bg-[#e3edfb] text-[#2f5fa8]" },
  해변: { emoji: "🏖️", grad: "from-[#7cc7e6] to-[#3f8fc0]", chip: "bg-[#e0f2fb] text-[#2f7aa8]" },
  카페: { emoji: "☕", grad: "from-[#d6b48a] to-[#a07a4a]", chip: "bg-[#f4ece0] text-[#8a6a3a]" },
  골목: { emoji: "🏘️", grad: "from-[#c9a9d6] to-[#8a5fa0]", chip: "bg-[#f0e6f4] text-[#7a4f95]" },
  로컬: { emoji: "📍", grad: "from-[#e0a37a] to-[#b06a3f]", chip: "bg-[#f6e8df] text-[#a5603a]" },
};

const FALLBACK = {
  emoji: "✨",
  grad: "from-[#9db8d6] to-[#5f7da0]",
  chip: "bg-[#e8eef6] text-[#4f6a95]",
};

/**
 * 숨겨진 로컬 명소 3~5개를 가로 스크롤 카드로 보여준다.
 * (샘플 데이터 기반, 관광객이 적은 로컬 스팟)
 */
export function HiddenPlaceCards({ places }: { places: HiddenPlace[] }) {
  return (
    <section>
      <h2 className="mb-1 flex items-center gap-2 text-lg font-extrabold text-ink">
        <span aria-hidden="true">💎</span> 숨겨진 장소 추천
      </h2>
      <p className="mb-4 text-sm text-muted">관광객이 적은 로컬 명소들이에요.</p>

      {/* 가로 스크롤 */}
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {places.map((p) => {
          const s = TAG_STYLE[p.tag] ?? FALLBACK;
          return (
            <li
              key={p.name}
              className="w-[150px] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface shadow-sm"
            >
              <div
                className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${s.grad} text-4xl`}
                aria-hidden="true"
              >
                <span className="drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)]">
                  {s.emoji}
                </span>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                <span
                  className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${s.chip}`}
                >
                  {p.tag}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
