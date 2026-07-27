import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 디자인 토큰 (CSS 변수 기반 → globals.css 참조)
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
        },
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        ink: "var(--color-text)",
        muted: "var(--color-text-muted)",
        line: "var(--color-border)",
        success: "var(--color-success)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      borderRadius: {
        card: "24px",
      },
      boxShadow: {
        card: "0 20px 50px rgba(47, 115, 246, 0.14)",
        "card-hover": "0 26px 60px rgba(47, 115, 246, 0.22)",
      },
      backdropBlur: {
        card: "16px",
      },
      maxWidth: {
        content: "1360px",
      },
    },
  },
  plugins: [],
};

export default config;
