import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTravel } from "../../state/TravelContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../utils/cn";
import { buildPreviewSet, preloadMoodImages } from "./moodData";

/** 선택 전에는 중립 풀을 천천히 돌려 특정 테마를 미리 정해 두지 않는다 */
const ROTATE_MS = 5200;

/**
 * 여행 분위기 미리보기 — 실제 목적지는 숨기고 분위기 사진과 라벨만 보여 준다.
 * 테마를 고르면 대표 이미지와 라벨만 즉시 바뀐다.
 */
export function MoodPreview({ className = "" }: { className?: string }) {
  const { themes } = useTravel();
  const reduce = useReducedMotion();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    preloadMoodImages();
  }, []);

  useEffect(() => {
    if (reduce || themes.length > 0) return;
    const id = window.setInterval(() => setRotation((r) => r + 1), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduce, themes.length]);

  const { hero, supporting, highlighted } = buildPreviewSet(themes, rotation);

  return (
    <section className={cn("mood", className)} aria-label="여행 분위기 미리보기">
      <p className="mood__eyebrow font-expedition">TRIP MOOD</p>

      <div className="mood__stage">
        {/* 한 장만 유지하고 새 사진이 오면 위로 페이드인한다.
            AnimatePresence로 겹치면 빠져나간 노드가 DOM에 쌓여서 쓰지 않는다. */}
        <motion.img
          key={hero.image}
          src={hero.image}
          alt=""
          draggable={false}
          className="mood__photo"
          initial={reduce ? false : { opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 0.8, 0.2, 1] }}
        />

        <div className="mood__wash" aria-hidden="true" />
        <div className="mood__caption">
          <p className="mood__badge">{hero.label}</p>
          <p className="mood__title">{hero.tagline}</p>
        </div>
      </div>

      <ul className="mood__strip">
        {supporting.map((item) => (
          <li
            key={item.theme}
            className="mood__thumb"
            data-on={item.theme === highlighted}
          >
            <img src={item.image} alt="" loading="lazy" draggable={false} />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      <p className="mood__note">목적지는 카드를 뒤집는 순간 공개됩니다.</p>
    </section>
  );
}
