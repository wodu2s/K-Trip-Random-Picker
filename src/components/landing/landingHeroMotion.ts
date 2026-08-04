/** Landing Hero orchestration timings (ms) */

/** Text entrance duration */
export const HERO_INTRO_MS = 1200;
/** CTA fades in slightly after title */
export const HERO_CTA_DELAY_MS = 120;
/** After text intro completes, wait then start first demo (300–400ms) */
export const HERO_DEMO_DELAY_MS = 350;
/** Minimum Feature step highlight duration */
export const HERO_FEATURE_HOLD_MS = 600;

/** First demo gather → fan → focus → CTA pulse (~2.9s) */
export const HERO_DEMO_DUR_MS = 2900;
export const HERO_PREVIEW_DUR_MS = 2400;
export const HERO_PREVIEW_LOOP_MS = 10000;
export const HERO_EXIT_MS = 480;

export type HeroMotionPhase = "intro" | "idle" | "demo" | "preview" | "exit";
export type FeatureStep = 0 | 1 | 2 | null;

/** Demo beats — card-pick story + CTA glance */
export type DemoBeat =
  | "gather"
  | "split"
  | "cross"
  | "fan"
  | "focus"
  | "pointCta"
  | "settle";

/** Abbreviated repeat preview beats */
export type PreviewBeat = "rise" | "cross" | "focus" | "settle";
