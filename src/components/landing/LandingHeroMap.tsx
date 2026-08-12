import { useEffect, useId, useState } from "react";
import southKorea from "@svg-maps/south-korea";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type SouthKoreaLocation = {
  id: string;
  name: string;
  path: string;
};

const locations = southKorea.locations as SouthKoreaLocation[];

type NodeId = "seoul" | "gangneung" | "jeonju" | "busan" | "jeju";

/**
 * City markers — approximate points inside the package's own viewBox
 * (0 0 524 631), estimated from each province path's bounding box.
 * Gangneung sits on Gangwon's east coast, Jeonju in northern North Jeolla —
 * neither is the province centroid.
 */
const NODES: {
  id: NodeId;
  name: string;
  x: number;
  y: number;
  anchor: "start" | "end";
  /** Index into ROUTES — the arc the spark runs while this node is active */
  route: number;
  /** Run the spark backwards when the node sits at the far end of that arc */
  reverse: boolean;
  /** How long this node stays active, ms */
  dwell: number;
}[] = [
  { id: "seoul", name: "서울", x: 152, y: 127, anchor: "start", route: 0, reverse: true, dwell: 3800 },
  { id: "gangneung", name: "강릉", x: 345, y: 110, anchor: "start", route: 0, reverse: false, dwell: 4600 },
  { id: "jeonju", name: "전주", x: 175, y: 310, anchor: "end", route: 1, reverse: false, dwell: 4200 },
  { id: "busan", name: "부산", x: 345, y: 402, anchor: "end", route: 1, reverse: true, dwell: 4800 },
  { id: "jeju", name: "제주", x: 112, y: 565, anchor: "end", route: 2, reverse: true, dwell: 4000 },
];

/** Centre of the compass rose the map sits on */
const CHART = { cx: 262, cy: 312 };

/** Rose radii — just wider than the landmass, so it still reads as a circle */
const ROSE_OUTER = 294;
const ROSE_INNER = 256;

/** Bearing ticks every 15°, skipping the ones the long axes already cover */
const TICKS = Array.from({ length: 24 }, (_, i) => i * 15).filter((d) => d % 45 !== 0);

/** Cardinal letters, placed just inside the outer ring */
const CARDINALS = [
  { label: "N", dx: 0, dy: -1 },
  { label: "E", dx: 1, dy: 0 },
  { label: "S", dx: 0, dy: 1 },
  { label: "W", dx: -1, dy: 0 },
] as const;

/** Graduation marks on the four main axes */
const AXIS_MARKS = [200, 250];

/**
 * Hand-placed contour lines — varied length and curvature so the terrain does
 * not read as a repeating wave. Clipped to the landmass.
 */
const CONTOURS = [
  { d: "M96 148 Q150 120 206 142 T318 128", w: 0.5, o: 0.3 },
  { d: "M112 186 Q168 160 224 182 Q276 202 336 178", w: 0.4, o: 0.2 },
  { d: "M128 232 Q182 208 232 236 Q288 266 348 240", w: 0.55, o: 0.34 },
  { d: "M104 268 Q158 250 210 276 T322 292", w: 0.4, o: 0.18 },
  { d: "M132 318 Q186 296 238 322 Q292 348 344 326", w: 0.5, o: 0.3 },
  { d: "M108 356 Q164 338 216 362 T330 372", w: 0.4, o: 0.2 },
  { d: "M126 402 Q178 384 228 406 Q280 428 336 408", w: 0.55, o: 0.32 },
  { d: "M114 444 Q170 428 220 448 T324 452", w: 0.4, o: 0.18 },
  { d: "M138 484 Q188 470 234 488 Q282 506 322 492", w: 0.5, o: 0.28 },
  { d: "M150 520 Q196 508 240 524 T312 528", w: 0.4, o: 0.2 },
  { d: "M166 88 Q210 66 258 84", w: 0.5, o: 0.26 },
  { d: "M188 556 Q228 546 266 558", w: 0.45, o: 0.24 },
  { d: "M84 300 Q112 288 140 300", w: 0.4, o: 0.22 },
  { d: "M352 200 Q384 186 408 200", w: 0.4, o: 0.22 },
  /* Short broken fragments — keep the field from reading as stacked waves */
  { d: "M196 210 Q228 198 258 212", w: 0.45, o: 0.26 },
  { d: "M242 296 Q268 282 296 294", w: 0.4, o: 0.2 },
  { d: "M164 366 Q192 356 216 368", w: 0.45, o: 0.24 },
  { d: "M256 456 Q284 444 306 456", w: 0.4, o: 0.2 },
  { d: "M186 138 Q208 130 230 140", w: 0.4, o: 0.22 },
] as const;

