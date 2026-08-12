import type { CSSProperties } from "react";
import type { CardPhase } from "../../types/travel";
import {
  isComplete,
  isSelectable,
  showsDeckOrbit,
  showsReadyAmbience,
  showsRestackFlash,
  showsSelectBurst,
  showsSpotlight,
} from "../../lib/cardPhaseUtils";
import "./shuffleDeck.css";

const PARTICLE_SEEDS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
  const radius = 44 + (i % 3) * 3;
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius * 0.88}%`,
    delay: `${(i * 0.37) % 2.4}s`,
    dur: `${3.2 + (i % 4) * 0.6}s`,
  };
});

const STAR_SEEDS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + 0.4;
  const radius = 46 + (i % 4) * 2.5;
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius * 0.9}%`,
    delay: `${(i * 0.53) % 4}s`,
    dur: `${3.6 + (i % 5) * 0.7}s`,
    sparkle: i % 5 === 0,
  };
});

const STAR_POINTS = STAR_SEEDS.map((s) => ({
  x: Number.parseFloat(s.left),
  y: Number.parseFloat(s.top),
}));

/** 별을 잇는 희미한 별자리 선 — STAR_SEEDS 인덱스 쌍 */
const CONSTELLATION_LINES: readonly [number, number][] = [
  [1, 5],
  [5, 10],
  [10, 3],
  [8, 13],
];

const BURST_ANGLES = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);

/** 무대 전체 분위기 — orbit·spotlight·별빛·파티클·선택 burst (나침반 자체 halo는 ShuffleFx가 담당) */
export function CardFx({
  phase,
  reduce,
  isMobile,
}: {
  phase: CardPhase;
  reduce: boolean;
  isMobile: boolean;
}) {
  const readyIdle = phase === "ready";
  const settled = isSelectable(phase);

  const showOrbit = showsDeckOrbit(phase) || readyIdle || settled;
  const showSpotlightFx = showsSpotlight(phase);
  const showReadyFx = showsReadyAmbience(phase);
  const showFlash = showsRestackFlash(phase);
  const showBurst = showsSelectBurst(phase);
  const completeFade = isComplete(phase);

  const ambientFx = (readyIdle || settled) && !completeFade;
  const particleCount = reduce || !(showReadyFx || settled) ? 0 : isMobile ? 6 : 12;
  const particles = PARTICLE_SEEDS.slice(0, particleCount);
  const starCount = reduce || !ambientFx ? 0 : isMobile ? 9 : 16;
  const stars = STAR_SEEDS.slice(0, starCount);

  const orbitMixing = phase === "mixing";
  const orbitReveal = phase === "revealing";

  return (
    <>
      <div
        className={`shuffle-deck__spotlight${showSpotlightFx ? " shuffle-deck__spotlight--on" : ""}${completeFade ? " shuffle-deck__spotlight--fade" : ""}`}
        aria-hidden="true"
      />

      {showOrbit ? (
        <div
          className={`shuffle-deck__orbit-layer${orbitMixing ? " shuffle-deck__orbit-layer--mixing" : ""}${orbitReveal ? " shuffle-deck__orbit-layer--reveal-spin" : ""}`}
          aria-hidden="true"
        >
          <div className="shuffle-deck__orbit shuffle-deck__orbit--outer">
            <span className="shuffle-deck__orbit-dot" />
          </div>
          {!isMobile ? (
            <div className="shuffle-deck__orbit shuffle-deck__orbit--inner">
              <span className="shuffle-deck__orbit-dot" />
            </div>
          ) : null}
        </div>
      ) : null}

      {!reduce && stars.length > 0 ? (
        <div className="shuffle-deck__stars" aria-hidden="true">
          {stars.map((s, idx) => (
            <span
              key={idx}
              className={`shuffle-deck__star${s.sparkle ? " shuffle-deck__star--sparkle" : ""}`}
              style={
                {
                  left: s.left,
                  top: s.top,
                  "--s-delay": s.delay,
                  "--s-dur": s.dur,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : null}

      {!reduce && ambientFx && !isMobile ? (
        <svg
          className="shuffle-deck__constellation"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {CONSTELLATION_LINES.map(([a, b], idx) => {
            const p1 = STAR_POINTS[a];
            const p2 = STAR_POINTS[b];
            if (!p1 || !p2) return null;
            return (
              <line
                key={idx}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="rgba(216,184,74,0.3)"
                strokeWidth="0.15"
              />
            );
          })}
        </svg>
      ) : null}

      {!reduce && particles.length > 0 ? (
        <div className="shuffle-deck__particles" aria-hidden="true">
          {particles.map((p, idx) => (
            <span
              key={idx}
              className="shuffle-deck__particle"
              style={
                {
                  left: p.left,
                  top: p.top,
                  "--p-delay": p.delay,
                  "--p-dur": p.dur,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : null}

      {showFlash && !reduce ? (
        <div
          className="shuffle-deck__restack-flash shuffle-deck__restack-flash--on"
          aria-hidden="true"
        />
      ) : null}

      {showBurst && !reduce ? (
        <>
          <div className="shuffle-deck__ripple shuffle-deck__ripple--on" aria-hidden="true" />
          <div className="shuffle-deck__burst shuffle-deck__burst--on" aria-hidden="true">
            {BURST_ANGLES.map((angle, idx) => {
              const dist = 28 + (idx % 3) * 12;
              const bx = Math.cos(angle) * dist;
              const by = Math.sin(angle) * dist;
              return (
                <span
                  key={idx}
                  className="shuffle-deck__burst-dot"
                  style={
                    {
                      "--bx": `${bx}px`,
                      "--by": `${by}px`,
                      animationDelay: `${idx * 0.02}s`,
                    } as CSSProperties
                  }
                />
              );
            })}
          </div>
        </>
      ) : null}
    </>
  );
}

/** @deprecated */
export function DeckOrbit({ active, reduce }: { active: boolean; reduce: boolean }) {
  if (!active || reduce) return null;
  return (
    <div className="shuffle-deck__orbit-layer" aria-hidden="true">
      <div className="shuffle-deck__orbit shuffle-deck__orbit--outer">
        <span className="shuffle-deck__orbit-dot" />
      </div>
    </div>
  );
}

export { DeckOrbit as GoldSparks };
