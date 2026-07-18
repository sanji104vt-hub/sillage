import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const baseline = JSON.parse(readFileSync("reports/fragrance-migration-baseline.json", "utf8"));
const fragrances = loadFragrances();
const csv = (value) => {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? null);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const decodeHtml = (value) => String(value || "")
  .replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const textOf = (html, pattern) => decodeHtml(html.match(pattern)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "");
const contentHash = (item) => {
  const snapshot = structuredClone(item);
  delete snapshot.slug;
  delete snapshot.purchaseLinks;
  delete snapshot.sources;
  delete snapshot.rakuten;
  return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
};

const rows = [];
function compare(slug, field, before, after, reason = "") {
  const same = JSON.stringify(before ?? null) === JSON.stringify(after ?? null);
  rows.push({ slug, field, before: before ?? null, after: after ?? null, changed: !same, intended: same, reason: same ? "一致" : reason });
}

for (const before of baseline.items) {
  const item = fragrances[before.index];
  if (!item) {
    compare(before.slug, "product", "present", "missing", "商品消失は意図していません");
    continue;
  }
  const page = readFileSync(`public/items/${item.slug}.html`, "utf8");
  const related = [...page.matchAll(/href="\/items\/([^"?#]+)(?:\.html)?"/g)]
    .map((match) => match[1]).filter((value) => value !== item.slug);
  const purchaseUrls = Object.fromEntries(["official", "amazon", "rakuten"].map((key) => [key, item.purchaseLinks?.[key]?.url || null]));
  compare(before.slug, "array-order", before.index, fragrances.findIndex((entry) => entry.slug === before.slug));
  compare(before.slug, "slug", before.slug, item.slug);
  compare(before.slug, "brand", before.brand, item.brand);
  compare(before.slug, "productName", before.productName, item.name);
  compare(before.slug, "detailUrl", before.currentDetailUrl, `/items/${item.slug}`);
  compare(before.slug, "productContentHash", before.contentHash, contentHash(item));
  compare(before.slug, "purchaseUrls", before.purchaseUrls, purchaseUrls);
  compare(before.slug, "sourceUrls", before.sourceUrls, (item.sources || []).map((source) => source.url));
  compare(before.slug, "title", before.title, textOf(page, /<title>([\s\S]*?)<\/title>/));
  compare(before.slug, "description", before.description, decodeHtml(page.match(/<meta name="description" content="([^"]*)"/)?.[1] || ""));
  compare(before.slug, "canonical", before.canonical, page.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || "");
  compare(before.slug, "h1", before.h1, textOf(page, /<h1[^>]*>([\s\S]*?)<\/h1>/));
  compare(before.slug, "relatedSlugs", before.relatedSlugs, [...new Set(related)].slice(0, 3));
}

const headers = ["slug", "field", "before", "after", "changed", "intended", "reason"];
writeFileSync("reports/fragrance-migration-comparison.csv", `\uFEFF${headers.join(",")}\n${rows.map((row) => headers.map((key) => csv(row[key])).join(",")).join("\n")}\n`, "utf8");
const unexpected = rows.filter((row) => row.changed && !row.intended);
console.log(`Compared ${baseline.items.length} fragrances across ${rows.length} checks.`);
console.log(`Unexpected differences: ${unexpected.length}`);
if (unexpected.length) {
  unexpected.slice(0, 20).forEach((row) => console.error(`${row.slug} ${row.field}`));
  process.exitCode = 1;
}
