import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

const url = "http://127.0.0.1:8080/provider-hub-v14.html";
const outDir = "/workspace/screenshots";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push("page:" + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console:" + m.text());
});

await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);

const results = { errors };

results.controls = await page.evaluate(() => {
  const sidebar = document.getElementById("sidebar");
  const order = ["urlLoadStatus", "titleControls", "tagFilter"];
  const inSidebar = order.map((id) => {
    const el = document.getElementById(id);
    return !!(el && sidebar.contains(el));
  });
  const legends = [...sidebar.querySelectorAll("legend")].map((l) => l.textContent.trim());
  const styles = [...document.getElementById("styleSelect").options].map((o) => o.value);
  const modes = [...document.getElementById("modeSelect").options].map((o) => o.value);
  return {
    inSidebar,
    legends,
    styles,
    modes,
    mapsBtn: document.getElementById("btnMapsKey").textContent.trim(),
    titleHasMode: !!document.getElementById("titlePane").querySelector("#modeSelect"),
    styleCount: styles.length,
    rows: document.querySelectorAll("#tableBody tr").length,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  };
});

const newThemes = [
  "neuomorphism",
  "bootstrap-3",
  "y2k-early-2000s",
  "early-web-1990s",
  "memphis-corporate",
  "flat-design",
  "cinematic",
  "material-design",
  "neo-brutalism",
];

async function shot(name) {
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });
}

for (const t of newThemes.concat(["psychedelic-blotter", "lcars", "glassmorphism"])) {
  await page.selectOption("#styleSelect", t);
  await page.waitForTimeout(200);
  const applied = await page.evaluate(() => document.documentElement.getAttribute("data-style"));
  results["style-" + t] = applied;
  await shot("v14-" + t);
}

const combos = [
  ["neuomorphism", "dark", "1.6", "v14-neuomorphism-dark-compact"],
  ["bootstrap-3", "light", "1.6", "v14-bootstrap-3-light-compact"],
  ["y2k-early-2000s", "dark", "0.7", "v14-y2k-dark-loose"],
  ["early-web-1990s", "light", "1.6", "v14-early-web-light-compact"],
  ["memphis-corporate", "light", "0.7", "v14-memphis-light-loose"],
  ["flat-design", "dark", "1.6", "v14-flat-dark-compact"],
  ["cinematic", "dark", "0.7", "v14-cinematic-dark-loose"],
  ["material-design", "light", "1.6", "v14-material-light-compact"],
  ["neo-brutalism", "dark", "1.6", "v14-neobrutal-dark-compact"],
  ["psychedelic-blotter", "light", "0.7", "v14-blotter-light-loose"],
];

for (const [style, mode, density, name] of combos) {
  await page.selectOption("#styleSelect", style);
  await page.selectOption("#modeSelect", mode);
  await page.fill("#densitySlider", density);
  await page.waitForTimeout(180);
  await shot(name);
  results[name] = await page.evaluate(() => ({
    style: document.documentElement.getAttribute("data-style"),
    mode: document.documentElement.getAttribute("data-mode"),
  }));
}

await page.selectOption("#modeSelect", "large");
await page.waitForTimeout(150);
results.largeOk = await page.evaluate(() => document.documentElement.getAttribute("data-mode") === "large");
await page.selectOption("#modeSelect", "minimized");
await page.waitForTimeout(150);
results.minimizedOk = await page.evaluate(() => document.documentElement.getAttribute("data-mode") === "minimized");
await page.selectOption("#modeSelect", "light");

const search = page.locator("#search");
if (await search.isEnabled()) {
  await search.fill("Elena");
  await page.waitForTimeout(200);
  results.searchHits = await page.evaluate(() => document.querySelectorAll("#tableBody tr:not([style*='display: none'])").length);
}

results.jsonUrl = await page.evaluate(async () => {
  const input = document.getElementById("urlInput");
  input.value = "/sample-austin-directory.json";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  document.getElementById("btnLoadUrl").click();
  await new Promise((r) => setTimeout(r, 900));
  return {
    status: document.getElementById("urlLoadStatus").textContent,
    rows: document.querySelectorAll("#tableBody tr").length,
  };
});

for (const w of [320, 375, 768, 1024]) {
  await page.setViewportSize({ width: w, height: 800 });
  await page.waitForTimeout(150);
  results["vp" + w] = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    controlsVisible: !!document.getElementById("titleControls") && getComputedStyle(document.getElementById("titleControls")).display !== "none",
    tableVisible: !!document.getElementById("psychTable"),
  }));
}
await page.setViewportSize({ width: 1440, height: 900 });
await shot("v14-hub");
await page.setViewportSize({ width: 375, height: 800 });
await shot("v14-hub-mobile");

results.errors = errors;
writeFileSync(`${outDir}/v14-qa.json`, JSON.stringify(results, null, 2));
await browser.close();
console.log(JSON.stringify(results, null, 2));
