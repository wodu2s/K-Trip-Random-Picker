import { useState } from "react";
import { motion } from "motion/react";
import { Gem, MapPin } from "lucide-react";
import type { Destination, SceneVariant } from "../../types/travel";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { getEmojiHints } from "../../lib/icons";

/**
 * PAGE 5 여행지 공개 Hero (design_2.5 톤).
 */
export function DestinationHero({ destination, layoutId }: { destination: Destination; layoutId?: string }) {
  const reduce = useReducedMotion();
  const [imgError, setImgError] = useState(false);
  const hints = getEmojiHints(destination);

  return (
    <div className="text-center">
      <p className="text-[11px] font-bold tracking-[0.14em] text-brass">DESTINATION FOUND</p>
      <p className="mt-2 text-sm font-semibold text-muted">{destination.region}</p>
      <motion.h1
        className="mt-1 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      >
        {destination.name}
      </motion.h1>
      <motion.p
        className="mt-2 text-lg font-bold text-brass"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
      >
        {destination.tagline}
      </motion.p>

      <motion.div
        layoutId={layoutId}
        className="relative mx-auto mt-5 aspect-video w-full overflow-hidden rounded-[28px] shadow-card"
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {!imgError ? (
          <img
            src={destination.image}
            alt={`${destination.name} 대표 사진`}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <HeroArt variant={destination.scene} />
        )}

        {destination.isHiddenGem && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-[13px] bg-paper/95 px-3 py-1.5 text-sm font-bold text-primary shadow-sm">
            <Gem className="h-4 w-4 text-brass" strokeWidth={2.2} aria-hidden="true" /> 숨은 명소
          </span>
        )}

        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-[13px] border border-[var(--adventure-line)] bg-paper/95 px-3 py-1.5 text-sm font-bold text-ink shadow-sm">
          <MapPin className="h-4 w-4 text-brass" strokeWidth={2.2} aria-hidden="true" /> {destination.region}
        </span>

        <span
          className="absolute right-4 top-4 rotate-[-10deg] rounded-sm border-2 border-[var(--adventure-orange)] px-2 py-0.5 text-[10px] font-extrabold tracking-[0.12em] text-[var(--adventure-orange)]"
          aria-hidden="true"
        >
          ARRIVED
        </span>
      </motion.div>

      <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted">
        <span>카드 속 힌트였어요</span>
        <span className="text-lg" aria-hidden="true">
          {hints.join(" ")}
        </span>
      </p>
    </div>
  );
}

/** 골든아워 한국 풍경 SVG (테마별 초점 요소) */
function HeroArt({ variant }: { variant: SceneVariant }) {
  return (
    <svg viewBox="0 0 400 225" className="h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="여행지 풍경 일러스트">
      <defs>
        <linearGradient id="d-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fc0f2" />
          <stop offset="55%" stopColor="#cfe6f8" />
          <stop offset="100%" stopColor="#f4e3c4" />
        </linearGradient>
        <linearGradient id="d-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f86c9" />
          <stop offset="100%" stopColor="#2a6bb0" />
        </linearGradient>
        <radialGradient id="d-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6da" />
          <stop offset="60%" stopColor="#ffdf9c" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffdf9c" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="225" fill="url(#d-sky)" />
      <circle cx="300" cy="90" r="70" fill="url(#d-sun)" />
      <circle cx="300" cy="90" r="22" fill="#fff0c8" />

      <g fill="#ffffff" opacity="0.85">
        <ellipse cx="90" cy="45" rx="34" ry="12" />
        <ellipse cx="120" cy="52" rx="26" ry="10" />
        <ellipse cx="250" cy="35" rx="24" ry="9" />
      </g>

      {variant === "sea" && (
        <>
          <rect y="140" width="400" height="85" fill="url(#d-sea)" />
          <path d="M300,110 l70,30 v85 h-70 Z" fill="#f2d69f" opacity="0.5" />
          <path d="M0,150 Q60,90 130,120 T240,130 L240,225 L0,225 Z" fill="#5f8f6e" />
          <path d="M180,225 Q210,150 250,150 Q300,150 320,225 Z" fill="#6ea77c" />
          <rect x="243" y="120" width="10" height="34" fill="#fff" />
          <rect x="243" y="120" width="10" height="8" fill="#e5484d" />
          <polygon points="242,120 254,120 248,112" fill="#c53b3f" />
          <path d="M60,225 Q70,185 82,225 Z" fill="#4d5a63" />
          <path d="M95,225 Q108,175 122,225 Z" fill="#5a6771" />
          <path d="M140,70 q7,-7 14,0 q7,-7 14,0" fill="none" stroke="#4a5a68" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}

      {variant === "mountain" && (
        <>
          <path d="M0,150 Q80,80 160,130 T400,120 L400,225 L0,225 Z" fill="#8aa9c9" opacity="0.7" />
          <path d="M0,175 Q90,120 180,160 T400,155 L400,225 L0,225 Z" fill="#5f8f6e" />
          <path d="M120,225 Q180,120 240,225 Z" fill="#4f7d5f" />
          <polygon points="200,150 176,190 224,190" fill="#3f6a52" />
          <polygon points="200,150 190,167 210,167" fill="#eef4f7" />
          <rect x="150" y="175" width="5" height="50" fill="#dcefff" opacity="0.85" />
          <g fill="#3f6a4e">
            <polygon points="70,210 58,225 82,225" />
            <polygon points="70,198 60,214 80,214" />
          </g>
        </>
      )}

      {variant === "town" && (
        <>
          <path d="M0,160 Q100,110 200,150 T400,140 L400,225 L0,225 Z" fill="#9db8d6" opacity="0.6" />
          <path d="M0,185 Q120,150 240,180 T400,175 L400,225 L0,225 Z" fill="#7f9d78" />
          <g fill="#3f2f2a">
            <TownRoof cx={90} baseY={205} w={90} h={26} />
            <TownRoof cx={180} baseY={210} w={78} h={22} />
            <TownRoof cx={150} baseY={225} w={110} h={30} />
            <TownRoof cx={260} baseY={222} w={92} h={26} />
          </g>
          <rect y="219" width="400" height="6" fill="#5a4340" />
        </>
      )}
    </svg>
  );
}

function TownRoof({ cx, baseY, w, h }: { cx: number; baseY: number; w: number; h: number }) {
  const half = w / 2;
  return (
    <path
      d={`M${cx - half},${baseY}
          Q${cx - half - 4},${baseY - 5} ${cx - half + 10},${baseY - h * 0.4}
          Q${cx},${baseY - h} ${cx + half - 10},${baseY - h * 0.4}
          Q${cx + half + 4},${baseY - 5} ${cx + half},${baseY} Z`}
    />
  );
}
