import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const THEMES = [
  "lcars",
  "winxp",
  "windows-11-mica",
  "glassmorphism",
  "pixel-8bit",
  "corporate-clean",
  "psychedelic-blotter",
  "web2-glossy",
];

const PATHS = [
  "/workspace/provider-hub-v12.html",
  "/workspace/provider-hub-v12.css",
  "/workspace/provider-hub-v12.js",
  "/workspace/public/provider-hub-v12.html",
  "/workspace/public/provider-hub-v12.css",
  "/workspace/public/provider-hub-v12.js",
];

function read(p) {
  return readFileSync(p, "utf8");
}

describe("Provider Hub v12 files", () => {
  for (const p of PATHS) {
    it(`exists ${p}`, () => {
      assert.equal(existsSync(p), true, p);
    });
  }

  it("HTML references v12 assets only", () => {
    const html = read("/workspace/provider-hub-v12.html");
    assert.match(html, /provider-hub-v12\.css/);
    assert.match(html, /provider-hub-v12\.js/);
    assert.doesNotMatch(html, /provider-hub-v11\.(css|js)/);
    assert.match(html, /id="styleSelect"/);
    assert.match(html, /id="modeSelect"/);
    assert.match(html, /id="psychTable"/);
    assert.match(html, /id="infoModal"/);
    const ids = [...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(dup, [], `duplicate ids: ${dup.join(",")}`);
  });

  it("JS catalogs exactly eight themes and aliases", () => {
    const js = read("/workspace/provider-hub-v12.js");
    for (const t of THEMES) {
      assert.ok(js.includes(`value: '${t}'`), t);
    }
    assert.match(js, /startrek: 'lcars'/);
    assert.match(js, /function resolveStyle/);
    assert.match(js, /FALLBACK_STYLE = 'corporate-clean'/);
    assert.match(js, /providerHub_session_style_v3/);
    assert.match(js, /providerHubPrefs_v2/);
    const check = spawnSync("node", ["--check", "/workspace/provider-hub-v12.js"], {
      encoding: "utf8",
    });
    assert.equal(check.status, 0, check.stderr);
  });

  it("CSS scopes every theme and covers states", () => {
    const css = read("/workspace/provider-hub-v12.css");
    for (const t of THEMES) {
      assert.ok(css.includes(`html[data-style="${t}"]`), t);
      assert.ok(css.includes(`html[data-style="${t}"] .btn:hover`), `${t} hover`);
      assert.ok(css.includes(`html[data-style="${t}"] .btn:focus-visible`), `${t} focus`);
      assert.ok(css.includes(`html[data-style="${t}"] .btn:disabled`), `${t} disabled`);
      assert.ok(css.includes(`html[data-style="${t}"] .dataset-card.active`), `${t} selected`);
    }
    assert.match(css, /prefers-reduced-motion/);
    assert.match(css, /prefers-reduced-transparency/);
    assert.match(css, /backdrop-filter/);
    const body = css.replace(/\/\*[\s\S]*?\*\//g, "");
    assert.equal(body.split("{").length, body.split("}").length);
    assert.ok(!css.includes("\u2014") && !css.includes("\u2013"));
  });

  it("unknown styles fail safe via resolveStyle", () => {
    const js = read("/workspace/provider-hub-v12.js");
    const start = js.indexOf("  const STYLE_CATALOG = [");
    const end = js.indexOf("  /* ---------- DOM ---------- */");
    assert.ok(start >= 0 && end > start, "catalog block not found");
    const snippet = `${js.slice(start, end)}
      const samples = ['lcars','startrek','winxp','glass','pixel','memphis','',null];
      const out = samples.map((s) => resolveStyle(s));
      if (out[0] !== 'lcars') throw new Error('lcars');
      if (out[1] !== 'lcars') throw new Error('startrek alias');
      if (out[2] !== 'winxp') throw new Error('winxp');
      if (out[3] !== 'glassmorphism') throw new Error('glass alias');
      if (out[4] !== 'pixel-8bit') throw new Error('pixel alias');
      if (out[5] !== 'corporate-clean') throw new Error('unknown memphis');
      if (out[6] !== 'corporate-clean') throw new Error('empty');
      if (out[7] !== 'corporate-clean') throw new Error('null');
    `;
    const run = spawnSync("node", ["--input-type=module", "-e", snippet], {
      encoding: "utf8",
    });
    assert.equal(run.status, 0, run.stderr || run.stdout);
  });
});
