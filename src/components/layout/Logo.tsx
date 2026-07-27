import Link from "next/link";

/** Pick&Go 워드마크 — 파란 지도핀 + "Pick"(네이비) / "&Go"(파랑) */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label="Pick&Go 홈"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M12 22s7-6.4 7-12A7 7 0 0 0 5 10c0 5.6 7 12 7 12Z"
          fill="var(--color-primary)"
        />
        <circle cx="12" cy="10" r="2.6" fill="#fff" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight">
        <span className="text-ink">Pick</span>
        <span className="text-primary">&Go</span>
      </span>
    </Link>
  );
}
