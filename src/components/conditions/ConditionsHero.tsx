import { motion } from "motion/react";
import { ADVENTURE_IMAGES } from "../../lib/adventureAssets";
import { usePreloadedImage } from "../../hooks/usePreloadedImage";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { Duration, ThemeKey } from "../../types/travel";
import { cn } from "../../utils/cn";

type Props = {
  duration: Duration | null;
  themes: ThemeKey[];
  className?: string;
  compact?: boolean;
};

/**
 * 오른쪽 탐험 장면 — 아치 창·책상·나침반·카드가 이미 담긴 실제 이미지를 그대로 사용한다.
 * (더 이상 CSS 아치 마스크나 합성 장식이 필요 없음)
 */
export function ConditionsHero({ className = "", compact = false }: Props) {
  const reduce = useReducedMotion();
  const { loaded, failed, src } = usePreloadedImage(ADVENTURE_IMAGES.conditionsScene);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[16px]",
        compact ? "h-[180px]" : "h-full",
        className,
      )}
      style={{ background: "var(--panel-deep)", border: "1px solid var(--gold-soft)" }}
    >
      {!failed && (
        <motion.img
          src={src}
          alt="아치 창 너머로 노을이 지는 탐험 서재 — 나침반, 지도, 여행 카드가 놓인 책상"
          draggable={false}
          fetchPriority="high"
          initial={reduce ? false : { scale: 1.02, opacity: 0 }}
          animate={{ scale: loaded ? [1, 1.015, 1] : 1.02, opacity: loaded ? 1 : 0 }}
          transition={{
            opacity: { duration: 0.45, ease: [0.22, 0.8, 0.2, 1] },
            scale: reduce
              ? { duration: 0.3 }
              : { duration: 24, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute inset-0 h-full w-full select-none object-cover object-center"
        />
      )}

      {/* 패널과 맞닿는 좌측 가장자리만 약하게 블렌딩 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(90deg, rgba(4,17,28,0.35) 0%, transparent 12%)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
