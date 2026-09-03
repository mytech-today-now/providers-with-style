import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

const url = "http://127.0.0.1:8080/provider-hub-v13.html";
const outDir = "/workspace/screenshots";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push("page:" + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console:" + m.text()); });

await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(600);

const results = {};

async function shot(name) {
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });
}

results.controls = await page.evaluate(() => {
  const sidebar = document.getElementById("sidebar");
  const order = ["urlLoadStatus", "titleControls", "tagFilter"];
  const idx = order.map((id) => {
    const el = document.getElementById(id);
    return el && sidebar.contains(el);
  });
  const legends = [...sidebar.querySelectorAll("legend")].map((l) => l.textContent.trim());
  const styles = [...document.getElementById("styleSelect").options].map((o) => ({ v: o.value, t: o.textContent }));
  const modes = [...document.getElementById("modeSelect").options].map((o) => o.value);
  const mapsBtn = document.getElementById("btnMapsKey").textContent.trim();
  const mapsStatus = document.getElementById("mapsKeyStatus").textContent.trim();
  const titleHasMode = document.getElementById("titlePane").querySelector("#modeSelect");
  return {
    inSidebar: idx,
    legends,
    styles,
    modes,
    mapsBtn,
    mapsStatus,
    titleHasMode: !!titleHasMode,
    styleAttr: document.documentElement.getAttribute("data-style"),
    modeAttr: document.documentElement.getAttribute("data-mode"),
    rows: document.querySelectorAll("#tableBody tr").length,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  };
});

const themes = [
  "swiss-modernist",
  "windows-31-program-manager",
  "ibm-pc-monochrome-terminal",
  "psychedelic-blotter",
  "lcars",
  "winxp",
  "corporate-clean",
];

for (const t of themes) {
  await page.selectOption("#styleSelect", t);
  await page.waitForTimeout(250);
  const applied = await page.evaluate(() => document.documentElement.getAttribute("data-style"));
  results["style-" + t] = applied;
  await shot("v13-" + t);
}

await page.selectOption("#styleSelect", "windows-31-program-manager");
await page.selectOption("#modeSelect", "light");
await page.waitForTimeout(200);
await shot("v13-win31-light");
await page.selectOption("#modeSelect", "dark");
await page.waitForTimeout(200);
await shot("v13-win31-dark-compact");
await page.fill("#densitySlider", "1.6");
await page.waitForTimeout(150);

await page.selectOption("#styleSelect", "ibm-pc-monochrome-terminal");
await page.selectOption("#modeSelect", "light");
await page.fill("#densitySlider", "0.7");
await page.waitForTimeout(200);
await shot("v13-ibm-light-loose");
await page.selectOption("#modeSelect", "dark");
await page.fill("#densitySlider", "1.6");
await page.waitForTimeout(200);
await shot("v13-ibm-dark-compact");
await page.selectOption("#modeSelect", "large");
await page.waitForTimeout(200);
await shot("v13-ibm-large");
const largeFont = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--font-scale").trim());
results.ibmLargeFont = largeFont;
await page.selectOption("#modeSelect", "minimized");
await page.waitForTimeout(200);
await shot("v13-ibm-minimized");

await page.selectOption("#styleSelect", "swiss-modernist");
await page.selectOption("#modeSelect", "dark");
await page.fill("#densitySlider", "1.6");
await page.waitForTimeout(200);
await shot("v13-swiss-dark-compact");

await page.selectOption("#styleSelect", "psychedelic-blotter");
await page.selectOption("#modeSelect", "dark");
await page.fill("#densitySlider", "1.6");
await page.waitForTimeout(200);
await shot("v13-blotter-dark-compact");
await page.selectOption("#modeSelect", "light");
await page.waitForTimeout(200);
await shot("v13-blotter-light");

await page.selectOption("#modeSelect", "system");
await page.fill("#search", "Elena");
await page.waitForTimeout(200);
results.searchElena = await page.evaluate(() => {
  const rows = [...document.querySelectorAll("#tableBody tr")].filter((r) => r.offsetParent !== null);
  const text = rows.map((r) => r.textContent).join(" ");
  return { n: rows.length, hasElena: /elena/i.test(text), hasMarcus: /marcus/i.test(text) };
});

await page.selectOption("#styleSelect", "swiss-modernist");
const stored = await page.evaluate(() => sessionStorage.getItem("providerHub_session_style_v3"));
results.persisted = stored;

await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
results.afterReload = await page.evaluate(() => document.documentElement.getAttribute("data-style"));

await page.evaluate(() => {
  sessionStorage.setItem("providerHub_session_style_v3", "memphis-unknown");
});
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(500);
results.unknownFallback = await page.evaluate(() => document.documentElement.getAttribute("data-style"));

const widths = [320, 375, 768, 1024, 1440, 2560];
results.viewports = {};
await page.selectOption("#styleSelect", "corporate-clean").catch(() => {});
for (const w of widths) {
  await page.setViewportSize({ width: w, height: 800 });
  await page.waitForTimeout(200);
  results.viewports[w] = await page.evaluate(() => ({
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    hasMode: !!document.getElementById("modeSelect"),
    hasStyle: !!document.getElementById("styleSelect"),
    mapsBtn: document.getElementById("btnMapsKey")?.getBoundingClientRect().width || 0,
    sidebarTop: document.getElementById("sidebar")?.getBoundingClientRect().bottom,
    tableTop: document.getElementById("tableArea")?.getBoundingClientRect().top,
  }));
  await shot("v13-w" + w);
}

await page.setViewportSize({ width: 390, height: 844 });
await page.selectOption("#styleSelect", "ibm-pc-monochrome-terminal");
await page.selectOption("#modeSelect", "dark");
await page.waitForTimeout(200);
await shot("v13-ibm-mobile");

results.errors = errors;
results.focusVisible = await page.evaluate(async () => {
  const sel = document.getElementById("styleSelect");
  sel.focus();
  const cs = getComputedStyle(sel);
  return { outline: cs.outline, outlineWidth: cs.outlineWidth };
});

writeFileSync("/workspace/screenshots/v13-qa.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await browser.close();
