import { motion, AnimatePresence } from "motion/react";
import { TravelPostmark } from "./TravelPostmark";

/**
 * 선택 직후 0.3초 — 우측 하단에 여행 소인이 찍히는 애니메이션.
 * 게임식 펀치/네온 효과는 사용하지 않는다.
 */
export function TicketPunchEffect({ active, reduce }: { active: boolean; reduce: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.05 : 0.1 }}
          aria-hidden="true"
        >
          <motion.div
            className="absolute bottom-2.5 right-2.5"
            initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.35, y: -10, rotate: -28 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: -14 }}
            transition={{ duration: reduce ? 0.12 : 0.3, ease: [0.22, 0.8, 0.2, 1] }}
          >
            <TravelPostmark size={46} stamped />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const TicketPunchOverlay = TicketPunchEffect;
