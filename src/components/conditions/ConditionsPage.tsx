import { useEffect } from "react";
import { motion } from "motion/react";
import { PageContainer } from "../layout/PageContainer";
import { StepProgress } from "../layout/StepProgress";
import { AdventurePageShell } from "../layout/AdventurePageShell";
import { ConditionsControls } from "./ConditionsControls";
import { ConditionsHero } from "./ConditionsHero";
import { CardDeckPreview } from "./CardDeckPreview";
import { useTravel } from "../../state/TravelContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { preloadConditionsAssets } from "../../lib/adventureAssets";

/**
 * 탐험 조건 설정 — 2열 계획 + 점선 경로 + CSS 미니 덱.
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
    <AdventurePageShell>
      <PageContainer className="flex min-h-[calc(100vh-4rem)] flex-col py-6 sm:py-8 lg:py-9">
        <motion.div {...enter(0)} className="mx-auto w-full max-w-4xl shrink-0">
          <StepProgress current={1} />
        </motion.div>

        <div className="relative mt-6 hidden min-h-0 flex-1 gap-6 lg:mt-7 lg:flex xl:gap-7">
          {/* CTA → hero pin dotted connector */}
          <svg
            className="pointer-events-none absolute inset-0 z-[5] hidden h-full w-full lg:block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M40,78 C48,78 52,55 62,48"
              fill="none"
              stroke="rgba(201,162,39,0.55)"
              strokeWidth="0.45"
              strokeDasharray="1.2 1.4"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx="62" cy="48" r="0.9" fill="#C9A227" />
          </svg>

          <motion.aside
            {...(reduce
              ? enter(0.05)
              : {
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.32, delay: 0.08, ease: [0.22, 0.8, 0.2, 1] as const },
                })}
            className="expedition-panel relative z-10 flex w-[42%] max-w-[480px] shrink-0 flex-col p-6 xl:p-7"
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.045]"
              aria-hidden="true"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, #16281F 0.6px, transparent 0.7px), radial-gradient(circle at 80% 60%, #16281F 0.5px, transparent 0.6px)",
                backgroundSize: "28px 28px, 36px 36px",
              }}
            />
            <div className="relative flex flex-1 flex-col">
              <ConditionsControls />
            </div>
          </motion.aside>

          <motion.div
            {...(reduce
              ? enter(0.08)
              : {
                  initial: { opacity: 0, scale: 1.02 },
                  animate: { opacity: 1, scale: 1 },
                  transition: { duration: 0.4, delay: 0.12, ease: [0.22, 0.8, 0.2, 1] as const },
                })}
            className="relative z-10 min-w-0 flex-1"
          >
            <ConditionsHero duration={duration} themes={themes} />
            <div className="pointer-events-none absolute bottom-3 right-3 z-20 sm:bottom-5 sm:right-5">
              <CardDeckPreview />
            </div>
          </motion.div>
        </div>

        <div className="mt-5 flex flex-1 flex-col gap-5 lg:hidden">
          <motion.div
            {...enter(0.06)}
            className="expedition-panel relative p-5 sm:p-6"
          >
            <ConditionsControls />
          </motion.div>

          <motion.div {...enter(0.14)} className="relative">
            <ConditionsHero duration={duration} themes={themes} compact />
            <div className="pointer-events-none mt-[-20px] hidden justify-center sm:flex">
              <CardDeckPreview className="w-[clamp(180px,48vw,220px)]" />
            </div>
          </motion.div>
        </div>

        <div className="hidden h-12 shrink-0 lg:block" aria-hidden="true" />
      </PageContainer>
    </AdventurePageShell>
  );
}
