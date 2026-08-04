import { motion } from "motion/react";
import { TravelCard } from "./TravelCard";
import { CompassDecoration } from "./CompassDecoration";
import { TicketDecoration } from "./TicketDecoration";
import { OrbitTrails } from "./OrbitTrails";
import type { HeroPhase } from "./heroTypes";

type Parallax = { x: number; y: number };

const CARDS = [
  { id: 1, side: "left" as const, baseR: -8, baseX: -72, baseZ: 2 },
  { id: 2, side: "center" as const, baseR: 0, baseX: 0, baseZ: 5 },
  { id: 3, side: "right" as const, baseR: 8, baseX: 72, baseZ: 3 },
];

export function CardStack({
  phase,
  hovered,
  reduce,
  parallax,
}: {
  phase: HeroPhase;
  hovered: boolean;
  reduce: boolean;
  parallax: {
    map: Parallax;
    orbit: Parallax;
    back: Parallax;
    front: Parallax;
    props: Parallax;
  };
}) {
  const exiting = phase === "exiting";

  return (
    <div className="landing-card-stack relative mx-auto w-full overflow-visible">
      <div className="relative aspect-[1.05] w-full sm:aspect-[1.02]">
        <OrbitTrails
          reduce={reduce}
          bright={hovered && !exiting}
          parallax={parallax.orbit}
        />

        <div className="absolute inset-0 z-[10] flex items-center justify-center">
          {CARDS.map((card, i) => {
            const featured = card.side === "center";
            let x = card.baseX;
            let y = featured ? 0 : 10;
            let r = card.baseR;
            let s = featured ? 1 : 0.92;
            let z = card.baseZ;

            if (hovered && !exiting) {
              if (card.side === "left") x = -96;
              if (card.side === "right") x = 96;
              if (featured) {
                y = -12;
                s = 1.025;
              }
            }

            if (exiting) {
              x = (i - 1) * 4;
              y = (i - 1) * 3;
              r = (i - 1) * 1.2;
              s = 0.94;
              z = 5 - Math.abs(i - 1);
            }

            const idleY = featured ? [0, -8, 0] : card.side === "left" ? [0, 5, 0] : [0, -4, 0];
            const idleR = featured
              ? [0, 0.8, 0]
              : card.side === "left"
                ? [-8, -9.5, -8]
                : [8, 9, 8];
            const idleDur = featured ? 6 : card.side === "left" ? 7 : 6.5;

            return (
              <motion.div
                key={card.id}
                className="absolute"
                style={{
                  width: "min(72%, 320px)",
                  zIndex: z,
                  willChange: exiting || hovered ? "transform" : "auto",
                }}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  x: x + (featured ? parallax.front.x : parallax.back.x),
                  y: exiting || hovered || reduce ? y : idleY.map((v) => v + y),
                  rotate: exiting || hovered || reduce ? r : idleR,
                  scale: s,
                }}
                transition={
                  exiting
                    ? { duration: 0.38, ease: [0.22, 0.8, 0.2, 1] }
                    : hovered || reduce
                      ? { duration: 0.4, ease: [0.22, 0.8, 0.2, 1] }
                      : {
                          y: {
                            duration: idleDur,
                            ease: "easeInOut",
                            repeat: Infinity,
                            delay: i * 0.35,
                          },
                          rotate: {
                            duration: idleDur,
                            ease: "easeInOut",
                            repeat: Infinity,
                            delay: i * 0.35,
                          },
                          default: { duration: 0.45, ease: [0.22, 0.8, 0.2, 1] },
                        }
                }
              >
                <TravelCard featured={featured} />
              </motion.div>
            );
          })}
        </div>

        <CompassDecoration
          parallax={parallax.props}
          roseDeg={hovered && !exiting ? 8 : 0}
          reduce={reduce}
          size={148}
        />
        <TicketDecoration parallax={parallax.props} reduce={reduce} />
      </div>
    </div>
  );
}
