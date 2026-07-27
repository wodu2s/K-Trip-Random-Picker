"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { StepProgress } from "@/components/layout/StepProgress";
import { ShuffleScene } from "@/components/cards/ShuffleScene";
import { useTravelStore } from "@/stores/travelStore";
import { recommendCards } from "@/lib/recommend";

const MESSAGES = [
  "출발지 확인 중",
  "이동 가능 시간 계산 중",
  "취향과 테마 분석 중",
  "랜덤 카드 준비 중",
] as const;

const BENEFITS = [
  { emoji: "🎲", text: "어디로 갈지 고민할 필요 없이" },
  { emoji: "❤️", text: "새로운 장소와의 설레는 만남" },
  { emoji: "🌿", text: "숨겨진 명소를 발견하는 기쁨" },
];

export default function ShufflePage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [msgIndex, setMsgIndex] = useState(0);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const { duration, themes, setCards } = useTravelStore.getState();

    // 조건이 없으면(새로고침·직접 진입) 조건 설정으로 돌려보낸다.
    if (!duration) {
      setBlocked(true);
      router.replace("/conditions");
      return;
    }

    // 조건에 맞는 후보 5장을 뽑아 상태에 저장 (실제 API 미호출)
    setCards(recommendCards(themes));

    // 셔플 총 시간: 일반 ~2.8초 / 모션 최소화 ~1.4초
    const total = reduce ? 1400 : 2800;
    const step = total / MESSAGES.length;

    // 정리 가능한 단일 타이머 배열 (난립 방지 · 언마운트 시 일괄 정리)
    const timers: ReturnType<typeof setTimeout>[] = [];
    MESSAGES.forEach((_, i) => {
      timers.push(setTimeout(() => setMsgIndex(i), Math.round(step * i)));
    });
    timers.push(setTimeout(() => router.replace("/cards"), total));

    return () => timers.forEach(clearTimeout);
    // 마운트 시 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (blocked) return null;

  const progress = ((msgIndex + 1) / MESSAGES.length) * 100;

  return (
    <PageContainer className="flex min-h-[calc(100vh-4rem)] flex-col justify-center text-center">
      <StepProgress current={2} className="mx-auto mb-8 max-w-2xl" />

      <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
        카드를 <span className="text-primary">섞고</span> 있어요!
      </h1>
      <p className="mt-3 text-lg text-muted">
        설렘 가득한 여행지를 준비 중이에요 ✨
      </p>

      {/* 셔플 장면 */}
      <div className="mt-6">
        <ShuffleScene />
      </div>

      {/* 상태 메시지 + 진행 바 */}
      <div className="mx-auto mt-6 max-w-sm">
        <div className="flex items-center justify-center gap-2 text-[15px] font-bold text-primary-dark">
          <span
            className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary"
            aria-hidden="true"
          />
          {MESSAGES[msgIndex]}…
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* 스크린리더 안내 (로딩 상태) */}
        <p role="status" aria-live="polite" className="sr-only">
          여행지 카드를 준비하고 있어요. {MESSAGES[msgIndex]}.
        </p>
      </div>

      {/* 랜덤 여행의 즐거움 (부가 안내) */}
      <ul className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-x-6 gap-y-2">
        {BENEFITS.map((b) => (
          <li key={b.text} className="flex items-center gap-2 text-sm text-muted">
            <span aria-hidden="true">{b.emoji}</span>
            {b.text}
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
