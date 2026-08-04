import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1648, height: 920 },
  deviceScaleFactor: 1,
});
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });

// Capture intro animation early
const intro = await page.evaluate(async () => {
  const samples = [];
  for (let i = 0; i < 6; i++) {
    const card = document.querySelector('[data-landing-card="center"]');
    const map = document.querySelector("[data-landing-map]");
    samples.push({
      t: i * 250,
      cardOp: card ? getComputedStyle(card).opacity : null,
      cardTy: card ? getComputedStyle(card).transform : null,
      mapOp: map ? getComputedStyle(map).opacity : null,
      mapTf: map ? getComputedStyle(map).transform : null,
    });
    await new Promise((r) => setTimeout(r, 250));
  }
  return samples;
});

await page.waitForTimeout(1800);

const final = await page.evaluate(() => {
  const compassInner = document.querySelector("[data-landing-compass] > div");
  const ticketInner = document.querySelector("[data-landing-ticket] > div");
  const card = document.querySelector('[data-landing-card="center"] > div > div');
  const offenders = [];
  document.querySelectorAll("[data-landing-hero] *").forEach((el) => {
    const t = getComputedStyle(el).transform;
    if (!t || t === "none") return;
    const m = t.match(/matrix\(([^,]+)/);
    if (!m) return;
    const a = parseFloat(m[1]);
    if (a > 0.5 && a < 0.99) {
      offenders.push({
        tag: el.tagName,
        data:
          el.getAttribute("data-landing-card") ||
          el.getAttribute("data-landing-visual") ||
          el.className?.toString?.().slice?.(0, 60),
        a,
      });
    }
  });
  return {
    compassLayoutW: compassInner ? Math.round(parseFloat(getComputedStyle(compassInner).width)) : null,
    ticketLayoutW: ticketInner ? Math.round(parseFloat(getComputedStyle(ticketInner).width)) : null,
    cardLayoutW: card ? Math.round(card.getBoundingClientRect().width) : null,
    cardLayoutH: card ? Math.round(card.getBoundingClientRect().height) : null,
    sub1Scales: offenders,
    eyebrow: getComputedStyle(document.querySelector(".landing-hero__eyebrow")).fontSize,
    title: getComputedStyle(document.querySelector(".landing-hero__title")).fontSize,
    cta: (() => {
      const el = document.querySelector("[data-landing-cta]");
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    })(),
  };
});

console.log(JSON.stringify({ intro, final }, null, 2));
await page.screenshot({ path: "scripts/landing-1648x920-pass2.png" });
await browser.close();
