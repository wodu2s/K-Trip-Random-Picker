import { MotionConfig, AnimatePresence, LayoutGroup, motion } from "motion/react";
import { TravelProvider, useTravel } from "./state/TravelContext";
import { Header } from "./components/layout/Header";
import { LandingPage } from "./components/landing/LandingPage";
import { ConditionsPage } from "./components/conditions/ConditionsPage";
import { CardsPage } from "./components/cards/CardsPage";
import { DestinationPage } from "./components/destination/DestinationPage";
import { CARD_MOTION } from "./lib/cardMotion";

function PageSwitch() {
  const { page } = useTravel();
  // shuffle은 cards로 통합
  const active = page === "shuffle" ? "cards" : page;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          opacity: { duration: CARD_MOTION.pageEnter },
          y: { duration: CARD_MOTION.pageExit },
          ease: [0.22, 0.8, 0.2, 1],
        }}
      >
        {active === "landing" && <LandingPage />}
        {active === "conditions" && <ConditionsPage />}
        {active === "cards" && <CardsPage />}
        {active === "destination" && <DestinationPage />}
      </motion.div>
    </AnimatePresence>
  );
}

function PersistentBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #F5F0E1 0%, #EDE4CE 55%, #E4D6B0 100%)",
      }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full opacity-[0.05]" viewBox="0 0 1200 800" fill="none">
        <ellipse cx="600" cy="400" rx="340" ry="260" stroke="#16281F" strokeWidth="1.2" />
        <ellipse cx="600" cy="400" rx="220" ry="170" stroke="#16281F" strokeWidth="0.9" strokeDasharray="4 6" />
        <path
          d="M120,560 C320,380 480,420 640,300 C800,180 960,240 1080,160"
          stroke="#16281F"
          strokeWidth="1.4"
          strokeDasharray="5 7"
        />
        <circle cx="280" cy="420" r="2.5" fill="#C9A227" opacity="0.7" />
        <circle cx="720" cy="280" r="2.5" fill="#C9A227" opacity="0.7" />
      </svg>
    </div>
  );
}

function AppShell() {
  const { page } = useTravel();
  const isLanding = page === "landing";

  return (
    <div
      className={
        isLanding
          ? "relative h-svh min-h-[820px] max-h-svh overflow-hidden"
          : "relative min-h-screen overflow-x-hidden"
      }
      style={{
        background: isLanding ? "#03101B" : "var(--color-parchment-200)",
        transform: "none",
        zoom: "normal",
      }}
      data-landing-root={isLanding ? "true" : undefined}
    >
      {!isLanding ? <PersistentBackdrop /> : null}
      <Header />
      <PageSwitch />
    </div>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <TravelProvider>
        <LayoutGroup>
          <AppShell />
        </LayoutGroup>
      </TravelProvider>
    </MotionConfig>
  );
}

export default App;
