import { forwardRef } from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "accent" | "secondary";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[8px] font-semibold " +
  "transition-all duration-150 ease-out select-none " +
  "hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 " +
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-[var(--color-text-on-brass-btn)] shadow-[0_10px_24px_rgba(22,40,31,0.28)] focus-visible:outline-brass",
  accent:
    "bg-accent text-[var(--color-forest-900)] shadow-[0_10px_24px_rgba(201,162,39,0.35)] focus-visible:outline-accent",
  secondary:
    "bg-surface text-primary border border-brass/40 shadow-sm focus-visible:outline-primary",
};

const sizes: Record<Size, string> = {
  sm: "min-h-[40px] px-4 text-[15px]",
  md: "min-h-[48px] px-6 text-[16px]",
  lg: "min-h-[52px] px-8 text-[17px]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", children, ...rest },
  ref,
) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as ButtonAsLink;
    return (
      <a href={href} ref={ref as React.Ref<HTMLAnchorElement>} className={classes} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...(rest as ButtonAsButton)}>
      {children}
    </button>
  );
});
