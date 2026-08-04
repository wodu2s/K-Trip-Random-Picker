/** 아주 제한적으로 사용하는 미세한 별빛 반짝임 (히어로 새벽 하늘용) */
export function Stars({ className = "" }: { className?: string }) {
  const dots = [
    { top: "10%", left: "18%", size: 3, delay: "0s" },
    { top: "6%", left: "40%", size: 2, delay: "-1.2s" },
    { top: "14%", left: "70%", size: 2.5, delay: "-2.1s" },
    { top: "20%", left: "86%", size: 2, delay: "-0.6s" },
  ];

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute animate-twinkle rounded-full bg-white"
          style={{ top: d.top, left: d.left, width: d.size, height: d.size, animationDelay: d.delay }}
        />
      ))}
    </div>
  );
}
