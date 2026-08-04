/**
 * PAGE 1 히어로 배경 — 실제 수채화풍 한국 해안 마을 이미지(watercolor coast) +
 * 좌측(카피 영역)은 배경색으로 덮고 우측(이미지)은 그대로 드러나는 가로 그라디언트.
 * 과거의 밝은 단색 배경 + SVG 일러스트 조합을 대체한다.
 */
export function HeroBackdrop() {
  return (
    <div
      className="scene-backdrop"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(247,251,255,0.98) 0%, rgba(247,251,255,0.88) 38%, rgba(247,251,255,0.22) 70%, rgba(247,251,255,0.05) 100%), url('/assets/backgrounds/hero-watercolor-coast.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
