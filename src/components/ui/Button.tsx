"use client";

import Link from "next/link";
import { forwardRef } from "react";

type Variant = "primary" | "accent" | "secondary";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold " +
  "transition-transform duration-150 ease-out select-none " +
  "hover:scale-[1.03] active:scale-[0.98] " +
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // 파란 CTA (선택/진행)
  primary:
    "bg-primary text-white shadow-[0_12px_28px_rgba(47,115,246,0.35)] focus-visible:outline-primary",
  // 노란 CTA (랜덤/강조 — 여행지 뽑기)
  accent:
    "bg-accent text-ink shadow-[0_12px_28px_rgba(255,209,102,0.45)] focus-visible:outline-accent",
  // 흰 배경 + 파란 테두리
  secondary:
    "bg-surface text-primary border border-primary/40 shadow-sm focus-visible:outline-primary",
};

const sizes: Record<Size, string> = {
  sm: "min-h-[40px] px-4 text-[15px]",
  md: "min-h-[48px] px-6 text-[16px]",
  lg: "min-h-[56px] px-8 text-[18px]",
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

/**
 * 공통 버튼.
 * - href가 있으면 next/link 앵커로, 없으면 <button>으로 렌더링.
 * - variant: primary(파랑) / accent(노랑) / secondary(흰 테두리)
 */
export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(
  { variant = "primary", size = "md", className = "", children, ...rest },
  ref,
) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as ButtonAsLink;
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...anchorRest}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      {...(rest as ButtonAsButton)}
    >
      {children}
    </button>
  );
});
