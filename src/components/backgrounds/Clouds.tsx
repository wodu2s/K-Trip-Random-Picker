/**
 * 아주 느리게(18~24초) 좌우로 떠다니는 부드러운 구름.
 * prefers-reduced-motion에서는 index.css 전역 규칙이 애니메이션을 정지시킨다.
 */
export function Clouds({ className = "", tint = "#ffffff" }: { className?: string; tint?: string }) {
  const puffs = [
    { top: "8%", left: "6%", w: 120, h: 34, dur: "drift-slow" as const, delay: "0s", opacity: 0.55 },
    { top: "16%", left: "62%", w: 150, h: 40, dur: "drift-slower" as const, delay: "-6s", opacity: 0.45 },
    { top: "4%", left: "78%", w: 90, h: 26, dur: "drift-slow" as const, delay: "-3s", opacity: 0.4 },
    { top: "22%", left: "24%", w: 100, h: 28, dur: "drift-slower" as const, delay: "-10s", opacity: 0.38 },
  ];

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {puffs.map((p, i) => (
        <span
          key={i}
          className={`absolute rounded-full blur-xl ${p.dur === "drift-slow" ? "animate-drift-slow" : "animate-drift-slower"}`}
          style={{
            top: p.top,
            left: p.left,
            width: p.w,
            height: p.h,
            background: tint,
            opacity: p.opacity,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
