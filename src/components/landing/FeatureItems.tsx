import { Compass, GalleryVerticalEnd, MapPin } from "lucide-react";
import { cn } from "../../utils/cn";
import type { FeatureStep } from "./landingHeroMotion";

const FEATURES = [
  {
    key: "TasteSelect",
    Icon: Compass,
    num: "01",
    title: "\uCDE8\uD5A5 \uC120\uD0DD",
    desc: "\uC5EC\uD589 \uC2A4\uD0C0\uC77C 3\uAC00\uC9C0\uB97C \uACE8\uB77C\uC694.",
  },
  {
    key: "DrawCard",
    Icon: GalleryVerticalEnd,
    num: "02",
    title: "\uD6C4\uBCF4 \uD0D0\uC0C9",
    desc: "\uAD00\uAD11 \uB370\uC774\uD130\uC5D0\uC11C \uD6C4\uBCF4 5\uACF3\uC744 \uCC3E\uC544\uC694.",
  },
  {
    key: "CheckCourse",
    Icon: MapPin,
    num: "03",
    title: "\uCF54\uC2A4\u00B7\uBBF8\uC158 \uD655\uC778",
    desc: "\uB9DE\uCDA4 \uC77C\uC815\uACFC \uD604\uC9C0 \uB3C4\uC804\uC744 \uD655\uC778\uD574\uC694.",
  },
] as const;

/** Single process bar — 3 equal steps, optional demo activeStep */
export function FeatureItems({
  className = "",
  activeStep = null,
}: {
  className?: string;
  variant?: "light" | "onHero";
  activeStep?: FeatureStep;
}) {
  return (
    <ul
      className={cn("landing-feature-bar relative flex w-full items-stretch", className)}
      data-landing-steps="true"
      aria-label="Pick and Go process"
    >
      {FEATURES.map((f, i) => {
        const active = activeStep === i;
        return (
          <li
            key={f.key}
            className="relative z-[1] flex min-w-0 flex-1 items-center"
            aria-current={active ? "step" : undefined}
          >
            {i > 0 ? (
              <span
                className="landing-feature-sep pointer-events-none absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
                aria-hidden="true"
              >
                <svg width="64" height="8" viewBox="0 0 64 8" fill="none">
                  <path
                    d="M1 4 H63"
                    stroke="rgba(210,164,70,0.42)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="2 6"
                  />
                  <circle cx="32" cy="4" r="1.8" fill="rgba(210,164,70,0.6)" />
                </svg>
              </span>
            ) : null}

            <div className="landing-feature-item flex w-full min-w-0 items-center gap-4">
              <span
                className={cn(
                  "landing-feature-badge flex shrink-0 items-center justify-center rounded-full",
                  active && "landing-feature-badge-active",
                )}
                aria-hidden="true"
              >
                <f.Icon
                  className="h-[22px] w-[22px]"
                  style={{ color: active ? "#E2C48A" : "#C5A059" }}
                  strokeWidth={active ? 2.1 : 1.85}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className="shrink-0 text-[21px] font-bold tabular-nums"
                    style={{ color: active ? "#E2C48A" : "#C5A059" }}
                  >
                    {f.num}
                  </span>
                  <span className="landing-feature-title truncate">{f.title}</span>
                </div>
                <span className="landing-feature-desc">{f.desc}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
