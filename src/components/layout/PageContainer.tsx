/**
 * 페이지 콘텐츠 래퍼 — 최대 너비 제한 + 좌우 여백 + 세로 패딩.
 * 모든 페이지가 동일한 그리드 폭/여백을 갖도록 통일한다.
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
      className={`mx-auto w-full max-w-content px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 ${className}`}
    >
      {children}
    </Tag>
  );
}
