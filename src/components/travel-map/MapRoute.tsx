import { motion } from "motion/react";
import { MAP_COLORS } from "./mapTokens";
import type { TravelMapRoute } from "./types";

const EASE_DRAW = [0.22, 1, 0.36, 1] as const;

type Props = {
  route: TravelMapRoute;
  reduce: boolean;
  emphasized: boolean;
  dimmed: boolean;
  revealOpacity: number;
  showSignal: boolean;
  compact: boolean;
};

export function MapRoute({
  route,
  reduce,
  emphasized,
  dimmed,
  revealOpacity,
  showSignal,
  compact,
}: Props) {
  const isPrimary = route.importance === "primary";
  const strokeColor = isPrimary ? MAP_COLORS.routePrimary : MAP_COLORS.routeSecondary;
  const strokeWidth = isPrimary ? 1.05 : 0.75;
  const glowWidth = isPrimary ? 2.8 : 2;
  const targetOpacity = isPrimary ? 0.58 : 0.28;
  const opacity =
    (dimmed && !emphasized ? 0.45 : emphasized ? Math.min(targetOpacity + 0.2, 0.78) : targetOpacity) *
    revealOpacity;

  return (
    <g aria-hidden="true">
      <motion.path
        d={route.path}
        stroke={MAP_COLORS.routeGlow}
        strokeWidth={glowWidth}
        strokeLinecap="round"
        fill="none"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: opacity * 0.7 }}
        transition={
          reduce
            ? { duration: 0.3, delay: route.delay * 0.5 }
            : {
                pathLength: { duration: 2.1, delay: 0.25 + route.delay, ease: EASE_DRAW },
                opacity: { duration: 0.6, delay: 0.25 + route.delay },
              }
        }
      />

      <motion.path
        d={route.path}
        stroke={emphasized ? MAP_COLORS.bronzeLight : strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity }}
        transition={
          reduce
            ? { duration: 0.3, delay: route.delay * 0.5 }
            : {
                pathLength: { duration: 2, delay: 0.25 + route.delay, ease: EASE_DRAW },
                opacity: { duration: 0.5, delay: 0.35 + route.delay },
              }
        }
      />

      {showSignal && route.signal && !reduce && !compact ? (
        <g opacity={opacity * 0.9}>
          <circle r="2.8" fill={MAP_COLORS.signal}>
            <animateMotion
              dur="7.5s"
              repeatCount="indefinite"
              begin={`${route.delay + 2}s`}
              path={route.path}
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
          <circle r="6" fill={MAP_COLORS.signalGlow} opacity="0.4">
            <animateMotion
              dur="7.5s"
              repeatCount="indefinite"
              begin={`${route.delay + 2}s`}
              path={route.path}
              keyPoints="0;1"
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
        </g>
      ) : null}
    </g>
  );
}
