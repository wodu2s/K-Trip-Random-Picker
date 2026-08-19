import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ExpeditionCardArt } from "../cards/ExpeditionCardArt";
import { DECK_CARDS, DECK_OPACITY, type DeckCardToken } from "./landingAssets";
import type { DemoBeat, HeroMotionPhase, PreviewBeat } from "./landingHeroMotion";

const EASE = [0.22, 0.8, 0.2, 1] as const;
const EASE_INOUT = "easeInOut" as const;

/** Idle float — settled scale always 1; vertical bob only, within ±5px */
const CARD_IDLE = [
  { dx: 0, dy: -4, dr: 0, dur: 7, delay: 0.2 },
  { dx: 0, dy: -4.2, dr: 0, dur: 7, delay: 0.35 },
  { dx: 0, dy: -5, dr: 0, dur: 7, delay: 0 },
  { dx: 0, dy: -4.2, dr: 0, dur: 7, delay: 0.45 },
  { dx: 0, dy: -4, dr: 0, dur: 7, delay: 0.55 },
] as const;

/** Pixel-locked desktop poses — tightened fan gap around the center card */
const LOCKED_CARDS = [
  { left: 305, top: 70, w: 300, r: -10, z: 2 },
  { left: 334, top: 42, w: 330, r: -5, z: 3 },
  { left: 375, top: 20, w: 370, r: 0, z: 6 },
  { left: 514, top: 60, w: 340, r: 8, z: 4 },
  { left: 609, top: 110, w: 320, r: 14, z: 3 },
] as const;

type DeckLayout = {
  dist: number;
  frontW: number;
  backW: number;
  deckW: number;
  deckH: number;
  /** locked = pixel-perfect desktop; full = mid; peek = mobile */
  mode: "locked" | "full" | "peek";
  peekPx: number;
};

