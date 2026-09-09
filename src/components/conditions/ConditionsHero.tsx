import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ADVENTURE_IMAGES } from "../../lib/adventureAssets";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { cn } from "../../utils/cn";

type Props = {
  className?: string;
};

/** 실제 국내 여행지 사진 — 목적지는 밝히지 않고 분위기만 보여준다 */
const PHOTOS = ADVENTURE_IMAGES.journeyPhotos;
const KEYWORDS = ["바다", "산", "한옥", "도시"] as const;

export function ConditionsHero({ className = "" }: Props) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % PHOTOS.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <figure className={cn("dossier-frame", className)}>
      <figcaption className="px-1 pb-3 pt-1">
        <p className="journey-preview__eyebrow font-expedition">RANDOM TRIP PREVIEW</p>
        <h2
          className="text-[17px] font-bold tracking-tight"
          style={{ color: "var(--ivory)", fontFamily: "'Noto Serif KR Variable', serif" }}
        >
          어떤 여행이 기다리고 있을까요?
        </h2>
      </figcaption>

      <div
        /* 모바일은 4:5 비율, 데스크톱은 왼쪽 열 높이에 맞춰 세로로 채운다 */
        className="journey-preview relative aspect-[4/5] overflow-hidden rounded-[2px] lg:aspect-auto lg:min-h-0 lg:flex-1"
      >
        {PHOTOS.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            draggable={false}
            fetchPriority={i === 0 ? "high" : "low"}
            initial={false}
            animate={{ opacity: i === index ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 0.8, 0.2, 1] }}
            className="absolute inset-0 h-full w-full select-none object-cover object-center"
          />
        ))}
        <div className="journey-preview__wash" aria-hidden="true" />

        <figcaption className="journey-preview__caption">
          <p className="journey-preview__keywords">
            {KEYWORDS.map((word, i) => (
              <span key={word} data-current={i === index}>
                {word}
              </span>
            ))}
          </p>
          <p className="journey-preview__note">목적지는 카드를 뒤집는 순간 공개됩니다.</p>
        </figcaption>
      </div>
    </figure>
  );
}
