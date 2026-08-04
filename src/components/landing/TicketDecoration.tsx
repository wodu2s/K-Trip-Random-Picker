import { useState } from "react";
import { motion } from "motion/react";
import { LANDING_ASSET_CONFIG } from "./landingAssets";
import { useLandingAsset } from "./useLandingAsset";

/**
 * Previous expedition ticket design — parchment, stub, brass print.
 * Decorative only (aria-hidden).
 */
export function TicketDecoration({
  parallax = { x: 0, y: 0 },
  reduce = false,
  width = 190,
  height = 82,
}: {
  parallax?: { x: number; y: number };
  reduce?: boolean;
  width?: number;
  height?: number;
}) {
  const asset = useLandingAsset(LANDING_ASSET_CONFIG.ticket.src);
  const [ticketNo] = useState(() => String(Math.floor(10000 + Math.random() * 90000)));
  const stubW = Math.max(22, Math.round(width * 0.16));
  const idleOn = !reduce;

  return (
    <motion.div
      className="pointer-events-none absolute bottom-[3%] right-[-2%] z-[12] hidden sm:block"
      aria-hidden="true"
      animate={
        idleOn
          ? {
              x: parallax.x,
              y: [parallax.y, parallax.y - 2, parallax.y],
              rotate: [-8, -7, -8],
            }
          : { x: parallax.x, y: parallax.y, rotate: -8 }
      }
      transition={
        idleOn
          ? { duration: 4.8, ease: "easeInOut", repeat: Infinity }
          : { type: "spring", stiffness: 60, damping: 18 }
      }
      style={{
        width,
        height,
        filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.55))",
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: "6px",
          isolation: "isolate",
          background:
            "linear-gradient(155deg, #F8F2E3 0%, var(--color-parchment-100) 42%, var(--color-parchment-300) 100%)",
          border: "1px solid var(--color-brass-line)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -10px 18px rgba(184,149,46,0.08), 0 1px 0 rgba(43,35,24,0.06)",
        }}
      >
        {asset.ready ? (
          <img
            src={LANDING_ASSET_CONFIG.ticket.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-multiply"
            draggable={false}
            onError={asset.fail}
          />
        ) : null}
        <div
          className="pointer-events-none absolute inset-[5px] rounded-[3px]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(184,149,46,0.55)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-[10%] top-[10%] border-l border-dashed"
          style={{ left: stubW, borderColor: "rgba(184,149,46,0.55)" }}
          aria-hidden="true"
        />
        <span
          className="absolute left-0 top-1/2 z-[3] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black [mix-blend-mode:destination-out]"
          aria-hidden="true"
        />
        <span
          className="absolute right-0 top-1/2 z-[3] h-3.5 w-3.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-black [mix-blend-mode:destination-out]"
          aria-hidden="true"
        />
        <div
          className="absolute left-0 top-0 flex h-full items-center justify-center"
          style={{ width: stubW }}
          aria-hidden="true"
        >
          <span
            className="font-landing-display rotate-[-90deg] text-[9px] font-bold tracking-[0.18em]"
            style={{ color: "var(--color-brass-500)" }}
          >
            PICK&GO
          </span>
        </div>
        <div
          className="relative z-[1] flex h-full flex-col justify-center pr-3"
          style={{ paddingLeft: stubW + 10 }}
        >
          <p
            className="font-landing-display text-[10px] font-bold leading-tight tracking-[0.14em]"
            style={{ color: "var(--color-brass-line)" }}
          >
            ADVENTURE
          </p>
          <p
            className="font-landing-display mt-0.5 text-[14px] font-bold leading-tight tracking-[0.04em] sm:text-[15px]"
            style={{ color: "var(--color-text-headline)" }}
          >
            EXPEDITION TICKET
          </p>
          <p
            className="mt-1.5 text-[11px] font-medium tracking-[0.06em]"
            style={{
              color: "var(--color-text-body-muted)",
              fontFamily: "var(--font-family-base)",
            }}
          >
            NO. {ticketNo}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
