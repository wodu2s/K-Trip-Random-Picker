/**
 * Target-image palette — dark navy + muted bronze constellation glow
 */
export const MAP_COLORS = {
  bgDeep: "#040810",
  bgMid: "#06111D",
  bgSoft: "#081722",
  coastGlow: "rgba(184, 145, 86, 0.42)",
  coastLine: "rgba(184, 145, 86, 0.55)",
  networkLine: "rgba(184, 145, 86, 0.22)",
  networkLineBright: "rgba(210, 175, 120, 0.38)",
  networkDot: "rgba(200, 168, 110, 0.55)",
  networkDotDim: "rgba(184, 145, 86, 0.28)",
  routeSecondary: "rgba(139, 159, 164, 0.3)",
  routePrimary: "rgba(184, 145, 86, 0.58)",
  routeGlow: "rgba(184, 145, 86, 0.14)",
  bronze: "#B89156",
  bronzeLight: "#C9A86A",
  bronzeLabel: "#B89156",
  ivory: "#F0E8D8",
  ivoryCore: "#FFF8EE",
  arc: "rgba(120, 140, 150, 0.2)",
  arcBronze: "rgba(184, 145, 86, 0.26)",
  halo: "rgba(184, 145, 86, 0.1)",
  signal: "#EDE8DB",
  signalGlow: "rgba(237, 232, 219, 0.3)",
  sparkle: "rgba(240, 232, 216, 0.75)",
  landFill: "rgba(8, 18, 28, 0.65)",
} as const;

export const MAP_VIEWBOX = { width: 500, height: 625 } as const;

export const VARIANT_MAX_WIDTH: Record<
  "hero" | "search" | "compact" | "embedded",
  string
> = {
  hero: "max-w-[760px]",
  search: "max-w-[680px]",
  compact: "max-w-[390px]",
  embedded: "max-w-none",
};
