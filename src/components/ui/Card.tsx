import { forwardRef } from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** 선택/강조 상태일 때 테두리·그림자 강화 */
  selected?: boolean;
  /** hover 시 살짝 떠오르는 인터랙션 적용 */
  interactive?: boolean;
  children: React.ReactNode;
};

/**
 * 공통 카드 표면 스타일.
 * 둥근 모서리 + 부드러운 그림자 + 글래스 배경 (CLAUDE.md 카드 원칙).
 * 페이지별 카드(MysteryCard 등)는 이 컴포넌트를 기반으로 확장한다.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { selected = false, interactive = false, className = "", children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "surface-card rounded-card",
        interactive
          ? "transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-card-hover"
          : "",
        selected
          ? "ring-2 ring-primary shadow-card-hover -translate-y-1"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
});
