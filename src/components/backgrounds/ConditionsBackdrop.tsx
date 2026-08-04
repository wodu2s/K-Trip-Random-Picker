import { useParallax } from "../../hooks/useParallax";
import type { ThemeKey } from "../../types/travel";

/**
 * PAGE 2 조건 설정 배경 — 실제 언덕·곡선 도로·지도 핀 원화 이미지를 전체 배경으로 사용한다.
 * 최상단(진행 표시줄)에만 옅은 화면색 그라디언트를 얹어 글자 가독성을 확보한다.
 * theme prop은 추후 테마별 포인트 강조에 활용할 수 있도록 유지한다.
 */
export function ConditionsBackdrop({ theme: _theme }: { theme: ThemeKey | null }) {
  const parallax = useParallax(4);

  return (
    <div
      className="scene-backdrop"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(247,251,255,0.9) 0%, rgba(247,251,255,0.45) 14%, rgba(247,251,255,0.05) 30%, rgba(247,251,255,0.05) 100%), url('/assets/backgrounds/conditions-hills-road.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transform: `translate(${parallax.x * 0.4}px, ${parallax.y * 0.25}px)`,
      }}
    />
  );
}
