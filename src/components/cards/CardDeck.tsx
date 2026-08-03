"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTravelStore } from "@/stores/travelStore";
import { useDevice } from "@/components/system/DeviceProvider";
import { MysteryCard } from "./MysteryCard";
import type { MysteryCardData } from "@/types/travel";

/**
 * 추천된 5장의 미스터리 카드를 배치하고 선택 인터랙션을 담당한다.
 * - 데스크톱: 5장 한 줄(가운데 카드 강조).
 * - 모바일: 가로 스와이프 캐러셀(한 장씩 스냅 + 인디케이터).
 * - 선택 시: 선택 카드는 중앙에서 크게 뒤집힌 뒤 /destination/[id] 로 이동한다.
 */
export function CardDeck() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const device = useDevice();
  const cards = useTravelStore((s) => s.cards);
  const selectCard = useTravelStore((s) => s.selectCard);
  const reveal = useTravelStore((s) => s.reveal);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 언마운트 시 타이머 정리
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const selecting = selectedId !== null;
  const selectedCard = cards.find((c) => c.id === selectedId) ?? null;

  function handleSelect(cardId: string, destinationId: string) {
    if (selecting) return;
    setSelectedId(cardId);
    selectCard(cardId);
    const delay = reduce ? 350 : 850;
    timer.current = setTimeout(() => {
      reveal(destinationId);
      router.push(`/destination/${destinationId}`);
    }, delay);
  }

  return (
    <div className="relative">
      {device === "mobile" ? (
        <MobileDeck
          cards={cards}
          selecting={selecting}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      ) : (
        <DesktopDeck
          cards={cards}
          selecting={selecting}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      )}

      {/* 선택 카드: 중앙으로 이동 + 뒤집기 오버레이 (공용) */}
      <AnimatePresence>
        {selecting && selectedCard && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 px-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-live="polite"
          >
            <motion.div
              className="w-[190px] sm:w-[210px]"
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1.12, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
            >
              <MysteryCard
                hints={selectedCard.emojiHints}
                index={0}
                disabled
                flipped={!reduce}
              />
            </motion.div>
            <span className="sr-only">여행지를 공개하는 중이에요…</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type DeckProps = {
  cards: MysteryCardData[];
  selecting: boolean;
  selectedId: string | null;
  onSelect: (cardId: string, destinationId: string) => void;
};

/** 데스크톱: 5장 한 줄 그리드 */
function DesktopDeck({ cards, selecting, selectedId, onSelect }: DeckProps) {
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-5 gap-3">
      {cards.map((card, i) => {
        const isSelected = card.id === selectedId;
        return (
          <motion.div
            key={card.id}
            animate={
              selecting && !isSelected
                ? { opacity: 0, scale: 0.85, x: (i - 2) * 44 }
                : { opacity: 1, scale: 1, x: 0 }
            }
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ visibility: isSelected ? "hidden" : "visible" }}
          >
            <MysteryCard
              hints={card.emojiHints}
              index={i + 1}
              emphasize={i === 2}
              disabled={selecting}
              onSelect={() => onSelect(card.id, card.destinationId)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

/** 모바일: 가로 스와이프 캐러셀 (스냅 + 인디케이터) */
function MobileDeck({ cards, selecting, selectedId, onSelect }: DeckProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || cards.length === 0) return;
    const cardW = el.scrollWidth / cards.length;
    setActive(Math.min(cards.length - 1, Math.round(el.scrollLeft / cardW)));
  }

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[19%] pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label="여행지 카드 5장 (좌우로 넘겨 선택)"
      >
        {cards.map((card, i) => {
          const isSelected = card.id === selectedId;
          return (
            <motion.div
              key={card.id}
              className="w-[62%] shrink-0 snap-center"
              animate={
                selecting && !isSelected
                  ? { opacity: 0.25, scale: 0.9 }
                  : { opacity: 1, scale: 1 }
              }
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ visibility: isSelected ? "hidden" : "visible" }}
            >
              <MysteryCard
                hints={card.emojiHints}
                index={i + 1}
                disabled={selecting}
                onSelect={() => onSelect(card.id, card.destinationId)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* 페이지 인디케이터 */}
      <div className="mt-1 flex items-center justify-center gap-1.5" aria-hidden="true">
        {cards.map((c, i) => (
          <span
            key={c.id}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === active ? "w-5 bg-primary" : "w-2 bg-line"
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-muted">
        ← 옆으로 넘겨 카드를 골라보세요 →
      </p>
    </div>
  );
}
