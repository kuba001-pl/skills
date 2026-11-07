#!/usr/bin/env node
// Measure the UI problems a script can see, so the eye can focus on the rest.
//
//   ui-check.mjs <url> [<url>...] [--widths 375,768,1280] [--dark] [--out <dir>]
//
// For each URL and width: a full-page screenshot, axe-core WCAG A/AA
// violations, horizontal overflow, clipped text, console errors, small touch
// targets (at widths up to 480), and how many font sizes and off-scale spacing
// values are in use. Writes ui-check-<theme>.json and prints a summary. Exits 1 when a
// MUST rule fails (axe serious/critical, overflow, clipped text, console
// errors during load), else 0. Values over 64px are skipped as spacing
// (centering margins). Prefer an http URL: file:// blocks some checks.
// --dark only sets prefers-color-scheme. An app that switches theme with a
// class or a stored setting needs that set first, or "dark" shots are light. Installs playwright and axe-core into
// ~/.cache/ui-polish-check on first use.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i < 0 ? dflt : args.splice(i, 2)[1];
};
const dark = args.includes("--dark");
if (dark) args.splice(args.indexOf("--dark"), 1);
const widths = (opt("--widths", "375,768,1280") ?? "").split(",").map(Number);
const outArg = opt("--out", ".agent-work/evidence/ui-polish");
const urls = args;
const parses = (u) => { try { return !!new URL(u).protocol; } catch { return false; } };
if (!urls.length || !outArg || widths.some((w) => !w) || !urls.every(parses)) {
  console.error("usage: ui-check.mjs <url>... [--widths 375,768,1280] [--dark] [--out dir]");
  process.exit(2);
}
const out = resolve(outArg);

const cache = join(homedir(), ".cache", "ui-polish-check");
if (!existsSync(join(cache, "node_modules", "playwright"))) {
  mkdirSync(cache, { recursive: true });
  execFileSync("npm", ["install", "--prefix", cache, "--silent", "playwright@1", "axe-core@4"], { stdio: "inherit" });
}
const req = createRequire(join(cache, "package.json"));
const { chromium } = req("playwright");
const axePath = req.resolve("axe-core/axe.min.js");

let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  if (!/Executable doesn't exist/.test(e.message)) throw e;
  execFileSync(process.execPath, [join(cache, "node_modules", "playwright", "cli.js"), "install", "chromium"], { stdio: "inherit" });
  browser = await chromium.launch();
}

// Runs in the page. Returns layout facts the axe rules do not cover.
function measure(width) {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
  };
  const label = (el) =>
    el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") +
    (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "");
  // Skip visually hidden text (sr-only): it is clipped on purpose.
  const srOnly = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width <= 1 || r.height <= 1 || s.clip !== "auto";
  };
  const all = [...document.querySelectorAll("body *")].filter((el) => visible(el) && !srOnly(el));
  // Compare with the requested width: mobile Chrome widens the layout
  // viewport to fit overflowing content, so innerWidth would hide it.
  const overflowX = document.documentElement.scrollWidth - width;
  const pastEdge = all.filter((el) => el.getBoundingClientRect().right > width + 1).map(label);
  const clipped = all
    .filter((el) => {
      const s = getComputedStyle(el);
      return el.scrollWidth > el.clientWidth + 1 && /hidden|clip/.test(s.overflowX) &&
        s.textOverflow !== "ellipsis" && el.textContent.trim();
    })
    .map(label);
  const small = width > 480 ? [] : all
    .filter((el) => el.matches("button, input:not([type=hidden]), select, textarea, [role=button], nav a"))
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width < 44 || r.height < 44; })
    .map((el) => { const r = el.getBoundingClientRect(); return `${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`; });
  const fonts = new Set();
  const offScale = {};
  for (const el of all) {
    const s = getComputedStyle(el);
    if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) fonts.add(s.fontSize);
    for (const p of ["marginTop", "marginBottom", "marginLeft", "marginRight", "paddingTop", "paddingBottom",
      "paddingLeft", "paddingRight", "rowGap", "columnGap"]) {
      const v = parseFloat(s[p]);
      if (v > 2 && v <= 64 && v % 4) offScale[v + "px"] = (offScale[v + "px"] || 0) + 1;
    }
  }
  return {
    overflowX: Math.max(0, overflowX),
    pastEdge: pastEdge.slice(0, 10),
    clipped: clipped.slice(0, 10),
    smallTargets: small.slice(0, 10),
    noViewportMeta: !document.querySelector('meta[name=viewport]'),
    fontSizes: [...fonts].sort((a, b) => parseFloat(a) - parseFloat(b)),
    offScaleSpacing: offScale,
  };
}

mkdirSync(out, { recursive: true });
const results = [];
let failed = false;
const theme = dark ? "dark" : "light";
async function check(url, slug, width) {
  const mobile = width <= 480;
  const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile, colorScheme: theme });
  try {
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    // Pages that poll or hold a socket open never reach networkidle.
    await page.goto(url, { waitUntil: "load" });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    const shot = join(out, `${slug}-${width}-${theme}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    page.removeAllListeners("console");
    page.removeAllListeners("pageerror");
    await page.addScriptTag({ path: axePath });
    const axe = await page.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")) }));
    });
    const layout = await page.evaluate(measure, width);
    const must = [
      ...axe.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `axe ${v.id}: ${v.help} (${v.targets.join(", ")})`),
      ...(layout.overflowX ? [`page scrolls sideways by ${layout.overflowX}px (${layout.pastEdge.join(", ")})`] : []),
      ...(mobile && layout.noViewportMeta ? ["no <meta name=viewport>: phones render the desktop layout zoomed out"] : []),
      ...layout.clipped.map((c) => `clipped text: ${c}`),
      ...errors.map((e) => `console error: ${e}`),
    ];
    const should = [
      ...axe.filter((v) => v.impact !== "serious" && v.impact !== "critical").map((v) => `axe ${v.id}: ${v.help}`),
      ...layout.smallTargets.map((t) => `touch target under 44px: ${t}`),
      ...(layout.fontSizes.length > 7 ? [`${layout.fontSizes.length} font sizes in use: ${layout.fontSizes.join(" ")}`] : []),
      ...Object.entries(layout.offScaleSpacing).map(([v, n]) => `off the 4px scale: ${v} used ${n}x`),
    ];
    return { url, width, theme, screenshot: shot, must, should, fontSizes: layout.fontSizes };
  } catch (e) {
    return { url, width, theme, screenshot: null, must: [`could not check the page: ${e.message.split("\n")[0]}`], should: [] };
  } finally {
    await page.close();
  }
}

for (const [i, url] of urls.entries()) {
  // Index plus path, query, and hash, so /a/settings, /b/settings, and #/x differ.
  const u = new URL(url);
  const slug = `${i + 1}-${(u.pathname + u.search + u.hash).replace(/\.html?$/, "").replace(/[^\w-]+/g, "_").replace(/^_+|_+$/g, "") || "index"}`;
  for (const width of widths) {
    const r = await check(url, slug, width);
    failed ||= r.must.length > 0;
    results.push(r);
    console.log(`\n## ${url} at ${width}px (${theme}): ${r.must.length} MUST, ${r.should.length} SHOULD`);
    if (r.screenshot) console.log(`screenshot: ${r.screenshot}`);
    for (const m of r.must) console.log(`- MUST ${m}`);
    for (const s of r.should) console.log(`- SHOULD ${s}`);
  }
}
await browser.close();
writeFileSync(join(out, `ui-check-${theme}.json`), JSON.stringify(results, null, 2));
process.exit(failed ? 1 : 0);
