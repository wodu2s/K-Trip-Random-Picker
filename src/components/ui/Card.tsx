import { forwardRef } from "react";
import { cn } from "../../utils/cn";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** 선택/강조 상태일 때 테두리·그림자 강화 */
  selected?: boolean;
  /** hover 시 살짝 떠오르는 인터랙션 적용 */
  interactive?: boolean;
  children: React.ReactNode;
};

/** Shared surface card — parchment paper + adventure selection states. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { selected = false, interactive = false, className = "", children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "surface-card rounded-card",
        interactive && "transition-all duration-200 ease-out hover:-translate-y-[3px] hover:shadow-card-hover hover:border-primary/40",
        selected && "border-primary bg-primary/[0.04] shadow-card-hover ring-2 ring-primary/30",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
