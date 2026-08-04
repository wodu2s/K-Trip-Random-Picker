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

const PARTICLE_SEEDS = Array.from({ length: 12 }, (_, i) => ({
  left: `${8 + (i * 7.3) % 84}%`,
  top: `${12 + (i * 11) % 76}%`,
  delay: `${(i * 0.37) % 2.4}s`,
  dur: `${3.2 + (i % 4) * 0.6}s`,
}));

const BURST_ANGLES = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);

/** 덱 뒤 글로우·orbit·spotlight·파티클·선택 burst */
export function CardFx({
  phase,
  reduce,
  isMobile,
  centerGlow = false,
}: {
  phase: CardPhase;
  reduce: boolean;
  isMobile: boolean;
  centerGlow?: boolean;
}) {
  const showOrbit = showsDeckOrbit(phase);
  const showSpotlightFx = showsSpotlight(phase);
  const showReadyFx = showsReadyAmbience(phase);
  const showFlash = showsRestackFlash(phase);
  const showBurst = showsSelectBurst(phase);
  const completeFade = isComplete(phase);

  const particleCount = reduce || !showReadyFx ? 0 : isMobile ? 4 : 7;
  const particles = PARTICLE_SEEDS.slice(0, particleCount);

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

      {centerGlow && isSelectable(phase) ? (
        <div
          className="shuffle-deck__center-glow shuffle-deck__center-glow--pulse pointer-events-none absolute left-1/2 top-1/2 -z-10"
          style={{ width: 120, height: 160, marginLeft: -60, marginTop: -80 }}
          aria-hidden="true"
        />
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
