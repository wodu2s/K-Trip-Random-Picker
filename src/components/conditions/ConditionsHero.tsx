import { motion, AnimatePresence } from "motion/react";
import { Building2, Camera, Mountain, Trees, Utensils, Waves } from "lucide-react";
import { ADVENTURE_IMAGES } from "../../lib/adventureAssets";
import { usePreloadedImage } from "../../hooks/usePreloadedImage";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { THEME_META } from "../../data/destinations";
import type { Duration, ThemeKey } from "../../types/travel";
import { cn } from "../../utils/cn";

const THEME_SYMBOL: Partial<
  Record<ThemeKey, React.ComponentType<{ className?: string; strokeWidth?: number }>>
> = {
  sea: Waves,
  nature: Mountain,
  food: Utensils,
  vibe: Camera,
  history: Building2,
  local: Trees,
  activity: Trees,
  etc: Trees,
};

const DURATION_LABEL: Record<Duration, string> = {
  "day-trip": "당일치기",
  overnight: "1박 2일+",
};

type Props = {
  duration: Duration | null;
  themes: ThemeKey[];
  className?: string;
  compact?: boolean;
};

/** 오른쪽 탐험 전망 히어로 — 긴 설명문 없이 태그만 반응 */
export function ConditionsHero({ duration, themes, className = "", compact = false }: Props) {
  const reduce = useReducedMotion();
  const { loaded, failed, src } = usePreloadedImage(ADVENTURE_IMAGES.heroWindow);

  const tags: string[] = [];
  if (duration) tags.push(DURATION_LABEL[duration]);
  for (const t of themes) {
    if (tags.length >= 3) break;
    tags.push(THEME_META[t].label);
  }
  const overflow = (duration ? 1 : 0) + themes.length - tags.length;

  const activeTheme = themes[themes.length - 1];
  const Symbol = activeTheme ? THEME_SYMBOL[activeTheme] : null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[16px] border border-[rgba(201,162,39,0.45)] bg-[var(--color-parchment-300)] shadow-[0_16px_40px_rgba(22,40,31,0.16)]",
        compact ? "min-h-[280px] aspect-[16/11]" : "h-full min-h-[520px] lg:min-h-[560px]",
        className,
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, #EDE4D0 0%, #D8CBB0 40%, #B8C4A8 70%, #8FA89A 100%)",
        }}
        aria-hidden="true"
      />

      {!failed && (
        <motion.img
          src={src}
          alt="창밖으로 보이는 탐험 전망 — 산, 강, 여행 준비 도구"
          width={1200}
          height={900}
          draggable={false}
          fetchPriority="high"
          initial={reduce ? false : { scale: 1.025, opacity: 0 }}
          animate={{ scale: 1, opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.22, 0.8, 0.2, 1] }}
          className="absolute inset-0 h-full w-full select-none object-cover object-[center_40%]"
        />
      )}

      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[36%] bg-gradient-to-r from-[rgba(250,246,236,0.55)] via-[rgba(250,246,236,0.18)] to-transparent"
        aria-hidden="true"
      />

      <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
        <span className="font-expedition inline-flex rounded-[8px] border border-brass/35 bg-[rgba(245,240,225,0.92)] px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-primary shadow-sm">
          EXPEDITION AWAITS
        </span>
      </div>

      {/* map pin target for dotted path */}
      <span
        id="hero-route-pin"
        className="absolute right-[18%] top-[42%] h-3 w-3 rounded-full bg-brass shadow-[0_0_0_4px_rgba(201,162,39,0.28)]"
        aria-hidden="true"
      />

      <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence mode="popLayout">
            {tags.map((tag) => (
              <motion.span
                key={tag}
                layout
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                className="rounded-[6px] border border-brass/40 bg-[rgba(22,40,31,0.78)] px-2.5 py-1 text-xs font-bold text-[var(--color-text-on-brass-btn)]"
              >
                {tag}
              </motion.span>
            ))}
            {overflow > 0 && (
              <motion.span
                key="overflow"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-[6px] bg-[rgba(245,240,225,0.92)] px-2.5 py-1 text-xs font-bold text-primary"
              >
                +{overflow}
              </motion.span>
            )}
          </AnimatePresence>

          {Symbol && (
            <motion.span
              key={activeTheme}
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-[8px] border border-brass/30 bg-[rgba(245,240,225,0.92)] text-brass shadow-sm"
              aria-hidden="true"
            >
              <Symbol className="h-5 w-5" strokeWidth={2.2} />
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}
