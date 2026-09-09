import { useEffect } from "react";
import { motion } from "motion/react";
import "@fontsource-variable/noto-serif-kr";
import "@fontsource-variable/noto-sans-kr";
import "./conditions-theme.css";
import panelCorner from "../../assets/conditions/panel-corners.svg";
import { ConditionsControls } from "./ConditionsControls";
import { ConditionsHero } from "./ConditionsHero";
import { ShuffleLaunch } from "./ShuffleLaunch";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { preloadConditionsAssets } from "../../lib/adventureAssets";

function DossierCorners() {
  return (
    <div className="dossier-corners" aria-hidden="true">
      <img src={panelCorner} alt="" />
      <img src={panelCorner} alt="" />
      <img src={panelCorner} alt="" />
      <img src={panelCorner} alt="" />
    </div>
  );
}

/**
 * 탐험 조건 설정 — 왼쪽 기록지 / 오른쪽 미지의 여정.
 * 상태·추천 로직·라우팅은 그대로 두고 화면 구성만 담당한다.
 */
export function ConditionsPage() {
  const reduce = useReducedMotion();

  useEffect(() => {
    preloadConditionsAssets();
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
      <div className="conditions-page__veil" aria-hidden="true" />

      <div className="conditions-page__main">
        <motion.div {...enter(0.04)} className="conditions-page__panel">
          <div className="dossier">
            <DossierCorners />
            <div className="dossier-body">
              <ConditionsControls />
            </div>
            <ShuffleLaunch />
          </div>
        </motion.div>

        <motion.div {...enter(0.1)} className="conditions-page__panel">
          <ConditionsHero />
        </motion.div>
      </div>
    </div>
  );
}
