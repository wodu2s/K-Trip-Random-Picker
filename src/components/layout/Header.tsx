import { useState } from "react";
import { Menu, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { JourneySteps } from "./JourneySteps";
import { useTravel } from "../../state/TravelContext";
import { cn } from "../../utils/cn";

const NAV_ITEMS = [
  { label: "\uD0D0\uD5D8\uD558\uAE30", page: "landing" as const },
  { label: "\uC870\uAC74 \uC124\uC815", page: "conditions" as const },
];

/** Header ? full-bleed on landing (target B), parchment on other pages */
export function Header() {
  const [open, setOpen] = useState(false);
  const { page, goToLanding, goToConditions } = useTravel();
  const dest = page === "destination";
  const darkH = dest ? 72 : 86;
  const dark =
    page === "landing" ||
    page === "conditions" ||
    page === "cards" ||
    page === "shuffle" ||
    dest;
  const showJourney = page === "cards" || page === "conditions" || page === "destination";
  const journeyActive =
    page === "conditions" ? 1 : page === "cards" || page === "shuffle" ? 2 : page === "destination" ? 3 : 0;

  function handleNav(target: "landing" | "conditions") {
    setOpen(false);
    if (target === "landing") goToLanding();
    else goToConditions();
  }

  return (
    <header
      className={cn("sticky top-0 z-[30]", dark && "header-landing")}
      data-landing-header={dark ? "true" : undefined}
      style={
        dark
          ? { minHeight: darkH, height: darkH }
          : {
              background: "var(--color-parchment-100)",
              borderBottom: "1px solid var(--color-parchment-line)",
            }
      }
    >
      <div
        className={cn(
          "relative flex w-full items-center justify-between",
          dark
            ? dest
              ? "h-[72px] min-h-[72px] max-w-none pl-8 pr-[30px]"
              : "h-[86px] min-h-[86px] max-w-none pl-8 pr-[30px]"
            : "mx-auto h-16 max-w-[1200px] gap-6 px-5 sm:px-8 lg:gap-10",
        )}
      >
        <Logo
          onClick={() => handleNav("landing")}
          tone={dark ? "dark" : "light"}
        />

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center md:flex"
          aria-label={showJourney ? "탐험 진행 단계" : "주요 메뉴"}
          style={{ fontFamily: "var(--font-family-base)" }}
        >
          {showJourney ? (
            <JourneySteps activeIndex={journeyActive} />
          ) : (
            <div className="flex items-center gap-[48px]">
              {NAV_ITEMS.map((item) => {
                const active = page === item.page;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNav(item.page)}
                    className={cn(
                      "relative font-medium transition-colors",
                      dark ? "text-[16.5px]" : "text-[16px]",
                      dark
                        ? active
                          ? "text-[#F0E9DA]"
                          : "text-[#F0E9DA]/75 hover:text-[#F0E9DA]"
                        : active
                          ? "text-[var(--color-forest-800)]"
                          : "text-[var(--color-text-headline)]/80 hover:text-[var(--color-forest-800)]",
                    )}
                  >
                    {item.label}
                    {active ? (
                      <span
                        className="absolute -bottom-1 left-1/2 h-[2px] w-[72%] -translate-x-1/2 rounded-full"
                        style={{ background: dark ? "#C5A059" : "var(--color-brass-500)" }}
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        <div className="hidden items-center gap-3.5 md:flex">
          {page === "cards" || page === "shuffle" ? (
            <button
              type="button"
              className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full border transition-colors hover:border-[rgba(208,165,77,0.75)]"
              style={{
                borderColor: "rgba(208,165,77,0.45)",
                color: "#F0E9DA",
                background: "rgba(201,162,39,0.06)",
              }}
              aria-label="마이페이지"
            >
              <User size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>
          ) : (
            <>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-[8px] border text-[15px] font-semibold transition-colors",
                  dark ? "h-[50px] px-6" : "h-11 px-5",
                )}
                style={
                  dark
                    ? {
                        background: "transparent",
                        borderColor: "rgba(208,165,77,0.55)",
                        color: "#F0E9DA",
                        fontFamily: "var(--font-family-base)",
                      }
                    : {
                        background: "var(--color-parchment-100)",
                        borderColor: "rgba(43,35,24,0.35)",
                        color: "var(--color-text-headline)",
                        fontFamily: "var(--font-family-base)",
                      }
                }
              >
                {"\uB85C\uADF8\uC778"}
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center rounded-[8px] text-[15px] font-semibold transition-colors",
                  dark ? "h-[50px] px-6" : "h-11 px-5",
                )}
                style={
                  dark
                    ? {
                        background: "#1F3D2E",
                        color: "#F0E6C8",
                        fontFamily: "var(--font-family-base)",
                        border: "1px solid rgba(208,165,77,0.35)",
                      }
                    : {
                        background: "var(--color-forest-800)",
                        color: "var(--color-text-on-forest)",
                        fontFamily: "var(--font-family-base)",
                      }
                }
              >
                {"\uD68C\uC6D0\uAC00\uC785"}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-[10px] md:hidden"
          style={{ color: dark ? "#F0E9DA" : "var(--color-text-headline)" }}
          aria-label={open ? "\uBA54\uB274 \uB2EB\uAE30" : "\uBA54\uB274 \uC5F4\uAE30"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div
          className="border-t md:hidden"
          style={{
            borderColor: dark ? "rgba(205,162,76,0.22)" : "var(--color-parchment-line)",
            background: dark ? "#040C16" : "var(--color-parchment-100)",
          }}
        >
          <nav
            className="flex flex-col gap-1 px-5 py-3"
            aria-label={"\uBAA8\uBC14\uC77C \uBA54\uB274"}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNav(item.page)}
                className="rounded-[10px] px-3 py-3 text-left text-base font-medium"
                style={{
                  color: dark ? "#F0E9DA" : "var(--color-text-headline)",
                  fontFamily: "var(--font-family-base)",
                }}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-[8px] border py-2.5 text-[15px] font-semibold"
                style={{
                  borderColor: dark ? "rgba(208,165,77,0.55)" : "var(--color-text-headline)",
                  color: dark ? "#F0E9DA" : "var(--color-text-headline)",
                  background: "transparent",
                }}
              >
                {"\uB85C\uADF8\uC778"}
              </button>
              <button
                type="button"
                className="flex-1 rounded-[8px] py-2.5 text-[15px] font-semibold"
                style={{
                  background: dark ? "#1F3D2E" : "var(--color-forest-800)",
                  color: "#F0E6C8",
                }}
              >
                {"\uD68C\uC6D0\uAC00\uC785"}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
