"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * PAGE 3 카드 셔플 장면.
 * 5장의 카드가 원형 궤도를 따라 돌며 회전·교차하고, 주변에 빛 입자가 흩날린다.
 * prefers-reduced-motion 이면 복잡한 궤도 대신 부드러운 페이드/펄스로 대체한다.
 */

const CARD_COUNT = 5;
const RADIUS = 92; // 궤도 반지름(px)

// 빛 입자 좌표(고정값 → SSR 하이드레이션 불일치 방지)
const PARTICLES = [
  { x: -120, y: -60, d: 0 },
  { x: 130, y: -40, d: 0.4 },
  { x: -90, y: 90, d: 0.8 },
  { x: 100, y: 100, d: 1.2 },
  { x: 0, y: -130, d: 0.6 },
  { x: -150, y: 30, d: 1.0 },
  { x: 150, y: 70, d: 0.2 },
  { x: 40, y: 140, d: 1.4 },
];

/** 카드 뒷면 — 전통 물결(청해파문)을 단순화한 네이비 패턴 + 지도핀 */
function CardBack() {
  return (
    <div className="relative h-[124px] w-[88px] overflow-hidden rounded-2xl border-[3px] border-white/80 bg-gradient-to-br from-[#3f6fd6] to-[#12305c] shadow-[0_14px_30px_rgba(18,48,92,0.4)]">
      <svg
        className="absolute inset-0 h-full w-full opacity-30"
        viewBox="0 0 88 124"
        aria-hidden="true"
      >
        {[16, 40, 64, 88, 112].map((y) => (
          <path
            key={y}
            d={`M-4,${y} q11,-9 22,0 t22,0 t22,0 t22,0`}
            fill="none"
            stroke="#cfe0fb"
            strokeWidth="2"
          />
        ))}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl text-white/90">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 22s7-6.4 7-12A7 7 0 0 0 5 10c0 5.6 7 12 7 12Z"
            fill="#fff"
          />
          <circle cx="12" cy="10" r="2.6" fill="#3f6fd6" />
        </svg>
      </span>
    </div>
  );
}

export function ShuffleScene() {
  const reduce = useReducedMotion();

  return (
    <div
      className="relative mx-auto flex h-[300px] w-full max-w-[440px] items-center justify-center sm:h-[360px]"
      aria-hidden="true"
    >
      {/* ===== 배경 백드롭 (교체 지점) =====
          실사 사진으로 바꾸려면 이 <ShuffleBackdrop /> 한 곳만 교체하면 된다. */}
      <ShuffleBackdrop />

      {/* 빛 입자 */}
      {!reduce &&
        PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            style={{ x: p.x, y: p.y }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: p.d,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* 카드 덱 */}
      <div className="relative h-1 w-1">
        {Array.from({ length: CARD_COUNT }).map((_, i) => {
          const baseAngle = (360 / CARD_COUNT) * i;

          if (reduce) {
            // 모션 최소화: 겹친 부채꼴 + 은은한 펄스
            return (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2"
                style={{
                  x: "-50%",
                  y: "-50%",
                  rotate: (i - 2) * 8,
                  translateX: (i - 2) * 14,
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              >
                <CardBack />
              </motion.div>
            );
          }

          // 궤도 회전(outer) + 카드 스핀/깊이 교차(inner)
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{ x: "-50%", y: "-50%" }}
              animate={{ rotate: [baseAngle, baseAngle + 360] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                style={{ y: -RADIUS }}
                animate={{
                  rotate: [0, -180, -360],
                  scale: [0.9, 1.08, 0.9],
                  zIndex: [1, 20, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              >
                <CardBack />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 셔플 배경 — 한국적인 낮 분위기(맑은 하늘 + 흐릿한 한옥 기와 지붕)를
 * CSS/SVG로 재현. 과하지 않게 흐리고 은은하게 처리.
 * (깨끗한 실사 사진을 받으면 이 컴포넌트만 교체)
 */
function ShuffleBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[32px]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#bfe0ff] via-[#e8f4ff] to-[#f4faff]" />
      <svg
        className="absolute inset-x-0 bottom-0 h-1/2 w-full opacity-40 blur-[2px]"
        viewBox="0 0 400 140"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        <g fill="#7c9bd6">
          {[
            { cx: 40, y: 118, w: 90, h: 28 },
            { cx: 130, y: 124, w: 78, h: 24 },
            { cx: 220, y: 120, w: 96, h: 30 },
            { cx: 320, y: 126, w: 84, h: 26 },
          ].map((r, i) => {
            const half = r.w / 2;
            return (
              <path
                key={i}
                d={`M${r.cx - half},${r.y}
                    Q${r.cx - half - 4},${r.y - 5} ${r.cx - half + 10},${r.y - r.h * 0.4}
                    Q${r.cx},${r.y - r.h} ${r.cx + half - 10},${r.y - r.h * 0.4}
                    Q${r.cx + half + 4},${r.y - 5} ${r.cx + half},${r.y} Z`}
              />
            );
          })}
        </g>
      </svg>
      {/* 중앙 발광 (카드가 만들어지는 느낌) */}
      <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-2xl" />
    </div>
  );
}
