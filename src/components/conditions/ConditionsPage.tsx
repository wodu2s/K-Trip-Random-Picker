import { useEffect } from "react";
import { motion } from "motion/react";
import "@fontsource-variable/noto-serif-kr";
import "@fontsource-variable/noto-sans-kr";
import "./conditions-theme.css";
import panelCorner from "../../assets/conditions/panel-corners.svg";
import { PageContainer } from "../layout/PageContainer";
import { StepProgress } from "../layout/StepProgress";
import { ConditionsControls } from "./ConditionsControls";
import { ConditionsHero } from "./ConditionsHero";
import { useTravel } from "../../state/TravelContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { preloadConditionsAssets } from "../../lib/adventureAssets";

/** panel-corners.svg 4모서리 배치 — 외곽선/내부선과 별도 레이어 */
function PanelCorners() {
  const base = "pointer-events-none absolute h-9 w-9";
  return (
    <>
      <img src={panelCorner} alt="" aria-hidden="true" className={`${base} left-1.5 top-1.5`} />
      <img
        src={panelCorner}
        alt=""
        aria-hidden="true"
        className={`${base} right-1.5 top-1.5`}
        style={{ transform: "scaleX(-1)" }}
      />
      <img
        src={panelCorner}
        alt=""
        aria-hidden="true"
        className={`${base} bottom-1.5 left-1.5`}
        style={{ transform: "scaleY(-1)" }}
      />
      <img
        src={panelCorner}
        alt=""
        aria-hidden="true"
        className={`${base} bottom-1.5 right-1.5`}
        style={{ transform: "scale(-1, -1)" }}
      />
    </>
  );
}

/** 패널 3중 테두리 — 외곽선 + 내부선(별도 레이어) + 약한 inset shadow + 은은하게 숨쉬는 금빛 glow */
function PanelFrame({
  children,
  className = "",
  reduce,
}: {
  children: React.ReactNode;
  className?: string;
  reduce: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-[16px] ${className}`}
      style={{
        background: "var(--panel)",
        border: "1px solid var(--gold-soft)",
        boxShadow: "inset 0 0 24px rgba(0,0,0,0.35)",
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[16px]"
        style={{ boxShadow: "0 0 0 1px rgba(212,175,55,0.5), 0 0 26px rgba(212,175,55,0.16)" }}
        animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
        transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-[6px] rounded-[11px]"
        style={{ border: "1px solid rgba(212,175,55,0.16)" }}
        aria-hidden="true"
      />
      <PanelCorners />
      {children}
    </div>
  );
}

/** 아주 옅은 별빛 — 신비로운 밤하늘 느낌 (고정 좌표, 느리게 반짝임) */
const STARS = [
  { x: "8%", y: "12%", delay: 0 },
  { x: "18%", y: "28%", delay: 1.4 },
  { x: "4%", y: "55%", delay: 2.6 },
  { x: "22%", y: "70%", delay: 0.7 },
  { x: "12%", y: "85%", delay: 3.2 },
  { x: "30%", y: "8%", delay: 2 },
  { x: "35%", y: "45%", delay: 1 },
  { x: "50%", y: "15%", delay: 3.6 },
  { x: "65%", y: "6%", delay: 0.4 },
  { x: "6%", y: "38%", delay: 4 },
] as const;

function StarField({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {STARS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ left: s.x, top: s.y, width: 2, height: 2, background: "var(--ivory)" }}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        />
      ))}
    </div>
  );
}

/** 아주 옅게 떠도는 안개 — 좌우로 느리게 흐름 */
function DriftingMist({ reduce }: { reduce: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute rounded-full"
        style={{
          left: "-10%",
          top: "10%",
          width: "45%",
          height: "60%",
          background: "radial-gradient(ellipse, rgba(120,150,190,0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={reduce ? undefined : { x: [0, 40, 0] }}
        transition={reduce ? undefined : { duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          left: "60%",
          top: "40%",
          width: "40%",
          height: "55%",
          background: "radial-gradient(ellipse, rgba(212,175,55,0.06) 0%, transparent 70%)",
          filter: "blur(46px)",
        }}
        animate={reduce ? undefined : { x: [0, -30, 0] }}
        transition={reduce ? undefined : { duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/**
 * 탐험 조건 설정 — 다크 네이비·골드 톤, 조건 패널 중심 2열 레이아웃.
 */
export function ConditionsPage() {
  const { duration, themes } = useTravel();
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
    <div
      className="conditions-theme relative min-h-[calc(100vh-4rem)]"
      style={{ background: "var(--bg)", fontFamily: "'Noto Sans KR Variable', sans-serif" }}
    >
      {/* 약한 비네팅 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 35%, transparent 55%, rgba(0,0,0,0.35) 100%)",
        }}
        aria-hidden="true"
      />
      <DriftingMist reduce={reduce} />
      <StarField reduce={reduce} />

      <PageContainer className="relative flex min-h-[calc(100vh-4rem)] flex-col py-6 sm:py-8 lg:py-9">
        <div className="mx-auto w-full" style={{ maxWidth: 1320 }}>
          <motion.div {...enter(0)} className="mx-auto w-full max-w-4xl shrink-0">
            <StepProgress current={1} />
          </motion.div>

          <div className="relative mt-2 hidden min-h-0 flex-1 gap-6 lg:mt-2 lg:flex xl:gap-7">
            <motion.div
              {...(reduce
                ? enter(0.05)
                : {
                    initial: { opacity: 0, y: 16 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.32, delay: 0.08, ease: [0.22, 0.8, 0.2, 1] as const },
                  })}
              className="relative z-10 h-[620px] w-[60%] max-w-[780px] shrink-0"
            >
              <PanelFrame className="h-full p-6 xl:p-7" reduce={reduce}>
                <ConditionsControls />
              </PanelFrame>
            </motion.div>

            <motion.div
              {...(reduce
                ? enter(0.08)
                : {
                    initial: { opacity: 0, scale: 1.02 },
                    animate: { opacity: 1, scale: 1 },
                    transition: { duration: 0.4, delay: 0.12, ease: [0.22, 0.8, 0.2, 1] as const },
                  })}
              className="relative z-10 h-[620px] min-w-0 flex-1"
            >
              <ConditionsHero duration={duration} themes={themes} />
            </motion.div>
          </div>

          <div className="mt-2 flex flex-1 flex-col gap-5 lg:hidden">
            <motion.div {...enter(0.06)} className="relative">
              <PanelFrame className="p-5 sm:p-6" reduce={reduce}>
                <ConditionsControls />
              </PanelFrame>
            </motion.div>

            <motion.div {...enter(0.14)} className="relative">
              <ConditionsHero duration={duration} themes={themes} compact />
            </motion.div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
