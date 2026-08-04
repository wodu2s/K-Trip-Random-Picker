import { MapPin, Mountain, Trees, Waves, Eye, Footprints, Coffee, Building2 } from "lucide-react";
import type { HiddenPlace } from "../../types/travel";
import { cn } from "../../utils/cn";

const TAG_STYLE: Record<
  string,
  { chip: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }
> = {
  자연: { chip: "bg-[#e7f0e8] text-[#3d6b4f]", Icon: Trees },
  산책: { chip: "bg-[#eef0e4] text-[#5a6640]", Icon: Footprints },
  전망: { chip: "bg-[#e8eef4] text-[#3d5570]", Icon: Eye },
  해변: { chip: "bg-[#e6f1f5] text-[#3d6680]", Icon: Waves },
  카페: { chip: "bg-[#f3ebe2] text-[#7a5a3a]", Icon: Coffee },
  골목: { chip: "bg-[#eee8e2] text-[#6a5648]", Icon: Building2 },
  로컬: { chip: "bg-[#f3e9e2] text-[#8a5a3a]", Icon: MapPin },
};

const FALLBACK = { chip: "bg-[#ebe6dc] text-[#5a564c]", Icon: Mountain };

/** 숨겨진 장소 — Adventure 파치먼트 카드 */
export function HiddenPlaceCards({ places }: { places: HiddenPlace[] }) {
  return (
    <section>
      <p className="font-expedition mb-1 text-[11px] font-bold tracking-[0.16em] text-brass">FIELD NOTES</p>
      <h2 className="font-expedition mb-1 text-lg font-bold text-ink">숨겨진 장소 메모</h2>
      <p className="mb-4 text-sm text-muted">관광객이 적은 로컬 명소들이에요.</p>

      <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {places.map((p) => {
          const s = TAG_STYLE[p.tag] ?? FALLBACK;
          const Icon = s.Icon;
          return (
            <li
              key={p.name}
              className={cn(
                "w-[160px] shrink-0 snap-start overflow-hidden rounded-[10px] border border-brass/30 bg-[var(--color-parchment-100)] shadow-[0_8px_20px_rgba(22,40,31,0.1)]",
                "transition-transform duration-200 hover:-translate-y-1",
              )}
            >
              <div
                className="relative flex aspect-[4/3] items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(22,40,31,0.06), transparent 55%), #EDE4CE",
                }}
                aria-hidden="true"
              >
                <svg className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 160 120" fill="none">
                  <ellipse cx="80" cy="60" rx="48" ry="34" stroke="#16281F" strokeWidth="1" />
                  <path d="M20,90 C50,50 90,70 140,30" stroke="#16281F" strokeWidth="1" strokeDasharray="3 4" />
                </svg>
                <Icon className="relative h-8 w-8 text-primary" strokeWidth={1.8} />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                <span className={cn("mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-bold", s.chip)}>
                  {p.tag}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
