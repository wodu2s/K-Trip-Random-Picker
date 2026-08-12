import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { FloatingParticles } from "./FloatingParticles";
import { HeroCopy } from "./HeroCopy";
import { HeroSteps } from "./HeroSteps";
import { LandingBackground } from "./LandingBackground";
import { LandingCardDeck } from "./LandingCardDeck";
import { LandingHeroMap } from "./LandingHeroMap";
import type { HeroMotionPhase } from "./landingHeroMotion";
import { HERO_EXIT_MS } from "./landingHeroMotion";
import "./landing-hero.css";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const update = () => setMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return mobile;
}

/**
 * Target B hero — full-bleed map, large right visual, wide feature bar.
 * CTA still calls onStart → conditions.
 */
export function LandingHero({ onStart }: { onStart: () => void }) {
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const [entered, setEntered] = useState(reduce);
  const [deckPhase, setDeckPhase] = useState<HeroMotionPhase>(
    reduce ? "idle" : "intro",
  );
  const [ctaHover, setCtaHover] = useState(false);
  const busy = deckPhase === "exit";

  useEffect(() => {
    if (reduce) {
      setEntered(true);
      setDeckPhase("idle");
      return;
    }
    /* StrictMode remount skips motion `initial` — drive entrance via state */
    const raf = window.requestAnimationFrame(() => setEntered(true));
    const t = window.setTimeout(() => setDeckPhase("idle"), 1700);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [reduce]);

  const handleStart = useCallback(() => {
    if (busy) return;
    setCtaHover(false);
    setDeckPhase("exit");
    window.setTimeout(() => {
      onStart();
    }, reduce ? 0 : HERO_EXIT_MS);
  }, [busy, onStart, reduce]);

  return (
    <section className="landing-hero" data-landing-hero="true">
      <LandingBackground
        reduce={reduce}
        ctaHover={ctaHover && !busy}
        exiting={busy}
      />

      <div className="landing-hero__map-bleed" aria-hidden="true">
        <LandingHeroMap pulse={ctaHover && !busy} />
      </div>

      <FloatingParticles reduce={reduce} mobile={mobile} />

      {/* Layer 2 — copy + CTA */}
      <div className="landing-hero__copy">
        <div className="landing-hero__flourish" aria-hidden="true">
          <svg width="26" height="14" viewBox="0 0 26 14" fill="none">
            <path
              d="M1 10 Q8 2 14 7 T25 4"
              stroke="#D8B84A"
              strokeWidth="1"
              opacity="0.6"
              fill="none"
            />
            <path
              d="M22 1 L23 3.2 L25 4 L23 4.8 L22 7 L21 4.8 L19 4 L21 3.2 Z"
              fill="#D8B84A"
              opacity="0.85"
            />
          </svg>
          <p className="landing-hero__flourish-text">
            오늘의 여행지는 운명이 정해줄 거예요
          </p>
        </div>
        <HeroCopy
          onStart={handleStart}
          reduce={reduce}
          busy={busy}
          onHoverChange={(h) => {
            if (busy) return;
            setCtaHover(h);
          }}
        />
      </div>

      {/* Layer 3 — large cards / compass / ticket */}
      <motion.div
        className="landing-hero__visual"
        data-landing-visual="true"
        aria-hidden="true"
        style={{ transformOrigin: "100% 50%" }}
        initial={false}
        animate={{
          opacity: deckPhase === "exit" ? 0.85 : entered ? 1 : 0,
          y: entered ? 0 : 24,
          scale: entered ? 0.77 : 1,
        }}
        transition={{
          duration: reduce ? 0.2 : 0.9,
          delay: reduce ? 0 : 0.15,
          ease: [0.22, 0.8, 0.2, 1],
        }}
      >
        <LandingCardDeck
          phase={deckPhase}
          motionKey={entered ? 1 : 0}
          ctaHover={ctaHover && deckPhase !== "exit"}
          reduce={reduce}
          animating={deckPhase === "exit"}
          entered={entered}
        />
      </motion.div>

      <HeroSteps reduce={reduce} />
    </section>
  );
}
