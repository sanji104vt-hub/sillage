import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadFragrances } from "../lib/fragrance-data.mjs";

const PRIORITY_BRANDS = new Set([
  "Diptyque",
  "Le Labo",
  "Maison Margiela",
  "Jo Malone",
  "Dior",
  "Chanel",
  "Tom Ford",
  "Creed",
  "Prada",
  "SHIRO",
]);
const TARGET_ADDITIONS = 20;
const existingEnglish = new Set(Object.keys(
  JSON.parse(readFileSync("data/i18n/products.en.json", "utf8")).products,
));
const products = loadFragrances();

const hasText = (value) => typeof value === "string" && value.trim().length > 0;
const csv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const yesNo = (value) => value ? "yes" : "no";

function inspect(product) {
  const officialSources = (product.sources || []).filter((source) => source.sourceType === "official");
  const officialPrices = (product.sizes || []).filter((size) => Number.isInteger(size.referencePriceYen));
  const officialLink = product.purchaseLinks?.official?.url || "";
  const rakutenLink = product.purchaseLinks?.rakuten?.url || "";
  const hasMoshimo = /(?:^|\.)moshimo\.com/i.test(new URL(rakutenLink || "https://invalid.local").hostname);
  const checks = {
    officialSource: officialSources.length > 0,
    officialLink: /^https:\/\//.test(officialLink),
    concentration: hasText(product.concentration?.value),
    sizes: (product.sizes || []).some((size) => Number.isFinite(Number(size.volumeMl))),
    notes: [product.top, product.mid, product.last].every(hasText),
    releaseYear: Number.isInteger(product.releaseYear),
    family: hasText(product.family),
    scenes: (product.scenes || []).length > 0,
    seasons: (product.seasons || []).length > 0,
    editorial: (product.recommendedFor || []).length > 0 && (product.notRecommendedFor || []).length > 0,
    verifiedAt: /^\d{4}-\d{2}-\d{2}$/.test(product.verifiedAt || ""),
    rakuten: /^https:\/\//.test(rakutenLink),
    moshimo: hasMoshimo,
    rakutenPrice: product.priceSource === "rakuten" && Number.isFinite(Number(product.priceValue)),
    officialPrice: officialPrices.length > 0,
    japanPurchasable: /^https:\/\//.test(officialLink) || /^https:\/\//.test(rakutenLink),
    safeLink: !product.needsCorrectLink,
  };

  const score = [
    checks.officialSource, checks.officialLink, checks.concentration, checks.sizes,
    checks.notes, checks.releaseYear, checks.family, checks.scenes, checks.seasons,
    checks.editorial, checks.verifiedAt, checks.rakuten, checks.rakutenPrice,
    checks.japanPurchasable, checks.safeLink,
  ].filter(Boolean).length
    + (checks.moshimo ? 2 : 0)
    + (checks.officialPrice ? 2 : 0)
    + (PRIORITY_BRANDS.has(product.brand) ? 3 : 0);

  const indexReady = checks.officialSource && checks.officialLink && checks.concentration
    && checks.sizes && checks.notes && checks.releaseYear && checks.family
    && checks.scenes && checks.seasons && checks.editorial && checks.verifiedAt
    && checks.rakuten && checks.safeLink;
  const priority = indexReady
    ? (PRIORITY_BRANDS.has(product.brand) ? "P1" : "P2")
    : (score >= 14 ? "P3" : "excluded");
  const missing = Object.entries(checks)
    .filter(([key, value]) => !value && !["moshimo", "rakutenPrice", "officialPrice"].includes(key))
    .map(([key]) => key);

  return {
    slug: product.slug,
    brand: product.brand,
    name: product.name,
    score,
    priority,
    indexReady,
    existing: existingEnglish.has(product.slug),
    selected: false,
    checks,
    officialSources: officialSources.map((source) => source.url).join(" | "),
    officialLink,
    rakutenLink,
    officialPriceCount: officialPrices.length,
    missing: missing.join(" | "),
  };
}

const rows = products.map(inspect).sort((a, b) => {
  const rank = { P1: 0, P2: 1, P3: 2, excluded: 3 };
  return rank[a.priority] - rank[b.priority]
    || Number(b.checks.officialPrice) - Number(a.checks.officialPrice)
    || Number(b.checks.rakutenPrice) - Number(a.checks.rakutenPrice)
    || b.score - a.score
    || a.brand.localeCompare(b.brand, "en")
    || a.slug.localeCompare(b.slug, "en");
});