function useDeckLayout(): DeckLayout {
  const [layout, setLayout] = useState<DeckLayout>({
    dist: 1,
    frontW: 370,
    backW: 340,
    deckW: 940,
    deckH: 700,
    mode: "locked",
    peekPx: 12,
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 768) {
        setLayout({
          dist: 1,
          frontW: 210,
          backW: 190,
          deckW: Math.min(w - 16, 360),
          deckH: 400,
          mode: "peek",
          peekPx: 10,
        });
      } else if (w < 1024) {
        setLayout({
          dist: 1,
          frontW: 280,
          backW: 255,
          deckW: 620,
          deckH: 520,
          mode: "peek",
          peekPx: 12,
        });
      } else if (w < 1440 || h < 820) {
        setLayout({
          dist: 1,
          frontW: 330,
          backW: 305,
          deckW: 820,
          deckH: 640,
          mode: "full",
          peekPx: 12,
        });
      } else {
        setLayout({
          dist: 1,
          frontW: 370,
          backW: 340,
          deckW: 940,
          deckH: 700,
          mode: "locked",
          peekPx: 12,
        });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return layout;
}

/** Fan X — desktop uses exact tokens; peek = center 3 + outer edge 8–14px */
function fanX(index: number, card: DeckCardToken, layout: DeckLayout): number {
  if (layout.mode === "peek") {
    const mid = layout.frontW * 0.26;
    if (index === 0) return -(mid + layout.peekPx);
    if (index === 1) return -mid;
    if (index === 2) return 0;
    if (index === 3) return mid;
    return mid + layout.peekPx;
  }
  return card.x * layout.dist;
}

type Beat = DemoBeat | PreviewBeat;

export function LandingCardDeck({
  phase,
  motionKey,
  ctaHover,
  reduce,
  animating = false,
  entered = true,
}: {
  phase: HeroMotionPhase;
  motionKey: number;
  ctaHover: boolean;
  reduce: boolean;
  animating?: boolean;
  entered?: boolean;
}) {
  const layout = useDeckLayout();
  const [beat, setBeat] = useState<Beat>("settle");

  useEffect(() => {
    if (reduce) {
      setBeat("settle");
      return;
    }
    if (phase === "demo") {
      setBeat("gather");
      const t = [
        window.setTimeout(() => setBeat("split"), 380),
        window.setTimeout(() => setBeat("cross"), 780),
        window.setTimeout(() => setBeat("fan"), 1400),
        window.setTimeout(() => setBeat("focus"), 2050),
        window.setTimeout(() => setBeat("pointCta"), 2550),
        window.setTimeout(() => setBeat("settle"), 3000),
      ];
      return () => t.forEach((id) => window.clearTimeout(id));
    }
    if (phase === "preview") {
      setBeat("rise");
      const t = [
        window.setTimeout(() => setBeat("cross"), 320),
        window.setTimeout(() => setBeat("focus"), 1000),
        window.setTimeout(() => setBeat("settle"), 2000),
      ];
      return () => t.forEach((id) => window.clearTimeout(id));
    }
    setBeat("settle");
  }, [phase, motionKey, reduce]);

  const activeMotion = phase === "demo" || phase === "preview" || phase === "exit";
  const deckFloat =
    reduce
      ? { y: 0 }
      : phase === "preview" && beat !== "settle"
        ? { y: -3 }
        : phase === "demo"
          ? { y: beat === "settle" || beat === "pointCta" ? 0 : -2 }
          : phase === "exit"
            ? { y: -2 }
            : { y: [0, -2.5, 0] };

  const wc = animating || phase === "intro" ? "transform" : "auto";

  const locked = layout.mode === "locked";

  return (
    <div
      className="relative max-w-none overflow-visible"
      style={{
        width: layout.deckW,
        height: layout.deckH,
        transform: "none",
      }}
      data-landing-deck={layout.mode}
      aria-hidden="true"
    >
      <motion.p
        className="pointer-events-none absolute z-[7] whitespace-nowrap text-center"
        style={{
          left: "50%",
          top: locked ? -10 : "-4%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-family-base)",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "#F1DBA0",
          background: "rgba(5, 18, 30, 0.55)",
          border: "1px solid rgba(197, 160, 89, 0.45)",
          borderRadius: 9999,
          padding: "4px 14px",
        }}
        initial={false}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ duration: reduce ? 0.2 : 0.6, delay: reduce ? 0 : 0.5 }}
      >
        조건에 맞는 여행 후보 5곳
      </motion.p>

      <motion.div
        className="absolute inset-0 overflow-visible"
        style={{ willChange: wc, transformOrigin: "50% 50%" }}
        animate={deckFloat}
        transition={
          activeMotion || reduce
            ? { duration: 0.45, ease: EASE }
            : { duration: 7, ease: EASE_INOUT, repeat: Infinity }
        }
      >
        {DECK_CARDS.map((card, i) => {
          if (layout.mode === "peek" && i === 0) return null;
          /* Locked: hide outermost left so center + right dominate */
          if (locked && i === 0) return null;
          return (
            <DeckCardLayer
              key={`${card.id}-${motionKey}`}
              card={card}
              index={i}
              layout={layout}
              featured={i === 2}
              phase={phase}
              beat={beat}
              ctaHover={ctaHover}
              reduce={reduce}
              willChangeOn={animating || phase === "intro"}
              entered={entered}
            />
          );
        })}

      </motion.div>
    </div>
  );
}

