import { useState } from "react";
import { motion } from "motion/react";
import { Clock, Landmark, MapPin, Mountain, Waves } from "lucide-react";
import type { Destination, SceneVariant } from "../../types/travel";
import { getAccentColor } from "../../lib/icons";
import { TravelPostmark } from "./TravelPostmark";

const SCENE_ICON: Record<SceneVariant, typeof Waves> = {
  sea: Waves,
  mountain: Mountain,
  town: Landmark,
};

/** 테마별 수채화 톤 fallback */
const SCENE_GRADIENT: Record<SceneVariant, string> = {
  sea: "linear-gradient(160deg, #D7ECFF 0%, #8FC0EE 45%, #5B9BE0 100%)",
  mountain: "linear-gradient(160deg, #E5F3E8 0%, #9DC9A8 45%, #6FA57E 100%)",
  town: "linear-gradient(160deg, #FFF1E0 0%, #E8C49A 50%, #C9A576 100%)",
};

/**
 * 티켓 앞면 — 상단 62% 이미지 + 하단 38% 아이보리 정보.
 */
export function TravelCardFront({
  destination,
  revealMotion = false,
}: {
  destination: Destination;
  revealMotion?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const SceneIcon = SCENE_ICON[destination.scene];
  const accent = getAccentColor(destination);

  return (
    <motion.div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl"
      style={{
        border: "1.5px solid rgba(255,249,236,0.85)",
        boxShadow: "0 10px 22px rgba(36,88,184,0.18)",
        background: "#FFF9EC",
      }}
      initial={revealMotion ? { opacity: 0, scale: 1.04 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="relative h-[62%] w-full shrink-0 overflow-hidden">
        {!imgError ? (
          <img
            src={destination.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: SCENE_GRADIENT[destination.scene] }}
          >
            <SceneIcon className="h-9 w-9 text-white/80" strokeWidth={1.6} aria-hidden="true" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FFF9EC]/35 via-transparent to-transparent" />
      </div>

      <div className="relative flex h-[38%] w-full flex-col justify-between bg-[#FFF9EC] px-2.5 py-2 text-left sm:px-3 sm:py-2.5">
        <div className="min-w-0 pr-10">
          <p className="truncate text-[13px] font-extrabold text-ink sm:text-[15px]">{destination.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[9px] font-semibold text-muted sm:text-[10px]">
            <MapPin className="h-2.5 w-2.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
            <span className="truncate">{destination.region}</span>
          </p>
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted sm:text-[11px]">
            {destination.shortDescription}
          </p>
        </div>

        <div className="mt-1 flex items-end justify-between gap-1 pr-9">
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 flex-wrap gap-1">
              {destination.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="truncate rounded-full px-1.5 py-0.5 text-[8px] font-bold sm:text-[9px]"
                  style={{ backgroundColor: `${accent}1A`, color: accent }}
                >
                  #{tag}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-0.5 text-[8px] font-semibold text-muted sm:text-[9px]">
              <Clock className="h-2.5 w-2.5" strokeWidth={2.4} aria-hidden="true" />
              {destination.travelTimeText}
            </span>
          </div>
        </div>

        <TravelPostmark className="absolute bottom-2 right-2" size={36} />
      </div>
    </motion.div>
  );
}

export const CardFrontFace = TravelCardFront;
