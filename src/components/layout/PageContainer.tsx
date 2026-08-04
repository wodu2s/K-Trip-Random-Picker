import { cn } from "../../utils/cn";

/**
 * 페이지 콘텐츠 래퍼 — 최대 너비 1280px + 반응형 패딩.
 */
export function PageContainer({
  children,
  className = "",
  as: Tag = "main",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "main" | "section" | "div";
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
