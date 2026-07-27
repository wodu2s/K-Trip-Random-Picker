"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * 이모지 힌트 카드 한 장.
 * 앞면: 이모지 힌트 3개 + 큰 물음표 (여행지명·지역·사진은 절대 노출하지 않음).
 * 뒷면: 전통 물결 패턴(네이비) — 선택 시 뒤집힘 연출용.
 * <button>으로 구현되어 키보드로 선택 가능.
 */
export function MysteryCard({
  hints,
  index,
  onSelect,
  disabled = false,
  emphasize = false,
  flipped = false,
}: {
  hints: string[];
  index: number;
  onSelect?: () => void;
  disabled?: boolean;
  emphasize?: boolean;
  flipped?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-label={`${index}번 카드 선택하기 (이모지 힌트 3개)`}
      whileHover={disabled || reduce ? undefined : { y: -10, scale: 1.05 }}
      whileTap={disabled || reduce ? undefined : { scale: 0.98 }}
      className={`group block w-full [perspective:1000px] disabled:cursor-default ${
        emphasize ? "lg:-translate-y-2 lg:scale-[1.05]" : ""
      }`}
    >
      <motion.div
        className="relative aspect-[3/4] w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: reduce ? 0 : 0.6, ease: "easeInOut" }}
      >
        {/* ===== 앞면 ===== */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <div className="h-full w-full rounded-[22px] bg-gradient-to-br from-[#7cb8ff] to-[#ffd166] p-[3px] shadow-[0_16px_36px_rgba(47,115,246,0.22)] transition-shadow group-hover:shadow-[0_24px_48px_rgba(47,115,246,0.32)]">
            <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[19px] bg-white">
              {/* 은은한 패턴 워터마크 */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05]"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id={`mc-pat-${index}`}
                    width="34"
                    height="34"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(12)"
                  >
                    <circle cx="6" cy="6" r="3" fill="#12305c" />
                    <rect x="20" y="18" width="6" height="6" rx="1.5" fill="#12305c" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#mc-pat-${index})`} />
              </svg>

              {/* 이모지 힌트 3개 (3D 느낌 그림자) */}
              <div className="z-10 flex items-center justify-center gap-1.5 px-2 text-3xl sm:text-4xl">
                {hints.slice(0, 3).map((e, i) => (
                  <span
                    key={i}
                    className="drop-shadow-[0_5px_6px_rgba(18,48,92,0.28)]"
                    aria-hidden="true"
                  >
                    {e}
                  </span>
                ))}
              </div>

              {/* 큰 물음표 */}
              <div
                className="z-10 mt-4 text-5xl font-black text-line sm:text-6xl"
                aria-hidden="true"
              >
                ?
              </div>
            </div>
          </div>
        </div>

        {/* ===== 뒷면 (네이비 물결 패턴) ===== */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="relative h-full w-full overflow-hidden rounded-[22px] border-[3px] border-white/80 bg-gradient-to-br from-[#3f6fd6] to-[#12305c] shadow-[0_16px_36px_rgba(18,48,92,0.4)]">
            <svg
              className="absolute inset-0 h-full w-full opacity-30"
              viewBox="0 0 100 140"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {[16, 40, 64, 88, 112].map((y) => (
                <path
                  key={y}
                  d={`M-4,${y} q13,-10 26,0 t26,0 t26,0 t26,0`}
                  fill="none"
                  stroke="#cfe0fb"
                  strokeWidth="2.5"
                />
              ))}
            </svg>
            <span className="absolute inset-0 flex items-center justify-center">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 22s7-6.4 7-12A7 7 0 0 0 5 10c0 5.6 7 12 7 12Z"
                  fill="#fff"
                />
                <circle cx="12" cy="10" r="2.6" fill="#3f6fd6" />
              </svg>
            </span>
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}
