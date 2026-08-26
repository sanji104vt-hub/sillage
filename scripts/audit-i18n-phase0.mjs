import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadFragrances } from "../lib/fragrance-data.mjs";

const products = loadFragrances();
const brands = JSON.parse(readFileSync("data/brands.json", "utf8"));
const siteCopy = JSON.parse(readFileSync("data/site-copy.json", "utf8"));
const shops = JSON.parse(readFileSync("data/stores.json", "utf8")).stores
  .filter((store) => store.city === "kyoto")
  .map((store) => ({
    slug: store.id,
    name: store.nameJa,
    address: store.addressJa,
    latitude: store.coordinates?.lat,
    longitude: store.coordinates?.lng,
    google_maps_url: store.googleMapsUrl,
    hours: store.openingHours,
    verifiedAt: store.verifiedAt,
  }));
const kyotoHtml = readFileSync("public/columns/kyoto-fragrance-shops.html", "utf8");
const output = "reports/i18n-phase0";
mkdirSync(output, { recursive: true });

const isBlank = (value) => value == null || value === "" || Array.isArray(value) && value.length === 0;
const validUrl = (value) => {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname); }
  catch { return false; }
};
const csv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const ratio = (count, total) => `${((count / total) * 100).toFixed(1)}%`;
const issueRows = [];
const issue = (severity, scope, id, message) => issueRows.push({ severity, scope, id, message });

const declaredHeroCount = Number(String(siteCopy.heroProductLine || "").match(/\d+/)?.[0] || 0);
if (declaredHeroCount && declaredHeroCount !== products.length) {
  issue("high", "site-copy", "heroProductLine", `Source copy says ${declaredHeroCount} products, but the product database contains ${products.length}`);
}

const fields = {
  brand: (p) => p.brand,
  nameJa: (p) => p.name,
  gender: (p) => p.gender,
  family: (p) => p.family,
  topNote: (p) => p.top,
  middleNote: (p) => p.mid,
  lastNote: (p) => p.last,
  seasons: (p) => p.seasons,
  scenes: (p) => p.scenes,
  priceTier: (p) => p.priceTier,
  displayedPrice: (p) => p.price,
  concentration: (p) => p.concentration,
  sizes: (p) => p.sizes,
  image: (p) => p.img,
  officialLink: (p) => p.purchaseLinks?.official?.url,
  rakutenLink: (p) => p.purchaseLinks?.rakuten?.url,
  sources: (p) => p.sources,
  verifiedAt: (p) => p.verifiedAt,
  updatedAt: (p) => p.updatedAt,
  nameEn: () => null,
  englishSlug: () => null,
};

const localized = existsSync("data/i18n/products.en.json")
  ? JSON.parse(readFileSync("data/i18n/products.en.json", "utf8")).products
  : {};
fields.nameEn = (p) => localized[p.slug]?.nameEn;
fields.englishSlug = (p) => localized[p.slug]?.englishSlug;

const missing = Object.fromEntries(Object.keys(fields).map((key) => [key, 0]));
for (const product of products) {
  for (const [name, getter] of Object.entries(fields)) if (isBlank(getter(product))) missing[name]++;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug || "")) issue("critical", "product", product.slug, "Invalid or missing Japanese product slug");
  if (product.purchaseLinks?.official && !validUrl(product.purchaseLinks.official.url)) issue("critical", "product", product.slug, "Invalid official URL");
  if (product.purchaseLinks?.rakuten && !validUrl(product.purchaseLinks.rakuten.url)) issue("critical", "product", product.slug, "Invalid Rakuten URL");
  if (product.needsCorrectLink) issue("high", "product", product.slug, "Purchase link is marked needsCorrectLink and must not be reused in English output");
  if (product.priceSizeMismatch || product.priceSizeUnknown) issue("high", "product", product.slug, "Retail price size is unresolved");
  if (!product.sources?.length) issue("medium", "product", product.slug, "No structured source records");
  if (!product.img) issue("high", "product", product.slug, "No product image URL");
  if (!product.concentration) issue("medium", "product", product.slug, "No concentration data");
  if (!product.sizes?.length) issue("medium", "product", product.slug, "No size data");
}

const duplicates = (values) => {
  const counts = new Map();
  for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts].filter(([, count]) => count > 1);
};
for (const [value, count] of duplicates(products.map((p) => p.slug))) issue("critical", "product", value, `Duplicate slug used ${count} times`);
for (const [value, count] of duplicates(products.map((p) => `${p.brand}\u0000${p.name}`))) issue("high", "product", value.replace("\u0000", " / "), `Duplicate brand and product name used ${count} times`);
for (const [value, count] of duplicates(products.map((p) => p.img))) issue("medium", "image", value, `Image URL is shared by ${count} products`);

const sourceUrls = products.flatMap((p) => (p.sources || []).map((source) => source.url));
for (const [value, count] of duplicates(sourceUrls)) issue("medium", "source", value, `Source URL is reused ${count} times`);

const brandNames = new Set(brands.map((brand) => brand.name));
for (const product of products) if (!brandNames.has(product.brand)) issue("critical", "brand", product.brand, `Product ${product.slug} references an undefined brand`);
for (const brand of brands) if (!products.some((product) => product.brand === brand.name)) issue("high", "brand", brand.name, "Brand has no listed products");

