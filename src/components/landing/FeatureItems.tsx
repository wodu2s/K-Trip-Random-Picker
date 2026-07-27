const FEATURES = [
  {
    emoji: "✨",
    badge: "bg-accent/25 text-primary-dark",
    title: "랜덤 추천",
    desc: "설렘 가득한 발견",
  },
  {
    emoji: "❤️",
    badge: "bg-[#ffe0e0] text-[#e5484d]",
    title: "나만의 여행",
    desc: "취향에 맞는 테마",
  },
] as const;

/** 랜딩 하단 서비스 특징 3개 (아이콘 배지 + 제목 + 설명) */
export function FeatureItems({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-8 gap-y-5 ${className}`}>
      {FEATURES.map((f) => (
        <li key={f.title} className="flex min-w-[130px] flex-col gap-2">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full text-xl shadow-sm ${f.badge}`}
            aria-hidden="true"
          >
            {f.emoji}
          </span>
          <span className="text-[15px] font-bold text-ink">{f.title}</span>
          <span className="-mt-1 text-sm text-muted">{f.desc}</span>
        </li>
      ))}
    </ul>
  );
}
