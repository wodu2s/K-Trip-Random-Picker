import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { HeroMysteryCard, type HeroTicketCardData } from "./HeroMysteryCard";
import { HeroCardOrbit } from "./HeroCardOrbit";

type SlotKey = "A" | "B" | "C" | "D" | "E";

type SlotStyle = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
  z: number;
};

/** leftBack → leftFront → center → rightFront → rightBack */
const SLOT_ORDER: SlotKey[] = ["A", "B", "C", "D", "E"];

const DESKTOP_SLOTS: Record<SlotKey, SlotStyle> = {
  A: { x: -140, y: 18, scale: 0.86, rotate: -10, opacity: 0.55, z: 1 },
  B: { x: -70, y: 8, scale: 0.94, rotate: -5, opacity: 0.82, z: 3 },
  C: { x: 0, y: -8, scale: 1, rotate: 0, opacity: 1, z: 5 },
  D: { x: 70, y: 8, scale: 0.94, rotate: 5, opacity: 0.82, z: 3 },
  E: { x: 140, y: 18, scale: 0.86, rotate: 10, opacity: 0.55, z: 1 },
};

const TABLET_SLOTS: Record<SlotKey, SlotStyle> = {
  A: { x: -108, y: 14, scale: 0.86, rotate: -10, opacity: 0.55, z: 1 },
  B: { x: -54, y: 6, scale: 0.94, rotate: -5, opacity: 0.82, z: 3 },
  C: { x: 0, y: -6, scale: 1, rotate: 0, opacity: 1, z: 5 },
  D: { x: 54, y: 6, scale: 0.94, rotate: 5, opacity: 0.82, z: 3 },
  E: { x: 108, y: 14, scale: 0.86, rotate: 10, opacity: 0.55, z: 1 },
};

const MOBILE_SLOTS: Record<SlotKey, SlotStyle> = {
  A: { x: -92, y: 12, scale: 0.8, rotate: -9, opacity: 0.2, z: 1 },
  B: { x: -48, y: 6, scale: 0.92, rotate: -4, opacity: 0.75, z: 3 },
  C: { x: 0, y: -6, scale: 1, rotate: 0, opacity: 1, z: 5 },
  D: { x: 48, y: 6, scale: 0.92, rotate: 4, opacity: 0.75, z: 3 },
  E: { x: 92, y: 12, scale: 0.8, rotate: 9, opacity: 0.2, z: 1 },
};

const CARDS: HeroTicketCardData[] = [
  { id: "t1", index: 1, emojis: ["🌊", "🌙"] },
  { id: "t2", index: 2, emojis: ["🌲", "🚶"] },
  { id: "t3", index: 3, emojis: ["🍜", "🏮"] },
  { id: "t4", index: 4, emojis: ["🏯", "🍁"] },
  { id: "t5", index: 5, emojis: ["🚲", "🌿"] },
];

const EASE: [number, number, number, number] = [0.22, 0.8, 0.2, 1];
const STEP_MS = 3500;
const MOVE_S = 0.9;

function useViewport() {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1440));

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 그룹 약 15% 축소, 우측 영역 55% 이하
  if (width < 640) {
    return { slots: MOBILE_SLOTS, cardW: 122, stageH: 248, maxW: 300, mobile: true };
  }
  if (width < 1024) {
    return { slots: TABLET_SLOTS, cardW: 136, stageH: 270, maxW: 340, mobile: false };
  }
  return { slots: DESKTOP_SLOTS, cardW: 150, stageH: 290, maxW: 360, mobile: false };
}

/**
 * Hero 우측 블루 여행 티켓 순환 그룹.
 * 실제 셔플 로직과 분리된 시각 티저.
 */
export function HeroMysteryCards() {
  const reduce = useReducedMotion();
  const { slots, cardW, stageH, maxW, mobile } = useViewport();
  const [offset, setOffset] = useState(0);
  const [hintPulse, setHintPulse] = useState(false);
  const [sparkFlash, setSparkFlash] = useState(false);
  const [swapAnim, setSwapAnim] = useState(false);

  useEffect(() => {
    if (reduce) return undefined;

    const tick = () => {
      setOffset((o) => (o + 1) % 5);
      setSwapAnim(true);
      setHintPulse(true);
      setSparkFlash(true);
      window.setTimeout(() => setSwapAnim(false), MOVE_S * 1000);
      window.setTimeout(() => setHintPulse(false), 500);
      window.setTimeout(() => setSparkFlash(false), 550);
    };

    const start = window.setTimeout(tick, 1200);
    const id = window.setInterval(tick, STEP_MS);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [reduce]);

  const cardSlots = useMemo(() => {
    return CARDS.map((card, i) => {
      const slotIndex = (i + offset) % 5;
      return { card, slotKey: SLOT_ORDER[slotIndex] };
    });
  }, [offset]);

  return (
    <div
      className="relative mx-auto w-full overflow-hidden"
      style={{ height: stageH, maxWidth: maxW }}
      aria-hidden="true"
    >
      <HeroCardOrbit flash={sparkFlash} reduce={reduce} mobile={mobile} />

      <motion.div
        className="absolute bottom-[7%] left-1/2 h-[32px] w-[70%] -translate-x-1/2 rounded-[100%] blur-[12px]"
        style={{
          background: "radial-gradient(ellipse, rgba(36,88,184,0.2), transparent 72%)",
        }}
        animate={
          reduce
            ? { opacity: 0.45, scaleX: 1 }
            : swapAnim
              ? { opacity: [0.4, 0.65, 0.45], scaleX: [0.94, 1.04, 1] }
              : { opacity: [0.4, 0.55, 0.4], scaleX: 1 }
        }
        transition={
          swapAnim
            ? { duration: 0.9, ease: EASE }
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ transform: "translateY(-6%)" }}
      >
        {cardSlots.map(({ card, slotKey }) => {
          const slot = slots[slotKey];
          const isCenter = slotKey === "C";
          const scaleTarget: number | number[] =
            !reduce && swapAnim && isCenter ? [0.94, 1.04, 1] : slot.scale;

          return (
            <motion.div
              key={card.id}
              className="absolute will-change-transform"
              style={{ zIndex: slot.z }}
              initial={false}
              animate={{
                x: slot.x,
                y: slot.y,
                scale: scaleTarget,
                rotate: slot.rotate,
                opacity: slot.opacity,
              }}
              transition={{
                duration: reduce ? 0 : MOVE_S,
                ease: EASE,
              }}
            >
              <HeroMysteryCard
                card={card}
                width={cardW}
                isCenter={isCenter}
                hintPulse={isCenter && hintPulse}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
