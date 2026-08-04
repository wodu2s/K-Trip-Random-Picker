import type { ReactNode } from "react";

export type NodeImportance = "primary" | "secondary" | "minor";

export type RouteImportance = "primary" | "secondary";

export type TravelMapVariant = "hero" | "search" | "compact";

export type TravelMapNode = {
  id: string;
  label?: string;
  /** viewBox coordinates */
  x: number;
  y: number;
  importance: NodeImportance;
  /** Stagger pulse / draw timing (seconds) */
  delay: number;
  /** Label anchor relative to node */
  labelAnchor?: "left" | "right";
};

export type TravelMapRoute = {
  id: string;
  from: string;
  to: string;
  path: string;
  importance: RouteImportance;
  delay: number;
  /** Allow a signal dot to travel along this route */
  signal?: boolean;
};

export type TravelMapArc = {
  id: string;
  path: string;
  opacity: number;
  dashed?: boolean;
  /** Light point travels along arc */
  lightPoint?: boolean;
};

export type TravelNetworkMapProps = {
  activeNodeId?: string;
  onNodeSelect?: (nodeId: string) => void;
  interactive?: boolean;
  showLabels?: boolean;
  variant?: TravelMapVariant;
  className?: string;
  /** Replace default silhouette (PNG/SVG img or custom SVG) */
  mapAsset?: ReactNode;
  /** 0–1 — for search / spotlight integration */
  revealIntensity?: number;
  /** Fill parent container (landing background embed) */
  embedded?: boolean;
};
