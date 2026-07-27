"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { StepProgress } from "@/components/layout/StepProgress";
import { CardDeck } from "@/components/cards/CardDeck";
import { useTravelStore } from "@/stores/travelStore";
import { recommendCards } from "@/lib/recommend";

const MAX_REDRAWS = 3;

export default function CardsPage() {
  const router = useRouter();
  const cards = useTravelStore((s) => s.cards);
  const themes = useTravelStore((s) => s.themes);
  const setCards = useTravelStore((s) => s.setCards);

  const [mounted, setMounted] = useState(false);
  const [redrawsLeft, setRedrawsLeft] = useState(MAX_REDRAWS);

  // 잘못된 접근(카드 없음)이면 조건 설정으로. mounted 게이트로 하이드레이션 불일치 방지.
  useEffect(() => {
    setMounted(true);
    if (useTravelStore.getState().cards.length === 0) {
      router.replace("/conditions");
    }
  }, [router]);

  // 다시 뽑기 — 동일한 5장이 그대로 반복되지 않도록 처리
  function handleRedraw() {
    if (redrawsLeft <= 0) return;
    const prev = cards.map((c) => c.destinationId).join(",");
    let next = recommendCards(themes);
    for (let i = 0; i < 6 && next.map((c) => c.destinationId).join(",") === prev; i++) {
      next = recommendCards(themes);
    }
    setCards(next);
    setRedrawsLeft((n) => n - 1);
  }

  const canRedraw = redrawsLeft > 0;

  return (
    <PageContainer className="flex min-h-[calc(100vh-4rem)] flex-col justify-center text-center">
      {/* 상단: 진행 단계 + 다시 뽑기 잔여 횟수 */}
      <div className="relative mb-6">
        <StepProgress current={3} className="mx-auto max-w-2xl" />
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm font-bold text-primary-dark shadow-sm sm:absolute sm:right-0 sm:top-0 sm:mt-0">
          <span aria-hidden="true">🔄</span> 다시 뽑기 {redrawsLeft}/{MAX_REDRAWS}회
        </span>
      </div>

      <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
        마음이 이끄는 <span className="text-primary">카드</span>를 골라보세요!
      </h1>
      <p className="mt-3 text-lg text-muted">
        여행지 이름은 아직 비밀이에요 🤫
      </p>

      {/* 카드 덱 (mounted 이후에만, cards 있을 때만) */}
      <div className="mt-6">
        {mounted && cards.length > 0 ? (
          <CardDeck />
        ) : (
          <div className="min-h-[280px]" aria-hidden="true" />
        )}
      </div>

      {/* 힌트 안내 (목적지 직접 노출 금지) */}
      <div className="surface-card mx-auto mt-6 flex max-w-xl items-start gap-3 rounded-2xl px-5 py-4 text-left">
        <span className="text-lg" aria-hidden="true">
          💡
        </span>
        <p className="text-sm leading-relaxed text-ink">
          <span className="font-bold text-primary">힌트</span>
          <span className="mx-2 text-line">|</span>
          이모지들은 여행지의 특징을 나타내요! 어떤 곳인지 상상해보세요 ✨
        </p>
      </div>

      {/* 카드 다시 뽑기 */}
      <div className="mx-auto mt-6 max-w-xl">
        <button
          type="button"
          onClick={handleRedraw}
          disabled={!canRedraw}
          className="flex w-full items-center justify-between gap-3 rounded-2xl bg-primary/[0.08] px-5 py-4 text-left transition-colors hover:bg-primary/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm" aria-hidden="true">
            🔀
          </span>
          <span className="flex-1">
            <span className="block text-base font-extrabold text-ink">
              카드 다시 뽑기
            </span>
            <span className="block text-sm text-muted">
              {canRedraw
                ? "새로운 5장의 카드를 다시 만나보세요!"
                : "다시 뽑기 횟수를 모두 사용했어요."}
            </span>
          </span>
          <span className="text-xl text-primary" aria-hidden="true">
            ›
          </span>
        </button>
      </div>
    </PageContainer>
  );
}
