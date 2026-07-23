import { readFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const fragrances = loadFragrances();
const bySlug = new Map(fragrances.map((fragrance) => [fragrance.slug, fragrance]));

for (const fragrance of fragrances) {
  const html = readFileSync(`public/items/${fragrance.slug}.html`, "utf8");
  const competitors = [
    ...html.matchAll(/<section class="direct-pair"[^>]*data-competitor="([^"]+)"/g),
  ].map((match) => match[1]);

  if (competitors.length !== 2 || new Set(competitors).size !== competitors.length) {
    throw new Error(`${fragrance.slug}: 代表比較は重複なしの2商品である必要があります`);
  }
  for (const competitorSlug of competitors) {
    const competitor = bySlug.get(competitorSlug);
    if (!competitor || competitorSlug === fragrance.slug) {
      throw new Error(`${fragrance.slug}: 不正な比較先 ${competitorSlug}`);
    }
    if (competitor.brand === fragrance.brand) {
      throw new Error(`${fragrance.slug}: 代表比較は別ブランドを優先してください`);
    }
    if (!html.includes(`href="/items/${competitorSlug}"`)) {
      throw new Error(`${fragrance.slug}: 比較先リンクがありません`);
    }
  }
  if ((html.match(/class="direct-table"/g) || []).length !== 2) {
    throw new Error(`${fragrance.slug}: 比較表が2件ありません`);
  }
  if (/\b(?:undefined|null)\b/.test(html)) {
    throw new Error(`${fragrance.slug}: 欠損値の文字列が表示されています`);
  }
}

console.log(`Product comparisons valid: ${fragrances.length} pages, 2 competitors each`);
