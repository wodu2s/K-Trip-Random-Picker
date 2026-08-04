import { motion } from "motion/react";

const COPY = {
  eyebrow: "\uC5B4\uB514\uB85C \uAC08\uC9C0 \uBAA8\uB97C \uB54C,",
  cta: "\uB0B4 \uC5EC\uD589 \uCE74\uB4DC \uBF51\uAE30",
  note: "\uAD00\uAD11 \uB370\uC774\uD130 \uAE30\uBC18 \u00B7 \uC57D 30\uCD08 \u00B7 \uD68C\uC6D0\uAC00\uC785 \uC5C6\uC774 \uCCB4\uD5D8",
} as const;

const EASE = [0.22, 0.8, 0.2, 1] as const;

/** Target B hero copy — large serif title + glowing bronze CTA */
export function HeroCopy({
  onStart,
  reduce,
  busy,
  onHoverChange,
}: {
  onStart: () => void;
  reduce: boolean;
  busy: boolean;
  onHoverChange: (hover: boolean) => void;
}) {
  return (
    <div
      className="landing-hero__copy-inner relative z-[15] flex flex-col text-left"
      data-landing-copy="true"
    >
      <motion.p
        className="landing-hero__eyebrow"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: reduce ? 0 : 0.2, ease: EASE }}
      >
        {COPY.eyebrow}
      </motion.p>

      <motion.h1
        className="landing-hero__title"
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: reduce ? 0 : 0.32, ease: EASE }}
      >
        Pick<span className="landing-hero__amp">&</span>Go
      </motion.h1>

      <motion.p
        className="landing-hero__desc"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: reduce ? 0 : 0.48, ease: EASE }}
      >
        <span className="landing-hero__desc-em">{"\uCDE8\uD5A5 3\uAC00\uC9C0"}</span>
        {"\uB97C \uACE0\uB974\uACE0 "}
        <span className="landing-hero__desc-em">{"\uCE74\uB4DC \uD55C \uC7A5"}</span>
        {"\uC744 \uBF51\uC73C\uBA74,\n\uC624\uB298\uC758 \uC5EC\uD589\uC9C0\uC640 \uCF54\uC2A4\uB97C \uC54C\uB824\uB4DC\uB824\uC694."}
      </motion.p>

      <motion.div
        className="landing-hero__cta-wrap"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: reduce ? 0 : 0.62, ease: EASE }}
      >
        <button
          type="button"
          className="landing-hero__cta"
          data-landing-cta="true"
          disabled={busy}
          aria-busy={busy}
          onClick={onStart}
          onMouseEnter={() => onHoverChange(true)}
          onMouseLeave={() => onHoverChange(false)}
          onFocus={() => onHoverChange(true)}
          onBlur={() => onHoverChange(false)}
        >
          <span className="landing-hero__cta-label">{COPY.cta}</span>
          <span className="landing-hero__cta-arrow" aria-hidden="true">
            <svg width="36" height="14" viewBox="0 0 36 14" fill="none">
              <path
                d="M1 7H32M32 7L26 2M32 7L26 12"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        <p className="landing-hero__note">{COPY.note}</p>
      </motion.div>
    </div>
  );
}
