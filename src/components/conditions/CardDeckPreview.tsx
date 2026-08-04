import { motion } from "motion/react";
import { Compass } from "lucide-react";
import { ExpeditionCardArt } from "../cards/ExpeditionCardArt";
import { ADVENTURE } from "../../lib/adventureCardTokens";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../utils/cn";

/**
 * 다음 단계 예고용 미니 덱 — 히어로 우측 하단에 배치.
 * 실제 카드 UI를 대체하지 않는다.
 */
export function CardDeckPreview({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const layers = [
    { x: -18, y: 8, r: -10, z: 1 },
    { x: -4, y: 3, r: -3, z: 2 },
    { x: 10, y: 0, r: 5, z: 3 },
  ];

  return (
    <motion.div
      className={cn(
        "pointer-events-none relative h-[110px] w-[clamp(150px,14vw,230px)]",
        className,
      )}
      initial={reduce ? false : { opacity: 0, y: 16, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.45, delay: 0.22, ease: [0.22, 0.8, 0.2, 1] }}
      aria-hidden="true"
    >
      <p
        className="font-expedition absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold tracking-[0.14em]"
        style={{ color: ADVENTURE.brass }}
      >
        NEXT · CARD DRAW
      </p>
      {layers.map((layer, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 drop-shadow-[0_12px_18px_rgba(22,40,31,0.26)]"
          style={{
            zIndex: layer.z,
            transform: `translate(calc(-50% + ${layer.x}px), calc(-50% + ${layer.y}px)) rotate(${layer.r}deg)`,
          }}
        >
          <MiniDeckCard face={i === 2 ? "hint" : "back"} />
        </div>
      ))}
    </motion.div>
  );
}

function MiniDeckCard({ face }: { face: "back" | "hint" }) {
  if (face === "hint") {
    return (
      <div
        className="flex h-[96px] w-[64px] flex-col items-center justify-center rounded-[10px] px-1"
        style={{
          background: ADVENTURE.parchmentLight,
          border: `1.5px solid ${ADVENTURE.brass}`,
          boxShadow: "inset 0 0 0 1px rgba(201,162,39,0.35)",
        }}
      >
        <p
          className="font-expedition text-[6px] font-bold tracking-[0.12em]"
          style={{ color: ADVENTURE.forestDark }}
        >
          HINT
        </p>
        <Compass className="mt-1 h-5 w-5" style={{ color: ADVENTURE.brass }} strokeWidth={1.7} />
      </div>
    );
  }

  return (
    <div className="h-[96px] w-[64px] overflow-hidden rounded-[10px]">
      <ExpeditionCardArt featured={false} />
    </div>
  );
}
