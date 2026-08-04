import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { HeroBackdrop } from "../backgrounds/HeroBackdrop";
import { HeroMysteryCards } from "../hero/HeroMysteryCards";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const BADGE_TEXT =
  "\uC5EC\uD589\uC9C0\uB97C \uAC80\uC0C9\uD558\uC9C0 \uC54A\uACE0, \uC624\uB298\uC758 \uB79C\uB364 \uC5EC\uD589\uC9C0\uB97C \uBF51\uC544\uBCF4\uC138\uC694";
const TITLE_LINE_1 = "\uB2F9\uC2E0\uC758 \uB9C8\uC74C";
const TITLE_LINE_2 = "\uC774\uB044\uB294 ";
const TITLE_HIGHLIGHT = "\uC5EC\uD589\uC9C0";
const SUB_LINE_1 = "\uC9C0\uAE08 \uAC08 \uC218 \uC788\uB294 \uC5EC\uD589\uC9C0\uB97C";
const SUB_HIGHLIGHT = "\uB79C\uB364";
const SUB_LINE_2 = "\uC73C\uB85C \uBF51\uC544\uB4DC\uB9B4\uAC8C\uC694!";
const CTA_PRIMARY = "\uC5EC\uD589\uC9C0 \uBF51\uAE30";
const CTA_SECONDARY = "\uC11C\uBE44\uC2A4 \uB458\uB7EC\uBCF4\uAE30";

/**
 * PAGE 1 히어로 — 좌측 카피 + CTA, 우측 Hero 전용 순환 카드 티저.
 * CTA/라우팅과 실제 카드 셔플 로직은 기존과 동일하다.
 */
export function HeroSection({ onStart }: { onStart: () => void }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <HeroBackdrop />

      <div className="relative mx-auto grid w-full max-w-[1280px] items-center gap-8 lg:grid-cols-[minmax(0,40%)_minmax(0,60%)] lg:gap-2">
        <motion.div
          className="max-w-[520px]"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-block rounded-full bg-white/85 px-4 py-1.5 text-xs font-bold text-primary-dark shadow-sm sm:text-sm">
            {BADGE_TEXT}
          </span>

          <h1 className="mt-4 text-4xl font-extrabold leading-[1.12] tracking-tight text-ink lg:text-5xl xl:text-[3.4rem]">
            {TITLE_LINE_1}
            <br />
            {TITLE_LINE_2}
            <span className="text-primary">{TITLE_HIGHLIGHT}</span>
          </h1>

          <p className="mt-2 text-lg font-semibold leading-relaxed text-muted lg:mt-2.5 lg:text-xl">
            {SUB_LINE_1}
            <br />
            <span className="text-primary">{SUB_HIGHLIGHT}</span>
            {SUB_LINE_2}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 sm:mt-7">
            <Button
              onClick={onStart}
              variant="accent"
              size="lg"
              className="group shadow-[0_6px_0_#e0a92e,0_12px_24px_rgba(255,200,87,0.28)] transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_0_#e0a92e,0_16px_28px_rgba(255,200,87,0.34)] active:translate-y-1 active:shadow-[0_2px_0_#e0a92e]"
            >
              {CTA_PRIMARY}
              <ArrowRight
                className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-[3px]"
                strokeWidth={2.3}
                aria-hidden="true"
              />
            </Button>
            <Button
              onClick={onStart}
              variant="secondary"
              size="lg"
              className="shadow-sm transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-1"
            >
              {CTA_SECONDARY}
            </Button>
          </div>
        </motion.div>

        <div className="relative flex min-w-0 items-center justify-center lg:justify-end lg:pr-4 lg:-translate-y-2">
          <HeroMysteryCards />
        </div>
      </div>
    </section>
  );
}
