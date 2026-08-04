import { motion } from "motion/react";

/**
 * 티켓 상단 흰색 캡슐 — 이모지 힌트 최대 2개.
 */
export function CardHintWindow({
  emojis,
  twinkle = false,
  hoverScale = false,
  pulse = false,
}: {
  emojis: readonly string[] | [string, string];
  twinkle?: boolean;
  hoverScale?: boolean;
  /** 중앙 진입 시 한 번 밝아짐 */
  pulse?: boolean;
}) {
  const pair = emojis.slice(0, 2);
  if (pair.length === 0) return null;

  return (
    <motion.div
      className="absolute left-1/2 top-3.5 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full px-2.5 py-0.5"
      style={{
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 2px 8px rgba(18,48,92,0.12)",
      }}
      animate={
        pulse
          ? { opacity: [0.7, 1], scale: [0.96, 1.06, 1], filter: ["brightness(1)", "brightness(1.12)", "brightness(1)"] }
          : twinkle
            ? { opacity: [0.88, 1, 0.88], scale: hoverScale ? 1.03 : [1, 1.02, 1] }
            : { scale: hoverScale ? 1.03 : 1, opacity: 1 }
      }
      transition={
        pulse
          ? { duration: 0.5, ease: [0.22, 0.8, 0.2, 1] }
          : twinkle
            ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.22, ease: "easeOut" }
      }
      aria-hidden="true"
    >
      {pair.map((emoji, i) => (
        <span key={i} className="text-[18px] leading-none sm:text-[20px]">
          {emoji}
        </span>
      ))}
    </motion.div>
  );
}
