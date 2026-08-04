/**
 * Pick&Go 여행 소인(우표 스탬프) — 카드 우측 하단에 사용.
 */
export function TravelPostmark({
  className = "",
  size = 44,
  stamped = false,
}: {
  className?: string;
  size?: number;
  /** 방금 찍힌 강조 상태 */
  stamped?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none flex items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        border: `1.5px dashed ${stamped ? "rgba(50,119,246,0.55)" : "rgba(118,168,248,0.55)"}`,
        background: stamped ? "rgba(255,249,236,0.92)" : "rgba(255,249,236,0.55)",
        transform: "rotate(-14deg)",
        opacity: stamped ? 0.95 : 0.72,
      }}
      aria-hidden="true"
    >
      <div className="text-center leading-none">
        <p
          className="text-[7px] font-extrabold tracking-[0.08em]"
          style={{ color: stamped ? "#3277F6" : "#76A8F8" }}
        >
          Pick&Go
        </p>
        <p className="mt-0.5 text-[6px] font-semibold" style={{ color: "#9BB8E0" }}>
          KOREA
        </p>
      </div>
    </div>
  );
}
