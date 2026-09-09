import { useState } from "react";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import type { Destination } from "../../types/travel";
import {
  ADVENTURE,
  ADVENTURE_SHADOW,
  getCardVariant,
} from "../../lib/adventureCardTokens";

const ADVENTURE_SHADOW_SELECTED = ADVENTURE_SHADOW.selected;
import { CARD_MOTION } from "../../lib/cardMotion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { CompassGraphic } from "./CompassGraphic";
import { ContourPattern, CornerMarks, PaperNoise } from "./ContourPattern";
import { ExpeditionCardArt } from "./ExpeditionCardArt";
import { PickedStamp } from "./PickedStamp";

export type AdventureFace = "back" | "hint";

type RevealInfo = Pick<Destination, "name" | "region" | "image" | "shortDescription" | "tags">;

const PARCHMENT_TINTS = [
  ADVENTURE.parchmentLight,
  "#F2EBDA",
  ADVENTURE.parchment,
] as const;

/**
 * Adventure Compass Card — 뒷면 / 힌트 / 공개면.
 * 목적지는 힌트·뒷면에 노출하지 않는다.
 */
export function AdventureTravelCard({
  hints,
  index,
  onSelect,
  disabled = false,
  face = "hint",
  flipped = false,
  stamped = false,
  selected = false,
  reveal = null,
  needleBoost = 0,
  embedded = false,
  className = "",
}: {
  hints: string[];
  index: number;
  onSelect?: () => void;
  disabled?: boolean;
  face?: AdventureFace;
  flipped?: boolean;
  stamped?: boolean;
  /** Selected / centering — before or with PICKED stamp */
  selected?: boolean;
  reveal?: RevealInfo | null;
  /** 호버 시 바늘 추가 각도 */
  needleBoost?: number;
  /** ShuffleDeck 등 상위 motion.button 안에 넣을 때 */
  embedded?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const variant = getCardVariant(index - 1);
  const isPicked = selected || stamped || flipped;
  const rotateY = flipped
    ? reduce
      ? 180
      : ([0, 70, 110, 180] as number[])
    : face === "back"
      ? 180
      : 0;
  const labelHints = hints.slice(0, 5).join(", ");
  const ariaLabel =
    flipped && reveal
      ? `선택된 여행지 ${reveal.name}`
      : selected || stamped
        ? `선택한 여행 카드 ${labelHints}`
        : `${labelHints} 힌트가 포함된 여행 카드 선택`;

  // 뒷면→힌트는 duration 0. 공개 flip만 70→110을 빠르게 통과.
  const inner = (
    <motion.div
      className="preserve-3d relative h-full w-full"
      style={{ aspectRatio: "2 / 3" }}
      animate={{
        rotateY,
        scale: flipped && !reduce ? [1.08, 1.02, 1.08] : 1,
      }}
      transition={{
        rotateY: flipped
          ? {
              duration: reduce ? 0.18 : CARD_MOTION.flip,
              ease: [0.22, 0.8, 0.2, 1],
              times: reduce ? undefined : [0, 0.18, 0.32, 1],
            }
          : { duration: 0 },
        scale: { duration: reduce ? 0.16 : CARD_MOTION.flip },
      }}
    >
      {/* 힌트 면 (rotateY 0) */}
      <div className="backface-hidden absolute inset-0">
        <HintFace
          hints={hints}
          variant={variant}
          needleDeg={variant.needle + needleBoost}
          animateNeedle={stamped || Math.abs(needleBoost) > 0}
          emphasized={selected && !flipped}
        />
        <PickedStamp active={stamped && !flipped} reduce={reduce} />
      </div>

      {/* 뒷면 / 공개면 (rotateY 180) */}
      <div className="backface-hidden absolute inset-0" style={{ transform: "rotateY(180deg)" }}>
        {flipped && reveal ? (
          <RevealFace destination={reveal} hints={hints} />
        ) : (
          <BackFace />
        )}
      </div>
    </motion.div>
  );

  if (embedded) {
    if (flipped && reveal) {
      return (
        <div className={`relative h-full w-full ${className}`} aria-hidden="true">
          <RevealFace destination={reveal} hints={hints} />
        </div>
      );
    }
    return (
      <div className={`relative h-full w-full ${className}`} aria-hidden="true">
        <HintFace
          hints={hints}
          variant={variant}
          needleDeg={variant.needle + needleBoost}
          animateNeedle={stamped || Math.abs(needleBoost) > 0}
          emphasized={selected && !flipped}
        />
        <PickedStamp active={stamped && !flipped} reduce={reduce} />
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      aria-pressed={isPicked}
      whileTap={disabled || reduce ? undefined : { scale: 0.985 }}
      className={`relative block w-full perspective-1000 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 disabled:cursor-default ${className}`}
      style={{ outlineColor: ADVENTURE.brass }}
    >
      {inner}
    </motion.button>
  );
}

function DualBorder({ brass = false }: { brass?: boolean; forest?: boolean }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-[6px] rounded-[7px]"
        style={{ boxShadow: `inset 0 0 0 1px ${ADVENTURE.brass}` }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-[10px] rounded-[5px]"
        style={{
          boxShadow: brass
            ? `inset 0 0 0 0.75px ${ADVENTURE.brassLine}`
            : "inset 0 0 0 0.75px rgba(201,162,39,0.4)",
        }}
        aria-hidden="true"
      />
    </>
  );
}

function BackFace() {
  return <ExpeditionCardArt featured />;
}

function HintFace({
  hints,
  variant,
  needleDeg,
  animateNeedle,
  emphasized = false,
}: {
  hints: string[];
  variant: ReturnType<typeof getCardVariant>;
  needleDeg: number;
  animateNeedle: boolean;
  emphasized?: boolean;
}) {
  const bg = PARCHMENT_TINTS[variant.parchmentShift] ?? ADVENTURE.parchmentLight;
  const bottomHints = hints.slice(0, 3);

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{
        borderRadius: "var(--radius-card)",
        background: bg,
        border: emphasized
          ? `2.5px solid ${ADVENTURE.brass}`
          : `1.5px solid ${ADVENTURE.brass}`,
        boxShadow: emphasized
          ? `0 0 0 1px ${ADVENTURE.brassLine}, ${ADVENTURE_SHADOW_SELECTED}`
          : "0 14px 30px rgba(22,40,31,0.2)",
      }}
    >
      <PaperNoise />
      <ContourPattern tone="light" pathVariant={variant.path} />
      <CornerMarks tone="light" />
      <DualBorder />

      <div className="relative z-10 flex items-start justify-between px-3.5 pt-3.5">
        <p
          className="font-expedition text-[12px] font-bold tracking-[0.12em]"
          style={{ color: ADVENTURE.forestDark }}
        >
          Pick&Go
        </p>
        <p
          className="font-expedition text-[9px] font-bold tracking-[0.1em]"
          style={{ color: ADVENTURE.brass }}
        >
          {variant.expedition}
        </p>
      </div>

      <div className="relative z-10 mx-auto mt-1 flex flex-1 items-center justify-center">
        <CompassGraphic
          size={92}
          needleDeg={needleDeg || 35}
          animateNeedle={animateNeedle}
          showLoop={false}
          pulse={animateNeedle}
          emphasizeRim={emphasized}
        />
      </div>

      <div className="relative z-10 mt-auto px-3 pb-3.5 text-center">
        <p
          className="font-expedition text-[10px] font-bold tracking-[0.18em]"
          style={{ color: ADVENTURE.brass }}
        >
          EXPEDITION
        </p>
        {bottomHints.length > 0 ? (
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            {bottomHints.map((emoji, i) => (
              <span
                key={`${emoji}-${i}`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] shadow-sm"
                style={{
                  background: ADVENTURE.parchmentLight,
                  border: `1.5px solid ${ADVENTURE.brassLine}`,
                }}
                aria-hidden="true"
              >
                {emoji}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** 공개면 내용이 순서대로 올라오는 stagger */
const REVEAL_ITEM = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
} as const;

/**
 * 공개면 — 카드 뒷면과 같은 forest + antique gold 틀 안에
 * 실제 관광지 사진 · 목적지명 · 소개 2줄 · 힌트 3개를 얹는다.
 */
function RevealFace({
  destination,
  hints = [],
}: {
  destination: RevealInfo;
  hints?: string[];
}) {
  const reduce = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);
  const bottomHints = hints.slice(0, 3);

  const stagger = (i: number) => ({
    duration: reduce ? 0 : 0.34,
    delay: reduce ? 0 : 0.06 + i * CARD_MOTION.revealStagger,
    ease: [0.22, 0.8, 0.2, 1] as [number, number, number, number],
  });

  return (
    <motion.div
      className="relative flex h-full w-full flex-col overflow-hidden"
      initial="hidden"
      animate="show"
      style={{
        borderRadius: "var(--radius-card)",
        background:
          "linear-gradient(165deg, #1B3022 0%, var(--color-forest-900) 52%, #122018 100%)",
        border: `1.5px solid ${ADVENTURE.brass}`,
        boxShadow: `0 0 0 1px ${ADVENTURE.brassLine}, ${ADVENTURE_SHADOW_SELECTED}`,
      }}
    >
      {/* 사진 */}
      <motion.div
        className="relative w-full overflow-hidden"
        style={{ height: "55%" }}
        variants={REVEAL_ITEM}
        transition={stagger(0)}
      >
        {destination.image && !imageFailed ? (
          <img
            src={destination.image}
            alt=""
            draggable={false}
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(150deg, #2A4433 0%, #1B3022 60%, #122018 100%)",
            }}
          />
        )}
        {/* 사진 아래를 forest로 녹여 카드와 이어붙인다 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,32,24,0.18) 0%, rgba(18,32,24,0) 45%, rgba(18,32,24,0.92) 100%)",
          }}
        />
      </motion.div>

      {/* 양피지 본문 */}
      <div
        className="relative flex flex-1 flex-col px-3.5 pt-2.5 pb-3"
        style={{
          background: `linear-gradient(180deg, ${ADVENTURE.parchment} 0%, ${ADVENTURE.parchmentLight} 100%)`,
          borderTop: `1px solid ${ADVENTURE.brass}`,
        }}
      >
        <PaperNoise />

        <motion.div className="relative z-10" variants={REVEAL_ITEM} transition={stagger(1)}>
          <p
            className="font-expedition text-[8px] font-bold tracking-[0.22em]"
            style={{ color: ADVENTURE.brass }}
          >
            DESTINATION FOUND
          </p>
          <p
            className="mt-0.5 flex items-center gap-1 font-expedition text-[9px] font-bold tracking-[0.14em]"
            style={{ color: "rgba(22,40,31,0.66)" }}
          >
            <MapPin
              className="h-3 w-3 shrink-0"
              strokeWidth={2.4}
              style={{ color: ADVENTURE.brass }}
              aria-hidden="true"
            />
            <span className="truncate">{destination.region}</span>
          </p>
        </motion.div>

        <motion.p
          className="relative z-10 mt-1 font-expedition text-[17px] leading-tight font-bold"
          style={{ color: ADVENTURE.forestDark }}
          variants={REVEAL_ITEM}
          transition={stagger(2)}
        >
          {destination.name}
        </motion.p>

        <motion.p
          className="relative z-10 mt-1.5 line-clamp-2 text-[10.5px] leading-[1.45]"
          style={{ color: "rgba(22,40,31,0.72)" }}
          variants={REVEAL_ITEM}
          transition={stagger(3)}
        >
          {destination.shortDescription}
        </motion.p>

        {bottomHints.length > 0 ? (
          <motion.div
            className="relative z-10 mt-auto flex items-center justify-center gap-1.5 pt-2"
            style={{ borderTop: `1px solid ${ADVENTURE.brassLine}` }}
            variants={REVEAL_ITEM}
            transition={stagger(4)}
          >
            {bottomHints.map((emoji, i) => (
              <span
                key={`${emoji}-${i}`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] shadow-sm"
                style={{
                  background: ADVENTURE.parchmentLight,
                  border: `1.5px solid ${ADVENTURE.brassLine}`,
                }}
                aria-hidden="true"
              >
                {emoji}
              </span>
            ))}
          </motion.div>
        ) : null}
      </div>

      <DualBorder brass />
    </motion.div>
  );
}

/** MysteryCard 호환 별칭 */
export const MysteryCard = AdventureTravelCard;