/**
 * Dashed arcs between the candidate nodes — 3 strands only. Just one carries a
 * travelling light at a time: the arc belonging to the currently active node.
 */
const ROUTES = [
  "M345 110 Q250 88 152 127",
  "M152 127 Q166 224 175 310 Q266 352 345 402",
  "M345 402 Q232 492 112 565",
] as const;

/** Brass star points — sea and sky only, never over the landmass */
const STARS = [
  { x: 486, y: 62, r: 1.7, delay: 0 },
  { x: 34, y: 196, r: 1.1, delay: 1.4 },
  { x: 470, y: 542, r: 1.4, delay: 2.6 },
  { x: 58, y: 414, r: 0.9, delay: 3.9 },
  { x: 430, y: 606, r: 1.2, delay: 5.1 },
  { x: 446, y: 152, r: 0.8, delay: 6.3 },
] as const;

const PILL_W = 46;
const PILL_H = 22;
/** Constant gap between a node and its label pill */
const PILL_GAP = 10;

/**
 * Landing hero map — real South Korea province paths from
 * @svg-maps/south-korea (coordinates untouched), styled as a modern
 * expedition chart resting on an old navigation instrument: near-black land
 * with contour + grain texture, a coastline that only catches brass light in
 * places, and a compass rose wider than the map itself. The card deck must
 * stay the stronger focal point, so nothing here glows on its own.
 */
