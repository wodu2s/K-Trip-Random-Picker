import { useEffect, useId, useState } from "react";
import southKorea from "@svg-maps/south-korea";

type SouthKoreaLocation = {
  id: string;
  name: string;
  path: string;
};

const locations = southKorea.locations as SouthKoreaLocation[];

type NodeId = "seoul" | "gangneung" | "busan" | "jeju";

/**
 * City markers — approximate points inside the package's own viewBox
 * (0 0 524 631), estimated from each province path's bounding box.
 * Gangneung sits on Gangwon's east coast, not the province centroid.
 */
const NODES: { id: NodeId; name: string; x: number; y: number; anchor: "start" | "end" }[] = [
  { id: "seoul", name: "서울", x: 152, y: 127, anchor: "start" },
  { id: "gangneung", name: "강릉", x: 345, y: 110, anchor: "start" },
  { id: "busan", name: "부산", x: 345, y: 402, anchor: "end" },
  { id: "jeju", name: "제주", x: 112, y: 592, anchor: "end" },
];

/** Single dashed route chaining the 4 nodes — 3 segments, one path element */
const ROUTE_D = "M152 127 Q250 100 345 110 Q400 260 345 402 Q230 492 112 592";

const PILL_W = 46;
const PILL_H = 22;

/**
 * Landing hero map — real South Korea province paths from
 * @svg-maps/south-korea (coordinates untouched), rendered as one silhouette
 * with 4 city nodes and one dashed route. Card deck stays in a separate
 * foreground layer.
 */
export function LandingHeroMap({ pulse = false }: { pulse?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const nodeGlowId = `hero-map-node-glow-${uid}`;
  const landGradId = `hero-map-land-grad-${uid}`;
  const dotPatternId = `hero-map-dots-${uid}`;
  const clipId = `hero-map-clip-${uid}`;
  const [litId, setLitId] = useState<NodeId | null>(null);

  useEffect(() => {
    if (!pulse) {
      setLitId(null);
      return;
    }
    let i = 0;
    setLitId(NODES[0]!.id);
    const id = window.setInterval(() => {
      i = (i + 1) % NODES.length;
      setLitId(NODES[i]!.id);
    }, 550);
    return () => window.clearInterval(id);
  }, [pulse]);

  return (
    <svg
      className="landing-hero-map"
      viewBox={southKorea.viewBox}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={landGradId} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#0D2438" />
          <stop offset="100%" stopColor="#050F18" />
        </linearGradient>
        <pattern id={dotPatternId} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.6" fill="#c89b3c" fillOpacity={0.35} />
        </pattern>
        <clipPath id={clipId}>
          {locations.map((loc) => (
            <path key={`clip-${loc.id}`} d={loc.path} />
          ))}
        </clipPath>
        <filter id={nodeGlowId} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Layer 1 — navy gradient fill + very faint dot pattern (clipped to landmass) */}
      <g fill={`url(#${landGradId})`} fillOpacity={0.22} stroke="none">
        {locations.map((loc) => (
          <path key={`fill-${loc.id}`} d={loc.path} />
        ))}
      </g>
      <rect x={0} y={0} width={524} height={631} fill={`url(#${dotPatternId})`} clipPath={`url(#${clipId})`} opacity={0.5} />

      {/* Layer 2 — province boundaries (also serves as the thin coastline) */}
      <g fill="none" stroke="#c89b3c" strokeOpacity={0.16} strokeWidth={0.8}>
        {locations.map((loc) => (
          <path key={`edge-${loc.id}`} d={loc.path} />
        ))}
      </g>

      {/* Layer 3 — one dashed route chaining the 4 candidate nodes */}
      <path
        d={ROUTE_D}
        stroke="#c89b3c"
        strokeWidth={0.9}
        strokeDasharray="3 6"
        strokeLinecap="round"
        fill="none"
        opacity={0.32}
      />

      {/* Layer 4 — nodes + labels */}
      {NODES.map((n) => {
        const lit = litId === n.id;
        const pillX = n.anchor === "start" ? n.x + 9 : n.x - 9 - PILL_W;
        return (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={lit ? 4.5 : 3.2}
              fill={lit ? "#FFF8EE" : "#D8B84A"}
              stroke="#c89b3c"
              strokeWidth={0.7}
              filter={`url(#${nodeGlowId})`}
            />
            <rect
              x={pillX}
              y={n.y - PILL_H / 2}
              width={PILL_W}
              height={PILL_H}
              rx={PILL_H / 2}
              fill="rgba(5, 16, 27, 0.72)"
              stroke={lit ? "#FFF8EE" : "rgba(200, 155, 60, 0.5)"}
              strokeWidth={0.9}
            />
            <text
              x={pillX + PILL_W / 2}
              y={n.y + 4}
              textAnchor="middle"
              fontSize={12.5}
              fontWeight={700}
              fill={lit ? "#FFF8EE" : "#c89b3c"}
            >
              {n.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
