import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = (...parts) => resolve(ROOT, ...parts);
const V13_HTML = file("archive", "provider-hub", "v13", "providers-with-style", "providers", "provider-hub-v13.html");
const V13_CSS = file("archive", "provider-hub", "v13", "providers-with-style", "providers", "provider-hub-v13.css");
const V13_JS = file("archive", "provider-hub", "v13", "providers-with-style", "providers", "provider-hub-v13.js");
const V14_PROVIDER_HTML = file("archive", "provider-hub", "v14", "providers-with-style", "providers", "provider-hub-v14.html");
const V14_PROVIDER_CSS = file("archive", "provider-hub", "v14", "providers-with-style", "providers", "provider-hub-v14.css");
const V14_PROVIDER_JS = file("archive", "provider-hub", "v14", "providers-with-style", "providers", "provider-hub-v14.js");
const V14_PUBLIC_HTML = file("archive", "provider-hub", "v14", "public", "provider-hub-v14.html");
const V14_PUBLIC_CSS = file("archive", "provider-hub", "v14", "public", "provider-hub-v14.css");
const V14_PUBLIC_JS = file("archive", "provider-hub", "v14", "public", "provider-hub-v14.js");
const V16_HTML = file("archive", "provider-hub", "v16", "providers-with-style", "providers", "provider-hub-v16.html");
const V16_CSS = file("archive", "provider-hub", "v16", "providers-with-style", "providers", "provider-hub-v16.css");
const V16_JS = file("archive", "provider-hub", "v16", "providers-with-style", "providers", "provider-hub-v16.js");

const RUNTIMES = [
  { name: "v14 provider copy", jsPath: V14_PROVIDER_JS, htmlPath: V14_PROVIDER_HTML, cssPath: V14_PROVIDER_CSS },
  { name: "v14 public copy", jsPath: V14_PUBLIC_JS, htmlPath: V14_PUBLIC_HTML, cssPath: V14_PUBLIC_CSS },
  { name: "legacy v16 fixture", jsPath: V16_JS, htmlPath: V16_HTML, cssPath: V16_CSS },
];

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
  V14_PROVIDER_HTML,
  V14_PROVIDER_CSS,
  V14_PROVIDER_JS,
  V14_PUBLIC_HTML,
  V14_PUBLIC_CSS,
  V14_PUBLIC_JS,
];

function read(p) {
  return readFileSync(p, "utf8");
}

function sourceBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `source block not found: ${startMarker}`);
  return source.slice(start, end);
}

function remoteToolsFor(source, initialDatasets = [], cryptoApi = webcrypto) {
  const helpers = sourceBlock(source, "  function stableStringify(value) {", "  function setUrlLoadStatus(message, state) {");
  return new Function("window", "initialDatasets", `
    const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    const MAX_IMPORT_RECORDS = 10000;
    const makeImportLimitError = (code, source, measured, limit, unit) => Object.assign(new Error('limit'), { code, source, measured, limit, unit });
    let records = structuredClone(initialDatasets);
    let nextId = records.reduce((max, record) => Math.max(max, Number(record.id) || 0), 0) + 1;
    async function idbPutDataset(data) {
      if (data.id == null) data.id = nextId++;
      const saved = structuredClone(data);
      const index = records.findIndex(record => record.id === saved.id);
      if (index >= 0) records[index] = saved;
      else records.push(saved);
      return data.id;
    }
    async function idbListDatasets() {
      const rows = structuredClone(records);
      for (const dataset of rows) {
        if (await sanitizeStoredSourceMetadata(dataset)) await idbPutDataset(dataset);
      }
      return rows;
    }
    ${helpers}
    return {
      normalizeSourceUrl,
      normalizeRequestUrl,
      safeSourceLabel,
      sanitizeStoredSourceMetadata,
      importErrorCategory,
      importErrorSummary,
      upsertRemoteImport,
      cryptoAvailable: () => [typeof window.crypto, Boolean(window.crypto && window.crypto.subtle), typeof TextEncoder],
      list: idbListDatasets,
      stored: () => structuredClone(records),
    };
  `)({ location: { href: "https://hub.example/" }, crypto: cryptoApi }, initialDatasets);
}

function importFeedbackFor(source, safeSourceLabel) {
  const feedback = sourceBlock(
    source,
    "  function setUrlLoadStatus(message, state) {",
    "  async function processSingleJsonText(text, sourceName) {",
  );
  const status = {
    textContent: "",
    classes: new Map(),
    classList: { toggle(name, active) { this.owner.classes.set(name, active); } },
  };
  status.classList.owner = status;
  return new Function("window", "urlLoadStatus", "safeSourceLabel", "btnCancelImport", `
    ${feedback}
    return { setUrlLoadStatus, makeDiagnostic, status: urlLoadStatus };
  `)({ location: { href: "https://hub.example/" } }, status, safeSourceLabel, { addEventListener() {} });
}

function formatImportReportFor(source) {
  const formatter = sourceBlock(
    source,
    "  function formatImportReport(report) {",
    "  /* Load from a direct JSON URL or an exposed directory listing. */",
  );
  return new Function(`${formatter}; return formatImportReport;`)();
}

function parseDiagnosticHarnessFor(source, tools, feedback) {
  const parser = sourceBlock(
    source,
    "  async function processSingleJsonText(text, sourceName) {",
    "  async function autoSaveImport(payload) {",
  );
  const captured = [];
  const fakeConsole = { error(...args) { captured.push(args); } };
  class UnusedFileReader { static LOADING = 1; }
  const parseImportJson = importBoundaryHelpersFor(source, UnusedFileReader).parseImportJson;
  const parse = new Function("normalizeImportPayload", "parseImportJson", "makeDiagnostic", "importErrorCategory", "console", `
    let pendingImportData = null;
    ${parser}
    return processSingleJsonText;
  `)(normalizerFor(source), parseImportJson, feedback.makeDiagnostic, tools.importErrorCategory, fakeConsole);
  return { parse, captured };
}

function fetchTextFor(source, fetchImpl) {
  const urlHelpers = sourceBlock(source, "  function normalizeRequestUrl(value) {", "  function safeSourceLabel(value) {");
  const fetchHelpers = "const makeImportLimitError = (code, source, measured, limit, unit) => Object.assign(new Error('limit'), { code, source, measured, limit, unit });\n" +
    sourceBlock(source, "  const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;", "  function parseDirectoryDocument(");
  return new Function("fetch", "window", `${urlHelpers}\n${fetchHelpers}; return fetchText;`)(
    fetchImpl,
    { location: { href: "https://hub.example/", origin: "https://hub.example" } },
  );
}

function importBoundaryHelpersFor(source, FileReaderImpl) {
  const helpers = sourceBlock(source, "  const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;", "  function importOrigin(value) {");
  return new Function("FileReader", `
    const makeImportLimitError = (code, source, measured, limit, unit) => Object.assign(new Error('limit'), { code, source, measured, limit, unit });
    ${helpers}
    return {
      MAX_IMPORT_FILE_BYTES, MAX_IMPORT_TOTAL_BYTES, MAX_IMPORT_RECORDS, MAX_IMPORT_NESTING, MAX_IMPORT_FIELD_CHARS, MAX_IMPORT_FILES,
      validateLocalFileBatch, validateImportJsonText, parseImportJson, readLocalFileText
    };
  `)(FileReaderImpl);
}

function exactSizeImportJson(byteLength, maxFieldChars) {
  const parts = ['{"items":[]'];
  let remaining = byteLength - parts[0].length - 1;
  while (remaining > 0) {
    const overhead = 7;
    if (remaining < overhead) throw new Error('Cannot create exact-size JSON fixture.');
    let valueLength = Math.min(maxFieldChars, remaining - overhead);
    const after = remaining - overhead - valueLength;
    if (after > 0 && after < overhead) valueLength -= overhead - after;
    parts.push(',"p":"' + 'a'.repeat(valueLength) + '"');
    remaining -= overhead + valueLength;
  }
  parts.push('}');
  const text = parts.join('');
  assert.equal(Buffer.byteLength(text, 'utf8'), byteLength);
  return text;
}