const additions = rows
  .filter((row) => row.indexReady && !row.existing)
  .slice(0, TARGET_ADDITIONS);
for (const row of additions) row.selected = true;

mkdirSync("reports", { recursive: true });
const headers = [
  "slug", "brand", "product_name", "score", "priority", "existing_english",
  "selected_phase2", "index_ready", "official_source", "official_link",
  "concentration", "sizes", "notes_complete", "release_year", "family",
  "scenes", "seasons", "editorial_guidance", "verified_at", "japan_purchasable",
  "safe_link", "rakuten_link", "moshimo_link", "official_price", "rakuten_price",
  "missing_required",
];
const csvRows = rows.map((row) => [
  row.slug, row.brand, row.name, row.score, row.priority, yesNo(row.existing),
  yesNo(row.selected), yesNo(row.indexReady), yesNo(row.checks.officialSource),
  yesNo(row.checks.officialLink), yesNo(row.checks.concentration), yesNo(row.checks.sizes),
  yesNo(row.checks.notes), yesNo(row.checks.releaseYear), yesNo(row.checks.family),
  yesNo(row.checks.scenes), yesNo(row.checks.seasons), yesNo(row.checks.editorial),
  yesNo(row.checks.verifiedAt), yesNo(row.checks.japanPurchasable), yesNo(row.checks.safeLink),
  yesNo(row.checks.rakuten), yesNo(row.checks.moshimo), yesNo(row.checks.officialPrice),
  yesNo(row.checks.rakutenPrice), row.missing,
].map(csv).join(","));
writeFileSync(
  "reports/i18n-phase2-candidates.csv",
  `${headers.map(csv).join(",")}\n${csvRows.join("\n")}\n`,
  "utf8",
);

const selectedRows = additions.map((row) => `| ${row.slug} | ${row.brand} | ${row.name} | ${row.score} | ${row.priority} | ${yesNo(row.checks.officialSource)} | ${yesNo(row.checks.rakuten)} | ${yesNo(row.checks.moshimo)} | ${yesNo(row.checks.officialPrice)} | ${yesNo(row.checks.rakutenPrice)} | 公式情報・日本購入導線・主要属性が揃う |`).join("\n");
const counts = rows.reduce((acc, row) => {
  acc[row.priority] = (acc[row.priority] || 0) + 1;
  return acc;
}, {});
const report = `# Sillage Phase 2 英語化候補選定\n\n`
  + `- 監査日: 2026-08-26\n`
  + `- 日本語商品: ${products.length}\n`
  + `- 既存英語商品: ${existingEnglish.size}\n`
  + `- Phase 2追加選定: ${additions.length}\n`
  + `- Phase 2完了時の英語商品見込み: ${existingEnglish.size + additions.length}\n`
  + `- 判定件数: P1 ${counts.P1 || 0} / P2 ${counts.P2 || 0} / P3 ${counts.P3 || 0} / 除外 ${counts.excluded || 0}\n\n`
  + `## 判定基準\n\n`
  + `公式情報源、公式リンク、濃度、容量、Top/Middle/Last、発売年、香調、シーン、季節、編集判断、確認日、楽天導線が揃い、needsCorrectLinkがない商品だけをindexReadyとした。優先10ブランドをP1、同品質のその他ブランドをP2とし、既存5件を除く上位${TARGET_ADDITIONS}件を選んだ。公式価格と楽天価格は別評価であり、楽天価格を公式価格として扱っていない。\n\n`
  + `## Phase 2選定商品\n\n`
  + `| slug | ブランド | 商品名 | score | 優先度 | 公式情報源 | 楽天 | もしも | 公式価格 | 楽天価格 | 選定理由 |\n`
  + `|---|---|---|---:|---|---|---|---|---|---|---|\n`
  + `${selectedRows}\n\n`
  + `全150件の判定と欠損理由は \`reports/i18n-phase2-candidates.csv\` に記録した。\n`;
writeFileSync("reports/i18n-phase2-selection.md", report, "utf8");

console.log(`Phase 2 candidate audit: ${products.length} products, ${additions.length} selected additions, ${existingEnglish.size + additions.length} English pages projected.`);
