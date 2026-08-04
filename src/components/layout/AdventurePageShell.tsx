import { cn } from "../../utils/cn";

/**
 * Classic Expedition 페이지 셸 — 파치먼트 + 등고선/루트 장식.
 */
export function AdventurePageShell({
  children,
  className = "",
  dense = false,
}: {
  children: React.ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return (
    <div
      className={cn("relative min-h-[calc(100vh-4rem)] overflow-x-hidden", className)}
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #F5F0E1 0%, #EDE4CE 55%, #E4D6B0 100%)",
      }}
    >
      <div className="adventure-map-decor" aria-hidden="true">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" fill="none">
          <ellipse cx="600" cy="400" rx="340" ry="260" stroke="#16281F" strokeWidth="1.2" />
          <ellipse
            cx="600"
            cy="400"
            rx="220"
            ry="170"
            stroke="#16281F"
            strokeWidth="0.9"
            strokeDasharray="4 6"
          />
          <path
            d="M120,560 C320,380 480,420 640,300 C800,180 960,240 1080,160"
            stroke="#16281F"
            strokeWidth="1.4"
            strokeDasharray="5 7"
          />
          <circle cx="280" cy="420" r="3" fill="#C9A227" />
          <circle cx="720" cy="280" r="3" fill="#C9A227" />
          <text
            x="80"
            y="120"
            fill="#16281F"
            fontSize="14"
            fontWeight="700"
            letterSpacing="0.12em"
            fontFamily="Playfair Display, Noto Serif KR, serif"
          >
            37°N
          </text>
          <text
            x="1020"
            y="700"
            fill="#16281F"
            fontSize="14"
            fontWeight="700"
            letterSpacing="0.12em"
            fontFamily="Playfair Display, Noto Serif KR, serif"
          >
            EX-ROUTE
          </text>
        </svg>
      </div>
      <div className={cn("relative", dense ? "" : "")}>{children}</div>
    </div>
  );
}

/** 섹션 헤더 — EXPEDITION label + serif 제목 + 한 줄 설명 */
export function ExpeditionSectionHeader({
  label,
  title,
  description,
  className = "",
}: {
  label: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <header className={cn("text-center", className)}>
      <p className="font-expedition text-[11px] font-bold tracking-[0.16em] text-brass sm:text-[12px]">
        {label}
      </p>
      <h1 className="font-expedition mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-base font-medium text-muted sm:text-lg">{description}</p>
      ) : null}
    </header>
  );
}

/** 선택/완료 스탬프 배지 */
export function StampBadge({
  children = "DONE",
  tone = "brass",
  className = "",
}: {
  children?: string;
  tone?: "orange" | "brass" | "forest";
  className?: string;
}) {
  const color =
    tone === "brass"
      ? "var(--adventure-brass)"
      : tone === "forest"
        ? "var(--adventure-forest)"
        : "var(--adventure-orange)";
  return (
    <span
      className={cn(
        "font-expedition inline-flex rotate-[-8deg] items-center justify-center rounded-sm border-2 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.12em]",
        className,
      )}
      style={{ borderColor: color, color }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
