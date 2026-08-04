import { useId } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/* =============================================================================
 * TravelMapHero — Pick&Go premium Korea expedition map
 *
 * Style: dark navy · deep teal · muted bronze · refined expedition
 * Tech: React + TypeScript + Tailwind + motion/react · SVG · responsive
 * ============================================================================= */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type TravelMapNode = {
  id: string;
  label: string;
  /** viewBox coordinates (0 0 420 640) */
  x: number;
  y: number;
  /** Hub nodes — SEOUL / BUSAN */
  emphasis?: boolean;
  showLabel?: boolean;
};

export type TravelMapRoute = {
  id: string;
  from: string;
  to: string;
  /** SVG path `d` */
  d: string;
};

export type TravelMapOrbit = {
  id: string;
  d: string;
  dashed?: boolean;
  opacity: number;
};

/* -------------------------------------------------------------------------- */
/* Map data                                                                   */
/* -------------------------------------------------------------------------- */

/** 8 travel nodes across the peninsula */
export const TRAVEL_MAP_NODES: readonly TravelMapNode[] = [
  { id: "seoul", label: "SEOUL", x: 176, y: 132, emphasis: true, showLabel: true },
  { id: "gangneung", label: "GANGNEUNG", x: 314, y: 148 },
  { id: "daejeon", label: "DAEJEON", x: 206, y: 264 },
  { id: "jeonju", label: "JEONJU", x: 184, y: 308 },
  { id: "gwangju", label: "GWANGJU", x: 164, y: 394 },
  { id: "yeosu", label: "YEOSU", x: 224, y: 424 },
  { id: "busan", label: "BUSAN", x: 298, y: 482, emphasis: true, showLabel: true },
  { id: "jeju", label: "JEJU", x: 194, y: 582 },
];

/** Subtle route connections between nodes */
export const TRAVEL_MAP_ROUTES: readonly TravelMapRoute[] = [
  {
    id: "r-seoul-gangneung",
    from: "seoul",
    to: "gangneung",
    d: "M176 132 C218 114 268 122 314 148",
  },
  {
    id: "r-seoul-daejeon",
    from: "seoul",
    to: "daejeon",
    d: "M176 132 C184 174 196 224 206 264",
  },
  {
    id: "r-daejeon-jeonju",
    from: "daejeon",
    to: "jeonju",
    d: "M206 264 C200 280 190 296 184 308",
  },
  {
    id: "r-jeonju-gwangju",
    from: "jeonju",
    to: "gwangju",
    d: "M184 308 C174 338 168 368 164 394",
  },
  {
    id: "r-gwangju-yeosu",
    from: "gwangju",
    to: "yeosu",
    d: "M164 394 C182 404 206 414 224 424",
  },
  {
    id: "r-yeosu-busan",
    from: "yeosu",
    to: "busan",
    d: "M224 424 C246 444 272 464 298 482",
  },
  {
    id: "r-busan-jeju",
    from: "busan",
    to: "jeju",
    d: "M298 482 C266 524 226 558 194 582",
  },
  {
    id: "r-seoul-busan",
    from: "seoul",
    to: "busan",
    d: "M176 132 C196 216 246 356 298 482",
  },
];

/** 2 orbit-like arcs — decorative, not route lines */
export const TRAVEL_MAP_ORBITS: readonly TravelMapOrbit[] = [
  {
    id: "orbit-east",
    d: "M346 62 C468 142 492 312 432 462 C392 542 302 592 202 606",
    opacity: 0.22,
  },
  {
    id: "orbit-west",
    d: "M88 104 C-12 214 -2 384 76 504 C126 568 206 598 286 604",
    dashed: true,
    opacity: 0.15,
  },
];

/* -------------------------------------------------------------------------- */
/* Geometry — simplified Korea silhouette (viewBox 420 × 640)                 */
/* -------------------------------------------------------------------------- */

const KOREA_MAIN =
  "M204 18 C236 8 270 14 300 38 C326 60 346 92 360 130 C372 166 380 206 384 248 C390 300 388 350 378 398 C368 446 352 490 330 526 C308 562 280 586 246 596 C212 606 178 598 154 570 C132 544 118 508 108 468 C96 420 88 370 86 320 C84 270 92 222 110 180 C130 136 156 98 186 66 C196 44 198 28 204 18 Z";

const KOREA_JEJU =
  "M166 554 C194 540 226 546 244 568 C254 584 248 606 222 614 C194 622 164 610 152 586 C146 570 152 558 166 554 Z";

const KOREA_ULLEUNG =
  "M376 216 C390 208 404 214 410 230 C414 242 406 256 390 260 C374 264 362 252 360 236 C358 222 366 214 376 216 Z";

/* -------------------------------------------------------------------------- */
/* Palette — navy / deep teal / muted bronze (desaturated, not neon)          */
/* -------------------------------------------------------------------------- */

