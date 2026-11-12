// Visits every app route with a mocked API and signed-in Admin+Customer profile,
// then records how far each page is from the app visual language (DESIGN.md A15): rounded/glass/legacy colors,
// kicker labels above headings, and the gap between the sticky top chrome and the first h1.
// Usage: node scripts/design-sweep.mjs <tag> [baseUrl] [routePrefixes without leading slash, comma-separated]
// Output: test-results/design-sweep/<tag>/{report.json,*.png}
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tag = process.argv[2] ?? "current";
const base = process.argv[3] ?? "http://localhost:3000";
// Prefixes are given without the leading slash (e.g. "admin,staff") so Git Bash does not rewrite them into paths.
const prefixes = (process.argv[4] ?? "").split(",").filter(Boolean).map((p) => "/" + p.replace(/^\/+/, ""));
const outDir = path.join(root, "test-results", "design-sweep", tag);
fs.mkdirSync(outDir, { recursive: true });

const SKIP = new Set(["/", "/dev/glyph-test"]);

function routesFromAppDir() {
  const appDir = path.join(root, "src", "app");
  const routes = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "page.tsx") {
        const rel = path.relative(appDir, dir).split(path.sep).filter((s) => !/^\(.*\)$/.test(s));
        const url = "/" + rel.map((s) => (/^\[.*\]$/.test(s) ? "1" : s)).join("/");
        if (!SKIP.has(url)) routes.push(url);
      }
    }
  };
  walk(appDir);
  return routes.sort();
}

// Each portal redirects users without its role, so the profile follows the route.
function rolesFor(route) {
  if (route.startsWith("/admin")) return ["Admin"];
  if (route.startsWith("/staff")) return ["Driver"];
  if (["/login", "/register", "/forgot-password"].includes(route)) return null;
  return ["Customer"];
}

async function mockApi(page, getRoute) {
  await page.route("**/api/**", (route) => {
    const p = new URL(route.request().url()).pathname;
    if (p.endsWith("/account/profile")) {
      const roles = rolesFor(getRoute());
      return roles
        ? route.fulfill({ json: { id: 1, fullName: "Kiểm Thử", email: "sweep@test.local", roles } })
        : route.fulfill({ status: 401, json: { title: "Unauthorized" } });
    }
    return route.fulfill({ json: { items: [], totalCount: 0, data: [] } });
  });
}

// Old A1–A13 colors that should disappear once a page follows the landing palette.
const LEGACY = {
  "rgb(180, 83, 9)": "amber",
  "rgb(146, 64, 14)": "amber-hover",
  "rgb(254, 243, 199)": "amber-tint",
  "rgb(250, 248, 245)": "td-paper",
  "rgb(251, 251, 249)": "canvas",
  "rgb(15, 23, 42)": "slate-ink",
};

function measure(legacy) {
  const isVisible = (el, r) => r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  let rounded = 0;
  let backdrop = 0;
  const legacyHits = {};
  const roundedSamples = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest("svg") || el.closest("nextjs-portal")) continue;
    const r = el.getBoundingClientRect();
    if (!isVisible(el, r)) continue;
    const cs = getComputedStyle(el);
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    const isDisc = radius >= Math.min(r.width, r.height) / 2 - 1 && Math.abs(r.width - r.height) <= 2;
    if (radius > 0.5 && !isDisc) {
      rounded++;
      if (roundedSamples.length < 5) roundedSamples.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`);
    }
    if (cs.backdropFilter && cs.backdropFilter !== "none") backdrop++;
    for (const prop of ["color", "backgroundColor", "borderTopColor"]) {
      const name = legacy[cs[prop]];
      if (name) legacyHits[name] = (legacyHits[name] ?? 0) + 1;
    }
  }
  // Kicker/eyebrow above a heading (impeccable craft floor bans it): a short, small, uppercase or tracked
  // label as the heading's previous visible sibling, or its parent's when the heading leads its block.
  const visible = (el) => { const r = el.getBoundingClientRect(); return isVisible(el, r); };
  const prevVisible = (el) => { let p = el.previousElementSibling; while (p && !visible(p)) p = p.previousElementSibling; return p; };
  const isKicker = (el) => {
    if (!el) return false;
    const text = el.textContent.trim();
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    const tracked = parseFloat(cs.letterSpacing) / fs > 0.04 || cs.textTransform === "uppercase";
    return text.length > 0 && text.length <= 60 && fs <= 14 && tracked && !el.querySelector("input,button,a,select,h1,h2,h3");
  };
  const kickers = [];
  for (const h of document.querySelectorAll("main h1, main h2")) {
    if (!visible(h) || h.closest("nextjs-portal")) continue;
    let k = prevVisible(h);
    if (!k && h.parentElement) k = prevVisible(h.parentElement);
    if (isKicker(k)) kickers.push({ text: k.textContent.trim().slice(0, 40), icon: !!k.querySelector("svg") });
  }
  // Gap between the bottom of the fixed/sticky top chrome and the first heading.
  let chromeBottom = 0;
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "sticky") continue;
    const r = el.getBoundingClientRect();
    if (r.top <= 1 && r.height > 0 && r.height < 240 && r.width > innerWidth / 2) chromeBottom = Math.max(chromeBottom, r.bottom);
  }
  const h1 = [...document.querySelectorAll("main h1, h1")].find(visible);
  const main = document.querySelector("main") ?? document.body;
  return {
    kickers,
    headGap: h1 ? Math.round(h1.getBoundingClientRect().top - chromeBottom) : null,
    scrollRatio: Math.round((document.documentElement.scrollHeight / innerHeight) * 100) / 100,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    mainBg: getComputedStyle(main).backgroundColor,
    h1Font: document.querySelector("h1") ? getComputedStyle(document.querySelector("h1")).fontFamily.split(",")[0] : null,
    rounded,
    roundedSamples,
    backdrop,
    legacyHits,
  };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
let current = "/";
await mockApi(page, () => current);
const report = {};
for (const route of routesFromAppDir().filter((r) => !prefixes.length || prefixes.some((p) => r.startsWith(p)))) {
  current = route;
  try {
    await page.context().clearCookies();
    await page.goto(base + route, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1500);
    report[route] = { finalUrl: new URL(page.url()).pathname, ...(await page.evaluate(measure, LEGACY)) };
    await page.screenshot({ path: path.join(outDir, `${route.slice(1).replace(/\//g, "__") || "root"}.png`) });
  } catch (error) {
    report[route] = { error: String(error).slice(0, 200) };
  }
  const r = report[route];
  console.log(route, r.error ? `ERROR ${r.error}` : `rounded=${r.rounded} backdrop=${r.backdrop} legacy=${JSON.stringify(r.legacyHits)} kickers=${r.kickers.length} headGap=${r.headGap}`);
}
await browser.close();
fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));

const rows = Object.values(report).filter((r) => !r.error);
const sum = (f) => rows.reduce((n, r) => n + f(r), 0);
console.log(
  `\nSUMMARY ${tag}: routes=${rows.length} errors=${Object.keys(report).length - rows.length} ` +
    `rounded=${sum((r) => r.rounded)} backdrop=${sum((r) => r.backdrop)} ` +
    `legacy=${sum((r) => Object.values(r.legacyHits).reduce((a, b) => a + b, 0))} ` +
    `kickers=${sum((r) => r.kickers.length)} headGap>48=${rows.filter((r) => r.headGap > 48).length}`,
);
