import { motion } from "motion/react";
import { ADVENTURE } from "../../lib/adventureCardTokens";

/**
 * PICKED expedition stamp — brass + warm ochre print feel.
 * Appears after card centers; scale 1.4 → 1 (fade only if reduced-motion).
 */
export function PickedStamp({
  active,
  reduce = false,
}: {
  active: boolean;
  reduce?: boolean;
}) {
  if (!active) return null;

  return (
    <motion.div
      className="pointer-events-none absolute bottom-[12%] right-[5%] z-20"
      initial={
        reduce
          ? { opacity: 0, scale: 1, rotate: -8 }
          : { opacity: 0, scale: 1.4, rotate: -12 }
      }
      animate={{ opacity: 0.92, scale: 1, rotate: -8 }}
      transition={{
        duration: reduce ? 0.18 : 0.28,
        ease: [0.22, 0.8, 0.2, 1],
      }}
      aria-hidden="true"
    >
      <div
        className="relative flex h-[72px] w-[72px] items-center justify-center sm:h-[78px] sm:w-[78px]"
        style={{
          borderRadius: "46% 54% 48% 52% / 52% 46% 54% 48%",
          border: `2.5px solid ${ADVENTURE.orange}`,
          boxShadow: `
            inset 0 0 0 1.5px ${ADVENTURE.brass},
            inset 0 0 0 4px rgba(169,91,54,0.12),
            0 2px 6px rgba(43,35,24,0.12)
          `,
          background:
            "radial-gradient(circle at 40% 35%, rgba(232,206,124,0.28) 0%, rgba(169,91,54,0.16) 55%, rgba(201,162,39,0.12) 100%)",
        }}
      >
        {/* Irregular ink edge suggestion */}
        <div
          className="absolute inset-[5px] rounded-[inherit] opacity-40"
          style={{
            border: `1px dashed ${ADVENTURE.brassLine}`,
          }}
        />
        <div className="relative flex flex-col items-center leading-none">
          <span
            className="font-expedition text-[11px] font-bold tracking-[0.16em] sm:text-[12px]"
            style={{
              color: ADVENTURE.orange,
              textShadow: `0 0 0.5px ${ADVENTURE.brassLine}`,
            }}
          >
            PICKED
          </span>
          <span
            className="mt-1 block h-px w-8"
            style={{ background: ADVENTURE.brassLine, opacity: 0.65 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
