import { existsSync, readFileSync } from "node:fs";
import { englishBrands, englishProducts } from "./lib/i18n.mjs";
import { stores, storesForBrand, storesForCity } from "./lib/store-data.mjs";

const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const validUrl = (value) => {
  try { const url = new URL(value); return url.protocol === "https:" && Boolean(url.hostname); }
  catch { return false; }
};
const duplicates = (values) => {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts].filter(([, count]) => count > 1);
};

assert(storesForCity("kyoto").length === 18, `Kyoto store count changed: ${storesForCity("kyoto").length}`);
assert(storesForCity("tokyo").length >= 25 && storesForCity("tokyo").length <= 40, `Tokyo store count must be 25–40: ${storesForCity("tokyo").length}`);
assert(new Set(stores.map((store) => store.id)).size === stores.length, "Store IDs are not unique");
assert(duplicates(stores.map((store) => store.googleMapsUrl)).length === 0, "Google Maps URLs are duplicated");

for (const store of stores) {
  for (const field of ["id", "nameJa", "nameEn", "city", "area", "addressJa", "addressEn", "nearestStation", "officialUrl", "googleMapsUrl", "storeType", "availabilityLevel", "verifiedAt"]) {
    assert(Boolean(store[field]), `Store ${store.id || "(missing id)"} is missing ${field}`);
  }
  assert(validUrl(store.officialUrl), `Invalid official URL: ${store.id}`);
  assert(validUrl(store.googleMapsUrl), `Invalid Google Maps URL: ${store.id}`);
  assert([null, true, false].includes(store.englishSupport), `Invalid English support state: ${store.id}`);
  assert([null, true, false].includes(store.taxFree), `Invalid tax-free state: ${store.id}`);
  assert(store.availabilityLevel === "brand-confirmed", `Unverified availability level: ${store.id}`);
  assert(Array.isArray(store.brands), `Brands must be an array: ${store.id}`);
  assert(Array.isArray(store.sources) && store.sources.length > 0, `Source missing: ${store.id}`);
  for (const source of store.sources || []) {
    assert(Boolean(source.publisher && source.title), `Source label missing: ${store.id}`);
    assert(validUrl(source.url), `Invalid source URL: ${store.id}`);
  }
  if (store.coordinates !== null) {
    assert(Number.isFinite(store.coordinates?.lat) && store.coordinates.lat >= -90 && store.coordinates.lat <= 90, `Invalid latitude: ${store.id}`);
    assert(Number.isFinite(store.coordinates?.lng) && store.coordinates.lng >= -180 && store.coordinates.lng <= 180, `Invalid longitude: ${store.id}`);
  }
}

for (const [path, city, count] of [
  ["public/en/guides/perfume-shopping-kyoto/index.html", "kyoto", 18],
  ["public/en/guides/perfume-shopping-tokyo/index.html", "tokyo", storesForCity("tokyo").length],
]) {
  assert(existsSync(path), `Generated city guide missing: ${path}`);
  if (!existsSync(path)) continue;
  const html = readFileSync(path, "utf8");
  assert((html.match(/<article class="shop"/g) || []).length === count, `${city} card count mismatch`);
  assert(html.includes(`"numberOfItems":${count}`), `${city} ItemList count mismatch`);
  assert(html.includes(`data-city-guide="${city}"`), `${city} analytics city attribute missing`);
  assert(html.includes(":focus-visible"), `${city} focus-visible styles missing`);
  assert(html.includes("prefers-reduced-motion:reduce"), `${city} reduced-motion styles missing`);
  assert(!html.includes("We stock") && !html.includes("In stock"), `${city} guide makes an unsupported stock claim`);
}

const productBrands = new Map();
const fragrances = JSON.parse(readFileSync("data/fragrances.json", "utf8")).fragrances;
for (const product of fragrances) productBrands.set(product.slug, product.brand);
let linkedProducts = 0;
for (const slug of Object.keys(englishProducts)) {
  const brandKey = productBrands.get(slug);
  const brandSlug = englishBrands[brandKey]?.slug;
  if (!brandSlug || !storesForBrand(brandSlug).length) continue;
  linkedProducts++;
  const brand = englishBrands[brandKey];
  const englishSlug = englishProducts[slug].englishSlug;
  const html = readFileSync(`public/en/fragrances/${brand.slug}/${englishSlug}/index.html`, "utf8");
  assert(html.includes(`Where to explore ${brand.nameEn} in Japan`), `Where-to-try section missing: ${slug}`);
  assert(html.includes("Individual fragrance stock is not confirmed") || html.includes("This does not confirm stock"), `Stock disclaimer missing: ${slug}`);
}
assert(linkedProducts >= 10, `At least 10 English products must link to stores: ${linkedProducts}`);

const analytics = readFileSync("public/assets/analytics.js", "utf8");
for (const event of ["store_map_click", "store_official_click", "city_guide_view"]) {
  assert(analytics.includes(`"${event}"`), `Analytics event missing: ${event}`);
}

if (errors.length) {
  console.error("Store validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Store validation: OK (${stores.length} stores, ${linkedProducts} English products linked)`);
