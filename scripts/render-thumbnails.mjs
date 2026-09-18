import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });

await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/scripts/thumbnail-a.html");
await page.waitForTimeout(800);
await page.screenshot({ path: "screenshots/thumbnail-A.png" });
console.log("saved thumbnail-A.png");

await page.goto("file://" + process.cwd().replace(/\\/g, "/") + "/scripts/thumbnail-b.html");
await page.waitForTimeout(800);
await page.screenshot({ path: "screenshots/thumbnail-B.png" });
console.log("saved thumbnail-B.png");

await browser.close();