export function LandingHeroMap({ pulse = false }: { pulse?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const nodeGlowId = `hero-map-node-glow-${uid}`;
  const landGradId = `hero-map-land-grad-${uid}`;
  const depthId = `hero-map-depth-${uid}`;
  const grainId = `hero-map-grain-${uid}`;
  const bloomId = `hero-map-bloom-${uid}`;
  const auraId = `hero-map-aura-${uid}`;
  const coastMaskId = `hero-map-coast-mask-${uid}`;
  const clipId = `hero-map-clip-${uid}`;
  const reduce = useReducedMotion();
  const [litId, setLitId] = useState<NodeId | null>(null);
  /* Ambient choreography — one node at a time, advanced by its own dwell */
  const [step, setStep] = useState(0);

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

  useEffect(() => {
    if (reduce) return;
    const id = window.setTimeout(
      () => setStep((s) => s + 1),
      NODES[step % NODES.length]!.dwell,
    );
    return () => window.clearTimeout(id);
  }, [reduce, step]);

  /* The CTA hover sweep takes over completely, so nothing doubles up */
  const activeNode = reduce || pulse ? null : NODES[step % NODES.length]!;

  return (
    <div className="landing-hero-map">
      <svg
        viewBox={southKorea.viewBox}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={landGradId} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#071417" />
            <stop offset="100%" stopColor="#050f13" />
          </linearGradient>
          {/* Centre lift + edge falloff, so the land reads as a solid body */}
          <radialGradient id={depthId} cx="46%" cy="36%" r="62%">
            <stop offset="0%" stopColor="#1d3c38" stopOpacity={0.26} />
            <stop offset="52%" stopColor="#0a1a20" stopOpacity={0.04} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0.5} />
          </radialGradient>
          <radialGradient id={auraId} cx="50%" cy="48%" r="50%">
            <stop offset="0%" stopColor="#c29a45" stopOpacity={0.09} />
            <stop offset="60%" stopColor="#c29a45" stopOpacity={0.035} />
            <stop offset="100%" stopColor="#c29a45" stopOpacity={0} />
          </radialGradient>
          {/* Fine grain — generated, no image asset */}
          <filter id={grainId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.76  0 0 0 0 0.62  0 0 0 0 0.31  0 0 0 0.6 0"
            />
          </filter>
          {/*
           * Light rake across the coast: only the stretches under the bright
           * bands of this mask reflect brass.
           */}
          <linearGradient id={`${coastMaskId}-grad`} x1="14%" y1="96%" x2="86%" y2="4%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.1} />
            <stop offset="18%" stopColor="#ffffff" stopOpacity={0.95} />
            <stop offset="34%" stopColor="#ffffff" stopOpacity={0.12} />
            <stop offset="52%" stopColor="#ffffff" stopOpacity={0.85} />
            <stop offset="68%" stopColor="#ffffff" stopOpacity={0.08} />
            <stop offset="84%" stopColor="#ffffff" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.1} />
          </linearGradient>
          <mask id={coastMaskId}>
            <rect x={-80} y={-80} width={684} height={791} fill={`url(#${coastMaskId}-grad)`} />
          </mask>
          <clipPath id={clipId}>
            {locations.map((loc) => (
              <path key={`clip-${loc.id}`} d={loc.path} />
            ))}
          </clipPath>
          <filter id={bloomId} x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="1.3" />
          </filter>
          <filter id={nodeGlowId} x="-160%" y="-160%" width="420%" height="420%">
            <feGaussianBlur stdDeviation="1.1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient gold the map will reflect — never a glow on the map itself */}
        <circle cx={CHART.cx} cy={CHART.cy} r={246} fill={`url(#${auraId})`} />

        {/* Compass rose — wider than the landmass, axes running off the map */}
        <g
          className="landing-hero-map__chart"
          fill="none"
          stroke="#c29a45"
          strokeOpacity={0.16}
        >
          <circle cx={CHART.cx} cy={CHART.cy} r={ROSE_OUTER} strokeWidth={0.8} />
          <circle cx={CHART.cx} cy={CHART.cy} r={ROSE_INNER} strokeWidth={0.5} />
          {/* N / E / S / W — the long axes */}
          <line
            x1={CHART.cx}
            y1={CHART.cy - ROSE_OUTER}
            x2={CHART.cx}
            y2={CHART.cy + ROSE_OUTER}
            strokeWidth={0.7}
          />
          <line
            x1={CHART.cx - ROSE_OUTER}
            y1={CHART.cy}
            x2={CHART.cx + ROSE_OUTER}
            y2={CHART.cy}
            strokeWidth={0.7}
          />
          {/* Intercardinals, kept short so the centre stays quiet */}
          {[45, 135].map((deg) => (
            <line
              key={deg}
              x1={CHART.cx}
              y1={CHART.cy - ROSE_OUTER}
              x2={CHART.cx}
              y2={CHART.cy + ROSE_OUTER}
              strokeWidth={0.45}
              strokeOpacity={0.55}
              strokeDasharray="120 130"
              transform={`rotate(${deg} ${CHART.cx} ${CHART.cy})`}
            />
          ))}
          {TICKS.map((deg) => (
            <line
              key={deg}
              x1={CHART.cx}
              y1={CHART.cy - ROSE_OUTER}
              x2={CHART.cx}
              y2={CHART.cy - ROSE_OUTER + 12}
              strokeWidth={0.6}
              transform={`rotate(${deg} ${CHART.cx} ${CHART.cy})`}
            />
          ))}
          {/* Graduations on the four main axes */}
          {[0, 90, 180, 270].map((deg) =>
            AXIS_MARKS.map((r) => (
              <line
                key={`${deg}-${r}`}
                x1={CHART.cx - 5}
                y1={CHART.cy - r}
                x2={CHART.cx + 5}
                y2={CHART.cy - r}
                strokeWidth={0.6}
                transform={`rotate(${deg} ${CHART.cx} ${CHART.cy})`}
              />
            )),
          )}
        </g>
        <g
          fill="#c29a45"
          fillOpacity={0.22}
          fontFamily="var(--font-family-display)"
          fontSize={15}
          textAnchor="middle"
        >
          {CARDINALS.map((c) => (
            <text
              key={c.label}
              x={CHART.cx + c.dx * (ROSE_OUTER - 22)}
              y={CHART.cy + c.dy * (ROSE_OUTER - 22) + 5}
            >
              {c.label}
            </text>
          ))}
        </g>

        {/* Brass star points — sea and sky only */}
        <g fill="#d8b878">
          {STARS.map((s, i) => (
            <circle
              key={i}
              className="landing-hero-map__star"
              cx={s.x}
              cy={s.y}
              r={s.r}
              style={{ animationDelay: `${s.delay}s` }}
            />
          ))}
        </g>

        {/* Faint edge bloom — a hint of reflected light, not a halo */}
        <g
          fill="none"
          stroke="#c29a45"
          strokeOpacity={0.14}
          strokeWidth={2.2}
          strokeLinejoin="round"
          filter={`url(#${bloomId})`}
        >
          {locations.map((loc) => (
            <path key={`bloom-${loc.id}`} d={loc.path} />
          ))}
        </g>

        {/*
         * Coastline: strokes first, then the opaque land fill on top. Shared
         * province edges get covered by both neighbours' fills, so only the
         * true outer coast keeps a line — roughly 1px of it. The base pass is
         * dim; a masked highlight pass lights up a few stretches.
         */}
        <g
          fill="none"
          stroke="#9c7a35"
          strokeOpacity={0.85}
          strokeWidth={2}
          strokeLinejoin="round"
        >
          {locations.map((loc) => (
            <path key={`coast-${loc.id}`} d={loc.path} />
          ))}
        </g>
        <g
          fill="none"
          stroke="#e2c078"
          strokeWidth={2}
          strokeLinejoin="round"
          mask={`url(#${coastMaskId})`}
        >
          {locations.map((loc) => (
            <path key={`coast-lit-${loc.id}`} d={loc.path} />
          ))}
        </g>
        <g fill={`url(#${landGradId})`} stroke="none">
          {locations.map((loc) => (
            <path key={`fill-${loc.id}`} d={loc.path} />
          ))}
        </g>

        {/*
         * Terrain texture + depth, clipped to the landmass. Depth goes down
         * first so the contours are not washed out by its edge falloff.
         */}
        <g clipPath={`url(#${clipId})`}>
          <rect x={0} y={0} width={524} height={631} fill={`url(#${depthId})`} />
          <g fill="none" stroke="#c29a45">
            {CONTOURS.map((c, i) => (
              <path key={i} d={c.d} strokeWidth={c.w} strokeOpacity={c.o} />
            ))}
          </g>
          <rect
            x={0}
            y={0}
            width={524}
            height={631}
            filter={`url(#${grainId})`}
            opacity={0.13}
          />
        </g>

        {/* Internal administrative borders — almost background */}
        <g fill="none" stroke="#8a6a28" strokeOpacity={0.13} strokeWidth={0.5}>
          {locations.map((loc) => (
            <path key={`edge-${loc.id}`} d={loc.path} />
          ))}
        </g>

        {/* Dashed arcs chaining the 5 candidate nodes */}
        <g
          fill="none"
          stroke="#c29a45"
          strokeWidth={0.8}
          strokeDasharray="2 6"
          strokeLinecap="round"
          opacity={0.46}
        >
          {ROUTES.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Single travelling light, on the active node's arc — runs once, then rests */}
        {activeNode && (
          <circle
            key={`spark-${step}`}
            className="landing-hero-map__spark"
            cx={0}
            cy={0}
            r={1.6}
            fill="#FFF3D6"
            filter={`url(#${nodeGlowId})`}
            style={{
              offsetPath: `path("${ROUTES[activeNode.route]!}")`,
              animationDirection: activeNode.reverse ? "reverse" : "normal",
            }}
          />
        )}

        {NODES.map((n, i) => {
          const lit = litId === n.id;
          const active = activeNode?.id === n.id;
          const pillX = n.anchor === "start" ? n.x + PILL_GAP : n.x - PILL_GAP - PILL_W;
          return (
            <g key={n.id}>
              <circle
                className="landing-hero-map__halo landing-hero-map__halo--outer"
                cx={n.x}
                cy={n.y}
                r={9.5}
                fill="none"
                stroke="#d4ab55"
                strokeWidth={0.6}
                style={{ animationDelay: `${i * 0.7 + 0.45}s` }}
              />
              <circle
                className="landing-hero-map__halo"
                cx={n.x}
                cy={n.y}
                r={5.8}
                fill="none"
                stroke="#e2c078"
                strokeWidth={0.9}
                style={{ animationDelay: `${i * 0.7}s` }}
              />
              {/* One-shot ripple — mounts with the activation, fades out on its own */}
              {active && (
                <circle
                  key={`ripple-${step}`}
                  className="landing-hero-map__ripple"
                  cx={n.x}
                  cy={n.y}
                  r={9.5}
                  fill="none"
                  stroke="#e2c078"
                  strokeWidth={0.7}
                />
              )}
              <circle
                cx={n.x}
                cy={n.y}
                r={lit ? 4 : active ? 3.4 : 3}
                fill={lit || active ? "#FFFFFF" : "#FFFCEE"}
                stroke="#d4ab55"
                strokeWidth={0.5}
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
                fontFamily="var(--font-family-base)"
                fontSize={12.5}
                fontWeight={600}
                fill={lit ? "#FFF8EE" : "#c89b3c"}
              >
                {n.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
