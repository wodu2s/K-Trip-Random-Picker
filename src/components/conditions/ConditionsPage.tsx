import { useEffect } from "react";
import { motion } from "motion/react";
import "@fontsource-variable/noto-serif-kr";
import "@fontsource-variable/noto-sans-kr";
import "./conditions-theme.css";
import { ConditionsControls } from "./ConditionsControls";
import { MoodPreview } from "./MoodPreview";
import { ShuffleLaunch } from "./ShuffleLaunch";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { CONDITIONS_IMAGES, preloadMoodImages } from "./moodData";

/**
 * 탐험 조건 설정 — 좌 56% 기록지 / 우 44% 분위기 미리보기.
 * 상태·추천 로직·라우팅은 그대로 두고 화면 구성만 담당한다.
 */
export function ConditionsPage() {
  const reduce = useReducedMotion();

  useEffect(() => {
    preloadMoodImages();
  }, []);

  const enter = (delay: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.32, delay, ease: [0.22, 0.8, 0.2, 1] as const },
        };

  return (
    <div className="conditions-theme conditions-page">
      {/* 배경 원본 — CSS background 대신 img로 깔아 비율을 그대로 보존한다.
          헤더 아래(페이지 상단)에서 시작하고, 남는 아래쪽은 페이지 배경색으로 이어진다. */}
      <picture>
        {/* 모바일 전용 배경이 준비되면 moodData의 backdropMobile 경로만 바꾸면 된다 */}
        <source media="(max-width: 1023px)" srcSet={CONDITIONS_IMAGES.backdropMobile} />
        <img
          className="conditions-page__bg"
          src={CONDITIONS_IMAGES.backdrop}
          alt=""
          aria-hidden="true"
          draggable={false}
          fetchPriority="high"
        />
      </picture>
      <div className="conditions-page__seam" aria-hidden="true" />

      <div className="conditions-page__main">
        <motion.section {...enter(0.04)} className="conditions-page__left">
          <div className="dossier">
            <ConditionsControls />
          </div>
          <ShuffleLaunch />
        </motion.section>

        <motion.aside {...enter(0.1)} className="conditions-page__right">
          <MoodPreview />
        </motion.aside>
      </div>
    </div>
  );
}
