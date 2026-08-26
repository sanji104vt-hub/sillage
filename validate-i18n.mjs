import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";
import { englishBrands, englishProducts, englishRoute, localizeProduct } from "./lib/i18n.mjs";

const SITE = "https://sillage.asutelu.com";
const products = loadFragrances();
const bySlug = new Map(products.map((product) => [product.slug, product]));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const read = (path) => readFileSync(path, "utf8");
const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const walkHtml = (dir) => readdirSync(dir).flatMap((name) => {
  const path = `${dir}/${name}`;
  return statSync(path).isDirectory() ? walkHtml(path) : path.endsWith(".html") ? [path] : [];
});

assert(products.length === 150, `Expected current baseline of 150 products; got ${products.length}`);
assert(JSON.parse(readFileSync("data/brands.json", "utf8")).length === 41, "Expected current baseline of 41 brands");
assert(Object.keys(englishProducts).length >= 25 && Object.keys(englishProducts).length <= 30, `Expected 25–30 English product overlays; got ${Object.keys(englishProducts).length}`);

const routes = [];
for (const [slug, overlay] of Object.entries(englishProducts)) {
  const source = bySlug.get(slug);
  assert(Boolean(source), `English overlay references missing product: ${slug}`);
  if (!source) continue;
  assert(Boolean(englishBrands[source.brand]), `English brand overlay missing: ${source.brand}`);
  assert(Boolean(overlay.nameEn), `English product name missing: ${slug}`);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(overlay.englishSlug || ""), `Invalid English slug: ${slug}`);
  assert(["top", "mid", "last"].every((key) => overlay.notes?.[key]), `English notes incomplete: ${slug}`);
  assert(Boolean(overlay.editorial?.summary), `English editorial summary missing: ${slug}`);
  assert(overlay.editorial?.recommendedFor?.length > 0, `English recommended-for guidance missing: ${slug}`);
  assert(overlay.editorial?.notRecommendedFor?.length > 0, `English not-recommended guidance missing: ${slug}`);
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
  assert(!structured.some((entry) => entry.aggregateRating || entry.review), `Invented rating or review in JSON-LD: ${path}`);
  assert(html.includes(`Japanese name: ${esc(source.name)}`), `Japanese product name missing: ${path}`);
  if (source.releaseYear) assert(html.includes(`<dt>Release year</dt><dd>${source.releaseYear}</dd>`), `Release year missing: ${path}`);
  assert(html.includes("Sillage editorial view") && html.includes("not a claim made by the brand"), `Editorial attribution missing: ${path}`);
  const sourceHtml = readFileSync(`public/items/${slug}.html`, "utf8");
  assert(sourceHtml.includes(`<link rel="alternate" hreflang="en" href="${canonical}">`), `Reciprocal hreflang missing: public/items/${slug}.html`);
}
assert(new Set(routes).size === routes.length, "English routes are not unique");