function DeckCardLayer({
  card,
  index,
  layout,
  featured,
  phase,
  beat,
  ctaHover,
  reduce,
  willChangeOn,
  entered,
}: {
  card: DeckCardToken;
  index: number;
  layout: DeckLayout;
  featured: boolean;
  phase: HeroMotionPhase;
  beat: Beat;
  ctaHover: boolean;
  reduce: boolean;
  willChangeOn: boolean;
  entered: boolean;
}) {
  const lockedPose = LOCKED_CARDS[index];
  const locked = layout.mode === "locked" && lockedPose;
  const baseX = fanX(index, card, layout);
  const baseY = card.y * (layout.mode === "peek" ? 0.45 : layout.dist);
  const w = locked
    ? lockedPose.w
    : featured
      ? layout.frontW
      : layout.backW;
  const idle = CARD_IDLE[index] ?? CARD_IDLE[2]!;
  const left = index < 2;
  const right = index > 2;
  const faceOpacity = DECK_OPACITY[index] ?? 0.9;

  const pose = useMemo(() => {
    if (phase === "exit") {
      return {
        x: (index - 2) * 2.5,
        y: (index - 2) * 1.5,
        r: (index - 2) * 1,
        s: 1,
        z: locked ? lockedPose.z : card.z,
      };
    }

    let x = baseX;
    let y = baseY;
    let r = locked ? lockedPose.r : card.r;
    let z = locked ? lockedPose.z : card.z;

    if (phase === "demo") {
      if (beat === "gather") {
        x = (index - 2) * 4;
        y = (index - 2) * 3;
        r = (index - 2) * 1.5;
        z = 2 + index;
      } else if (beat === "split") {
        x = left ? baseX - 26 : right ? baseX + 26 : 0;
        y = featured ? baseY - 4 : baseY + (left ? -6 : 6);
        r = left ? -10 : right ? 10 : 0;
        z = featured ? 5 : 2;
      } else if (beat === "cross") {
        // Outer pair dips behind the featured card (z < 8)
        if (index === 0 || index === 1) {
          x = 40 + index * 8;
          y = baseY + 10;
          r = 5 + index;
          z = 2;
        } else if (index === 3 || index === 4) {
          x = -40 - (index - 3) * 8;
          y = baseY - 2;
          r = -5 - (index - 3);
          z = 3;
        } else {
          x = 0;
          y = baseY - 4;
          z = 4;
        }
      } else if (
        beat === "fan" ||
        beat === "focus" ||
        beat === "pointCta" ||
        beat === "settle"
      ) {
        x = baseX;
        y = baseY;
        r = card.r;
        z = card.z;
        // Emphasize with y / z only — no scale stack
        if ((beat === "focus" || beat === "pointCta") && featured) {
          y = baseY - 12;
          z = 6;
        }
      }
    }

    if (phase === "preview") {
      if (beat === "rise") y = baseY - 2;
      if (beat === "cross" || beat === "focus") {
        if (index === 1) {
          x = baseX + 36;
          y = baseY - 6;
          r = card.r + 3;
          z = 3;
        } else if (index === 3) {
          x = baseX - 36;
          y = baseY - 5;
          r = card.r - 3;
          z = 2;
        }
      }
      if (beat === "focus" && featured) {
        y = baseY - 10;
        z = 6;
      }
    }

    if (ctaHover) {
      x = baseX * 0.93;
      if (featured) {
        y = baseY - 6;
        z = 6;
      }
    }

    if (reduce && featured) y = baseY - 4;

    /* Locked mode: ignore fan offsets — absolute pixel layout handles place */
    if (locked) {
      return { x: 0, y: 0, r: lockedPose.r, s: 1, z: lockedPose.z };
    }

    return { x, y, r, s: 1, z };
  }, [
    phase,
    beat,
    baseX,
    baseY,
    card,
    featured,
    index,
    ctaHover,
    reduce,
    left,
    right,
    locked,
    lockedPose,
  ]);

  const showSweep =
    !reduce &&
    featured &&
    ((phase === "demo" && (beat === "focus" || beat === "pointCta")) ||
      (phase === "preview" && beat === "focus") ||
      ctaHover);

  const stagger =
    phase === "intro"
      ? 0.12 + index * 0.12
      : phase === "demo" && beat === "fan"
        ? index * 0.08
        : phase === "exit"
          ? index * 0.03
          : index * 0.12;

  const duration =
    phase === "demo" && beat === "gather"
      ? 0.32
      : phase === "demo" && beat === "cross"
        ? 0.48
        : phase === "demo" && beat === "fan"
          ? 0.42
          : phase === "exit"
            ? 0.4
            : featured
              ? 0.9
              : 1.05;

  const idlePaused =
    reduce ||
    phase === "demo" ||
    phase === "preview" ||
    phase === "exit" ||
    phase === "intro" ||
    ctaHover;

  if (locked && lockedPose) {
    return (
      <motion.div
        className="absolute"
        data-landing-card={featured ? "center" : `back-${index}`}
        style={{
          left: lockedPose.left,
          top: lockedPose.top,
          zIndex: pose.z,
          pointerEvents: "none",
          willChange: willChangeOn ? "transform" : "auto",
        }}
        initial={false}
        animate={{
          opacity: entered ? faceOpacity : 0,
          x: entered ? 0 : featured ? 0 : right ? 40 : -28,
          y: entered ? 0 : 24,
          rotate: pose.r,
          scale: 1,
        }}
        transition={{
          duration: reduce ? 0.2 : duration,
          delay: reduce || !entered ? 0 : 0.28 + stagger,
          ease: EASE,
        }}
      >
        <motion.div
          animate={
            idlePaused
              ? { y: 0 }
              : { y: [0, idle.dy, 0] }
          }
          transition={
            idlePaused
              ? { duration: 0.25 }
              : {
                  duration: idle.dur,
                  ease: EASE_INOUT,
                  repeat: Infinity,
                  delay: idle.delay,
                }
          }
        >
          <div
            className="relative overflow-hidden outline-none"
            style={{
              width: w,
              aspectRatio: "2 / 3",
              border: "none",
              borderRadius: 10,
              boxShadow: featured
                ? "0 34px 70px rgba(0, 0, 0, 0.56), 0 10px 28px rgba(0, 0, 0, 0.38)"
                : "0 24px 50px rgba(0, 0, 0, 0.45)",
              filter: cardDepthFilter(index, featured, ctaHover, phase, beat),
            }}
          >
            <ExpeditionCardArt
              featured={featured}
              showHints={featured}
              serial={index + 1}
            />
            <AnimatePresence>
              {showSweep ? <BrassEdgeSweep key={`sweep-${phase}-${beat}`} /> : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute left-1/2 top-[46%]"
      data-landing-card={featured ? "center" : `back-${index}`}
      style={{
        zIndex: pose.z,
        pointerEvents: "none",
        willChange: willChangeOn ? "transform" : "auto",
      }}
      initial={false}
      animate={{
        opacity: entered ? faceOpacity : 0,
        x: entered ? pose.x : left ? pose.x - 36 : right ? pose.x + 36 : 0,
        y: entered ? pose.y : pose.y + 24,
        rotate: pose.r,
        scale: 1,
      }}
      transition={{
        duration: phase === "idle" || phase === "intro" ? 0.9 : duration,
        delay: reduce || !entered ? 0 : 0.28 + index * 0.06 + stagger,
        ease: EASE,
      }}
    >
      <motion.div
        className="relative -translate-x-1/2 -translate-y-1/2"
        animate={
          idlePaused
            ? { x: 0, y: 0, rotate: 0 }
            : {
                x: [0, idle.dx, 0],
                y: [0, idle.dy, 0],
                rotate: [0, idle.dr, 0],
              }
        }
        transition={
          idlePaused
            ? { duration: 0.25 }
            : {
                duration: idle.dur,
                ease: EASE_INOUT,
                repeat: Infinity,
                delay: idle.delay,
              }
        }
      >
        <div
          className="relative overflow-hidden rounded-[var(--radius-card)] outline-none"
          style={{
            width: w,
            aspectRatio: "2 / 3",
            border: "none",
            outline: "none",
            boxShadow: featured
              ? "0 34px 70px rgba(0, 0, 0, 0.56), 0 10px 28px rgba(0, 0, 0, 0.38)"
              : "0 24px 50px rgba(0, 0, 0, 0.45)",
            transition: "box-shadow 200ms ease, filter 200ms ease",
            filter: cardDepthFilter(index, featured, ctaHover, phase, beat),
          }}
        >
          <ExpeditionCardArt
            featured={featured}
            showHints={featured}
            serial={index + 1}
          />
          <AnimatePresence>
            {showSweep ? <BrassEdgeSweep key={`sweep-${phase}-${beat}`} /> : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Depth — center bright/sharp; right-back cards darker */
function cardDepthFilter(
  index: number,
  featured: boolean,
  ctaHover: boolean,
  phase: HeroMotionPhase,
  beat: Beat,
): string {
  const emphasize =
    featured &&
    ((phase === "demo" && (beat === "focus" || beat === "pointCta")) ||
      (phase === "preview" && beat === "focus") ||
      ctaHover);

  if (featured) {
    return emphasize
      ? "brightness(1.13) contrast(1.09) saturate(1.06) drop-shadow(0 22px 36px rgba(0,0,0,0.5))"
      : "brightness(1.13) contrast(1.09) saturate(1.06)";
  }
  if (index === 4) {
    return "brightness(0.7) saturate(0.76)";
  }
  if (index === 3) {
    return "brightness(0.83) saturate(0.88)";
  }
  if (index === 0) {
    return "brightness(0.78) saturate(0.84)";
  }
  return "brightness(0.86) saturate(0.9)";
}

function BrassEdgeSweep() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[3] overflow-hidden"
      style={{ borderRadius: "var(--radius-card)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          padding: "2px",
          background:
            "conic-gradient(from 210deg, transparent 0 70%, rgba(232,206,124,0.9) 78%, rgba(201,162,39,0.5) 82%, transparent 88% 100%)",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        }}
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: 360, opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 1.05,
          ease: [0.4, 0.05, 0.2, 1],
          times: [0, 0.15, 0.55, 1],
        }}
      />
    </motion.div>
  );
}

