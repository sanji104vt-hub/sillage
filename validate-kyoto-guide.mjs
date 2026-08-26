import { readFileSync } from "node:fs";

const shops = JSON.parse(readFileSync("data/stores.json", "utf8")).stores
  .filter((store) => store.city === "kyoto")
  .map((store) => ({
    slug: store.id,
    name: store.nameJa,
    address: store.addressJa,
    hours: store.openingHours,
    latitude: store.coordinates?.lat,
    longitude: store.coordinates?.lng,
    google_maps_url: store.googleMapsUrl,
  }));
const html = readFileSync("public/columns/kyoto-fragrance-shops.html", "utf8");
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

assert(shops.length === 18, `Expected 18 Kyoto shop records; got ${shops.length}`);
assert(new Set(shops.map((shop) => shop.slug)).size === shops.length, "Kyoto shop slugs are not unique");
assert(new Set(shops.map((shop) => shop.name)).size === shops.length, "Kyoto shop names are not unique");
for (const shop of shops) {
  assert(Boolean(shop.name && shop.address && shop.hours), `Required shop field missing: ${shop.slug}`);
  assert(/^https:\/\/www\.google\.com\/maps\//.test(shop.google_maps_url || ""), `Invalid map URL: ${shop.slug}`);
  assert(html.includes(escapeHtml(shop.name)), `Rendered shop name missing: ${shop.slug}`);
}

const visibleCards = (html.match(/<div class="shop-info">/g) || []).length;
assert(visibleCards === shops.length, `Rendered shop card count mismatch: ${visibleCards}/${shops.length}`);
assert(!/17店|17店舗/.test(html), "Stale 17-shop wording remains in Kyoto guide");
assert(html.includes(`${shops.length}店ガイド`), "Kyoto title/h1 count mismatch");
assert(html.includes(`香水店${shops.length}店`), "Kyoto description count mismatch");

const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((match) => JSON.parse(match[1]));
const itemList = structured.find((entry) => entry["@type"] === "ItemList");
assert(Boolean(itemList), "Kyoto ItemList JSON-LD missing");
assert(itemList?.numberOfItems === shops.length, "Kyoto ItemList numberOfItems mismatch");
assert(itemList?.itemListElement?.length === shops.length, "Kyoto ItemList element count mismatch");

if (errors.length) {
  console.error("Kyoto guide validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Kyoto guide validation: OK (${shops.length} records, ${visibleCards} rendered cards)`);