for (const [path, canonical, noindex] of [
  ["public/en/index.html", `${SITE}/en/`, false],
  ["public/en/fragrances/index.html", `${SITE}/en/fragrances/`, false],
  ["public/en/brands/index.html", `${SITE}/en/brands/`, false],
  ["public/en/guides/perfume-shopping-kyoto/index.html", `${SITE}/en/guides/perfume-shopping-kyoto/`, false],
  ["public/en/guides/best-japanese-perfume-brands/index.html", `${SITE}/en/guides/best-japanese-perfume-brands/`, false],
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

const brandData = Object.entries(englishBrands).map(([key, brand]) => ({ key, ...brand, count: products.filter((product) => product.brand === key && englishProducts[product.slug]).length }));
assert(brandData.filter((brand) => brand.count > 0).length === 10, "English brand index should contain exactly 10 represented brands");
for (const brand of brandData.filter((entry) => entry.count > 0)) {
  const path = `public/en/brands/${brand.slug}/index.html`;
  assert(existsSync(path) === (brand.count >= 2), `Brand detail threshold mismatch: ${brand.nameEn} (${brand.count})`);
  if (existsSync(path)) {
    const html = read(path);
    assert((html.match(/class="card product-card"/g) || []).length === brand.count, `Brand product count mismatch: ${brand.nameEn}`);
    assert(html.includes('"@type":"CollectionPage"') && html.includes('"@type":"BreadcrumbList"'), `Brand structured data missing: ${brand.nameEn}`);
  }
}

const kyoto = read("public/en/guides/perfume-shopping-kyoto/index.html");
assert((kyoto.match(/<article class="shop"/g) || []).length === 18, "Kyoto guide must contain exactly 18 shops");
assert(kyoto.includes('"@type":"Article"') && kyoto.includes('"@type":"ItemList"') && kyoto.includes('"@type":"BreadcrumbList"'), "Kyoto guide structured data incomplete");
assert(kyoto.includes(`<link rel="alternate" hreflang="ja" href="${SITE}/columns/kyoto-fragrance-shops">`), "Kyoto guide Japanese hreflang missing");
assert((kyoto.match(/English support<\/dt><dd>Not confirmed/g) || []).length === 18, "Kyoto English support must remain unclaimed");
assert((kyoto.match(/Tax-free shopping<\/dt><dd>Not confirmed/g) || []).length === 18, "Kyoto tax-free support must remain unclaimed");
assert(kyoto.includes('data-column-slug="perfume-shopping-kyoto"'), "Kyoto guide analytics attributes missing");
const kyotoJa = read("public/columns/kyoto-fragrance-shops.html");
assert(kyotoJa.includes(`<link rel="alternate" hreflang="en" href="${SITE}/en/guides/perfume-shopping-kyoto/">`), "Japanese Kyoto guide reciprocal hreflang missing");

const japaneseBrandsGuide = read("public/en/guides/best-japanese-perfume-brands/index.html");
assert((japaneseBrandsGuide.match(/<article class="brand-guide">/g) || []).length === 4, "Japanese brands guide must contain exactly four sourced brands");
assert(japaneseBrandsGuide.includes('"@type":"Article"') && japaneseBrandsGuide.includes('"@type":"BreadcrumbList"'), "Japanese brands guide structured data incomplete");
assert(!japaneseBrandsGuide.includes('hreflang="ja" href="https://sillage.asutelu.com/columns/'), "Japanese brands guide must not invent a Japanese counterpart");
assert(japaneseBrandsGuide.includes('data-column-slug="best-japanese-perfume-brands"'), "Japanese brands guide analytics attributes missing");

const analytics = read("public/assets/analytics.js");
assert(analytics.includes('params.language = document.documentElement.lang || "ja"'), "Analytics language dimension missing");
assert(analytics.includes('path.indexOf("/en/guides/")') && analytics.includes('path.indexOf("/en/brands/")'), "English page types missing from analytics");

const sitemap = readFileSync("public/sitemap.xml", "utf8");
assert(sitemap.includes(`<loc>${SITE}/en/</loc>`), "English home missing from sitemap");
assert(sitemap.includes(`<loc>${SITE}/en/fragrances/</loc>`), "Indexable English catalogue missing from sitemap");
for (const expected of ["/en/brands/", "/en/guides/perfume-shopping-kyoto/", "/en/guides/best-japanese-perfume-brands/"]) assert(sitemap.includes(`<loc>${SITE}${expected}</loc>`), `English Phase 2 page missing from sitemap: ${expected}`);
for (const brand of brandData.filter((entry) => entry.count >= 2)) assert(sitemap.includes(`<loc>${SITE}/en/brands/${brand.slug}/</loc>`), `English brand page missing from sitemap: ${brand.slug}`);
for (const route of routes) assert(sitemap.includes(`<loc>${SITE}${route}</loc>`), `English product missing from sitemap: ${route}`);

const catalogue = readFileSync("public/en/fragrances/index.html", "utf8");
assert((catalogue.match(/class="card" href="\/en\/fragrances\//g) || []).length === routes.length, "English catalogue does not contain exactly the pilot products");
assert(!catalogue.includes("Japanese detail"), "English catalogue still links untranslated products");
assert(catalogue.includes(`${routes.length} fragrances currently available in English`), "English catalogue count explanation missing");

const englishHome = read("public/en/index.html");
assert(englishHome.includes(`Explore ${routes.length} fragrances`), "English home dynamic product count missing");
assert(!/(?:Start with five|Five fragrance|English pilot|In development)/i.test(englishHome), "English home still contains pilot or placeholder copy");

for (const route of routes) {
  const html = readFileSync(`public${route}index.html`, "utf8");
  assert(html.includes("Buy on Rakuten Japan"), `Rakuten Japan CTA missing: ${route}`);
  assert(html.includes("Last verified"), `Last verified missing: ${route}`);
  assert(html.includes('property="og:image"'), `OG image missing: ${route}`);
}

const home = readFileSync("public/index.html", "utf8");
assert(home.includes(`<link rel="alternate" hreflang="en" href="${SITE}/en/">`), "Japanese home English hreflang missing");
assert(home.includes("G-60BQRQWB5M") && home.includes("UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q"), "Japanese home analytics or verification tag changed");

for (const page of walkHtml("public/en")) {
  const html = read(page);
  for (const match of html.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const route = href.split(/[?#]/)[0];
    const candidates = route.endsWith("/")
      ? [`public${route}index.html`]
      : [`public${route}`, `public${route}.html`, `public${route}/index.html`];
    assert(candidates.some(existsSync), `Broken internal link in ${page}: ${href}`);
  }
}

if (errors.length) {
  console.error("i18n validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`i18n validation: OK (${routes.length} English products, 10 brands, 2 guides, ${products.length} shared catalogue records)`);