function controlledDirectoryParser() {
  return class DOMParserStub {
    parseFromString(text) {
      const tags = Array.from(text.matchAll(/<(a|link)\b[^>]*>/gi), match => match[0]);
      const readAttribute = (tag, name) => {
        const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*([\"'])(.*?)\\1`, "i"));
        return match ? match[2] : null;
      };
      const links = tags.map(tag => ({
        tag: tag.slice(1).split(/[\s>]/, 1)[0].toLowerCase(),
        href: readAttribute(tag, "href"),
        rel: readAttribute(tag, "rel") || "",
        getAttribute(name) { return this[name] ?? null; },
      }));
      return {
        querySelectorAll(selector) {
          if (selector === "a[href]") return links.filter(link => link.tag === "a" && link.href);
          if (selector === "link[rel~=\"manifest\"][href]") return links.filter(link => link.tag === "link" && link.href && link.rel.split(/\s+/).includes("manifest"));
          return [];
        },
      };
    }
  };
}

function directoryImportHarnessFor(source, fetchImpl, pageUrl = "http://provider-hub.test/") {
  const urlHelpers = sourceBlock(source, "  function normalizeRequestUrl(value) {", "  function safeSourceLabel(value) {");
  const importHelpers = sourceBlock(source, "  function isJsonFileUrl(value) {", "  function formatImportReport(report) {");
  const window = { location: { href: pageUrl, origin: new URL(pageUrl).origin } };
  return new Function("fetch", "window", "DOMParser", "document", `
    const isPlainObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
    const validateImportPayload = () => ({ valid: false });
    const logWarn = () => {};
    const makeImportLimitError = (code, source, measured, limit, unit) => Object.assign(new Error('limit'), { code, source, measured, limit, unit });
    const safeSourceLabel = value => {
      try { const url = new URL(value, window.location.href); return url.origin + "/" + (url.pathname.split("/").filter(Boolean).pop() || ""); }
      catch { return "source"; }
    };
    const importErrorCategory = error => error && error.code === "JSON_PARSE" ? "Invalid JSON" : "Load failed";
    const importErrorSummary = error => importErrorCategory(error) === "Invalid JSON" ? "The source is not valid JSON." : "The source could not be loaded.";
    ${urlHelpers}
    ${importHelpers}
    return { createImportOriginPolicy, discoverDirectoryJson, fetchText, importOrigin, limitImportUrls };
  `)(fetchImpl, window, controlledDirectoryParser(), {});
}

async function startControlledServer(handler) {
  const requests = [];
  const server = createServer((request, response) => {
    requests.push({ method: request.method, url: request.url, headers: request.headers });
    handler(request, response);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    requests,
    async close() {
      server.close();
      await once(server, "close");
    },
  };
}

function credentialObservingFetch(observations) {
  return async (url, options) => {
    observations.push({ url: new URL(url).href, credentials: options.credentials, redirect: options.redirect });
    const headers = new Headers(options.headers);
    if (options.credentials !== "omit") headers.set("cookie", "synthetic-session=should-not-cross-origins");
    return fetch(url, { ...options, headers });
  };
}

function descriptionHelpers(source) {
  return sourceBlock(source, "  function descriptionText(value) {", "  /* ---------- Clipboard helper ---------- */");
}

function providerLinkHelpers(source) {
  return sourceBlock(source, "  const SAFE_WEB_PROTOCOLS = new Set(['http:', 'https:']);", "  function descriptionText(value) {");
}

function normalizerFor(source) {
  const helpers = descriptionHelpers(source);
  const importHelpers = sourceBlock(source, "  function makeImportLimitError(code, source, measured, limit, unit) {", "  function stableStringify(value)");
  return new Function("raw", "fallbackName", `
    const MAX_IMPORT_FIELD_CHARS = 10000;
    const MAX_IMPORT_NESTING = 20;
    const MAX_IMPORT_RECORDS = 10000;
    const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    ${helpers}
    ${importHelpers}
    return normalizeImportPayload(raw, fallbackName);
  `);
}

function safeDestinationFor(source) {
  const helpers = providerLinkHelpers(source);
  return new Function("value", "baseUrl", `${helpers}; return resolveWebDestination(value, baseUrl);`);
}

function linkRendererFor(source, baseUrl) {
  const helpers = providerLinkHelpers(source);
  const fakeDocument = {
    baseURI: baseUrl,
    createElement(tagName) {
      let ownText = "";
      const element = {
        tagName,
        children: [],
        attributes: {},
        setAttribute(name, value) { this.attributes[name] = value; },
        appendChild(child) { this.children.push(child); return child; },
      };
      Object.defineProperty(element, "textContent", {
        get() { return ownText + this.children.map(child => child.textContent || "").join(""); },
        set(value) { ownText = String(value); this.children = []; },
      });
      return element;
    },
  };
  return new Function("document", `${helpers}; return (destination, label) => {
    const wrapper = { children: [], appendChild(child) { this.children.push(child); return child; } };
    const result = appendProviderDestination(wrapper, destination, label);
    return { result, children: wrapper.children };
  };`)(fakeDocument);
}

function mediaRuleBodies(css, mediaName) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const pattern = new RegExp(`@media\\s+${mediaName}\\b[^\\{]*\\{`, "g");
  const bodies = [];
  let match;
  while ((match = pattern.exec(source))) {
    const opening = source.indexOf("{", match.index);
    let depth = 1;
    let end = opening + 1;
    while (end < source.length && depth > 0) {
      if (source[end] === "{") depth += 1;
      if (source[end] === "}") depth -= 1;
      end += 1;
    }
    assert.equal(depth, 0, `unclosed @media ${mediaName} block`);
    bodies.push(source.slice(opening + 1, end - 1));
    pattern.lastIndex = end;
  }
  return bodies;
}

describe("Provider Hub v14 files", () => {
  for (const p of PATHS) {
    it(`exists ${p}`, () => {
      assert.equal(existsSync(p), true, p);
    });
  }

  it("leaves v13 files untouched", () => {
    assert.equal(existsSync(V13_HTML), true);
    assert.equal(existsSync(V13_CSS), true);
    assert.equal(existsSync(V13_JS), true);
    const v13 = read(V13_HTML);
    assert.match(v13, /provider-hub-v13\.css/);
    assert.doesNotMatch(v13, /provider-hub-v14/);
  });

  it("HTML references v14 assets only and places display controls in the sidebar", () => {
    const html = read(V14_PROVIDER_HTML);
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
    const js = read(V14_PROVIDER_JS);
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
    assert.doesNotThrow(() => new Function(js), "v14 JavaScript must parse");
    assert.equal(js.includes("\u2014") || js.includes("\u2013"), false);
  });

  it("CSS scopes every theme and covers states", () => {
    const css = read(V14_PROVIDER_CSS);
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
    const js = read(V14_PROVIDER_JS);
    const start = js.indexOf("  const STYLE_CATALOG = [");
    const end = js.indexOf("  /* ---------- DOM ---------- */");
    assert.ok(start >= 0 && end > start, "catalog block not found");
    const snippet = `${js.slice(start, end)}
      const samples = ['lcars','startrek','winxp','glass','pixel','unknown-theme','swiss','win31','ibm','neuomorphism','bootstrap','y2k','geocities','memphis','flat','cinematic','material','neobrutal','',null];
      const out = samples.map((s) => resolveStyle(s));
      const expect = ['lcars','lcars','winxp','glassmorphism','pixel-8bit','corporate-clean','swiss-modernist','windows-31-program-manager','ibm-pc-monochrome-terminal','neuomorphism','bootstrap-3','y2k-early-2000s','early-web-1990s','memphis-corporate','flat-design','cinematic','material-design','neo-brutalism','corporate-clean','corporate-clean'];
      out.forEach((v, i) => { if (v !== expect[i]) throw new Error(samples[i] + ' => ' + v); });
    `;
    assert.doesNotThrow(() => new Function(snippet)(), "unknown style resolution samples");
  });

  it("v14 and legacy v16 descriptions use the constrained renderer, not an HTML sink", () => {
    for (const runtime of RUNTIMES) {
      const js = read(runtime.jsPath);
      const display = sourceBlock(js, "  function displayData(data) {", "  async function applySavedLayout");
      const renderer = sourceBlock(js, "  function renderSafeRichText(container, value) {", "  function descriptionText(value)");
      const longDescriptionRenderer = sourceBlock(js, "  function renderLongDescription(container, data) {", "  /* ---------- Clipboard helper ---------- */");

      assert.match(display, /renderLongDescription\(document\.getElementById\('longDesc'\), data\)/, runtime.name);
      assert.doesNotMatch(display, /longDesc\.(?:innerHTML|outerHTML)\s*=/, runtime.name);
      assert.match(renderer, /new Set\(\['BR', 'P', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'B', 'I', 'SPAN'\]\)/, runtime.name);
      assert.match(renderer, /source\.innerHTML\s*=\s*value == null \? '' : String\(value\)/, runtime.name);
      assert.match(renderer, /!allowedTags\.has\(node\.tagName\)/, runtime.name);
      assert.match(renderer, /Array\.from\(node\.childNodes \|\| \[\]\)\.forEach\(child => fragment\.appendChild\(copyNode\(child\)\)\)/, runtime.name);
      assert.match(renderer, /safeClasses = Array\.from\(node\.classList\)\.filter\(className => className === 'pros' \|\| className === 'cons'\)/, runtime.name);
      assert.doesNotMatch(renderer, /container\.innerHTML|element\.setAttribute|element\.(?:href|src)\s*=/, runtime.name);
      assert.match(longDescriptionRenderer, /container\.textContent = descriptionText\(value\)/, runtime.name);
      assert.match(longDescriptionRenderer, /setAttribute\('role', 'note'\)/, runtime.name);
      assert.match(longDescriptionRenderer, /This description was not text and is shown as plain text\./, runtime.name);
      assert.doesNotMatch(js, /longDescriptionIsPlainText/, runtime.name);
    }
  });

  it("local and remote imports keep malformed descriptions as readable plain text", () => {
    const runtime = read(V14_PROVIDER_JS);
    const normalize = normalizerFor(runtime);
    const localInput = {
      prettyName: "Local fixture",
      items: [{ name: "Local provider" }],
      longDescription: { html: "<img src=x onerror=alert(1)>", note: "Keep this text" },
    };
    const local = normalize(localInput, "local-fixture");
    assert.equal(local.prettyName, "Local fixture");
    assert.equal(local.items.length, 1);
    assert.equal(local.longDescription, localInput.longDescription);
    assert.equal(Object.hasOwn(local, "longDescriptionIsPlainText"), false);

    const remote = normalize({ items: [], longDescription: 42 }, "remote-fixture");
    assert.deepEqual(remote.items, []);
    assert.equal(remote.longDescription, 42);
    assert.equal(Object.hasOwn(remote, "longDescriptionIsPlainText"), false);

    const localHandler = sourceBlock(runtime, "  jsonInput.addEventListener('change', async function () {", "  document.getElementById('btnNewDataset').addEventListener");
    assert.match(localHandler, /const parsed = parseImportJson\(text, file\.name\)/);
    assert.match(localHandler, /pendingImportData = normalizeImportPayload\([\s\S]*?parsed[\s\S]*?file\.name/);
    assert.match(runtime, /pendingImportData = normalizeImportPayload\([\s\S]*?parsed/);
    assert.match(runtime, /const payload = normalizeImportPayload\(raw, fallbackName, source\.sourceUrl\)/);
    assert.match(runtime, /sameSource\.longDescription = payload\.longDescription/);
  });

  it("edited descriptions retain malformed values unchanged and replace them after editing", () => {
    for (const runtime of RUNTIMES) {
      const js = read(runtime.jsPath);
      const helpers = descriptionHelpers(js);
      const preserveMalformed = new Function("data", "editedText", `${helpers}; return preserveMalformedDescription(data, editedText);`);
      const imported = { longDescription: { html: "<img src=x>" } };

      assert.equal(preserveMalformed(imported, JSON.stringify(imported.longDescription)), true, runtime.name);
      assert.equal(preserveMalformed(imported, "Edited description"), false, runtime.name);
      assert.equal(preserveMalformed({ longDescription: "Ordinary prose" }, "Ordinary prose"), false, runtime.name);
      assert.match(js, /descriptionText\(prefill\?\.longDescription\)/, runtime.name);
      assert.match(js, /const preserveMalformed = preserveMalformedDescription\(pendingImportData, longDescription\)/, runtime.name);
      assert.match(js, /const savedLongDescription = preserveMalformed[\s\S]*?pendingImportData\.longDescription/, runtime.name);
      assert.match(js, /currentData\.longDescription = preserveMalformed \? currentData\.longDescription : longDescription/, runtime.name);
    }
  });

  it("preserves empty, ordinary, Unicode, ampersand, and approved formatted descriptions", () => {
    const js = read(V14_PROVIDER_JS);
    const normalize = normalizerFor(js);
    for (const description of ["", "Care & wellness for 東京", "Plain text with <literal> brackets"]) {
      const normalized = normalize({ items: [], longDescription: description }, "fixture");
      assert.equal(normalized.longDescription, description);
      assert.equal(Object.hasOwn(normalized, "longDescriptionIsPlainText"), false);
    }
    const renderer = sourceBlock(js, "  function renderSafeRichText(container, value) {", "  function descriptionText(value)");
    assert.match(renderer, /'BR', 'P', 'UL', 'OL', 'LI', 'STRONG', 'EM', 'B', 'I', 'SPAN'/);
    assert.match(renderer, /className === 'pros' \|\| className === 'cons'/);
  });

  it("documents the exact safe description format for v14 and the legacy v16 fixture", () => {
    for (const runtime of RUNTIMES) {
      const html = read(runtime.htmlPath);
      const css = read(runtime.cssPath);
      assert.match(html, /id="metaLongHelp"/, runtime.name);
      assert.match(html, /aria-describedby="metaLongHelp"/, runtime.name);
      assert.match(html, /<textarea id="metaLong" aria-describedby="metaLongHelp"/, runtime.name);
      assert.match(html, /Allowed tags:[\s\S]*?class[\s\S]*?pros[\s\S]*?cons/, runtime.name);
      assert.match(html, /Other elements and all other attributes are discarded\./, runtime.name);
      assert.doesNotMatch(html, /Long description \/ disclaimer \(HTML allowed\)/, runtime.name);
      assert.match(html, /id="longDesc"/, runtime.name);
      assert.doesNotMatch(html, /id="longDesc"[^>]*aria-hidden="true"/, runtime.name);
      assert.doesNotMatch(css, /(?:#longDesc|\.disclaimer-wrap|\.disclaimer)\s*\{[^}]*display:\s*none/, runtime.name);
      const printRules = mediaRuleBodies(css, "print");
      assert.ok(printRules.length > 0, `${runtime.name}: print rules exist`);
      assert.doesNotMatch(printRules.join("\n"), /#longDesc|\.disclaimer-wrap|\.disclaimer(?:\s|,|\{)/, runtime.name);
    }
  });

  it("allows only parsed HTTP(S) destinations and preserves supported relative web paths", () => {
    const base = "https://directory.example/regions/austin/index.html";
    for (const runtime of RUNTIMES) {
      const js = read(runtime.jsPath);
      const safeDestination = safeDestinationFor(js);
      assert.equal(safeDestination("https://clinic.example/locations/austin", base), "https://clinic.example/locations/austin", runtime.name);
      assert.equal(safeDestination("http://clinic.example/locations/austin", base), "http://clinic.example/locations/austin", runtime.name);
      assert.equal(safeDestination("../maps/austin", base), "https://directory.example/regions/maps/austin", runtime.name);
      assert.equal(safeDestination("//maps.example/austin", base), "https://maps.example/austin", runtime.name);

      for (const value of [
        "",
        "javascript:window.__unsafe = true",
        "data:text/html,<script>window.__unsafe = true</script>",
        JSON.parse('{"toString":null}'),
        "https://[",
        " https://clinic.example/path",
        "https://clinic.example/path with space",
        "https://clinic.example/path\twith-tab",
        "https://clinic.example/\u0000path",
      ]) {
        assert.equal(safeDestination(value, base), null, `${runtime.name}: ${JSON.stringify(value)}`);
      }
    }
  });

  it("renders unsupported destinations as inert text with a visible explanation", () => {
    const base = "https://directory.example/providers/index.html";
    for (const runtime of RUNTIMES) {
      const render = linkRendererFor(read(runtime.jsPath), base);
      for (const value of [
        "javascript:window.__unsafe = true",
        "data:text/html,blocked",
        "https://[",
        "  javascript:blocked",
        JSON.parse('{"toString":null}'),
      ]) {
        const output = render(value, "Provider label");
        assert.equal(output.children.length, 1, runtime.name);
        const inert = output.children[0];
        assert.equal(inert.tagName, "span", runtime.name);
        assert.equal(inert.className, "provider-link-inert", runtime.name);
        assert.match(inert.textContent, /^Provider label/, runtime.name);
        assert.match(inert.textContent, /Destination not linked/, runtime.name);
        const displayedValue = typeof value === "string" ? value : JSON.stringify(value);
        assert.ok(inert.textContent.includes(displayedValue), runtime.name);
        assert.equal(inert.children[1].attributes.role, "note", runtime.name);
        assert.match(inert.children[1].textContent, /Destination not linked/, runtime.name);
        assert.equal(inert.href, undefined, runtime.name);
        assert.doesNotMatch(inert.tagName, /^a$/i, runtime.name);
      }

      const empty = render("", "");
      assert.equal(empty.result, null, runtime.name);
      assert.deepEqual(empty.children, [], runtime.name);

      const valid = render("https://clinic.example/a", "Clinic");
      assert.equal(valid.result.tagName, "a", runtime.name);
      assert.equal(valid.result.href, "https://clinic.example/a", runtime.name);
      assert.equal(valid.result.target, "_blank", runtime.name);
      assert.equal(valid.result.rel, "noopener", runtime.name);
      assert.equal(valid.result.textContent, "Clinic", runtime.name);
    }
  });

  it("uses the same destination gate for local, remote, and manually edited rows", () => {
    for (const runtime of RUNTIMES) {
      const js = read(runtime.jsPath);
      const normalize = normalizerFor(js);
      const maliciousItem = {
        name: "Imported provider",
        website: "javascript:window.__unsafe = true",
        distance: "2.0 mi",
        distanceUrl: "data:text/html,blocked",
      };
      const local = normalize({ items: [maliciousItem] }, "local-fixture");
      const remote = normalize({ items: [maliciousItem] }, "remote-fixture");
      assert.deepEqual(local.items[0], maliciousItem, runtime.name);
      assert.deepEqual(remote.items[0], maliciousItem, runtime.name);

      const renderer = sourceBlock(js, "  function renderRows(items) {", "  function setColumnVisibility(");
      assert.match(renderer, /appendProviderDestination\(wrapper, item\.distanceUrl, val\)/, runtime.name);
      assert.match(renderer, /appendProviderDestination\(wrapper, item\.website, text\)/, runtime.name);
      assert.match(renderer, /providerDestinationText\(item\.website\)/, runtime.name);
      assert.doesNotMatch(renderer, /(?:a|link)\.href\s*=\s*item\.(?:distanceUrl|website)/, runtime.name);

      const rowSave = sourceBlock(
        js,
        "  document.getElementById('rowSave').addEventListener('click', async () => {",
        "  document.getElementById('btnAddRow').addEventListener"
      );
      assert.match(rowSave, /item\.distanceUrl = distUrl\.value/, runtime.name);
      assert.match(rowSave, /currentData\.items\[editingRowIndex\] = item/, runtime.name);
      assert.match(rowSave, /displayData\(currentData\)/, runtime.name);
    }
  });
});

describe("remote source URL privacy", () => {
  const credentialUrl = "https://SYNTH_USER:SYNTH_PASSWORD@feed.example.test/private/providers.json?region=west&access_token=SYNTH_TOKEN&X-Amz-Signature=SYNTH_SIGNATURE#SYNTH_FRAGMENT";
  const rotatedCredentialUrl = "https://SYNTH_USER:SYNTH_PASSWORD@feed.example.test/private/providers.json?region=west&access_token=ROTATED_TOKEN&X-Amz-Signature=ROTATED_SIGNATURE#ROTATED_FRAGMENT";
  const markers = ["SYNTH_USER", "SYNTH_PASSWORD", "SYNTH_TOKEN", "SYNTH_SIGNATURE", "SYNTH_FRAGMENT"];
  const payload = {
    prettyName: "Privacy regression fixture",
    items: [{ name: "Example Clinic" }],
    tags: ["fixture"],
    shortDescription: "Synthetic test data",
    longDescription: "Synthetic test data",
    footerNote: "",
  };

  for (const runtime of RUNTIMES) {
    it(`${runtime.name}: stores a safe source identity and keeps signed fetch input ephemeral`, async () => {
      const js = read(runtime.jsPath);
      const tools = remoteToolsFor(js);
      assert.deepEqual(tools.cryptoAvailable(), ["object", true, "function"], runtime.name);
      const requestUrl = tools.normalizeRequestUrl(credentialUrl);
      assert.match(requestUrl, /SYNTH_USER:SYNTH_PASSWORD/);
      assert.match(requestUrl, /access_token=SYNTH_TOKEN/);
      assert.match(requestUrl, /X-Amz-Signature=SYNTH_SIGNATURE/);
      assert.doesNotMatch(requestUrl, /SYNTH_FRAGMENT/);

      const imported = await tools.upsertRemoteImport(payload, credentialUrl);
      assert.equal(imported.status, "created");
      assert.equal(imported.data.sourceUrl, "https://feed.example.test/private/providers.json?region=[redacted]&access_token=[redacted]&X-Amz-Signature=[redacted]");
      assert.match(imported.data.sourceIdentity, /^sha256:[0-9a-f]{64}$/);
      assert.deepEqual(imported.data.items, payload.items);
      const feedback = importFeedbackFor(js, tools.safeSourceLabel);
      const successStatus = formatImportReportFor(js)({
        discovered: 1,
        loaded: 1,
        duplicates: 0,
        skipped: 0,
        failed: 0,
        messages: [],
      });
      feedback.setUrlLoadStatus(successStatus, "success");
      assert.equal(feedback.status.textContent, "Discovered: 1 | Loaded: 1 | Duplicates: 0 | Incompatible: 0 | Failed: 0", runtime.name);
      for (const marker of markers) assert.equal(feedback.status.textContent.includes(marker), false, `${runtime.name}: successful status ${marker}`);
      const persisted = JSON.stringify(tools.stored());
      for (const marker of markers) assert.equal(persisted.includes(marker), false, `${runtime.name}: stored ${marker}`);

      const refreshed = await tools.upsertRemoteImport(payload, rotatedCredentialUrl);
      assert.equal(refreshed.status, "duplicate", runtime.name);
      assert.equal(tools.stored().length, 1, runtime.name);

      const ordinary = "https://feed.example.test/catalog/providers.json?region=east&edition=2026";
      const ordinaryMetadata = await tools.normalizeSourceUrl(ordinary);
      assert.equal(ordinaryMetadata.sourceUrl, "https://feed.example.test/catalog/providers.json?region=[redacted]&edition=[redacted]", runtime.name);
      assert.match(ordinaryMetadata.sourceIdentity, /^sha256:[0-9a-f]{64}$/);
      const encodedOrdinary = "https://feed.example.test/catalog/providers.json?region=west%20side&edition=2026&access%5Ftoken=SYNTH_TOKEN";
      const encodedMetadata = await tools.normalizeSourceUrl(encodedOrdinary);
      const sameEncodedMetadata = await tools.normalizeSourceUrl(encodedOrdinary + "#section");
      const differentQueryMetadata = await tools.normalizeSourceUrl(encodedOrdinary.replace("west%20side", "east"));
      assert.equal(encodedMetadata.sourceUrl, "https://feed.example.test/catalog/providers.json?region=[redacted]&edition=[redacted]&access%5Ftoken=[redacted]", runtime.name);
      assert.equal(encodedMetadata.sourceIdentity, sameEncodedMetadata.sourceIdentity, runtime.name);
      assert.notEqual(encodedMetadata.sourceIdentity, differentQueryMetadata.sourceIdentity, runtime.name);
      assert.equal(tools.safeSourceLabel(ordinary), "https://feed.example.test/…/providers.json", runtime.name);
      const ordinaryTools = remoteToolsFor(js);
      const ordinaryImport = await ordinaryTools.upsertRemoteImport(payload, ordinary);
      assert.equal(ordinaryImport.status, "created", runtime.name);
      assert.equal((await ordinaryTools.upsertRemoteImport(payload, ordinary + "#section")).status, "duplicate", runtime.name);

      const fallbackTools = remoteToolsFor(js, [], { subtle: { digest: async () => { throw new Error("SYNTH_TOKEN"); } } });
      const fallbackMetadata = await fallbackTools.normalizeSourceUrl(credentialUrl);
      assert.match(fallbackMetadata.sourceIdentity, /^sha256:[0-9a-f]{64}$/, runtime.name);
      assert.equal(fallbackMetadata.sourceIdentity, (await tools.normalizeSourceUrl(credentialUrl)).sourceIdentity, runtime.name);
      assert.equal(fallbackMetadata.sourceIdentity, (await fallbackTools.normalizeSourceUrl(rotatedCredentialUrl)).sourceIdentity, runtime.name);
      for (const marker of markers) {
        assert.equal(JSON.stringify(fallbackMetadata).includes(marker), false, `${runtime.name}: fallback ${marker}`);
      }
      await fallbackTools.upsertRemoteImport(payload, ordinary);
      const secondFeedPayload = { ...payload, items: [{ name: "Second feed fixture" }] };
      assert.equal((await fallbackTools.upsertRemoteImport(secondFeedPayload, ordinary.replace("region=east", "region=west"))).status, "created", runtime.name);
      assert.equal(fallbackTools.stored().length, 2, runtime.name);
    });

    it(`${runtime.name}: scrubs legacy source credentials without changing dataset contents`, async () => {
      const legacyDataset = {
        id: 73,
        prettyName: "Existing local records",
        sourceUrl: credentialUrl,
        items: [{ name: "Kept local record", notes: "unchanged" }],
      };
      const tools = remoteToolsFor(read(runtime.jsPath), [legacyDataset]);
      const rows = await tools.list();
      assert.equal(rows.length, 1, runtime.name);
      assert.deepEqual(rows[0].items, legacyDataset.items, runtime.name);
      assert.equal(rows[0].sourceUrl.includes("SYNTH_"), false, runtime.name);
      assert.match(rows[0].sourceIdentity, /^sha256:[0-9a-f]{64}$/, runtime.name);
      const persisted = JSON.stringify(tools.stored());
      for (const marker of markers) assert.equal(persisted.includes(marker), false, `${runtime.name}: legacy ${marker}`);

      const idbReaders = sourceBlock(
        read(runtime.jsPath),
        "  async function idbGetDataset(id) {",
        "  async function saveLayoutState(state) {",
      );
      assert.match(idbReaders, /sanitizeStoredSourceMetadata\(dataset\)/, runtime.name);
      assert.match(idbReaders, /await idbPutDataset\(dataset\)/, runtime.name);
    });

    it(`${runtime.name}: parse and fetch diagnostics keep actionable categories without credentials or stacks`, async () => {
      const js = read(runtime.jsPath);
      const tools = remoteToolsFor(js);
      const feedback = importFeedbackFor(js, tools.safeSourceLabel);
      const parseHarness = parseDiagnosticHarnessFor(js, tools, feedback);
      await assert.rejects(parseHarness.parse("{\"token\":", credentialUrl), SyntaxError);
      const parseStatus = `${tools.importErrorCategory({ code: "JSON_PARSE" })}: ${tools.safeSourceLabel(credentialUrl)}. ${tools.importErrorSummary({ code: "JSON_PARSE", message: "SYNTH_TOKEN", stack: "SYNTH_SIGNATURE" })}`;
      feedback.setUrlLoadStatus(parseStatus, "error");
      const visibleParseStatus = feedback.status.textContent;
      const fetchText = fetchTextFor(js, async () => { throw new Error("SYNTH_TOKEN network failure"); });
      let networkFailure;
      await assert.rejects(fetchText(credentialUrl, null, "fetching the JSON file"), error => {
        networkFailure = error;
        assert.equal(error.code, "NETWORK_OR_CORS", runtime.name);
        assert.doesNotMatch(error.message, /SYNTH_/, runtime.name);
        assert.doesNotMatch(error.stack || "", /SYNTH_/, runtime.name);
        assert.equal(Object.hasOwn(error, "cause"), false, runtime.name);
        return true;
      });
      const networkStatus = `${tools.importErrorCategory(networkFailure)}: ${tools.safeSourceLabel(credentialUrl)}. ${tools.importErrorSummary(networkFailure)}`;
      feedback.setUrlLoadStatus(networkStatus, "error");
      const visibleNetworkStatus = feedback.status.textContent;
      parseHarness.captured.push(["[ProviderHub] URL import diagnostic", feedback.makeDiagnostic(credentialUrl, tools.importErrorCategory(networkFailure))]);

      const capturedText = JSON.stringify(parseHarness.captured) + visibleParseStatus + visibleNetworkStatus;
      for (const marker of markers) {
        assert.equal(capturedText.includes(marker), false, `${runtime.name}: captured ${marker}`);
      }
      assert.match(networkStatus, /cross-origin requests/, runtime.name);
      assert.match(networkStatus, /may still have received the request/, runtime.name);
      assert.match(parseStatus, /not valid JSON/, runtime.name);
      assert.equal(parseHarness.captured[0][1].category, "Invalid JSON", runtime.name);
      assert.equal(Object.hasOwn(parseHarness.captured[0][1], "stack"), false, runtime.name);
      assert.equal(Object.hasOwn(parseHarness.captured[0][1], "successfullyImported"), false, runtime.name);

      const logSanitizerSource = sourceBlock(js, "  function safeLogArgs(args) {", "  function log() {");
      const safeLogArgs = new Function(`${logSanitizerSource}; return safeLogArgs;`)();
      assert.equal(JSON.stringify(safeLogArgs(["diagnostic", new Error("SYNTH_TOKEN")])).includes("SYNTH_TOKEN"), false, runtime.name);

      const loadHandler = sourceBlock(
        js,
        "  btnLoadUrl.addEventListener('click', async () => {",
        "  /* ---------- Live Details editor ---------- */",
      );
      assert.match(loadHandler, /safeSourceLabel\(submittedUrl\.href\)/, runtime.name);
      assert.match(loadHandler, /importErrorSummary\(error\)/, runtime.name);
      assert.doesNotMatch(loadHandler, /error\.message|error\.stack|successList/, runtime.name);
      assert.doesNotMatch(loadHandler, /console\.(?:log|warn|error)\([^;]*(?:sourceUrl|submittedUrl\.href)/, runtime.name);
      const stagedDirectoryImport = loadHandler.indexOf("stagedImports.push({ payload, sourceUrl: source.sourceUrl });");
      const atomicDirectorySave = loadHandler.indexOf("const importedResults = await upsertRemoteImportsAtomically(stagedImports);");
      assert.ok(stagedDirectoryImport >= 0 && atomicDirectorySave > stagedDirectoryImport, runtime.name);
      assert.doesNotMatch(loadHandler.slice(0, atomicDirectorySave), /await upsertRemoteImport\(/, runtime.name);
    });
  }
});

describe("directory import origin policy", () => {
  for (const runtime of RUNTIMES) {
    it(`${runtime.name}: shows a query-free, keyboard-accessible origin confirmation`, async () => {
      const js = read(runtime.jsPath);
      const html = read(runtime.htmlPath);
      assert.match(html, /id="originPolicyModal" role="dialog" aria-modal="true"/);
      assert.match(html, /aria-labelledby="originPolicyTitle" aria-describedby="originPolicyHelp"/);
      assert.match(html, /id="originPolicyList" aria-label="Origins awaiting approval"/);
      assert.match(html, /id="originPolicyCancel"[^>]*>Cancel import/);
      assert.match(html, /id="originPolicySkip"[^>]*>Skip external origins/);
      assert.match(html, /id="originPolicyAllow"[^>]*disabled>Continue with selected/);

      const promptSource = sourceBlock(js, "  function requestExternalOriginApproval(origins, signal) {", "  async function ensureImportOriginsAllowed(");
      assert.match(promptSource, /text\.textContent = origin/);
      assert.match(promptSource, /event\.key === 'Escape'/);
      assert.match(promptSource, /event\.key !== 'Tab'/);
      assert.match(promptSource, /event\.shiftKey/);
      assert.match(promptSource, /first\.focus\(\)/);
      assert.match(promptSource, /last\.focus\(\)/);
      assert.match(promptSource, /opener\.focus\(\)/);
      assert.doesNotMatch(promptSource, /\.search|\.href\s*=\s*origin/);
      const transport = sourceBlock(js, "  const MAX_IMPORT_ORIGINS = 8;", "  function parseDirectoryDocument(");
      assert.match(transport, /credentials: currentOrigin === window\.location\.origin \? 'same-origin' : 'omit'/);
      assert.match(transport, /redirect: 'manual'/);
      assert.match(transport, /MAX_IMPORT_FILES = 100/);
      assert.match(transport, /MAX_IMPORT_MANIFESTS = 20/);
      const loadHandler = sourceBlock(js, "  btnLoadUrl.addEventListener('click', async () => {", "  /* ---------- Live Details editor ---------- */");
      assert.match(loadHandler, /No files were imported; existing datasets are unchanged/);
      assert.match(loadHandler, /completed import\(s\) were retained/);
    });
  }

  it("requires a deliberate origin choice and traps keyboard focus until cancel or approval", async () => {
    const js = read(V14_PROVIDER_JS);
    const promptSource = sourceBlock(js, "  function requestExternalOriginApproval(origins, signal) {", "  async function ensureImportOriginsAllowed(");

    class FakeElement {
      constructor(owner, tagName) {
        this.owner = owner;
        this.tagName = tagName;
        this.children = [];
        this.attributes = {};
        this.listeners = new Map();
        this.classNames = new Set();
        this.classList = {
          add: name => this.classNames.add(name),
          remove: name => this.classNames.delete(name),
          contains: name => this.classNames.has(name),
        };
        this.offsetParent = {};
        this.disabled = false;
        this.checked = false;
        this.isConnected = true;
        this.value = "";
        this._text = "";
      }
      setAttribute(name, value) { this.attributes[name] = String(value); }
      append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
      appendChild(node) { this.children.push(node); return node; }
      replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
      addEventListener(name, callback) {
        if (!this.listeners.has(name)) this.listeners.set(name, new Set());
        this.listeners.get(name).add(callback);
      }
      removeEventListener(name, callback) { this.listeners.get(name)?.delete(callback); }
      dispatch(name, event = {}) {
        for (const callback of this.listeners.get(name) || []) callback({ target: this, preventDefault() {}, stopPropagation() {}, ...event });
      }
      focus() { this.owner.activeElement = this; }
      descendants() { return this.children.flatMap(child => [child, ...child.descendants()]); }
      querySelectorAll(selector) {
        const elements = this.descendants();
        if (selector === 'input[type="checkbox"]') return elements.filter(element => element.tagName === "input" && element.type === "checkbox");
        if (selector === 'input[type="checkbox"], button') return elements.filter(element => (element.tagName === "input" && element.type === "checkbox") || element.tagName === "button");
        return [];
      }
      querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
      get textContent() { return this._text + this.children.map(child => child.textContent).join(""); }
      set textContent(value) { this._text = String(value); this.children = []; }
    }

    const document = {
      activeElement: null,
      createElement(tagName) { return new FakeElement(this, tagName); },
      getElementById(id) { return this.elements.get(id); },
      elements: new Map(),
    };
    const modal = new FakeElement(document, "div");
    const list = new FakeElement(document, "ul");
    const allow = new FakeElement(document, "button");
    const skip = new FakeElement(document, "button");
    const cancel = new FakeElement(document, "button");
    const opener = new FakeElement(document, "button");
    document.elements.set("originPolicyModal", modal);
    document.elements.set("originPolicyList", list);
    document.elements.set("originPolicyAllow", allow);
    document.elements.set("originPolicySkip", skip);
    document.elements.set("originPolicyCancel", cancel);
    modal.append(list, cancel, skip, allow);
    document.activeElement = opener;

    const requestApproval = new Function("document", `${promptSource}; return requestExternalOriginApproval;`)(document);
    const firstSignal = new AbortController().signal;
    const firstDecision = requestApproval(["https://feed.example.test"], firstSignal);
    const checkbox = list.querySelector('input[type="checkbox"]');
    assert.ok(checkbox);
    assert.equal(checkbox.checked, false);
    assert.equal(allow.disabled, true);
    assert.equal(modal.classList.contains("open"), true);
    assert.equal(modal.attributes["aria-hidden"], "false");
    assert.equal(list.textContent, "https://feed.example.test");

    skip.focus();
    let tabPrevented = false;
    modal.dispatch("keydown", { key: "Tab", shiftKey: false, preventDefault() { tabPrevented = true; } });
    assert.equal(tabPrevented, true);
    assert.equal(document.activeElement, checkbox);
    let shiftTabPrevented = false;
    modal.dispatch("keydown", { key: "Tab", shiftKey: true, preventDefault() { shiftTabPrevented = true; } });
    assert.equal(shiftTabPrevented, true);
    assert.equal(document.activeElement, skip);

    checkbox.checked = true;
    checkbox.dispatch("change");
    assert.equal(allow.disabled, false);
    allow.dispatch("click");
    const accepted = await firstDecision;
    assert.deepEqual(Array.from(accepted.approvedOrigins), ["https://feed.example.test"]);
    assert.equal(document.activeElement, opener);

    const secondDecision = requestApproval(["https://other.example.test"], new AbortController().signal);
    modal.dispatch("keydown", { key: "Escape" });
    assert.equal((await secondDecision).cancelled, true);
    assert.equal(modal.attributes["aria-hidden"], "true");
    assert.equal(document.activeElement, opener);
  });

  it("gates duplicate cross-origin links before the first request and omits credentials", async () => {
    const observations = [];
    let fileServer;
    fileServer = await startControlledServer((request, response) => {
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ items: [{ name: "Controlled fixture" }] }));
    });
    const listingServer = await startControlledServer((request, response) => {
      response.setHeader("Content-Type", "text/html; charset=utf-8");
      if (request.url.startsWith("/denied/")) {
        response.end(`<a href="${fileServer.baseUrl}/providers.json?tracker=SYNTH_QUERY_SECRET"></a>`);
        return;
      }
      response.end(`<a href="${fileServer.baseUrl}/providers.json?tracker=SYNTH_QUERY_SECRET"></a><a href="${fileServer.baseUrl}/providers.json?tracker=SYNTH_QUERY_SECRET#duplicate"></a>`);
    });
    try {
      const js = read(V14_PROVIDER_JS);
      const harness = directoryImportHarnessFor(js, credentialObservingFetch(observations));
      const controller = new AbortController();
      const policy = harness.createImportOriginPolicy(`${listingServer.baseUrl}/directory/`);
      const approvals = [];
      const approve = async origins => {
        approvals.push(origins.slice());
        assert.equal(fileServer.requests.length, 0, "the external origin must not be contacted before its choice");
        return { approvedOrigins: new Set(origins), cancelled: false };
      };

      const discovered = await harness.discoverDirectoryJson(`${listingServer.baseUrl}/directory/`, controller.signal, policy, approve);
      assert.deepEqual(discovered.jsonUrls, [`${fileServer.baseUrl}/providers.json?tracker=SYNTH_QUERY_SECRET`]);
      assert.deepEqual(approvals, [[fileServer.baseUrl]]);
      assert.equal(fileServer.requests.length, 0, "discovery only asks for consent; file requests start afterward");
      assert.equal(JSON.stringify(approvals).includes("SYNTH_QUERY_SECRET"), false);

      const response = await harness.fetchText(discovered.jsonUrls[0], controller.signal, "fetching a discovered JSON file", policy, approve);
      assert.match(response.text, /Controlled fixture/);
      assert.equal(fileServer.requests.length, 1, "duplicate links produce one request");
      assert.equal(fileServer.requests[0].headers.cookie, undefined);
      assert.equal(observations.find(item => item.url.startsWith(fileServer.baseUrl)).credentials, "omit");
      assert.equal(observations.find(item => item.url.startsWith(fileServer.baseUrl)).redirect, "manual");

      const existingDatasets = [{ id: 1, name: "Keep this local dataset" }];
      const before = structuredClone(existingDatasets);
      const deniedPolicy = harness.createImportOriginPolicy(`${listingServer.baseUrl}/denied/`);
      const rejected = await harness.discoverDirectoryJson(`${listingServer.baseUrl}/denied/`, controller.signal, deniedPolicy, async origins => {
        assert.equal(fileServer.requests.length, 1, "a rejected origin must receive no request");
        assert.deepEqual(origins, [fileServer.baseUrl]);
        return { approvedOrigins: new Set(), cancelled: false };
      });
      assert.deepEqual(rejected.jsonUrls, []);
      assert.equal(rejected.failures[0].error.code, "ORIGIN_DENIED");
      assert.deepEqual(existingDatasets, before, "rejecting discovery leaves existing data unchanged");
      assert.equal(fileServer.requests.length, 1);

      const canceledPolicy = harness.createImportOriginPolicy(`${listingServer.baseUrl}/denied/`);
      await assert.rejects(
        harness.discoverDirectoryJson(`${listingServer.baseUrl}/denied/`, controller.signal, canceledPolicy, async () => ({ approvedOrigins: new Set(), cancelled: true })),
        error => error.code === "ORIGIN_PROMPT_CANCELLED",
      );
      assert.equal(fileServer.requests.length, 1, "canceling the origin prompt also sends no request");
      assert.deepEqual(existingDatasets, before, "canceling discovery leaves existing data unchanged");
    } finally {
      await Promise.all([listingServer.close(), fileServer.close()]);
    }
  });

  it("rechecks cross-origin redirects before following and skips malformed manifests", async () => {
    const observations = [];
    let listingServer;
    let fileServer;
    fileServer = await startControlledServer((request, response) => {
      response.setHeader("Access-Control-Allow-Origin", "*");
      if (request.url.startsWith("/bad-manifest.json")) {
        response.setHeader("Content-Type", "application/json");
        response.end("{ malformed manifest");
        return;
      }
      response.setHeader("Content-Type", "application/json");
      response.end(JSON.stringify({ items: [{ name: "Redirect fixture" }] }));
    });
    listingServer = await startControlledServer((request, response) => {
      if (request.url === "/redirect/") {
        response.setHeader("Content-Type", "text/html");
        response.end('<a href="/redirect.json"></a>');
        return;
      }
      if (request.url.startsWith("/redirect.json")) {
        response.writeHead(302, { Location: `${fileServer.baseUrl}/redirected.json` });
        response.end();
        return;
      }
      if (request.url === "/denied-redirect/") {
        response.setHeader("Content-Type", "text/html");
        response.end('<a href="/denied-redirect.json"></a>');
        return;
      }
      if (request.url.startsWith("/denied-redirect.json")) {
        response.writeHead(302, { Location: `${fileServer.baseUrl}/redirected.json` });
        response.end();
        return;
      }
      if (request.url === "/malformed/") {
        response.setHeader("Content-Type", "text/html");
        response.end(`<link rel="manifest" href="${fileServer.baseUrl}/bad-manifest.json?sig=SYNTH_QUERY_SECRET">`);
        return;
      }
      response.writeHead(404);
      response.end();
    });
    try {
      const harness = directoryImportHarnessFor(read(V14_PROVIDER_JS), credentialObservingFetch(observations));
      const signal = new AbortController().signal;
      const redirectPolicy = harness.createImportOriginPolicy(`${listingServer.baseUrl}/redirect/`);
      const redirectDiscovery = await harness.discoverDirectoryJson(`${listingServer.baseUrl}/redirect/`, signal, redirectPolicy, async origins => {
        throw new Error(`No file origin is expected during listing discovery: ${origins.join(",")}`);
      });
      assert.deepEqual(redirectDiscovery.jsonUrls, [`${listingServer.baseUrl}/redirect.json`]);
      let redirectPromptSawNoTargetRequest = false;
      const followed = await harness.fetchText(redirectDiscovery.jsonUrls[0], signal, "fetching a discovered JSON file", redirectPolicy, async origins => {
        assert.deepEqual(origins, [fileServer.baseUrl]);
        redirectPromptSawNoTargetRequest = fileServer.requests.length === 0;
        return { approvedOrigins: new Set(origins), cancelled: false };
      });
      assert.equal(redirectPromptSawNoTargetRequest, true);
      assert.equal(followed.responseUrl, `${fileServer.baseUrl}/redirected.json`);
      assert.equal(fileServer.requests.length, 1);
      assert.equal(fileServer.requests[0].headers.cookie, undefined);

      const deniedPolicy = harness.createImportOriginPolicy(`${listingServer.baseUrl}/denied-redirect/`);
      const deniedDiscovery = await harness.discoverDirectoryJson(`${listingServer.baseUrl}/denied-redirect/`, signal, deniedPolicy, async () => ({ approvedOrigins: new Set(), cancelled: false }));
      await assert.rejects(
        harness.fetchText(deniedDiscovery.jsonUrls[0], signal, "fetching a discovered JSON file", deniedPolicy, async origins => {
          assert.deepEqual(origins, [fileServer.baseUrl]);
          assert.equal(fileServer.requests.length, 1, "redirect target stays untouched until approval");
          return { approvedOrigins: new Set(), cancelled: false };
        }),
        error => error.code === "ORIGIN_DENIED",
      );
      assert.equal(fileServer.requests.length, 1);

      const opaqueRequests = [];
      const opaqueHarness = directoryImportHarnessFor(read(V14_PROVIDER_JS), async (url, options) => {
        opaqueRequests.push({ url, options });
        return { type: "opaqueredirect", status: 0 };
      });
      const opaquePolicy = opaqueHarness.createImportOriginPolicy("https://remote.example.test/opaque.json");
      await assert.rejects(
        opaqueHarness.fetchText("https://remote.example.test/opaque.json", signal, "fetching the JSON file", opaquePolicy, async () => {
          throw new Error("An opaque redirect must not prompt with a hidden destination");
        }),
        error => error.code === "REDIRECT_UNVERIFIED",
      );
      assert.equal(opaqueRequests.length, 1, "an opaque redirect is stopped before any follow-up request");

      const malformedPolicy = harness.createImportOriginPolicy(`${listingServer.baseUrl}/malformed/`);
      const malformed = await harness.discoverDirectoryJson(`${listingServer.baseUrl}/malformed/`, signal, malformedPolicy, async origins => {
        assert.deepEqual(origins, [fileServer.baseUrl]);
        return { approvedOrigins: new Set(origins), cancelled: false };
      });
      assert.deepEqual(malformed.jsonUrls, []);
      assert.equal(malformed.failures[0].error.code, "JSON_PARSE");
      assert.equal(fileServer.requests.filter(request => request.url.startsWith("/bad-manifest.json")).length, 1);
      assert.equal(fileServer.requests.every(request => request.headers.cookie === undefined), true);
      assert.equal(observations.filter(item => item.url.startsWith(fileServer.baseUrl)).every(item => item.credentials === "omit"), true);

      const beforeCorsCount = fileServer.requests.length;
      const corsObservations = [];
      const baseFetch = credentialObservingFetch(corsObservations);
      const corsHarness = directoryImportHarnessFor(read(V14_PROVIDER_JS), async (url, options) => {
        const response = await baseFetch(url, options);
        if (new URL(url).origin === fileServer.baseUrl) {
          await response.arrayBuffer();
          throw new TypeError("Synthetic CORS response rejection after the server received the request");
        }
        return response;
      });
      const corsPolicy = corsHarness.createImportOriginPolicy(`${listingServer.baseUrl}/cors/`);
      const corsTools = remoteToolsFor(read(V14_PROVIDER_JS));
      await assert.rejects(
        corsHarness.fetchText(`${fileServer.baseUrl}/cors.json`, signal, "fetching a discovered JSON file", corsPolicy, async origins => ({ approvedOrigins: new Set(origins), cancelled: false })),
        error => error.code === "NETWORK_OR_CORS",
      );
      assert.equal(fileServer.requests.length, beforeCorsCount + 1, "a CORS read failure can happen after the request was sent");
      assert.equal(fileServer.requests.at(-1).headers.cookie, undefined);
      assert.match(corsTools.importErrorSummary({ code: "NETWORK_OR_CORS" }), /may still have received the request/);
    } finally {
      await Promise.all([listingServer.close(), fileServer.close()]);
    }
  });

  it("keeps direct JSON and same-origin manifest imports working without an extra prompt", async () => {
    const observations = [];
    const server = await startControlledServer((request, response) => {
      response.setHeader("Access-Control-Allow-Origin", "*");
      if (request.url === "/same/manifest.json") {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ files: ["/same/local.json"] }));
      } else if (request.url === "/same/" ) {
        response.setHeader("Content-Type", "text/html");
        response.end('<link rel="manifest" href="/same/manifest.json">');
      } else {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify({ items: [{ name: "Local fixture" }] }));
      }
    });
    try {
      const harness = directoryImportHarnessFor(read(V14_PROVIDER_JS), credentialObservingFetch(observations), `${server.baseUrl}/app/`);
      const signal = new AbortController().signal;
      const denyUnexpectedPrompt = async origins => { throw new Error(`No confirmation should be needed: ${origins.join(",")}`); };
      const directPolicy = harness.createImportOriginPolicy(`${server.baseUrl}/direct.json`);
      const direct = await harness.fetchText(`${server.baseUrl}/direct.json`, signal, "fetching the JSON file", directPolicy, denyUnexpectedPrompt);
      assert.match(direct.text, /Local fixture/);

      const directoryUrl = `${server.baseUrl}/same/`;
      const sameOriginPolicy = harness.createImportOriginPolicy(directoryUrl);
      const discovery = await harness.discoverDirectoryJson(directoryUrl, signal, sameOriginPolicy, denyUnexpectedPrompt);
      assert.deepEqual(discovery.jsonUrls, [`${server.baseUrl}/same/local.json`]);
      const file = await harness.fetchText(discovery.jsonUrls[0], signal, "fetching a discovered JSON file", sameOriginPolicy, denyUnexpectedPrompt);
      assert.match(file.text, /Local fixture/);
      assert.equal(server.requests.filter(request => request.url === "/same/manifest.json").length, 1);
      assert.equal(server.requests.filter(request => request.url === "/same/local.json").length, 1);
      assert.equal(observations.every(item => item.credentials === "same-origin"), true, "same-origin imports keep their existing credential behavior");
    } finally {
      await server.close();
    }
  });

  it("bounds discovered origins, manifests, and JSON files", () => {
    const harness = directoryImportHarnessFor(read(V14_PROVIDER_JS), fetch);
    const filePolicy = harness.createImportOriginPolicy("https://directory.example.test/");
    const fileCandidates = Array.from({ length: 105 }, (_, index) => `https://directory.example.test/files/${index}.json`);
    assert.equal(harness.limitImportUrls(fileCandidates, filePolicy, "file").length, 100);
    assert.match(Array.from(filePolicy.limitMessages).join(" "), /additional JSON file link/);

    const manifestPolicy = harness.createImportOriginPolicy("https://directory.example.test/");
    const manifests = Array.from({ length: 25 }, (_, index) => `https://directory.example.test/manifests/${index}.json`);
    assert.equal(harness.limitImportUrls(manifests, manifestPolicy, "manifest").length, 20);
    assert.match(Array.from(manifestPolicy.limitMessages).join(" "), /additional manifest link/);

    const originPolicy = harness.createImportOriginPolicy("https://directory.example.test/");
    const manyOrigins = Array.from({ length: 10 }, (_, index) => `https://origin-${index}.example.test/data.json`);
    const bounded = harness.limitImportUrls(manyOrigins, originPolicy, "file");
    assert.equal(bounded.length, 7, "the user-entered origin plus seven discovered origins reaches the eight-origin cap");
    assert.equal(originPolicy.seenOrigins.size, 8);
    assert.equal(originPolicy.deniedOrigins.size, 3);
  });

  it("keeps response-body network or CORS failures in the existing safe category", async () => {
    const js = read(V14_PROVIDER_JS);
    const tools = remoteToolsFor(js);
    const fetchText = fetchTextFor(js, async () => ({
      ok: true,
      status: 200,
      type: "cors",
      url: "https://feed.example.test/providers.json?token=SYNTH_QUERY_SECRET",
      headers: { get: name => name === "content-type" ? "application/json" : null },
      body: new ReadableStream({ start(controller) { controller.error(new TypeError("SYNTH_READ_FAILURE")); } }),
    }));
    await assert.rejects(fetchText("https://feed.example.test/providers.json?token=SYNTH_QUERY_SECRET", null, "fetching the JSON file"), error => {
      assert.equal(error.code, "NETWORK_OR_CORS");
      assert.equal(tools.importErrorCategory(error), "Network or CORS failure");
      assert.match(tools.importErrorSummary(error), /may still have received the request/);
      assert.doesNotMatch(error.message, /SYNTH_/);
      return true;
    });
  });
});

describe("bounded local and remote imports", () => {
  for (const runtime of RUNTIMES) {
    it(`${runtime.name}: accepts a local file at 10 MiB and rejects one byte above before reading`, async () => {
      let readCalls = 0;
      class ImmediateFileReader {
        static LOADING = 1;
        constructor() { this.readyState = 0; }
        readAsText(file) {
          readCalls += 1;
          this.readyState = 2;
          this.result = file.text;
          queueMicrotask(() => this.onload && this.onload({ target: this }));
        }
        abort() { this.readyState = 2; if (this.onabort) this.onabort(); }
      }

      const source = read(runtime.jsPath);
      const limits = importBoundaryHelpersFor(source, ImmediateFileReader);
      const text = exactSizeImportJson(limits.MAX_IMPORT_FILE_BYTES, limits.MAX_IMPORT_FIELD_CHARS);
      const file = { name: "exact-limit.json", size: limits.MAX_IMPORT_FILE_BYTES, text };
      const byteBudget = { bytesRead: 0 };
      const loadedText = await limits.readLocalFileText(file, new AbortController().signal, byteBudget);
      const parsed = limits.parseImportJson(loadedText, file.name);
      assert.equal(normalizerFor(source)(parsed, "exact-limit", file.name).items.length, 0);
      assert.equal(Buffer.byteLength(loadedText, "utf8"), limits.MAX_IMPORT_FILE_BYTES);
      assert.equal(byteBudget.bytesRead, limits.MAX_IMPORT_FILE_BYTES);
      assert.equal(readCalls, 1);

      await assert.rejects(
        limits.readLocalFileText({ name: "over-limit.json", size: limits.MAX_IMPORT_FILE_BYTES + 1, text: "not read" }, new AbortController().signal, { bytesRead: 0 }),
        error => error.code === "IMPORT_LIMIT_FILE_BYTES" && error.measured === limits.MAX_IMPORT_FILE_BYTES + 1,
      );
      assert.equal(readCalls, 1, "the oversized file is rejected before FileReader starts");

      let canceled = false;
      class PendingFileReader {
        static LOADING = 1;
        constructor() { this.readyState = 0; }
        readAsText() { this.readyState = PendingFileReader.LOADING; }
        abort() {
          canceled = true;
          this.readyState = 2;
          if (this.onabort) this.onabort();
        }
      }
      const cancelLimits = importBoundaryHelpersFor(source, PendingFileReader);
      const controller = new AbortController();
      const pendingRead = cancelLimits.readLocalFileText(
        { name: "cancel-me.json", size: 10, text: "{}" },
        controller.signal,
        { bytesRead: 0 },
      );
      controller.abort();
      await assert.rejects(pendingRead, error => error.name === "AbortError");
      assert.equal(canceled, true, "cancellation aborts an active FileReader immediately");
    });

    it(`${runtime.name}: enforces file, total-byte, record, field, and nesting boundaries`, () => {
      class UnusedFileReader { static LOADING = 1; }
      const source = read(runtime.jsPath);
      const limits = importBoundaryHelpersFor(source, UnusedFileReader);
      const localFilesAtLimit = Array.from({ length: limits.MAX_IMPORT_FILES }, (_, index) => ({ name: `small-${index}.json`, size: 0 }));
      assert.equal(limits.validateLocalFileBatch(localFilesAtLimit).fileCount, limits.MAX_IMPORT_FILES);
      assert.throws(
        () => limits.validateLocalFileBatch([...localFilesAtLimit, { name: "too-many.json", size: 0 }]),
        error => error.code === "IMPORT_LIMIT_FILES" && error.measured === limits.MAX_IMPORT_FILES + 1,
      );
      const totalAtLimit = [
        { name: "a.json", size: limits.MAX_IMPORT_FILE_BYTES },
        { name: "b.json", size: limits.MAX_IMPORT_FILE_BYTES },
        { name: "c.json", size: 5 * 1024 * 1024 },
      ];
      assert.equal(limits.validateLocalFileBatch(totalAtLimit).totalBytes, limits.MAX_IMPORT_TOTAL_BYTES);
      assert.throws(
        () => limits.validateLocalFileBatch([...totalAtLimit.slice(0, 2), { name: "c.json", size: 5 * 1024 * 1024 + 1 }]),
        error => error.code === "IMPORT_LIMIT_TOTAL_BYTES" && error.measured === limits.MAX_IMPORT_TOTAL_BYTES + 1,
      );

      const normalize = normalizerFor(source);
      const exactRecords = Array.from({ length: limits.MAX_IMPORT_RECORDS }, () => ({ name: "x" }));
      assert.equal(normalize({ items: exactRecords }, "records.json").items.length, limits.MAX_IMPORT_RECORDS);
      assert.throws(
        () => normalize({ items: [...exactRecords, { name: "one-too-many" }] }, "records.json"),
        error => error.code === "IMPORT_LIMIT_RECORDS" && error.measured === limits.MAX_IMPORT_RECORDS + 1,
      );

      const exactField = JSON.stringify({ items: [{ name: "x".repeat(limits.MAX_IMPORT_FIELD_CHARS) }] });
      assert.equal(limits.parseImportJson(exactField, "field.json").items[0].name.length, limits.MAX_IMPORT_FIELD_CHARS);
      assert.throws(
        () => limits.parseImportJson(JSON.stringify({ items: [{ name: "x".repeat(limits.MAX_IMPORT_FIELD_CHARS + 1) }] }), "field.json"),
        error => error.code === "IMPORT_LIMIT_FIELD" && error.measured === limits.MAX_IMPORT_FIELD_CHARS + 1,
      );

      const atDepth = '{"items":[{"deep":' + "[".repeat(limits.MAX_IMPORT_NESTING - 3) + "0" + "]".repeat(limits.MAX_IMPORT_NESTING - 3) + "}]}";
      assert.doesNotThrow(() => limits.parseImportJson(atDepth, "nested.json"));
      const overDepth = '{"items":[{"deep":' + "[".repeat(limits.MAX_IMPORT_NESTING - 2) + "0" + "]".repeat(limits.MAX_IMPORT_NESTING - 2) + "}]}";
      assert.throws(
        () => limits.parseImportJson(overDepth, "nested.json"),
        error => error.code === "IMPORT_LIMIT_DEPTH" && error.measured === limits.MAX_IMPORT_NESTING + 1,
      );
    });

    it(`${runtime.name}: streams unknown-length remote bodies, cancels at the byte cap, and stops promptly on abort`, async () => {
      const source = read(runtime.jsPath);
      const url = "https://feed.example.test/providers.json";
      let canceled = false;
      let textMethodCalled = false;
      const streamingResponse = byteLength => {
        let emitted = 0;
        canceled = false;
        return {
          ok: true,
          status: 200,
          type: "cors",
          url,
          headers: new Headers({ "content-type": "application/json" }),
          body: new ReadableStream({
            pull(controller) {
              if (emitted >= byteLength) { controller.close(); return; }
              const chunkLength = Math.min(64 * 1024, byteLength - emitted);
              emitted += chunkLength;
              controller.enqueue(new Uint8Array(chunkLength).fill(0x61));
            },
            cancel() { canceled = true; },
          }, { highWaterMark: 0 }),
          async text() { textMethodCalled = true; throw new Error("unbounded text path used"); },
        };
      };
      const fetchText = fetchTextFor(source, async () => streamingResponse(10 * 1024 * 1024));
      const atLimit = await fetchText(url, null, "reading a streamed fixture");
      assert.equal(atLimit.byteCount, 10 * 1024 * 1024);
      assert.equal(atLimit.text.length, 10 * 1024 * 1024);
      assert.equal(textMethodCalled, false);

      const overLimit = fetchTextFor(source, async () => streamingResponse(10 * 1024 * 1024 + 1));
      await assert.rejects(overLimit(url, null, "reading a streamed fixture"), error => {
        assert.equal(error.code, "IMPORT_LIMIT_FILE_BYTES");
        assert.equal(error.measured, 10 * 1024 * 1024 + 1);
        return true;
      });
      await new Promise(resolve => setImmediate(resolve));
      assert.equal(canceled, true, "the response reader is canceled as soon as a chunk crosses the cap");
      assert.equal(textMethodCalled, false);

      const aggregateBudget = { bytesRead: 25 * 1024 * 1024 - 1 };
      const aggregateFetch = fetchTextFor(source, async () => streamingResponse(2));
      await assert.rejects(
        aggregateFetch(url, null, "reading a multi-file fixture", undefined, undefined, aggregateBudget),
        error => error.code === "IMPORT_LIMIT_TOTAL_BYTES" && error.measured === 25 * 1024 * 1024 + 1,
      );
      await new Promise(resolve => setImmediate(resolve));
      assert.equal(canceled, true, "the shared remote byte budget cancels a source that crosses the aggregate cap");

      let abortCanceled = false;
      const pendingReader = {
        read() { return new Promise(() => {}); },
        cancel() { abortCanceled = true; return Promise.resolve(); },
        releaseLock() {},
      };
      const controller = new AbortController();
      const abortFetch = fetchTextFor(source, async () => ({
        ok: true,
        status: 200,
        type: "cors",
        url,
        headers: new Headers(),
        body: { getReader: () => pendingReader },
      }));
      const pending = abortFetch(url, controller.signal, "reading a pending fixture");
      await new Promise(resolve => setImmediate(resolve));
      controller.abort();
      await assert.rejects(pending, error => error.name === "AbortError");
      assert.equal(abortCanceled, true);

      const importHandler = sourceBlock(source, "  btnLoadUrl.addEventListener('click', async () => {", "  /* ---------- Live Details editor ---------- */");
      assert.match(importHandler, /stagedImports\.push\(\{ payload, sourceUrl: source\.sourceUrl \}\)/);
      assert.match(importHandler, /await upsertRemoteImportsAtomically\(stagedImports\)/);
      assert.doesNotMatch(importHandler, /await upsertRemoteImport\(payload, source\.sourceUrl\)/);
    });
  }

  it("keeps the browser responsive and preserves an existing dataset after an oversized local file is rejected", async t => {
    let chromium;
    try { ({ chromium } = await import("playwright")); }
    catch { t.skip("Playwright is not installed in this workspace."); return; }
    let browser;
    try { browser = await chromium.launch({ headless: true }); }
    catch (error) { t.skip("Chromium could not launch in this environment: " + error.message); return; }

    const files = new Set(["provider-hub.html", "provider-hub.css", "provider-hub.js", "sample-austin-directory.json", "style-catalog.json", "favicon.svg"]);
    const server = await startControlledServer((request, response) => {
      const pathname = new URL(request.url, "http://provider-hub.test").pathname;
      const name = pathname === "/" ? "provider-hub.html" : pathname.replace(/^\//, "");
      if (!files.has(name)) { response.writeHead(404); response.end(); return; }
      const contentType = name.endsWith(".html") ? "text/html" : name.endsWith(".css") ? "text/css" : name.endsWith(".json") ? "application/json" : name.endsWith(".svg") ? "image/svg+xml" : "text/javascript";
      response.writeHead(200, { "Content-Type": contentType });
      response.end(read(file("public", name)));
    });

    try {
      const page = await browser.newPage();
      const origin = new URL(server.baseUrl).origin;
      await page.route("**/*", async route => {
        if (new URL(route.request().url()).origin !== origin) {
          await route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
          return;
        }
        await route.continue();
      });
      await page.addInitScript(() => localStorage.setItem("providerHub_v12_demo_seeded", "1"));
      await page.goto(server.baseUrl + "/provider-hub.html", { waitUntil: "domcontentloaded" });
      const savedId = await page.evaluate(async () => {
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open("ProviderHubDB_v2", 1);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });
        return await new Promise((resolve, reject) => {
          const tx = db.transaction("datasets", "readwrite");
          const request = tx.objectStore("datasets").add({ prettyName: "Existing fixture", fileName: "existing", items: [], tags: [] });
          request.onerror = () => reject(request.error);
          request.onsuccess = () => { request.__savedId = request.result; };
          tx.oncomplete = () => resolve(request.__savedId);
          tx.onerror = () => reject(tx.error);
        });
      });

      await page.locator("#jsonInput").setInputFiles({ name: "oversized.json", mimeType: "application/json", buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 0x20) });
      const measured = await page.evaluate(() => (10 * 1024 * 1024 + 1).toLocaleString());
      await page.waitForFunction(expected => document.getElementById("urlLoadStatus").textContent.includes(expected), measured);
      await page.locator("#btnNewDataset").click();
      const result = await page.evaluate(async savedId => {
        await new Promise(resolve => requestAnimationFrame(() => resolve()));
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open("ProviderHubDB_v2", 1);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });
        return await new Promise((resolve, reject) => {
          const tx = db.transaction("datasets", "readonly");
          const request = tx.objectStore("datasets").getAll();
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve({
            existing: request.result.some(dataset => dataset.id === savedId && dataset.prettyName === "Existing fixture"),
            count: request.result.length,
            status: document.getElementById("urlLoadStatus").textContent,
            modalOpen: document.getElementById("metaModal").classList.contains("open")
          });
        });
      }, savedId);
      assert.equal(result.existing, true);
      assert.equal(result.count, 1, "the rejected file did not create any dataset records");
      assert.match(result.status, new RegExp(measured));
      assert.equal(result.modalOpen, true, "the page handles another user action immediately after rejection");
      await page.close();
    } finally {
      await browser.close();
      await server.close();
    }
  });
});
