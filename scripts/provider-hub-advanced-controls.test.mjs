import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep, extname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_ROOT = resolve(ROOT, "public");
const SCREENSHOTS_DIR = process.env.PROVIDER_HUB_SCREENSHOTS_DIR;
const targets = [{ name: "public source", root: SOURCE_ROOT }];

if (process.env.PROVIDER_HUB_STATIC_ROOT) {
  targets.push({
    name: "production build output",
    root: resolve(process.env.PROVIDER_HUB_STATIC_ROOT),
  });
}

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function verifySourceContract(root) {
  const html = readFileSync(join(root, "provider-hub.html"), "utf8");
  const script = readFileSync(join(root, "provider-hub.js"), "utf8");
  const entryRoute = readFileSync(join(ROOT, "src", "routes", "index.tsx"), "utf8");
  const scriptRefs = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map(
    match => new URL(match[1], "https://provider-hub.test/provider-hub.html").pathname,
  );
  const stylesheetRefs = [...html.matchAll(/<link\b[^>]*\brel\s*=\s*["']stylesheet["'][^>]*\bhref\s*=\s*["']([^"']+)["']/gi)].map(
    match => new URL(match[1], "https://provider-hub.test/provider-hub.html").pathname,
  );

  assert.match(entryRoute, /src=["']\/provider-hub\.html["']/);
  assert.deepEqual(scriptRefs, ["/provider-hub.js"]);
  assert.deepEqual(stylesheetRefs, ["/provider-hub.css"]);
  assert.doesNotMatch(html, /jquery|cloudflareinsights/i);
  assert.doesNotMatch(script, /jQuery|\$\s*\(/);
  assert.match(html, /id="btnAdvancedControls"[\s\S]*?aria-expanded="false"/);
  assert.match(html, /id="advancedControlsPanel"[^>]*\shidden(?:\s|>|=)/);
  assert.match(script, /function setupAdvancedControls\(\)/);
  assert.match(script, /panel\.hidden = !open/);
  assert.match(script, /toggle\.setAttribute\('aria-expanded', String\(open\)\)/);
  assert.match(script, /area\.addEventListener\('focusin'/);

  return { html, script };
}

function startStaticServer(root, { missingPaths = [] } = {}) {
  const requests = [];
  const missingPathSet = new Set(missingPaths);
  const server = createServer((request, response) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url ?? "/", "http://provider-hub.test").pathname);
    } catch {
      response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
      response.end("Bad Request");
      return;
    }

    if (missingPathSet.has(pathname)) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not Found");
      requests.push({ pathname, status: 404 });
      return;
    }

    const path = resolve(root, `.${pathname}`);
    const relativePath = relative(root, path);
    if (relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not Found");
      requests.push({ pathname, status: 404 });
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
      response.end("Method Not Allowed");
      requests.push({ pathname, status: 405 });
      return;
    }

    try {
      const body = readFileSync(path);
      const status = 200;
      requests.push({ pathname, status });
      response.writeHead(status, {
        "content-type": contentTypes[extname(path).toLowerCase()] ?? "application/octet-stream",
        "content-length": body.length,
        "x-content-type-options": "nosniff",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (error) {
      const status = error?.code === "ENOENT" ? 404 : 500;
      requests.push({ pathname, status });
      response.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
      response.end(status === 404 ? "Not Found" : "Static test server error");
    }
  });

  return new Promise((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      const address = server.address();
      resolvePromise({
        baseUrl: `http://127.0.0.1:${address.port}`,
        requests,
        close: () => new Promise((resolveClose, rejectClose) => {
          server.close(error => error ? rejectClose(error) : resolveClose());
        }),
      });
    });
  });
}

function simplifyInitiator(initiator) {
  if (!initiator) return null;
  const frame = initiator.stack?.callFrames?.[0];
  return {
    type: initiator.type ?? "unknown",
    url: frame?.url ?? initiator.url ?? null,
    functionName: frame?.functionName ?? null,
    lineNumber: frame?.lineNumber ?? initiator.lineNumber ?? null,
  };
}

async function watchBrowser(page, origin) {
  const failures = { console: [], blockedConsole: [], runtime: [], responses: [], requests: [], external: [] };
  const pendingInitiators = new Map();
  const requestInitiators = new WeakMap();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  cdp.on("Network.requestWillBeSent", event => {
    const queued = pendingInitiators.get(event.request.url) ?? [];
    queued.push(simplifyInitiator(event.initiator));
    pendingInitiators.set(event.request.url, queued);
  });
  page.on("request", request => {
    const queued = pendingInitiators.get(request.url());
    if (queued?.length) requestInitiators.set(request, queued.shift());
  });
  page.on("console", message => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (/ERR_BLOCKED_BY_CLIENT/i.test(text)) {
      failures.blockedConsole.push(text);
    } else {
      failures.console.push(text);
    }
  });
  page.on("pageerror", error => failures.runtime.push(error.message));
  page.on("response", response => {
    if (response.status() < 400 || new URL(response.url()).origin !== origin) return;
    failures.responses.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", request => {
    let frameUrl = "unavailable";
    try {
      frameUrl = request.frame().url();
    } catch {
      frameUrl = "unavailable";
    }
    const failure = {
      method: request.method(),
      url: request.url(),
      resourceType: request.resourceType(),
      frameUrl,
      initiator: requestInitiators.get(request) ?? null,
      error: request.failure()?.errorText ?? "failed",
    };
    if (new URL(request.url()).origin === origin) {
      failures.requests.push(failure);
    } else {
      failures.external.push(failure);
    }
  });
  failures.close = () => cdp.detach();
  return failures;
}

function assertBrowserHealthy(failures, testContext) {
  const identifiedBlockedRequests = [...failures.requests, ...failures.external]
    .filter(request => request.error.includes("ERR_BLOCKED_BY_CLIENT"));
  if (failures.blockedConsole.length > identifiedBlockedRequests.length) {
    failures.console.push("Unidentified ERR_BLOCKED_BY_CLIENT console message without a matching failed request.");
  }
  if (failures.external.length) {
    testContext.diagnostic(`External request failures with URL, frame, resource type, and initiator: ${JSON.stringify(failures.external)}`);
  }
  assert.deepEqual(failures.console, [], "application console errors");
  assert.deepEqual(failures.runtime, [], "uncaught browser errors");
  assert.deepEqual(failures.responses, [], "first-party HTTP errors");
  assert.deepEqual(failures.requests, [], "first-party failed requests");
}

async function assertDisclosureState(page, open) {
  const panel = page.locator("#advancedControlsPanel");
  const toggle = page.locator("#btnAdvancedControls");
  assert.equal(await panel.evaluate(element => element.hidden), !open);
  assert.equal(await panel.isVisible(), open);
  assert.equal(await toggle.getAttribute("aria-expanded"), String(open));
}

async function saveScreenshot(name, page) {
  if (!SCREENSHOTS_DIR) return;
  mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  await page.screenshot({ path: join(SCREENSHOTS_DIR, name), fullPage: false });
}

for (const target of targets) {
  describe(`Provider Hub advanced controls: ${target.name}`, () => {
    it("serves the active page and required assets at their request paths", async t => {
      assert.ok(existsSync(target.root), `static root exists: ${target.root}`);
      const { html } = verifySourceContract(target.root);
      const server = await startStaticServer(target.root);
      t.after(() => server.close());

      const expected = [
        ["/provider-hub.html", /^text\/html\b/],
        ["/provider-hub.css", /^text\/css\b/],
        ["/provider-hub.js", /^text\/(?:javascript|ecmascript)\b/],
        ["/style-catalog.json", /^application\/json\b/],
        ["/sample-austin-directory.json", /^application\/json\b/],
        ["/favicon.svg", /^image\/svg\+xml\b/],
      ];

      for (const [pathname, contentType] of expected) {
        const response = await fetch(server.baseUrl + pathname);
        assert.equal(response.status, 200, pathname);
        assert.match(response.headers.get("content-type") ?? "", contentType, pathname);
        const body = await response.text();
        if (pathname.endsWith(".js") || pathname.endsWith(".css")) {
          assert.doesNotMatch(body, /^\s*<!doctype html\b/i, `${pathname} is not an HTML fallback`);
        }
      }

      const missingScriptServer = await startStaticServer(target.root, {
        missingPaths: ["/provider-hub.js"],
      });
      t.after(() => missingScriptServer.close());
      const missingScript = await fetch(missingScriptServer.baseUrl + "/provider-hub.js");
      assert.equal(missingScript.status, 404, "the required script path reports a missing asset");
      assert.match(missingScript.headers.get("content-type") ?? "", /^text\/plain\b/);
      assert.doesNotMatch(await missingScript.text(), /^\s*<!doctype html\b/i);

      const missing = await fetch(server.baseUrl + "/missing-provider-hub-regression.js");
      assert.equal(missing.status, 404, "a missing script is not served as the app HTML fallback");
      assert.match(html, /id="urlInput"[\s\S]*?id="btnLoadUrl"/);
      assert.match(html, /class="display-settings"/);
      assert.match(html, /id="jsonInput"/);
      assert.match(html, /id="datasetSearch"/);
      assert.match(html, /id="datasetList"/);
      assert.match(html, /id="btnMobileMapToggle"/);

      if (target.name === "production build output" && process.env.PROVIDER_HUB_VERCEL_CONFIG) {
        const config = JSON.parse(readFileSync(process.env.PROVIDER_HUB_VERCEL_CONFIG, "utf8"));
        const routes = config.routes ?? [];
        const filesystemIndex = routes.findIndex(route => route.handle === "filesystem");
        const fallbackIndex = routes.findIndex(route => route.dest === "/__server");
        assert.ok(filesystemIndex >= 0, "Vercel output handles static files");
        assert.ok(fallbackIndex > filesystemIndex, "static files are routed before the server fallback");
      }
    });

    it("supports pointer, keyboard, and touch disclosure use without app asset errors", async t => {
      const server = await startStaticServer(target.root);
      t.after(() => server.close());

      let chromium;
      try {
        ({ chromium } = await import("playwright"));
      } catch {
        t.skip("Playwright is not installed in this workspace.");
        return;
      }

      let browser;
      try {
        browser = await chromium.launch({ headless: true });
      } catch (error) {
        t.skip(`Chromium could not launch in this environment: ${error.message}`);
        return;
      }
      t.after(() => browser.close());

      const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      const desktopOrigin = new URL(server.baseUrl).origin;
      const desktopFailures = await watchBrowser(desktop, desktopOrigin);
      const response = await desktop.goto(`${server.baseUrl}/provider-hub.html`, { waitUntil: "load" });
      assert.equal(response?.status(), 200);
      assert.equal(await desktop.title(), "Provider Hub v17");
      assert.equal((await desktop.locator(".logo h1").innerText()).trim().toLowerCase(), "provider hub");
      const toggle = desktop.locator("#btnAdvancedControls");
      await assertDisclosureState(desktop, false);

      await toggle.click();
      await assertDisclosureState(desktop, true);
      assert.equal(await desktop.locator("#urlInput").isVisible(), true);
      assert.equal(await desktop.locator("#btnLoadUrl").isVisible(), true);
      assert.equal(await desktop.locator("#modeSelect").isVisible(), true);
      assert.equal(await desktop.locator("#styleSelect").isVisible(), true);
      await saveScreenshot(`${target.name.replaceAll(" ", "-")}-desktop-open.png`, desktop);
      await toggle.click();
      await assertDisclosureState(desktop, false);

      const arrow = desktop.locator(".advanced-controls-caret");
      await arrow.click();
      await assertDisclosureState(desktop, true);
      await arrow.click();
      await assertDisclosureState(desktop, false);

      await desktop.evaluate(() => document.activeElement?.blur());
      await desktop.mouse.move(1200, 820);
      const toggleBounds = await toggle.boundingBox();
      assert.ok(toggleBounds);
      await desktop.mouse.move(
        toggleBounds.x + toggleBounds.width / 2,
        toggleBounds.y + toggleBounds.height / 2,
      );
      await desktop.waitForFunction(() => document.getElementById("advancedControlsPanel")?.hidden === false);
      await assertDisclosureState(desktop, true);
      await toggle.click();
      await assertDisclosureState(desktop, true);
      await toggle.click();
      await assertDisclosureState(desktop, false);

      await desktop.mouse.move(1200, 820);
      await desktop.mouse.move(
        toggleBounds.x + toggleBounds.width / 2,
        toggleBounds.y + toggleBounds.height / 2,
      );
      await desktop.waitForFunction(() => document.getElementById("advancedControlsPanel")?.hidden === false);
      await desktop.locator("#urlInput").focus();
      await desktop.mouse.move(1200, 820);
      await desktop.waitForTimeout(220);
      await assertDisclosureState(desktop, true);
      await desktop.locator("#btnSidebarCollapse").focus();
      await desktop.waitForFunction(() => document.getElementById("advancedControlsPanel")?.hidden === true);
      await assertDisclosureState(desktop, false);

      await desktop.locator("#btnSidebarCollapse").focus();
      await toggle.focus();
      await assertDisclosureState(desktop, true);
      await desktop.keyboard.press("Escape");
      await assertDisclosureState(desktop, false);
      assert.equal(await toggle.evaluate(element => document.activeElement === element), true);

      await desktop.keyboard.press("Enter");
      await assertDisclosureState(desktop, true);
      await desktop.keyboard.press("Tab");
      assert.equal(
        await desktop.locator("#advancedControlsArea").evaluate(element => element.contains(document.activeElement)),
        true,
        "keyboard focus can move into the open panel",
      );
      await desktop.keyboard.press("Escape");
      await assertDisclosureState(desktop, false);
      assert.equal(await toggle.evaluate(element => document.activeElement === element), true);

      await toggle.click();
      await desktop.locator("#btnCloseAdvancedControls").click();
      await assertDisclosureState(desktop, false);
      assert.equal(await toggle.evaluate(element => document.activeElement === element), true);

      const beforeImport = await desktop.locator("#datasetCount").innerText();
      const fixture = Buffer.from(JSON.stringify({
        prettyName: "Disclosure regression fixture",
        tags: ["regression"],
        items: [{ name: "Disclosure regression provider" }],
      }));
      await desktop.locator("#jsonInput").setInputFiles({
        name: "disclosure-regression.json",
        mimeType: "application/json",
        buffer: fixture,
      });
      await desktop.waitForFunction(() => document.getElementById("metaModal")?.classList.contains("open"));
      assert.match(await desktop.locator("#urlLoadStatus").innerText(), /Loaded disclosure-regression\.json/);
      await desktop.locator("#metaCancel").click();
      assert.equal(await desktop.locator("#metaModal").evaluate(element => element.classList.contains("open")), false);
      assert.equal(await desktop.locator("#datasetCount").innerText(), beforeImport, "canceling a staged file leaves datasets unchanged");

      const oversizedBytes = 10 * 1024 * 1024 + 1;
      await desktop.locator("#jsonInput").setInputFiles({
        name: "oversized-regression.json",
        mimeType: "application/json",
        buffer: Buffer.alloc(oversizedBytes, 0x20),
      });
      await desktop.waitForFunction(
        expected => document.getElementById("urlLoadStatus")?.textContent.includes(expected),
        oversizedBytes.toLocaleString(),
      );
      assert.match(await desktop.locator("#urlLoadStatus").innerText(), /limit is 10,485,760 bytes/);
      assert.equal(await desktop.locator("#datasetCount").innerText(), beforeImport, "an oversized file leaves datasets unchanged");

      await toggle.click();
      await assertDisclosureState(desktop, true);
      await desktop.locator("#urlInput").fill(`${server.baseUrl}/sample-austin-directory.json`);
      await desktop.locator("#btnLoadUrl").click();
      await desktop.waitForFunction(() => document.getElementById("metaModal")?.classList.contains("open"));
      assert.match(await desktop.locator("#urlLoadStatus").innerText(), /Loaded: 1/);
      await desktop.locator("#metaCancel").click();
      assert.equal(await desktop.locator("#datasetCount").innerText(), beforeImport, "canceling a staged URL import leaves datasets unchanged");

      const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
      const mobile = await mobileContext.newPage();
      const mobileFailures = await watchBrowser(mobile, desktopOrigin);
      const mobileResponse = await mobile.goto(`${server.baseUrl}/provider-hub.html`, { waitUntil: "load" });
      assert.equal(mobileResponse?.status(), 200);
      assert.equal(await mobile.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches), false);
      await assertDisclosureState(mobile, false);
      await mobile.waitForFunction(() => document.querySelector("#datasetList .dataset-card"));
      await mobile.locator("#datasetSearch").fill("Austin");
      await mobile.waitForFunction(() => document.querySelectorAll("#datasetList .dataset-card").length > 0);
      await mobile.locator("#datasetSearch").fill("no matching provider hub dataset");
      await mobile.waitForFunction(() => document.querySelectorAll("#datasetList .dataset-card").length === 0);
      await mobile.locator("#datasetSearch").fill("");
      await mobile.waitForFunction(() => document.querySelectorAll("#datasetList .dataset-card").length > 0);
      const mapToggle = mobile.locator("#btnMobileMapToggle");
      assert.equal(await mapToggle.isVisible(), true);
      await mapToggle.tap();
      assert.equal(await mapToggle.getAttribute("aria-expanded"), "true");
      assert.equal(await mobile.locator("#app").evaluate(element => element.classList.contains("mobile-map-open")), true);
      await mapToggle.tap();
      assert.equal(await mapToggle.getAttribute("aria-expanded"), "false");
      assert.equal(await mobile.locator("#app").evaluate(element => element.classList.contains("mobile-map-open")), false);
      await mobile.locator("#btnAdvancedControls").tap();
      await assertDisclosureState(mobile, true);
      await mobile.locator("#urlInput").fill("https://example.test/directory.json");
      assert.equal(await mobile.locator("#urlInput").inputValue(), "https://example.test/directory.json");
      await saveScreenshot(`${target.name.replaceAll(" ", "-")}-mobile-open.png`, mobile);
      await mobile.locator("#btnCloseAdvancedControls").tap();
      await assertDisclosureState(mobile, false);
      assert.equal(
        await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        true,
        "mobile viewport has no horizontal overflow",
      );

      const missingScriptServer = await startStaticServer(target.root, {
        missingPaths: ["/provider-hub.js"],
      });
      t.after(() => missingScriptServer.close());
      const failedScriptPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      const failedScriptFailures = await watchBrowser(
        failedScriptPage,
        new URL(missingScriptServer.baseUrl).origin,
      );
      const failedScriptDocument = await failedScriptPage.goto(
        `${missingScriptServer.baseUrl}/provider-hub.html`,
        { waitUntil: "load" },
      );
      assert.equal(failedScriptDocument?.status(), 200);
      const failedScriptUrl = `${missingScriptServer.baseUrl}/provider-hub.js`;
      assert.ok(
        failedScriptFailures.responses.includes(`404 ${failedScriptUrl}`),
        `the failed required script is reported with its full URL: ${failedScriptUrl}`,
      );
      await assertDisclosureState(failedScriptPage, false);
      await failedScriptPage.locator("#btnAdvancedControls").click();
      await assertDisclosureState(failedScriptPage, false);
      const statusText = (await failedScriptPage.locator('[role="status"]').allInnerTexts()).join(" ");
      assert.doesNotMatch(statusText, /Provider Hub (?:is )?(?:ready|initialized|loaded successfully)/i);
      assert.deepEqual(failedScriptFailures.runtime, [], "a missing script does not start partial application code");
      await failedScriptFailures.close();
      await failedScriptPage.close();

      const requestedPaths = server.requests.map(request => request.pathname);
      assert.ok(requestedPaths.includes("/provider-hub.js"), "active application script was served");
      assert.ok(requestedPaths.includes("/provider-hub.css"), "active stylesheet was served");
      assert.equal(
        requestedPaths.includes("/vendor/jquery-4.0.0.min.js"),
        false,
        "active page no longer requests jQuery",
      );
      assertBrowserHealthy(desktopFailures, t);
      assertBrowserHealthy(mobileFailures, t);
      await desktopFailures.close();
      await mobileFailures.close();
      await mobileContext.close();
      await desktop.close();
    });
  });
}

if (process.env.PROVIDER_HUB_APP_ORIGIN) {
  const appOrigin = new URL(process.env.PROVIDER_HUB_APP_ORIGIN).origin;
  describe(`Provider Hub host integration: ${appOrigin}`, () => {
    it("loads the root iframe and its JavaScript from the requested URL", async t => {
      let chromium;
      try {
        ({ chromium } = await import("playwright"));
      } catch {
        t.skip("Playwright is not installed in this workspace.");
        return;
      }

      let browser;
      try {
        browser = await chromium.launch({ headless: true });
      } catch (error) {
        t.skip(`Chromium could not launch in this environment: ${error.message}`);
        return;
      }
      t.after(() => browser.close());

      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      const failures = await watchBrowser(page, appOrigin);
      const responses = [];
      page.on("response", response => responses.push(response));
      const rootResponse = await page.goto(`${appOrigin}/`, { waitUntil: "load" });
      assert.equal(rootResponse?.status(), 200, "the application root route responds successfully");
      assert.equal(await page.locator("iframe").getAttribute("src"), "/provider-hub.html");

      const providerFrame = page.frames().find(frame => {
        try {
          return new URL(frame.url()).pathname === "/provider-hub.html";
        } catch {
          return false;
        }
      });
      assert.ok(providerFrame, "the root route embeds the standalone Provider Hub page");
      assert.equal(await providerFrame.title(), "Provider Hub v17");

      const scriptResponse = responses.find(response => {
        try {
          return new URL(response.url()).pathname === "/provider-hub.js";
        } catch {
          return false;
        }
      });
      assert.ok(scriptResponse, "the iframe requested provider-hub.js");
      assert.equal(scriptResponse.status(), 200);
      assert.match(scriptResponse.headers()["content-type"] ?? "", /^text\/(?:javascript|ecmascript)\b/);
      assert.doesNotMatch(await scriptResponse.text(), /^\s*<!doctype html\b/i);
      assert.equal(
        new URL(scriptResponse.request().frame().url()).pathname,
        "/provider-hub.html",
        "the script request belongs to the embedded Provider Hub document",
      );
      assertBrowserHealthy(failures, t);
      await failures.close();
      await page.close();
    });
  });
}
