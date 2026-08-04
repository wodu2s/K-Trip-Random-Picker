/**
 * 블루 티켓 배경용 지도·등고선·비행 경로 SVG (opacity 0.12).
 */
export function CardRoutePattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-[0.12] ${className}`}
      viewBox="0 0 120 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <ellipse cx="58" cy="78" rx="40" ry="52" fill="none" stroke="#FFFFFF" strokeWidth="1" />
      <ellipse cx="58" cy="78" rx="28" ry="36" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
      <ellipse cx="58" cy="78" rx="16" ry="22" fill="none" stroke="#FFFFFF" strokeWidth="0.7" />
      <path
        d="M14,132 C34,96 52,108 68,84 C84,60 96,48 110,28"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeDasharray="3 4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M18,48 C40,62 58,50 78,68 C96,84 104,110 112,128"
        stroke="#FFFFFF"
        strokeWidth="0.9"
        strokeDasharray="2 5"
        fill="none"
      />
      <circle cx="110" cy="28" r="2.2" fill="#FFFFFF" />
      <circle cx="18" cy="48" r="1.6" fill="#FFFFFF" />
    </svg>
  );
}
