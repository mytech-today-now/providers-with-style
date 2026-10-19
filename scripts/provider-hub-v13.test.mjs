import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { Script } from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = (...parts) => resolve(ROOT, ...parts);
const V13_SOURCE_HTML = file("archive", "provider-hub", "v13", "providers-with-style", "providers", "provider-hub-v13.html");
const V13_SOURCE_CSS = file("archive", "provider-hub", "v13", "providers-with-style", "providers", "provider-hub-v13.css");
const V13_SOURCE_JS = file("archive", "provider-hub", "v13", "providers-with-style", "providers", "provider-hub-v13.js");
const V13_PUBLIC_HTML = file("archive", "provider-hub", "v13", "public", "provider-hub-v13.html");
const V13_PUBLIC_CSS = file("archive", "provider-hub", "v13", "public", "provider-hub-v13.css");
const V13_PUBLIC_JS = file("archive", "provider-hub", "v13", "public", "provider-hub-v13.js");

const THEMES = [
  "lcars",
  "winxp",
  "windows-11-mica",
  "glassmorphism",
  "pixel-8bit",
  "corporate-clean",
  "psychedelic-blotter",
  "swiss-modernist",
  "windows-31-program-manager",
  "ibm-pc-monochrome-terminal",
  "web2-glossy",
];

const PATHS = [
  V13_SOURCE_HTML,
  V13_SOURCE_CSS,
  V13_SOURCE_JS,
  V13_PUBLIC_HTML,
  V13_PUBLIC_CSS,
  V13_PUBLIC_JS,
];

function read(p) {
  return readFileSync(p, "utf8");
}

describe("Provider Hub v13 files", () => {
  for (const p of PATHS) {
    it(`exists ${p}`, () => {
      assert.equal(existsSync(p), true, p);
    });
  }

  it("HTML references v13 assets only and places display controls in the sidebar", () => {
    const html = read(V13_SOURCE_HTML);
    assert.match(html, /provider-hub-v13\.css/);
    assert.match(html, /provider-hub-v13\.js/);
    assert.doesNotMatch(html, /provider-hub-v1[012]\.(css|js)/);
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
    assert.match(sidebar, />Key<\/button>/);
    assert.match(sidebar, />Loose</);
    assert.match(sidebar, />Compact</);
    const ids = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(dup, [], `duplicate ids: ${dup.join(",")}`);
    assert.equal(html.includes("\u2014") || html.includes("\u2013"), false);
  });

  it("JS catalogs eleven themes and aliases", () => {
    const js = read(V13_SOURCE_JS);
    for (const t of THEMES) {
      assert.ok(js.includes(`value: '${t}'`), t);
    }
    assert.match(js, /startrek: 'lcars'/);
    assert.match(js, /swiss: 'swiss-modernist'/);
    assert.match(js, /win31: 'windows-31-program-manager'/);
    assert.match(js, /ibm: 'ibm-pc-monochrome-terminal'/);
    assert.match(js, /function resolveStyle/);
    assert.match(js, /FALLBACK_STYLE = 'corporate-clean'/);
    assert.match(js, /providerHub_session_style_v3/);
    assert.match(js, /providerHubPrefs_v2/);
    assert.doesNotThrow(() => new Script(js, { filename: V13_SOURCE_JS }));
    assert.equal(js.includes("\u2014") || js.includes("\u2013"), false);
  });

  it("CSS scopes every theme and covers states", () => {
    const css = read(V13_SOURCE_CSS);
    for (const t of THEMES) {
      assert.ok(css.includes(`html[data-style="${t}"]`), t);
      assert.ok(css.includes(`html[data-style="${t}"] .btn:hover`), `${t} hover`);
      assert.ok(css.includes(`html[data-style="${t}"] .btn:focus-visible`), `${t} focus`);
      assert.ok(css.includes(`html[data-style="${t}"] .btn:disabled`), `${t} disabled`);
      assert.ok(css.includes(`html[data-style="${t}"] .dataset-card.active`), `${t} selected`);
    }
    assert.match(css, /prefers-reduced-motion/);
    assert.match(css, /pointer-events:\s*none/);
    assert.doesNotMatch(css, /googleapis/);
    assert.doesNotMatch(css, /@keyframes/);
    const body = css.replace(/\/\*[\s\S]*?\*\//g, "");
    assert.equal(body.split("{").length, body.split("}").length);
    assert.ok(!css.includes("\u2014") && !css.includes("\u2013"));
  });

  it("unknown styles fail safe via resolveStyle", () => {
    const js = read(V13_SOURCE_JS);
    const start = js.indexOf("  const STYLE_CATALOG = [");
    const end = js.indexOf("  /* ---------- DOM ---------- */");
    assert.ok(start >= 0 && end > start, "catalog block not found");
    const snippet = `${js.slice(start, end)}
      const samples = ['lcars','startrek','winxp','glass','pixel','memphis','swiss','win31','ibm','',null];
      const out = samples.map((s) => resolveStyle(s));
      if (out[0] !== 'lcars') throw new Error('lcars');
      if (out[1] !== 'lcars') throw new Error('startrek alias');
      if (out[2] !== 'winxp') throw new Error('winxp');
      if (out[3] !== 'glassmorphism') throw new Error('glass alias');
      if (out[4] !== 'pixel-8bit') throw new Error('pixel alias');
      if (out[5] !== 'corporate-clean') throw new Error('unknown memphis');
      if (out[6] !== 'swiss-modernist') throw new Error('swiss alias');
      if (out[7] !== 'windows-31-program-manager') throw new Error('win31 alias');
      if (out[8] !== 'ibm-pc-monochrome-terminal') throw new Error('ibm alias');
      if (out[9] !== 'corporate-clean') throw new Error('empty');
      if (out[10] !== 'corporate-clean') throw new Error('null');
    `;
    assert.doesNotThrow(() => new Script(snippet).runInNewContext());
  });
});
