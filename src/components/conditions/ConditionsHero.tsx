import { motion } from "motion/react";
import { ADVENTURE_IMAGES } from "../../lib/adventureAssets";
import { usePreloadedImage } from "../../hooks/usePreloadedImage";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../utils/cn";

type Props = {
  className?: string;
};

/**
 * 미지의 여정 미리보기 — 세로형 프레임 안에 첨부 이미지를 그대로 크게 사용한다.
 * 목적지는 끝까지 밝히지 않으며, 아주 느린 zoom 외의 연출은 넣지 않는다.
 */
export function ConditionsHero({ className = "" }: Props) {
  const reduce = useReducedMotion();
  const { loaded, failed, src } = usePreloadedImage(ADVENTURE_IMAGES.journeyPreview);

  return (
    <figure className={cn("dossier-frame", className)}>
      <figcaption className="px-1 pb-3 pt-1">
        <h2
          className="text-[17px] font-bold tracking-tight"
          style={{ color: "var(--ivory)", fontFamily: "'Noto Serif KR Variable', serif" }}
        >
          미지의 여정 미리보기
        </h2>
      </figcaption>

      <div
        /* 모바일은 4:5 비율, 데스크톱은 왼쪽 열 높이에 맞춰 세로로 채운다 */
        className="relative aspect-[4/5] overflow-hidden rounded-[2px] lg:aspect-auto lg:min-h-0 lg:flex-1"
        style={{
          background: "var(--panel-deep)",
          border: "1px solid rgba(196,156,92,0.35)",
        }}
      >
        {!failed && (
          <motion.img
            src={src}
            alt="노을이 지는 항구 마을이 내려다보이는 아치 회랑 — 목적지는 아직 알 수 없다"
            draggable={false}
            fetchPriority="high"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ scale: loaded && !reduce ? [1, 1.035, 1] : 1, opacity: loaded ? 1 : 0 }}
            transition={{
              opacity: { duration: 0.5, ease: [0.22, 0.8, 0.2, 1] },
              scale: reduce
                ? { duration: 0.3 }
                : { duration: 30, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute inset-0 h-full w-full select-none object-cover object-center"
          />
        )}
      </div>
    </figure>
  );
}