const articleCount = Number(kyotoHtml.match(/(\d+)店(?:ガイド|ピックアップ)/)?.[1] || 0);
const structuredCount = Number(kyotoHtml.match(/"numberOfItems":(\d+)/)?.[1] || 0);
if (articleCount !== shops.length) issue("high", "kyoto", "article-count", `Visible article count is ${articleCount}, but shop data contains ${shops.length}`);
if (structuredCount !== shops.length) issue("critical", "kyoto", "jsonld-count", `JSON-LD count is ${structuredCount}, but shop data contains ${shops.length}`);
for (const shop of shops) {
  if (!shop.address || !Number.isFinite(shop.latitude) || !Number.isFinite(shop.longitude)) issue("critical", "kyoto", shop.slug, "Address or coordinates are missing");
  if (!validUrl(shop.google_maps_url)) issue("critical", "kyoto", shop.slug, "Google Maps URL is invalid");
  if (!shop.hours) issue("high", "kyoto", shop.slug, "Opening hours are missing");
  if (/atlier|purfums/i.test(shop.name)) issue("medium", "kyoto", shop.slug, `Store name needs manual spelling verification: ${shop.name}`);
}
if (!shops.every((shop) => Object.hasOwn(shop, "verifiedAt"))) issue("medium", "kyoto", "verification-date", "Shop records do not have per-record verification dates");

function allHtml(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? allHtml(path) : entry.name.endsWith(".html") ? [path] : [];
  });
}
const htmlFiles = allHtml("public");
const japaneseHtmlFiles = htmlFiles.filter((path) => !path.replaceAll("\\", "/").startsWith("public/en/"));
const englishHtmlFiles = htmlFiles.filter((path) => path.replaceAll("\\", "/").startsWith("public/en/"));
let indexCount = 0;
let noindexCount = 0;
for (const path of htmlFiles) {
  const html = readFileSync(path, "utf8");
  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);
  noindex ? noindexCount++ : indexCount++;
}

const productRows = products.map((product) => {
  const absent = Object.entries(fields).filter(([, getter]) => isBlank(getter(product))).map(([name]) => name);
  return [product.slug, product.brand, product.name, localized[product.slug]?.nameEn || "", localized[product.slug]?.englishSlug || "", absent.length, absent.join("|")];
});
writeFileSync(`${output}/products.csv`, [
  ["slug", "brand", "nameJa", "nameEn", "englishSlug", "missingCount", "missingFields"],
  ...productRows,
].map((row) => row.map(csv).join(",")).join("\n") + "\n");
writeFileSync(`${output}/issues.csv`, [
  ["severity", "scope", "id", "message"],
  ...issueRows.map((row) => [row.severity, row.scope, row.id, row.message]),
].map((row) => row.map(csv).join(",")).join("\n") + "\n");

const severityOrder = ["critical", "high", "medium", "low"];
const severitySummary = severityOrder.map((severity) => `| ${severity} | ${issueRows.filter((row) => row.severity === severity).length} |`).join("\n");
const missingSummary = Object.entries(missing).map(([field, count]) => `| ${field} | ${products.length - count} | ${count} | ${ratio(count, products.length)} |`).join("\n");
const linkRows = existsSync(`${output}/links.csv`) ? readFileSync(`${output}/links.csv`, "utf8").trim().split(/\r?\n/).slice(1) : [];
const linkStatuses = new Map();
for (const row of linkRows) {
  const status = row.match(/^"([^"]+)"/)?.[1] || "unknown";
  linkStatuses.set(status, (linkStatuses.get(status) || 0) + 1);
}
const linkSummary = linkRows.length
  ? [...linkStatuses].sort().map(([status, count]) => `| ${status} | ${count} |`).join("\n")
  : "| not_checked | 0 |";
const summary = `# Sillage Phase 0 multilingual readiness audit

Generated: ${new Date().toISOString()}

## Scope

- Products: ${products.length}
- Brands: ${brands.length}
- Kyoto shop records: ${shops.length}
- Existing Japanese static HTML: ${japaneseHtmlFiles.length} pages
- Generated English Phase 1 HTML: ${englishHtmlFiles.length} pages
- Total after Phase 1 generation: ${htmlFiles.length} pages (${indexCount} indexable / ${noindexCount} noindex)
- English pilot records: ${Object.keys(localized).length}

## Product field completeness

| Field | Present | Missing | Missing rate |
| --- | ---: | ---: | ---: |
${missingSummary}

The Japanese dataset remains the single source of truth. English fields are stored as a sparse overlay keyed by the existing Japanese slug.

## Severity summary

| Severity | Findings |
| --- | ---: |
${severitySummary}

Critical means the page cannot be identified or safely generated. High means a public link, image, price relation or visible count needs correction. Medium means the page can be generated but should not be treated as fully verified or index-ready. Low is informational.

## Kyoto article consistency

- Visible title/body count: ${articleCount}
- Shop data count: ${shops.length}
- ItemList JSON-LD count: ${structuredCount}
- Result: ${articleCount === shops.length && structuredCount === shops.length ? "consistent" : "inconsistent; do not translate or index an English city page until manually corrected"}

No Kyoto shop name, address, opening hour or map link was changed by this audit.

## External link audit

The affiliate tracking URL itself was not requested. For Moshimo links, the embedded Rakuten destination URL was checked instead.

| Status | Unique destinations |
| --- | ---: |
${linkSummary}

403 responses are classified as blocked, not broken. Timeouts and manual_review require browser verification before changing any product record. Only HTTP 404 or 410 is treated as not_found.

## Phase 1 decision

- Keep all existing Japanese routes and records unchanged.
- Use five verified pilot overlays only.
- Suppress purchase links carrying the internal needsCorrectLink flag.
- Keep the full English catalogue noindex until English names and destination coverage are materially complete.
- Index only the English home and pilot detail pages after local checks pass.
`;
writeFileSync(`${output}/summary.md`, summary, "utf8");
console.log(`Phase 0 audit: ${products.length} products, ${brands.length} brands, ${issueRows.length} findings.`);
console.log(`Reports: ${output}/summary.md, products.csv, issues.csv`);
