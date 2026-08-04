import { cn } from "../../utils/cn";

/** Circular forest badge + gold pin + display wordmark */
export function Logo({
  className = "",
  onClick,
  tone = "light",
}: {
  className?: string;
  onClick?: () => void;
  tone?: "light" | "dark";
}) {
  const word = tone === "dark" ? "#F3E8D2" : "var(--color-text-headline)";
  const amp = tone === "dark" ? "#D0A54D" : "var(--color-forest-800)";
  const dark = tone === "dark";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center",
        dark ? "gap-[14px]" : "gap-2.5",
        className,
      )}
      aria-label={"Pick&Go \uD648\uC73C\uB85C \uC774\uB3D9"}
      data-landing-logo={dark ? "true" : undefined}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-full",
          dark ? "h-[42px] w-[42px]" : "h-9 w-9",
        )}
        style={{
          background: "var(--color-forest-800)",
          boxShadow: dark ? "0 0 0 1px rgba(208,165,77,0.45)" : undefined,
        }}
        aria-hidden="true"
      >
        <svg
          width={dark ? 20 : 18}
          height={dark ? 20 : 18}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 21s6-5.6 6-10.5A6 6 0 0 0 6 10.5C6 15.4 12 21 12 21Z"
            fill="var(--color-brass-500)"
          />
          <path
            d="M12 7.2 L12.85 10 L12 12.8 L11.15 10 Z"
            fill="var(--color-forest-900)"
          />
          <circle cx="12" cy="10" r="1.5" fill="var(--color-brass-300)" />
        </svg>
      </span>
      <span
        className={cn(
          "font-landing-display font-bold leading-none tracking-tight",
          dark ? "text-[30px]" : "text-[20px]",
        )}
        style={{ color: word }}
      >
        Pick
        <span style={{ color: amp }}>&</span>
        Go
      </span>
    </button>
  );
}
