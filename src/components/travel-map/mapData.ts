import type { TravelMapArc, TravelMapNode, TravelMapRoute } from "./types";

/**
 * Target image nodes — 4 labeled primaries + secondary/minor waypoints
 * viewBox 0 0 500 625
 */
export const TRAVEL_NODES: readonly TravelMapNode[] = [
  {
    id: "seoul",
    label: "SEOUL",
    x: 195,
    y: 145,
    importance: "primary",
    delay: 0,
    labelAnchor: "left",
  },
  {
    id: "gangneung",
    label: "GANGNEUNG",
    x: 352,
    y: 158,
    importance: "primary",
    delay: 0.9,
    labelAnchor: "right",
  },
  {
    id: "daejeon",
    label: "DAEJEON",
    x: 242,
    y: 262,
    importance: "secondary",
    delay: 1.4,
  },
  {
    id: "jeonju",
    label: "JEONJU",
    x: 198,
    y: 318,
    importance: "secondary",
    delay: 0.5,
    labelAnchor: "left",
  },
  {
    id: "daegu",
    label: "DAEGU",
    x: 298,
    y: 368,
    importance: "secondary",
    delay: 1.7,
    labelAnchor: "right",
  },
  {
    id: "yeosu",
    label: "YEOSU",
    x: 232,
    y: 422,
    importance: "minor",
    delay: 2.1,
  },
  {
    id: "busan",
    label: "BUSAN",
    x: 338,
    y: 468,
    importance: "primary",
    delay: 0.55,
    labelAnchor: "right",
  },
  {
    id: "jeju",
    label: "JEJU",
    x: 198,
    y: 572,
    importance: "primary",
    delay: 1.2,
    labelAnchor: "left",
  },
];

/** Sweeping arc routes — target image flight-path curves */
export const TRAVEL_ROUTES: readonly TravelMapRoute[] = [
  {
    id: "seoul-gangneung",
    from: "seoul",
    to: "gangneung",
    path: "M195 145 Q268 88 352 158",
    importance: "primary",
    delay: 0.3,
    signal: true,
  },
  {
    id: "seoul-busan",
    from: "seoul",
    to: "busan",
    path: "M195 145 Q248 310 338 468",
    importance: "primary",
    delay: 0.45,
    signal: true,
  },
  {
    id: "gangneung-busan",
    from: "gangneung",
    to: "busan",
    path: "M352 158 Q382 320 338 468",
    importance: "secondary",
    delay: 0.6,
  },
  {
    id: "seoul-jeonju",
    from: "seoul",
    to: "jeonju",
    path: "M195 145 Q188 228 198 318",
    importance: "secondary",
    delay: 0.75,
  },
  {
    id: "jeonju-yeosu",
    from: "jeonju",
    to: "yeosu",
    path: "M198 318 Q212 372 232 422",
    importance: "secondary",
    delay: 0.85,
  },
  {
    id: "daegu-busan",
    from: "daegu",
    to: "busan",
    path: "M298 368 Q322 418 338 468",
    importance: "secondary",
    delay: 0.95,
  },
  {
    id: "busan-jeju",
    from: "busan",
    to: "jeju",
    path: "M338 468 Q268 538 198 572",
    importance: "primary",
    delay: 0.5,
    signal: true,
  },
];

/** Large orbital ellipses extending beyond landmass */
export const TRAVEL_ARCS: readonly TravelMapArc[] = [
  {
    id: "orbit-main",
    path: "M420 120 C520 220 520 420 420 520 C320 580 180 580 80 480 C-20 380 -20 180 80 80 C180 -20 320 -20 420 80",
    opacity: 0.24,
    lightPoint: true,
  },
  {
    id: "orbit-secondary",
    path: "M460 200 C540 300 540 400 460 480 C380 540 120 540 40 460 C-40 380 -40 280 40 200 C120 120 380 120 460 200",
    opacity: 0.16,
    dashed: true,
  },
  {
    id: "orbit-sweep",
    path: "M48 140 C148 40 348 40 448 140 C498 240 498 400 448 500",
    opacity: 0.14,
    dashed: true,
  },
];

export function routesForNode(nodeId: string): readonly TravelMapRoute[] {
  return TRAVEL_ROUTES.filter((r) => r.from === nodeId || r.to === nodeId);
}
