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
if (!top.includes('<script src="/data/fragrances.js"></script>')) errors.push("Top data asset missing");
if (!existsSync("public/data/fragrances.js")) errors.push("Generated fragrance asset missing");
for (const item of fragrances) {
  for (const value of item.scenes || []) if (!top.includes(`${value}:`)) errors.push(`Scene filter missing: ${value}`);
  for (const value of item.seasons || []) if (!top.includes(`${value}:`)) errors.push(`Season filter missing: ${value}`);
}

if (errors.length) {
  errors.forEach((error) => console.error(error));
  process.exitCode = 1;
} else {
  console.log(`Route validation: OK (${fragrances.length} items, ${brandPages.length} brands, ${columnPages.length} columns, filters, sitemap, assets, redirects and 404)`);
}
