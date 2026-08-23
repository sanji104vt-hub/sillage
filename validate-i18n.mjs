import { existsSync, readFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";
import { englishBrands, englishProducts, englishRoute, localizeProduct } from "./lib/i18n.mjs";

const SITE = "https://sillage.asutelu.com";
const products = loadFragrances();
const bySlug = new Map(products.map((product) => [product.slug, product]));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

assert(products.length === 150, `Expected current baseline of 150 products; got ${products.length}`);
assert(JSON.parse(readFileSync("data/brands.json", "utf8")).length === 41, "Expected current baseline of 41 brands");

const routes = [];
for (const [slug, overlay] of Object.entries(englishProducts)) {
  const source = bySlug.get(slug);
  assert(Boolean(source), `English overlay references missing product: ${slug}`);
  if (!source) continue;
  assert(Boolean(englishBrands[source.brand]), `English brand overlay missing: ${source.brand}`);
  assert(Boolean(overlay.nameEn), `English product name missing: ${slug}`);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(overlay.englishSlug || ""), `Invalid English slug: ${slug}`);
  assert(["top", "mid", "last"].every((key) => overlay.notes?.[key]), `English notes incomplete: ${slug}`);
  const route = englishRoute(source);
  routes.push(route);
  const path = `public${route}index.html`;
  assert(existsSync(path), `English page missing: ${path}`);
  if (!existsSync(path)) continue;
  const html = readFileSync(path, "utf8");
  const canonical = `${SITE}${route}`;
  assert(/^<!DOCTYPE html>/.test(html), `DOCTYPE missing: ${path}`);
  assert(html.includes('<html lang="en">'), `lang=en missing: ${path}`);
  assert(html.includes(`<link rel="canonical" href="${canonical}">`), `Canonical mismatch: ${path}`);
  assert(html.includes(`<link rel="alternate" hreflang="ja" href="${SITE}/items/${slug}">`), `Japanese hreflang missing: ${path}`);
  assert(html.includes(`<link rel="alternate" hreflang="en" href="${canonical}">`), `English hreflang missing: ${path}`);
  assert((html.match(/<h1\b/g) || []).length === 1, `h1 count is not one: ${path}`);
  assert(!/<meta name="robots" content="[^"]*noindex/i.test(html), `Index-ready pilot is noindex: ${path}`);
  assert(html.includes("G-60BQRQWB5M") && html.includes("UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q"), `Analytics or verification tag missing: ${path}`);
  assert(!/>\s*(?:null|undefined)\s*</i.test(html), `Null-like value is visible: ${path}`);
  const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  assert(structured.some((entry) => entry["@type"] === "Product"), `Product JSON-LD missing: ${path}`);
  assert(structured.some((entry) => entry["@type"] === "BreadcrumbList"), `Breadcrumb JSON-LD missing: ${path}`);
  const sourceHtml = readFileSync(`public/items/${slug}.html`, "utf8");
  assert(sourceHtml.includes(`<link rel="alternate" hreflang="en" href="${canonical}">`), `Reciprocal hreflang missing: public/items/${slug}.html`);
}
assert(new Set(routes).size === routes.length, "English routes are not unique");

for (const [path, canonical, noindex] of [
  ["public/en/index.html", `${SITE}/en/`, false],
  ["public/en/fragrances/index.html", `${SITE}/en/fragrances/`, true],
]) {
  assert(existsSync(path), `English foundation page missing: ${path}`);
  if (!existsSync(path)) continue;
  const html = readFileSync(path, "utf8");
  assert(html.includes('<html lang="en">'), `lang=en missing: ${path}`);
  assert(html.includes(`<link rel="canonical" href="${canonical}">`), `Canonical mismatch: ${path}`);
  assert(/<meta name="robots" content="[^"]*noindex/i.test(html) === noindex, `Robots state mismatch: ${path}`);
}

for (const slug of Object.keys(englishProducts)) {
  const localized = localizeProduct(bySlug.get(slug));
  assert(!bySlug.get(slug).needsCorrectLink, `Pilot product has an unresolved purchase link: ${slug}`);
  assert(Boolean(localized.japanAvailability.purchaseLinks.official), `Pilot product has no official purchase link: ${slug}`);
}

const sitemap = readFileSync("public/sitemap.xml", "utf8");
assert(sitemap.includes(`<loc>${SITE}/en/</loc>`), "English home missing from sitemap");
assert(!sitemap.includes(`<loc>${SITE}/en/fragrances/</loc>`), "Noindex English catalogue leaked into sitemap");
for (const route of routes) assert(sitemap.includes(`<loc>${SITE}${route}</loc>`), `English pilot missing from sitemap: ${route}`);

const home = readFileSync("public/index.html", "utf8");
assert(home.includes(`<link rel="alternate" hreflang="en" href="${SITE}/en/">`), "Japanese home English hreflang missing");
assert(home.includes("G-60BQRQWB5M") && home.includes("UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q"), "Japanese home analytics or verification tag changed");

if (errors.length) {
  console.error("i18n validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`i18n validation: OK (${routes.length} pilot products, ${products.length} shared catalogue records)`);
