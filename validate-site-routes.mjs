import { existsSync, readFileSync, readdirSync } from "node:fs";
import worker from "./src/index.js";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const fragrances = loadFragrances();
const errors = [];
const assetFetch = async (request) => {
  const url = new URL(request.url);
  const relative = url.pathname.replace(/^\//, "");
  const path = `public/${relative}`;
  return existsSync(path) ? new Response(readFileSync(path), { status: 200 }) : new Response("Not found", { status: 404 });
};
const env = { ASSETS: { fetch: assetFetch } };
async function expect(path, status, location) {
  const response = await worker.fetch(new Request(`https://sillage.asutelu.com${path}`), env);
  if (response.status !== status) errors.push(`${path}: expected ${status}, got ${response.status}`);
  if (location && response.headers.get("location") !== `https://sillage.asutelu.com${location}`) errors.push(`${path}: redirect mismatch`);
}

for (const item of fragrances) {
  if (!existsSync(`public/items/${item.slug}.html`)) errors.push(`Missing item page: ${item.slug}`);
}
await expect("/", 200);
await expect(`/items/${fragrances[0].slug}`, 200);
await expect("/items/does-not-exist", 404);
await expect(`/items/${fragrances[0].slug}.html`, 301, `/items/${fragrances[0].slug}`);
const brandPages = readdirSync("public").filter((name) => /^brand-.+\.html$/.test(name));
const columnPages = readdirSync("public/columns").filter((name) => name.endsWith(".html"));
if (brandPages.length !== 47) errors.push(`Expected 47 brand pages, got ${brandPages.length}`);
if (!columnPages.length) errors.push("No column pages found");
if (brandPages[0]) await expect(`/${brandPages[0]}`, 200);
if (columnPages[0]) await expect(`/columns/${columnPages[0].replace(/\.html$/, "")}`, 200);
const workersResponse = await worker.fetch(new Request(`https://sillage.sanji-104vt.workers.dev/items/${fragrances[0].slug}`), env);
if (workersResponse.status !== 301 || !workersResponse.headers.get("location")?.startsWith("https://sillage.asutelu.com/")) errors.push("workers.dev redirect mismatch");

const sitemap = readFileSync("public/sitemap.xml", "utf8");
for (const item of fragrances) if (!sitemap.includes(`https://sillage.asutelu.com/items/${item.slug}`)) errors.push(`Sitemap item missing: ${item.slug}`);
const top = readFileSync("public/index.html", "utf8");
const homeScript = readFileSync("public/assets/home.js", "utf8");
if (!top.includes('<script defer src="/assets/home.js"></script>')) errors.push("Top application asset missing");
if (!existsSync("public/data/fragrances.json")) errors.push("Generated fragrance JSON missing");
if (!existsSync("public/data/brands.json")) errors.push("Generated brand JSON missing");

// ホームの主要データは同期スクリプトで確定させる（遅延読み込みでの取りこぼしを防ぐ）
if (!existsSync("public/data/home-data.js")) errors.push("Synchronous home data script missing");
if (!top.includes('<script src="/data/home-data.js"></script>')) errors.push("home-data.js not loaded from index.html");
if (!homeScript.includes("window.SILLAGE_FRAGRANCES")) errors.push("home.js does not read synchronous fragrance data");
if (!homeScript.includes("window.SILLAGE_BRANDS")) errors.push("home.js does not read synchronous brand data");

// 内部リンク網は JavaScript 実行なしで初期HTMLからたどれること
if (top.includes('id="deferredHome"')) errors.push("Homepage still defers its main content");
const staticBrandLinks = new Set(top.match(/href="\/brand-[a-z0-9-]+\.html"/g) || []).size;
const staticItemLinks = new Set(top.match(/href="\/items\/[a-z0-9-]+"/g) || []).size;
const staticColumnLinks = new Set(top.match(/href="\/columns\/[a-z0-9-]+"/g) || []).size;
if (staticBrandLinks !== 47) errors.push(`Static brand links in index.html: ${staticBrandLinks} (expected 47)`);
if (staticItemLinks < 40) errors.push(`Static item links in index.html: ${staticItemLinks} (expected >= 40)`);
if (staticColumnLinks < 10) errors.push(`Static column links in index.html: ${staticColumnLinks} (expected >= 10)`);
for (const item of fragrances) {
  for (const value of item.scenes || []) if (!homeScript.includes(`${value}:`)) errors.push(`Scene filter missing: ${value}`);
  for (const value of item.seasons || []) if (!homeScript.includes(`${value}:`)) errors.push(`Season filter missing: ${value}`);
}

if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exitCode = 1;
} else {
  console.log(`Route validation: OK (${fragrances.length} items, ${brandPages.length} brands, ${columnPages.length} columns, filters, sitemap, assets, redirects and 404)`);
}
