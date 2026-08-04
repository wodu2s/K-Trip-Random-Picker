import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1648, height: 920 },
  deviceScaleFactor: 1,
});

await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded" });

const samples = [];
for (let i = 0; i < 10; i++) {
  const s = await page.evaluate(() => {
    const card = document.querySelector('[data-landing-card="center"]');
    const map = document.querySelector("[data-landing-map]");
    const visual = document.querySelector("[data-landing-visual]");
    const compass = document.querySelector("[data-landing-compass]");
    return {
      cardOp: card && getComputedStyle(card).opacity,
      cardTf: card && getComputedStyle(card).transform,
      mapOp: map && getComputedStyle(map).opacity,
      mapTf: map && getComputedStyle(map).transform,
      visOp: visual && getComputedStyle(visual).opacity,
      compassOp: compass && getComputedStyle(compass).opacity,
    };
  });
  samples.push({ t: i * 150, ...s });
  await page.waitForTimeout(150);
}

console.log(JSON.stringify(samples, null, 2));
await browser.close();