const PALETTE = {
  navyDeep: "#071018",
  navyMid: "#0D1F2A",
  tealDeep: "#122A36",
  tealSoft: "#1A3542",
  bronzeMuted: "#947C60",
  bronzeLine: "rgba(148, 124, 96, 0.42)",
  bronzeGlow: "rgba(148, 124, 96, 0.14)",
  coast: "rgba(100, 130, 140, 0.38)",
  mesh: "rgba(72, 108, 118, 0.18)",
  ivory: "#D8D0C2",
  ivorySoft: "#C4BCAE",
  label: "#E0D8CC",
  arc: "rgba(118, 108, 92, 0.28)",
} as const;

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

export type TravelMapHeroProps = {
  className?: string;
  /** Soft radial wash behind the map */
  withBackdrop?: boolean;
  /** Fill parent — used when embedded in landing background */
  embedded?: boolean;
};

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

export function TravelMapHero({
  className = "",
  withBackdrop = false,
  embedded = false,
}: TravelMapHeroProps) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();

  const clipId = `tm-clip-${uid}`;
  const landGradId = `tm-land-${uid}`;
  const routeGlowId = `tm-route-glow-${uid}`;

  return (
    <div
      className={[
        embedded
          ? "relative aspect-[420/640] w-full max-w-none"
          : "relative mx-auto aspect-[420/640] w-full max-w-[480px] sm:max-w-[560px] md:max-w-[640px] lg:max-w-[720px]",
        "select-none",
        className,
      ].join(" ")}
      aria-hidden={withBackdrop ? undefined : embedded ? true : undefined}
    >
      {withBackdrop ? (
        <div
          className="pointer-events-none absolute inset-[-6%] -z-10"
          style={{
            background:
              "radial-gradient(ellipse 62% 52% at 50% 44%, rgba(10,28,40,0.45) 0%, transparent 70%)",
          }}
        />
      ) : null}

      <svg
        viewBox="0 0 420 640"
        className="h-full w-full overflow-visible"
        fill="none"
        role="img"
        aria-label="대한민국 여행 지도"
      >
        <defs>
          <linearGradient id={landGradId} x1="16%" y1="6%" x2="84%" y2="94%">
            <stop offset="0%" stopColor={PALETTE.navyMid} />
            <stop offset="42%" stopColor={PALETTE.tealDeep} />
            <stop offset="100%" stopColor={PALETTE.navyDeep} />
          </linearGradient>

          <clipPath id={clipId}>
            <path d={KOREA_MAIN} />
            <path d={KOREA_JEJU} />
          </clipPath>

          <filter id={routeGlowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Silhouette ── */}
        <g aria-hidden="true">
          <path
            d={KOREA_MAIN}
            fill={`url(#${landGradId})`}
            stroke={PALETTE.coast}
            strokeWidth="1.15"
          />
          <path
            d={KOREA_JEJU}
            fill={PALETTE.tealDeep}
            stroke={PALETTE.coast}
            strokeWidth="0.95"
            opacity="0.94"
          />
          <path
            d={KOREA_ULLEUNG}
            fill={PALETTE.navyMid}
            stroke={PALETTE.coast}
            strokeWidth="0.8"
            opacity="0.75"
          />
        </g>

        {/* ── Internal mesh (quiet depth, clipped to land) ── */}
        <g clipPath={`url(#${clipId})`} opacity="0.85" aria-hidden="true">
          <path
            d="M156 154 C196 194 226 274 250 354 C270 414 290 464 306 504"
            stroke={PALETTE.mesh}
            strokeWidth="0.6"
          />
          <path d="M136 214 C186 234 246 244 316 214" stroke={PALETTE.mesh} strokeWidth="0.5" />
          <path d="M146 334 C196 354 256 364 316 344" stroke={PALETTE.mesh} strokeWidth="0.5" />
        </g>

        {/* ── Orbit arcs (1–2 decorative curves) ── */}
        <g aria-hidden="true">
          {TRAVEL_MAP_ORBITS.map((arc) => (
            <motion.path
              key={arc.id}
              d={arc.d}
              stroke={PALETTE.arc}
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeDasharray={arc.dashed ? "3 10" : undefined}
              opacity={arc.opacity}
              fill="none"
              animate={
                reduce || !arc.dashed
                  ? undefined
                  : { strokeDashoffset: [0, -40] }
              }
              transition={
                reduce || !arc.dashed
                  ? undefined
                  : { duration: 36, ease: "linear", repeat: Infinity }
              }
            />
          ))}
        </g>

        {/* ── Route connections (soft glow + subtle pulse) ── */}
        <g filter={`url(#${routeGlowId})`} aria-hidden="true">
          {TRAVEL_MAP_ROUTES.map((route) => (
            <g key={route.id}>
              <path
                d={route.d}
                stroke={PALETTE.bronzeGlow}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <motion.path
                d={route.d}
                stroke={PALETTE.bronzeLine}
                strokeWidth="0.95"
                strokeLinecap="round"
                fill="none"
                animate={
                  reduce ? { opacity: 0.55 } : { opacity: [0.32, 0.58, 0.32] }
                }
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        duration: 9,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: route.id.length % 3,
                      }
                }
              />
            </g>
          ))}
        </g>

        {/* ── Travel nodes ── */}
        {TRAVEL_MAP_NODES.map((node) => (
          <MapNode key={node.id} node={node} reduce={reduce} />
        ))}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Node sub-component                                                         */
