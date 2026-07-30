import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3100";
const OUT = new URL("./shots/", import.meta.url).pathname;
import { mkdirSync } from "fs";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

async function shot(path, name, opts = {}) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(opts.wait ?? 900);
  await page.screenshot({ path: `${OUT}${name}.png`, fullPage: opts.full ?? false });
  console.log("shot", name);
}

// Light mode tour
await shot("/", "01-home-top");
await page.goto(`${BASE}/`, { waitUntil: "networkidle" }).catch(() => {});
await page.mouse.wheel(0, 1600);
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}02-home-bento.png` });
await shot("/explore", "03-explore");
await shot("/explore/kyoto", "04-destination", { wait: 1200 });
await shot("/budget", "05-budget");
await shot("/assistant", "06-assistant");
await shot("/settings", "07-settings");
await shot("/packing", "08-packing-empty");
await shot("/trips", "09-trips-empty");

// Full plan flow
await page.goto(`${BASE}/plan`, { waitUntil: "networkidle" }).catch(() => {});
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}10-plan-compose.png` });
await page.getByRole("button", { name: "A week in Japan for two, culture and food" }).click();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}11-plan-generating.png` });
await page.waitForTimeout(2600);
await page.screenshot({ path: `${OUT}12-plan-preview.png` });
await page.getByRole("button", { name: "Save trip" }).click();
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}13-trip-itinerary.png` });
await page.getByRole("tab", { name: "Budget" }).click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}14-trip-budget.png` });
await page.getByRole("tab", { name: "Packing" }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}15-trip-packing.png` });

// Assistant conversation
await page.goto(`${BASE}/assistant`, { waitUntil: "networkidle" }).catch(() => {});
await page.getByRole("button", { name: "Do I need a visa for Japan?" }).click();
await page.waitForTimeout(2600);
await page.screenshot({ path: `${OUT}16-assistant-chat.png` });

// Dark mode
await page.emulateMedia({ colorScheme: "dark" });
await shot("/", "20-dark-home");
await shot("/explore/santorini", "21-dark-destination", { wait: 1200 });
await shot("/trips", "22-dark-trips");
await shot("/budget", "23-dark-budget");

// Mobile
await page.setViewportSize({ width: 390, height: 844 });
await page.emulateMedia({ colorScheme: "light" });
await shot("/", "30-mobile-home");
await shot("/explore", "31-mobile-explore");
await page.getByRole("button", { name: "Open menu" }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}32-mobile-nav.png` });

console.log("ERRORS:", errors.length ? errors.slice(0, 20).join("\n") : "none");
await browser.close();
