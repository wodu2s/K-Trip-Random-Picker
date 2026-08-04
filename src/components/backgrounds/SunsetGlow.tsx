/** 결과 화면 배경의 은은한 노을빛 — 6~8초 주기로 아주 약하게 호흡한다 */
export function SunsetGlow({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`pointer-events-none absolute animate-breathe rounded-full ${className}`} style={style} aria-hidden="true" />
  );
}
