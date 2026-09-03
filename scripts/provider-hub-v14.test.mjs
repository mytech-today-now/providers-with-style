import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const THEMES = [
  "lcars",
  "winxp",
  "windows-11-mica",
  "glassmorphism",
  "neuomorphism",
  "bootstrap-3",
  "y2k-early-2000s",
  "early-web-1990s",
  "memphis-corporate",
  "flat-design",
  "cinematic",
  "material-design",
  "neo-brutalism",
  "pixel-8bit",
  "corporate-clean",
  "psychedelic-blotter",
  "swiss-modernist",
  "windows-31-program-manager",
  "ibm-pc-monochrome-terminal",
  "web2-glossy",
];

const NEW_THEMES = [
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

const PATHS = [
  "/workspace/providers-with-style/providers/provider-hub-v14.html",
  "/workspace/providers-with-style/providers/provider-hub-v14.css",
  "/workspace/providers-with-style/providers/provider-hub-v14.js",
  "/workspace/public/provider-hub-v14.html",
  "/workspace/public/provider-hub-v14.css",
  "/workspace/public/provider-hub-v14.js",
];

function read(p) {
  return readFileSync(p, "utf8");
}

describe("Provider Hub v14 files", () => {
  for (const p of PATHS) {
    it(`exists ${p}`, () => {
      assert.equal(existsSync(p), true, p);
    });
  }

  it("leaves v13 files untouched", () => {
    assert.equal(existsSync("/workspace/providers-with-style/providers/provider-hub-v13.html"), true);
    assert.equal(existsSync("/workspace/providers-with-style/providers/provider-hub-v13.css"), true);
    assert.equal(existsSync("/workspace/providers-with-style/providers/provider-hub-v13.js"), true);
    const v13 = read("/workspace/providers-with-style/providers/provider-hub-v13.html");
    assert.match(v13, /provider-hub-v13\.css/);
    assert.doesNotMatch(v13, /provider-hub-v14/);
  });

  it("HTML references v14 assets only and places display controls in the sidebar", () => {
    const html = read("/workspace/providers-with-style/providers/provider-hub-v14.html");
    assert.match(html, /provider-hub-v14\.css/);
    assert.match(html, /provider-hub-v14\.js/);
    assert.doesNotMatch(html, /provider-hub-v1[0123]\.(css|js)/);
    assert.match(html, /id="styleSelect"/);
    assert.match(html, /id="modeSelect"/);
    assert.match(html, /id="densitySlider"/);
    assert.match(html, /id="btnMapsKey"/);
    assert.match(html, /id="psychTable"/);
    assert.match(html, /class="display-controls/);
    const sidebar = html.slice(html.indexOf('id="sidebar"'), html.indexOf('id="main"'));
    const titlePane = html.slice(html.indexOf('id="titlePane"'), html.indexOf('id="titleMapResizer"'));
    assert.ok(sidebar.indexOf('id="urlLoadStatus"') < sidebar.indexOf('id="titleControls"'));
    assert.ok(sidebar.indexOf('id="titleControls"') < sidebar.indexOf('id="tagFilter"'));
    assert.ok(!titlePane.includes("modeSelect"));
    assert.match(sidebar, /<legend>Mode<\/legend>/);
    assert.match(sidebar, /<legend>Style<\/legend>/);
    assert.match(sidebar, /<legend>Density<\/legend>/);
    assert.match(sidebar, /<legend>Maps<\/legend>/);
    const legendOrder = ["Mode", "Style", "Density", "Maps"].map((n) => sidebar.indexOf(`<legend>${n}</legend>`));
    assert.deepEqual(legendOrder, [...legendOrder].sort((a, b) => a - b));
    assert.match(sidebar, />Key<\/button>/);
    assert.match(sidebar, />Loose</);
    assert.match(sidebar, />Compact</);
    const ids = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(dup, [], `duplicate ids: ${dup.join(",")}`);
    assert.equal(html.includes("\u2014") || html.includes("\u2013"), false);
    for (const t of THEMES) {
      assert.ok(html.includes(`'${t}'`), t);
    }
  });

  it("JS catalogs twenty themes in the required order", () => {
    const js = read("/workspace/providers-with-style/providers/provider-hub-v14.js");
    const values = [...js.matchAll(/value: '([^']+)'/g)].map((m) => m[1]);
    assert.deepEqual(values, THEMES);
    const glass = values.indexOf("glassmorphism");
    const neo = values.indexOf("neuomorphism");
    assert.equal(neo, glass + 1);
    assert.deepEqual(values.slice(neo, neo + NEW_THEMES.length), NEW_THEMES);
    assert.match(js, /startrek: 'lcars'/);
    assert.match(js, /softui: 'neuomorphism'/);
    assert.match(js, /bootstrap3: 'bootstrap-3'/);
    assert.match(js, /y2k: 'y2k-early-2000s'/);
    assert.match(js, /geocities: 'early-web-1990s'/);
    assert.match(js, /memphis: 'memphis-corporate'/);
    assert.match(js, /flat: 'flat-design'/);
    assert.match(js, /material: 'material-design'/);
    assert.match(js, /neobrutal: 'neo-brutalism'/);
    assert.match(js, /function resolveStyle/);
    assert.match(js, /FALLBACK_STYLE = 'corporate-clean'/);
    assert.match(js, /providerHub_session_style_v3/);
    assert.match(js, /providerHubPrefs_v2/);
    const check = spawnSync("node", ["--check", "/workspace/providers-with-style/providers/provider-hub-v14.js"], {
      encoding: "utf8",
    });
    assert.equal(check.status, 0, check.stderr);
    assert.equal(js.includes("\u2014") || js.includes("\u2013"), false);
  });

  it("CSS scopes every theme and covers states", () => {
    const css = read("/workspace/providers-with-style/providers/provider-hub-v14.css");
    for (const t of THEMES) {
      assert.ok(css.includes(`html[data-style="${t}"]`), t);
      assert.ok(css.includes(`html[data-style="${t}"] .btn:hover`), `${t} hover`);
      assert.ok(css.includes(`html[data-style="${t}"] .btn:focus-visible`), `${t} focus`);
      assert.ok(css.includes(`html[data-style="${t}"] .btn:disabled`), `${t} disabled`);
      assert.ok(css.includes(`html[data-style="${t}"] .dataset-card.active`), `${t} selected`);
    }
    for (const t of NEW_THEMES) {
      assert.ok(css.includes(`html[data-mode="dark"][data-style="${t}"]`), `${t} dark`);
      assert.ok(css.includes(`html[data-style="${t}"] .tag-chip.active`), `${t} chip`);
      assert.ok(css.includes(`html[data-style="${t}"] th`), `${t} table`);
      assert.ok(css.includes(`html[data-style="${t}"] .modal`), `${t} modal`);
      assert.ok(css.includes(`html[data-style="${t}"] body::before`), `${t} atmosphere`);
    }
    assert.match(css, /html\[data-style="psychedelic-blotter"\]/);
    assert.match(css, /dashed|dotted|perforat/i);
    assert.match(css, /prefers-reduced-motion/);
    assert.match(css, /pointer-events:\s*none/);
    assert.doesNotMatch(css, /googleapis/);
    assert.doesNotMatch(css, /@keyframes/);
    const body = css.replace(/\/\*[\s\S]*?\*\//g, "");
    assert.equal(body.split("{").length, body.split("}").length);
    assert.ok(!css.includes("\u2014") && !css.includes("\u2013"));
  });

  it("unknown styles fail safe via resolveStyle", () => {
    const js = read("/workspace/providers-with-style/providers/provider-hub-v14.js");
    const start = js.indexOf("  const STYLE_CATALOG = [");
    const end = js.indexOf("  /* ---------- DOM ---------- */");
    assert.ok(start >= 0 && end > start, "catalog block not found");
    const snippet = `${js.slice(start, end)}
      const samples = ['lcars','startrek','winxp','glass','pixel','unknown-theme','swiss','win31','ibm','neuomorphism','bootstrap','y2k','geocities','memphis','flat','cinematic','material','neobrutal','',null];
      const out = samples.map((s) => resolveStyle(s));
      const expect = ['lcars','lcars','winxp','glassmorphism','pixel-8bit','corporate-clean','swiss-modernist','windows-31-program-manager','ibm-pc-monochrome-terminal','neuomorphism','bootstrap-3','y2k-early-2000s','early-web-1990s','memphis-corporate','flat-design','cinematic','material-design','neo-brutalism','corporate-clean','corporate-clean'];
      out.forEach((v, i) => { if (v !== expect[i]) throw new Error(samples[i] + ' => ' + v); });
    `;
    const run = spawnSync("node", ["--input-type=module", "-e", snippet], {
      encoding: "utf8",
    });
    assert.equal(run.status, 0, run.stderr || run.stdout);
  });
});
