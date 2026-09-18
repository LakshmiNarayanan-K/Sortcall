import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1280 }, deviceScaleFactor: 1 });
const p = process.cwd().replace(/\\/g, "/");
await page.goto("file://" + p + "/scripts/thumbnail-b-3x2.html");
await page.waitForTimeout(800);
await page.screenshot({ path: "screenshots/thumbnail-3x2.png" });
await browser.close();
console.log("saved screenshots/thumbnail-3x2.png");
