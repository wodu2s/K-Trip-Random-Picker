const PARTICLES = [
  { top: "42%", left: "18%", delay: "0s" },
  { top: "48%", left: "78%", delay: "-1.4s" },
  { top: "38%", left: "52%", delay: "-2.4s" },
];

/**
 * PAGE 3·4 카드 셔플·선택 배경.
 * 카드 주변은 밝고 비워 두고, 하단 풍경 opacity를 낮춰 카드 윤곽이 잘 보이게 한다.
 * 별빛·경로 효과는 카드 주변(중앙 밴드)에만 제한한다.
 */
export function ShuffleBackdrop() {
  const fade = "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 28%, #000 62%)";

  return (
    <div className="scene-backdrop">
      <div className="absolute inset-0 bg-gradient-to-b from-[#E8F3FF] via-[#F4F9FF] to-[#F7FBFF]" />

      <div
        className="absolute inset-x-0 bottom-0 h-[max(56px,8vw)] opacity-55"
        style={{
          backgroundImage: "url('/assets/backgrounds/shuffle-coast-strip.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 animate-twinkle rounded-full bg-accent/35"
          style={{ top: p.top, left: p.left, animationDelay: p.delay }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
