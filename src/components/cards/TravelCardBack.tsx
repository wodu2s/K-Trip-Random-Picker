import { MapPin } from "lucide-react";
import { CardRoutePattern } from "./CardRoutePattern";
import { CardHintWindow } from "./CardHintWindow";
import { ExpeditionCardArt, EXPEDITION_SLOT_HINTS } from "./ExpeditionCardArt";

/**
 * 블루 여행 티켓 카드 뒷면.
 * Hero 티저와 레거시 TravelCard가 동일한 디자인을 쓴다.
 */
export function TravelCardBack({
  index = 1,
  total = 5,
  hintEmojis,
  used = false,
  elevated = false,
  twinkleHint = false,
  hoverHint = false,
  pulseHint = false,
  serial,
  expedition = false,
}: {
  index?: number;
  total?: number;
  hintEmojis?: readonly string[] | [string, string];
  used?: boolean;
  elevated?: boolean;
  twinkleHint?: boolean;
  hoverHint?: boolean;
  pulseHint?: boolean;
  /** Expedition 셔플 덱 뒷면 */
  serial?: number;
  expedition?: boolean;
}) {
  if (expedition || serial != null) {
    return (
      <ExpeditionCardArt
        featured
        serial={serial}
        slotHints={serial != null ? EXPEDITION_SLOT_HINTS[serial - 1] : undefined}
      />
    );
  }

  const num = String(Math.max(1, index)).padStart(2, "0");
  const den = String(Math.max(1, total)).padStart(2, "0");
  const emojis = hintEmojis ?? ["🧭", "🌊"];

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(160deg, #78AEFF 0%, #3277F6 52%, #2458B8 100%)",
        border: "1.5px solid rgba(255,249,236,0.92)",
        boxShadow: elevated
          ? "0 12px 24px rgba(36,88,184,0.22)"
          : "0 8px 18px rgba(36,88,184,0.16)",
        isolation: "isolate",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[5px] rounded-[12px]"
        style={{ border: "1px solid rgba(255,200,87,0.72)" }}
        aria-hidden="true"
      />

      <CardRoutePattern />

      <div
        className="absolute left-0 top-1/2 z-20 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black [mix-blend-mode:destination-out]"
        aria-hidden="true"
      />
      <div
        className="absolute right-0 top-1/2 z-20 h-3.5 w-3.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-black [mix-blend-mode:destination-out]"
        aria-hidden="true"
      />

      <CardHintWindow
        emojis={emojis}
        twinkle={twinkleHint}
        hoverScale={hoverHint}
        pulse={pulseHint}
      />

      <div className="absolute inset-x-0 top-[52px] flex items-start justify-between px-3.5 sm:top-[56px] sm:px-4">
        <p className="text-[7px] font-bold tracking-[0.08em] text-white/75 sm:text-[8px]">
          PICK&GO TRAVEL TICKET
        </p>
        <p className="text-[8px] font-bold tabular-nums text-[#FFC857]/90 sm:text-[9px]">
          {num}/{den}
        </p>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(18,48,92,0.16)] sm:h-12 sm:w-12"
          aria-hidden="true"
        >
          <MapPin className="h-[18px] w-[18px] text-[#3277F6] sm:h-5 sm:w-5" strokeWidth={2.3} />
        </div>
        <span
          className="mt-2 text-[28px] font-light leading-none text-white/90 sm:text-[32px]"
          aria-hidden="true"
        >
          ?
        </span>
      </div>

      <p className="absolute inset-x-0 bottom-4 text-center text-[9px] font-bold tracking-[0.16em] text-white/80 sm:text-[10px]">
        DESTINATION HIDDEN
      </p>

      {used ? (
        <div
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[#2458B8]/35"
          aria-hidden="true"
        >
          <span className="rotate-[-18deg] rounded-md border-2 border-white/80 px-3 py-1 text-sm font-black tracking-[0.18em] text-white">
            USED
          </span>
        </div>
      ) : null}
    </div>
  );
}

export const CardBackFace = TravelCardBack;
