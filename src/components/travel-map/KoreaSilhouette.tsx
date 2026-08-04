import { KOREA_SILHOUETTE, NETWORK_DOTS, NETWORK_LINES } from "./mapGeometry";
import { MAP_COLORS } from "./mapTokens";

type Props = {
  clipId: string;
  landGradId: string;
  dimmed?: boolean;
};

/**
 * Target-image land layer — constellation network + glowing coast
 */
export function KoreaSilhouette({ clipId, landGradId, dimmed = false }: Props) {
  const opacity = dimmed ? 0.7 : 1;
  const glowId = `${landGradId}-glow`;

  return (
    <g aria-hidden="true" opacity={opacity}>
      <defs>
        <clipPath id={clipId}>
          <path d={KOREA_SILHOUETTE.mainland} />
          <path d={KOREA_SILHOUETTE.jeju} />
        </clipPath>
        <filter id={glowId} x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path d={KOREA_SILHOUETTE.mainland} fill={MAP_COLORS.landFill} stroke="none" />
      <path d={KOREA_SILHOUETTE.jeju} fill={MAP_COLORS.landFill} stroke="none" opacity="0.9" />

      <g clipPath={`url(#${clipId})`}>
        {NETWORK_LINES.map((d, i) => (
          <path
            key={`nl-${i}`}
            d={d}
            stroke={i % 4 === 0 ? MAP_COLORS.networkLineBright : MAP_COLORS.networkLine}
            strokeWidth={i % 5 === 0 ? 0.65 : 0.45}
            strokeLinecap="round"
            fill="none"
            opacity={0.55 + (i % 3) * 0.08}
          />
        ))}
        {NETWORK_DOTS.map((dot, i) => (
          <circle
            key={`nd-${i}`}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill={dot.o > 0.6 ? MAP_COLORS.networkDot : MAP_COLORS.networkDotDim}
            opacity={dot.o}
          />
        ))}
      </g>

      <g opacity="0.75">
        <circle cx={168} cy={568} r={0.8} fill={MAP_COLORS.networkDot} />
        <circle cx={198} cy={578} r={1} fill={MAP_COLORS.networkDot} />
        <circle cx={228} cy={572} r={0.7} fill={MAP_COLORS.networkDotDim} />
        <path
          d="M168 568 L198 578 L228 572"
          stroke={MAP_COLORS.networkLine}
          strokeWidth="0.45"
          fill="none"
        />
      </g>

      <path
        d={KOREA_SILHOUETTE.mainland}
        fill="none"
        stroke={MAP_COLORS.coastGlow}
        strokeWidth="2.2"
        filter={`url(#${glowId})`}
        opacity="0.55"
      />
      <path
        d={KOREA_SILHOUETTE.mainland}
        fill="none"
        stroke={MAP_COLORS.coastLine}
        strokeWidth="0.85"
        opacity="0.75"
      />
      <path
        d={KOREA_SILHOUETTE.jeju}
        fill="none"
        stroke={MAP_COLORS.coastLine}
        strokeWidth="0.75"
        filter={`url(#${glowId})`}
        opacity="0.65"
      />
      <path
        d={KOREA_SILHOUETTE.ulleung}
        fill="none"
        stroke={MAP_COLORS.networkLine}
        strokeWidth="0.55"
        opacity="0.35"
      />
    </g>
  );
}
