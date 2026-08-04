import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1648, height: 920 },
  deviceScaleFactor: 1,
});
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const report = await page.evaluate(() => {
  const map = document.querySelector("[data-landing-map]");
  const base = document.querySelector(".landing-hero-map__base img");
  const glow = document.querySelector(".landing-hero-map__glow img");
  const card = document.querySelector('[data-landing-card="center"]');
  const mb = map?.getBoundingClientRect();
  return {
    map: mb && {
      left: Math.round(mb.left),
      top: Math.round(mb.top),
      width: Math.round(mb.width),
      height: Math.round(mb.height),
      right: Math.round(mb.right),
    },
    mapPct: mb && {
      leftPct: +((mb.left / 1648) * 100).toFixed(1),
      widthPct: +((mb.width / 1648) * 100).toFixed(1),
      topFromHeroPct: +(((mb.top - 86) / 834) * 100).toFixed(1),
      heightPct: +((mb.height / 834) * 100).toFixed(1),
    },
    baseSrc: base?.currentSrc || base?.src || null,
    baseNat: base ? { w: base.naturalWidth, h: base.naturalHeight } : null,
    glowOk: Boolean(glow?.currentSrc || glow?.src),
    cardLeft: card ? Math.round(card.getBoundingClientRect().left) : null,
    filter: base ? getComputedStyle(base).filter : null,
    objectFit: base ? getComputedStyle(base).objectFit : null,
    objectPosition: base ? getComputedStyle(base).objectPosition : null,
  };
});

console.log(JSON.stringify(report, null, 2));
await page.screenshot({ path: "scripts/landing-map-check.png" });
await browser.close();
