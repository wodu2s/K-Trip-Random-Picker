"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

/**
 * PAGE 1 오른쪽 3D 비주얼 (CSS 3D 구현).
 *
 * 구조: 원형 받침대 위에 5장의 카드가 부채꼴로 펼쳐지고,
 * 나침반 · 지도핀 · 여행 가방 · 티켓 · 구름 · 반짝이가 주변을 장식한다.
 * - 마우스 이동에 따라 카드 덱이 미세하게 기운다 (parallax).
 * - 카드/오브젝트는 천천히 떠 있는 float 애니메이션.
 * - prefers-reduced-motion 시 모든 움직임 비활성화.
 *
 * 추후 이 컴포넌트 내부만 Spline <spline-viewer>로 교체하면 된다.
 */

type DeckCardDef = {
  x: number;
  rot: number;
  scale: number;
  z: number;
  center?: boolean;
  emoji?: string;
  sub?: string;
  tone?: string;
};

// 부채꼴 카드 정의 (앞→뒤 순서는 zIndex로 제어)
const CARDS: DeckCardDef[] = [
  {
    x: -150,
    rot: -15,
    scale: 0.8,
    z: 10,
    emoji: "🌲",
    sub: "⛰️",
    tone: "from-[#8fc0ff] to-[#bfe0c8]",
  },
  {
    x: -78,
    rot: -7,
    scale: 0.9,
    z: 20,
    emoji: "🏯",
    sub: "🏮",
    tone: "from-[#8fc0ff] to-[#ffe6a8]",
  },
  { x: 0, rot: 0, scale: 1, z: 40, center: true },
  {
    x: 78,
    rot: 7,
    scale: 0.9,
    z: 20,
    emoji: "🎈",
    sub: "☕",
    tone: "from-[#8fc0ff] to-[#ffd6a8]",
  },
  {
    x: 150,
    rot: 15,
    scale: 0.8,
    z: 10,
    emoji: "🗻",
    sub: "🍁",
    tone: "from-[#8fc0ff] to-[#bfe0c8]",
  },
] as const;

function Float({
  children,
  className = "",
  delay = 0,
  distance = 10,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  disabled?: boolean;
}) {
  return (
    <motion.div
      className={className}
      animate={disabled ? undefined : { y: [0, -distance, 0] }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

function DeckCard({
  card,
  rotX,
  rotY,
}: {
  card: (typeof CARDS)[number];
  rotX: MotionValue<number>;
  rotY: MotionValue<number>;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        zIndex: card.z,
        rotateX: card.center ? rotX : undefined,
        rotateY: card.center ? rotY : undefined,
        x: card.x - 75,
        y: -110,
        rotate: card.rot,
        scale: card.scale,
        transformStyle: "preserve-3d",
      }}
    >
      {/* 파랑→노랑 그라데이션 테두리 (레퍼런스 카드 림) */}
      <div
        className={`rounded-[22px] bg-gradient-to-br p-[3px] shadow-[0_18px_40px_rgba(47,115,246,0.28)] ${
          card.center ? "from-[#7cb8ff] to-[#ffd166]" : card.tone
        }`}
      >
        <div className="flex h-[210px] w-[150px] flex-col items-center justify-center overflow-hidden rounded-[19px] bg-white px-3">
          {card.center ? (
            <>
              <div className="flex flex-1 items-center justify-center text-5xl">
                <span className="drop-shadow-sm">🌊</span>
                <span className="-ml-1 drop-shadow-sm">🏝️</span>
              </div>
              <div className="mb-1 text-2xl">☀️</div>
              <p className="pb-3 text-center text-[11px] font-bold tracking-wide text-muted">
                WHERE TO GO
                <br />
                NEXT?
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-4xl opacity-95">
              <span>{card.emoji}</span>
              <span className="text-3xl">{card.sub}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TravelHero3D() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // 포인터 위치(-0.5 ~ 0.5) → 카드 덱 기울기
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-12, 12]), {
    stiffness: 120,
    damping: 18,
  });
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), {
    stiffness: 120,
    damping: 18,
  });

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="relative mx-auto h-[420px] w-full max-w-[560px] select-none sm:h-[480px]"
      style={{ perspective: "1000px" }}
      aria-hidden="true"
    >
      {/* 구름 & 반짝이 */}
      <Float disabled={!!reduce} delay={0.5} distance={8} className="absolute left-2 top-2 text-5xl opacity-90">
        ☁️
      </Float>
      <Float disabled={!!reduce} delay={1.4} distance={12} className="absolute right-6 top-0 text-4xl opacity-90">
        ☁️
      </Float>
      <span className="absolute left-1/3 top-6 text-lg text-white/90">✨</span>
      <span className="absolute right-1/4 top-24 text-sm text-white/80">✨</span>
      <span className="absolute left-8 top-40 text-base text-white/80">✨</span>

      {/* 받침대 (원형 podium) */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
        <div className="h-9 w-64 rounded-[100%] bg-[#5b8ee0] opacity-70 blur-[1px]" />
        <div className="-mt-[30px] h-8 w-64 rounded-[100%] bg-gradient-to-b from-white to-[#cfe0fb]" />
      </div>

      {/* 카드 덱 (parallax 적용 컨테이너) */}
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {CARDS.map((card, i) => (
          <Float
            key={i}
            disabled={!!reduce}
            delay={i * 0.25}
            distance={card.center ? 12 : 7}
            className="absolute inset-0"
          >
            <DeckCard card={card} rotX={rotX} rotY={rotY} />
          </Float>
        ))}
      </div>

      {/* 나침반 (모바일 숨김) */}
      <Float
        disabled={!!reduce}
        delay={0.8}
        className="absolute bottom-20 left-2 hidden text-5xl drop-shadow-md sm:block"
      >
        🧭
      </Float>

      {/* 지도 핀 */}
      <Float
        disabled={!!reduce}
        delay={1.1}
        className="absolute right-2 top-1/2 text-4xl drop-shadow-md"
      >
        📍
      </Float>

      {/* 여행 가방 (모바일 숨김) */}
      <Float
        disabled={!!reduce}
        delay={1.6}
        className="absolute bottom-8 right-6 hidden text-5xl drop-shadow-md sm:block"
      >
        🧳
      </Float>

      {/* 여행 티켓 (모바일 숨김) */}
      <Float
        disabled={!!reduce}
        delay={0.4}
        className="absolute bottom-6 left-1/4 hidden -rotate-6 sm:block"
      >
        <div className="rounded-lg bg-white px-3 py-2 text-[10px] font-extrabold tracking-wider text-primary shadow-md">
          ✈️ ADVENTURE
          <span className="block text-[8px] font-semibold text-muted">
            AWAITS
          </span>
        </div>
      </Float>
    </div>
  );
}
