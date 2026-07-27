"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTravelStore } from "@/stores/travelStore";
import { MysteryCard } from "./MysteryCard";

/**
 * 추천된 5장의 미스터리 카드를 배치하고 선택 인터랙션을 담당한다.
 * - 데스크톱: 5장 한 줄(가운데 카드 약간 강조) / 모바일: 2열 + 마지막 카드 중앙.
 * - 선택 시: 나머지 카드는 바깥으로 흩어져 흐려지고, 선택 카드는 중앙에서 뒤집힌 뒤
 *   /destination/[id] 로 이동한다.
 */
export function CardDeck() {
  const router = useRouter();
  const reduce = useReducedMotion();
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
      {/* 카드 그리드 */}
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5 lg:gap-3">
        {cards.map((card, i) => {
          const isSelected = card.id === selectedId;
          const isLastOdd = i === 4;
          return (
            <motion.div
              key={card.id}
              className={
                isLastOdd
                  ? "col-span-2 mx-auto w-[calc(50%-6px)] lg:col-span-1 lg:w-auto"
                  : ""
              }
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
                onSelect={() => handleSelect(card.id, card.destinationId)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* 선택 카드: 중앙으로 이동 + 뒤집기 오버레이 */}
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
