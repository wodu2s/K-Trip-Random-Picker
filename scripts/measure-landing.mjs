import { chromium } from "playwright";

const URL = process.env.LANDING_URL || "http://localhost:5173/";

async function measure() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1648, height: 920 },
    deviceScaleFactor: 1,
  });

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  const report = await page.evaluate(() => {
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        width: Math.round(r.width * 10) / 10,
        height: Math.round(r.height * 10) / 10,
        left: Math.round(r.left * 10) / 10,
        top: Math.round(r.top * 10) / 10,
        right: Math.round(r.right * 10) / 10,
        bottom: Math.round(r.bottom * 10) / 10,
        transform: cs.transform,
        zoom: cs.zoom,
        fontSize: cs.fontSize,
        maxWidth: cs.maxWidth,
      };
    };

    const header = document.querySelector("[data-landing-header], header.header-landing, header");
    const logo = document.querySelector("[data-landing-logo]");
    const copy = document.querySelector("[data-landing-copy]");
    const title = document.querySelector(".landing-hero__title");
    const cta = document.querySelector("[data-landing-cta]");
    const card = document.querySelector('[data-landing-card="center"]');
    const cardInner = card?.querySelector("div.relative, div[style]");
    const compass = document.querySelector("[data-landing-compass]");
    const ticket = document.querySelector("[data-landing-ticket]");
    const steps = document.querySelector("[data-landing-steps]");
    const map = document.querySelector("[data-landing-map]");
    const hero = document.querySelector("[data-landing-hero]");
    const root = document.querySelector("[data-landing-root]");
    const deck = document.querySelector("[data-landing-deck]");

    const scales = [];
    document.querySelectorAll("body *").forEach((el) => {
      const t = getComputedStyle(el).transform;
      if (t && t !== "none" && /matrix/.test(t)) {
        const m = t.match(/matrix\(([^)]+)\)/);
        if (m) {
          const a = parseFloat(m[1].split(",")[0]);
          if (Math.abs(a - 1) > 0.02 && Math.abs(a) > 0.01) {
            scales.push({
              tag: el.tagName,
              cls: (el.className || "").toString().slice(0, 80),
              a: Math.round(a * 1000) / 1000,
            });
          }
        }
      }
    });

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
      header: box(header),
      logo: box(logo),
      copy: box(copy),
      title: box(title),
      cta: box(cta),
      centerCard: box(card),
      centerCardInner: box(card?.querySelector(":scope > div > div") || card?.firstElementChild?.firstElementChild),
      compass: box(compass),
      ticket: box(ticket),
      steps: box(steps),
      map: box(map),
      hero: box(hero),
      root: box(root),
      deck: box(deck),
      deckMode: deck?.getAttribute("data-landing-deck"),
      nonIdentityScales: scales.slice(0, 25),
      reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
  });

  // Animation smoke: sample CTA box-shadow / card opacity over time
  const anim = await page.evaluate(async () => {
    const cta = document.querySelector("[data-landing-cta]");
    const card = document.querySelector('[data-landing-card="center"]');
    const samples = [];
    for (let i = 0; i < 4; i++) {
      samples.push({
        t: i * 400,
        ctaShadow: cta ? getComputedStyle(cta).boxShadow.slice(0, 80) : null,
        cardOpacity: card ? getComputedStyle(card).opacity : null,
        cardTransform: card ? getComputedStyle(card).transform : null,
      });
      await new Promise((r) => setTimeout(r, 400));
    }
    return samples;
  });

  await page.screenshot({
    path: "scripts/landing-1648x920.png",
    fullPage: false,
  });

  console.log(JSON.stringify({ report, anim }, null, 2));
  await browser.close();
}

measure().catch((e) => {
  console.error(e);
  process.exit(1);
});