/* -------------------------------------------------------------------------- */

function MapNode({ node, reduce }: { node: TravelMapNode; reduce: boolean }) {
  const isHub = Boolean(node.emphasis);
  const showLabel = node.showLabel || isHub;
  const labelLeft = node.id === "seoul";

  if (isHub) {
    return (
      <HubMarker
        node={node}
        reduce={reduce}
        showLabel={showLabel}
        labelLeft={labelLeft}
      />
    );
  }

  return (
    <SecondaryMarker
      node={node}
      reduce={reduce}
      showLabel={showLabel}
      labelLeft={labelLeft}
    />
  );
}

/** SEOUL / BUSAN — teardrop pin + smooth pulse ring */
function HubMarker({
  node,
  reduce,
  showLabel,
  labelLeft,
}: {
  node: TravelMapNode;
  reduce: boolean;
  showLabel: boolean;
  labelLeft: boolean;
}) {
  const { x, y } = node;
  const pinH = 14;
  const pinW = 9;

  return (
    <g>
      {/* Pulse ring */}
      <motion.circle
        cx={x}
        cy={y - 2}
        r={11}
        fill="none"
        stroke={PALETTE.bronzeMuted}
        strokeWidth="0.75"
        opacity="0.35"
        style={{ transformOrigin: `${x}px ${y - 2}px` }}
        animate={
          reduce
            ? { opacity: 0.3, scale: 1 }
            : { opacity: [0.18, 0.42, 0.18], scale: [0.96, 1.06, 0.96] }
        }
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 4.2, ease: "easeInOut", repeat: Infinity }
        }
      />

      {/* Teardrop pin */}
      <path
        d={`M${x} ${y + pinH * 0.55} C${x - pinW * 0.55} ${y - pinH * 0.15} ${x - pinW * 0.55} ${y - pinH * 0.85} ${x} ${y - pinH} C${x + pinW * 0.55} ${y - pinH * 0.85} ${x + pinW * 0.55} ${y - pinH * 0.15} ${x} ${y + pinH * 0.55} Z`}
        fill={PALETTE.bronzeMuted}
        opacity="0.88"
      />
      <circle cx={x} cy={y - pinH * 0.45} r={2.2} fill={PALETTE.navyDeep} opacity="0.85" />
      <circle cx={x} cy={y - pinH * 0.45} r={0.9} fill={PALETTE.ivory} opacity="0.5" />

      {showLabel ? (
        <text
          x={labelLeft ? x - 14 : x + 14}
          y={y - pinH - 6}
          textAnchor={labelLeft ? "end" : "start"}
          fill={PALETTE.label}
          fontSize="11"
          fontFamily='var(--font-family-base, ui-sans-serif, system-ui, sans-serif)'
          fontWeight={600}
          letterSpacing="0.14em"
          opacity="0.82"
        >
          {node.label}
        </text>
      ) : null}
    </g>
  );
}

/** Secondary nodes — minimal dot + faint ring */
function SecondaryMarker({
  node,
  reduce,
  showLabel,
  labelLeft,
}: {
  node: TravelMapNode;
  reduce: boolean;
  showLabel: boolean;
  labelLeft: boolean;
}) {
  const { x, y } = node;

  return (
    <g>
      <motion.circle
        cx={x}
        cy={y}
        r={6}
        fill="none"
        stroke={PALETTE.bronzeMuted}
        strokeWidth="0.55"
        opacity="0.22"
        animate={reduce ? undefined : { opacity: [0.14, 0.28, 0.14] }}
        transition={
          reduce
            ? undefined
            : { duration: 6, ease: "easeInOut", repeat: Infinity }
        }
      />
      <circle cx={x} cy={y} r={2} fill={PALETTE.ivorySoft} opacity="0.78" />
      <circle cx={x} cy={y} r={0.7} fill={PALETTE.ivory} opacity="0.45" />

      {showLabel ? (
        <text
          x={labelLeft ? x - 10 : x + 10}
          y={y - 9}
          textAnchor={labelLeft ? "end" : "start"}
          fill={PALETTE.label}
          fontSize="9.5"
          fontFamily='var(--font-family-base, ui-sans-serif, system-ui, sans-serif)'
          fontWeight={500}
          letterSpacing="0.1em"
          opacity="0.55"
        >
          {node.label}
        </text>
      ) : null}
    </g>
  );
}

export default TravelMapHero;
