import { motion } from "motion/react";
import { FeatureItems } from "./FeatureItems";
import type { FeatureStep } from "./landingHeroMotion";

/** Bottom 3-step bar — wraps FeatureItems; keeps entrance timing */
export function HeroSteps({
  reduce = false,
  activeStep = null,
}: {
  reduce?: boolean;
  activeStep?: FeatureStep;
}) {
  return (
    <motion.div
      className="landing-hero__steps relative z-[15]"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: reduce ? 0 : 1.2, ease: [0.22, 0.8, 0.2, 1] }}
    >
      <FeatureItems activeStep={activeStep} />
    </motion.div>
  );
}
