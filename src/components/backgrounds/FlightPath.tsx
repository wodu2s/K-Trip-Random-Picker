/** 하늘에 얇게 그려지는 비행 경로 점선 1~2개 (stroke-dashoffset으로 천천히 이어지는 느낌) */
export function FlightPath({ className = "", stroke = "#3277F6" }: { className?: string; stroke?: string }) {
  return (
    <svg className={`pointer-events-none absolute ${className}`} viewBox="0 0 300 140" fill="none" aria-hidden="true">
      <path d="M4,90 Q90,10 160,50 T296,20" stroke={stroke} strokeOpacity="0.3" strokeWidth="1.4" className="flight-dash" strokeLinecap="round" />
      <path d="M20,120 Q100,70 200,90" stroke={stroke} strokeOpacity="0.18" strokeWidth="1.2" className="flight-dash" strokeLinecap="round" style={{ animationDelay: "-4s" }} />
    </svg>
  );
}
