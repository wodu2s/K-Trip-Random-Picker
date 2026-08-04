import type { FeatureStep } from "./landingHeroMotion";

/**
 * Landing navy atmosphere only — map is full-bleed in LandingHero.
 */
export function LandingBackground({
  activeStep: _activeStep = null,
  ctaHover: _ctaHover = false,
  exiting: _exiting = false,
  paused: _paused = false,
  reduce: _reduce = false,
}: {
  reduce?: boolean;
  paused?: boolean;
  activeStep?: FeatureStep;
  ctaHover?: boolean;
  exiting?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 58% 40%, #0A1C28 0%, #04121E 45%, #03101B 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 40% 45% at 72% 48%, rgba(185,113,17,0.04) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
