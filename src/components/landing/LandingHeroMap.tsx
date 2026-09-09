import { useEffect, useId, useState } from "react";
import { ADVENTURE_IMAGES } from "../../lib/adventureAssets";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type NodeId = "seoul" | "gangneung" | "jeonju" | "busan" | "jeju";

/**
 * Overlay coordinate space — the map image is 4488×5608 (4:5), so a
 * 1000×1250 viewBox with the same `contain` fit lands exactly on top of it.
 */
const VIEW_W = 1000;
const VIEW_H = 1250;

/**
 * City markers, measured off the artwork: each point sits on the star already
 * painted in the image, so the overlay lights the same spot the label names.
 * The label plates come from the image itself — nothing is drawn twice.
 */
const NODES: {
  id: NodeId;
  name: string;
  x: number;
  y: number;
  /** Index into ROUTES — the arc the spark runs while this node is active */
  route: number;
  /** Run the spark backwards when the node sits at the far end of that arc */
  reverse: boolean;
  /** How long this node stays active, ms */
  dwell: number;
}[] = [
  { id: "seoul", name: "서울", x: 424, y: 393, route: 0, reverse: true, dwell: 3800 },
  { id: "gangneung", name: "강릉", x: 690, y: 356, route: 0, reverse: false, dwell: 4600 },
  { id: "jeonju", name: "전주", x: 398, y: 675, route: 1, reverse: false, dwell: 4200 },
  { id: "busan", name: "부산", x: 706, y: 801, route: 1, reverse: true, dwell: 4800 },
  { id: "jeju", name: "제주", x: 355, y: 1056, route: 2, reverse: true, dwell: 4000 },
];

/** Hair-thin arcs chaining the 5 cities — one carries a light at a time */
const ROUTES = [
  "M690 356 Q556 330 424 393",
  "M424 393 Q400 540 398 675 Q560 726 706 801",
  "M706 801 Q520 900 355 1056",
] as const;

/**
 * Landing hero map — the expedition map artwork is the visual; the only code
 * on top of it is a soft pulse on the five city nodes, the thin routes that
 * chain them and a single travelling light. Nothing else is drawn.
 */
export function LandingHeroMap({ pulse = false }: { pulse?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const nodeGlowId = `hero-map-node-glow-${uid}`;
  const reduce = useReducedMotion();
  const [litId, setLitId] = useState<NodeId | null>(null);
  const [hoverId, setHoverId] = useState<NodeId | null>(null);
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
      <img
        className="landing-hero-map__image"
        src={ADVENTURE_IMAGES.koreaAdventureMap}
        alt=""
        draggable={false}
      />

      <svg
        className="landing-hero-map__overlay"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <defs>
          <filter id={nodeGlowId} x="-160%" y="-160%" width="420%" height="420%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Route lines — barely there, so the drawn coastline stays the subject */}
        <g
          fill="none"
          stroke="#d8b268"
          strokeWidth={2}
          strokeDasharray="4 11"
          strokeLinecap="round"
          opacity={0.42}
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
            r={4.5}
            fill="#FFF3D6"
            filter={`url(#${nodeGlowId})`}
            style={{
              offsetPath: `path("${ROUTES[activeNode.route]!}")`,
              animationDirection: activeNode.reverse ? "reverse" : "normal",
            }}
          />
        )}

        {NODES.map((n, i) => {
          const bright = litId === n.id || hoverId === n.id;
          const active = activeNode?.id === n.id;
          return (
            <g key={n.id}>
              <circle
                className="landing-hero-map__halo"
                cx={n.x}
                cy={n.y}
                r={27}
                fill="none"
                stroke="#e2c078"
                strokeWidth={1.6}
                style={{ animationDelay: `${i * 0.7}s` }}
              />
              {/* One-shot ripple — mounts with the activation, fades out on its own */}
              {active && (
                <circle
                  key={`ripple-${step}`}
                  className="landing-hero-map__ripple"
                  cx={n.x}
                  cy={n.y}
                  r={27}
                  fill="none"
                  stroke="#e2c078"
                  strokeWidth={1.4}
                />
              )}
              {/* Lift on hover / CTA sweep only — the image already lights the star */}
              <circle
                className="landing-hero-map__node"
                cx={n.x}
                cy={n.y}
                r={12}
                fill="#FFF6DF"
                opacity={bright ? 0.55 : 0}
                filter={`url(#${nodeGlowId})`}
              />
              {/* Hit area, decorative only — no focus stop inside the aria-hidden map */}
              <circle
                className="landing-hero-map__hit"
                cx={n.x}
                cy={n.y}
                r={26}
                fill="transparent"
                onPointerEnter={() => setHoverId(n.id)}
                onPointerLeave={() => setHoverId((cur) => (cur === n.id ? null : cur))}
              >
                <title>{n.name}</title>
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
