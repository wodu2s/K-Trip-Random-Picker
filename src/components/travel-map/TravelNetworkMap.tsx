import { useEffect, useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { KoreaSilhouette } from "./KoreaSilhouette";
import { MapArc } from "./MapArc";
import { MapNode } from "./MapNode";
import { MapRoute } from "./MapRoute";
import { RouteSparkles } from "./RouteSparkles";
import { TRAVEL_ARCS, TRAVEL_NODES, TRAVEL_ROUTES } from "./mapData";
import { MAP_COLORS, MAP_VIEWBOX, VARIANT_MAX_WIDTH } from "./mapTokens";
import type { TravelMapNode, TravelNetworkMapProps } from "./types";

type Breakpoint = "desktop" | "tablet" | "mobile";

function useMapBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setBp("mobile");
      else if (w < 1024) setBp("tablet");
      else setBp("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bp;
}

/**
 * Premium Korea travel network map — target: constellation land + radar nodes + arc routes
 */
export function TravelNetworkMap({
  activeNodeId,
  onNodeSelect,
  interactive = false,
  showLabels = true,
  variant = "hero",
  className = "",
  mapAsset,
  revealIntensity,
  embedded = false,
}: TravelNetworkMapProps) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();
  const breakpoint = useMapBreakpoint();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const clipId = `tnm-clip-${uid}`;
  const landGradId = `tnm-land-${uid}`;

  const compact = variant === "compact" || breakpoint === "mobile";
  const isSearch = variant === "search";

  const revealOpacity = useMemo(() => {
    if (revealIntensity !== undefined) return revealOpacityClamp(revealIntensity);
    if (isSearch && !activeNodeId) return 0.35;
    if (isSearch && activeNodeId) return 0.88;
    return 1;
  }, [revealIntensity, isSearch, activeNodeId]);

  const nodes = useMemo(() => {
    if (breakpoint === "mobile") {
      return TRAVEL_NODES.filter((n) => n.importance !== "minor");
    }
    return TRAVEL_NODES;
  }, [breakpoint]);

  const arcs = useMemo(() => {
    if (breakpoint === "mobile") return TRAVEL_ARCS.slice(0, 1);
    if (breakpoint === "tablet") {
      return TRAVEL_ARCS.map((a) => ({ ...a, opacity: a.opacity * 0.72 }));
    }
    return TRAVEL_ARCS;
  }, [breakpoint]);

  const focusId = hoveredId ?? activeNodeId ?? null;

  const maxWidthKey = embedded ? "embedded" : variant;
  const sizeClass = embedded
    ? "relative aspect-[4/5] w-full max-w-none"
    : `relative mx-auto aspect-[4/5] w-full ${VARIANT_MAX_WIDTH[maxWidthKey]}`;

  return (
    <div
      className={[sizeClass, "select-none", isSearch ? "opacity-95" : "", className].join(" ")}
      style={isSearch ? { filter: "brightness(0.85) saturate(0.9)" } : undefined}
    >
      {/* Layer 1 — soft halo */}
      <div
        className="pointer-events-none absolute inset-[-8%] -z-10"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 55% 48% at 50% 44%, ${MAP_COLORS.halo} 0%, transparent 70%)`,
        }}
      />

      <motion.svg
        viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
        className="h-full w-full overflow-visible"
        fill="none"
        role={interactive ? "group" : "img"}
        aria-label={interactive ? undefined : "대한민국 여행 네트워크 지도"}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: revealOpacity }}
        transition={{ duration: reduce ? 0.2 : 0.8, ease: [0.22, 0.8, 0.2, 1] }}
      >
        {/* Layer 7 — outer orbit arcs (behind land) */}
        <g style={{ opacity: revealOpacity * 0.9 }}>
          {arcs.map((arc) => (
            <MapArc
              key={arc.id}
              arc={arc}
              reduce={reduce}
              compact={compact}
              revealOpacity={1}
            />
          ))}
        </g>

        {/* Layer 2–3 — constellation silhouette (swappable) */}
        {mapAsset ?? (
          <KoreaSilhouette clipId={clipId} landGradId={landGradId} dimmed={isSearch} />
        )}

        {/* Layer 5 + 8 — sweeping routes & signal dots */}
        <g style={{ opacity: revealOpacity }}>
          {TRAVEL_ROUTES.map((route) => {
            const emphasized =
              focusId !== null && (route.from === focusId || route.to === focusId);
            const dimmed = focusId !== null && !emphasized && interactive;
            return (
              <MapRoute
                key={route.id}
                route={route}
                reduce={reduce}
                emphasized={emphasized}
                dimmed={dimmed}
                revealOpacity={1}
                showSignal={!isSearch}
                compact={compact}
              />
            );
          })}
        </g>

        <RouteSparkles reduce={reduce} compact={compact} revealOpacity={revealOpacity} />

        {/* Layer 4 + 6 + 9 — radar nodes & labels */}
        <g style={{ pointerEvents: interactive ? "auto" : "none" }}>
          {nodes.map((node) => (
            <MapNode
              key={node.id}
              node={node}
              reduce={reduce}
              interactive={interactive}
              showLabel={showLabels}
              isActive={activeNodeId === node.id}
              isHovered={hoveredId === node.id}
              isDimmed={focusId !== null && focusId !== node.id && interactive}
              revealOpacity={nodeReveal(node, isSearch, activeNodeId, revealOpacity)}
              compact={compact}
              onSelect={onNodeSelect}
              onHover={setHoveredId}
            />
          ))}
        </g>
      </motion.svg>
    </div>
  );
}

function revealOpacityClamp(v: number): number {
  return Math.min(1, Math.max(0.12, v));
}

function nodeReveal(
  node: TravelMapNode,
  isSearch: boolean,
  activeNodeId: string | undefined,
  base: number,
): number {
  if (!isSearch) return base;
  if (!activeNodeId) {
    return node.importance === "primary" ? base * 0.5 : base * 0.18;
  }
  if (node.id === activeNodeId) return base;
  return base * 0.42;
}

export default TravelNetworkMap;
