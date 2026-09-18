import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const OUT = "screenshots";
const browser = await chromium.launch();

async function shot(url, path, { width = 720, height = 1280, wait = 2000, fullPage = false } = {}) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/${path}`, fullPage });
  await page.close();
  console.log("saved", path);
}

// 1. AI verdict card (flagship) — deep link auto-runs the AI sort
await shot("/?sample=greasy-pizza-box&region=us-generic", "1-verdict-card.png", { wait: 14000 });
// 2. Home hero
await shot("/", "2-home.png", {});
// 3. SortLab with SF region flip
await shot("/lab?region=us-ca-sf", "3-sortlab-sf.png", {});
// 4. Impact dashboard (seeded demo data)
await shot("/impact?seed=1", "4-impact.png", { wait: 3000 });

await browser.close();
console.log("DONE");
