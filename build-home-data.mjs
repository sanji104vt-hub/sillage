// ホームで使う香水92件・ブランド47件を、同期的に読み込める classic script として出力する。
// fetch の完了を待たずに PERFUMES / BRANDS が確定するため、
// 遅延読み込みのトリガー漏れでコンテンツが消える事故が起きない。
import { readFileSync, writeFileSync } from "node:fs";

const OUT = "public/data/home-data.js";

const fragrances = JSON.parse(readFileSync("public/data/fragrances.json", "utf8"));
const brands = JSON.parse(readFileSync("public/data/brands.json", "utf8"));

if (!Array.isArray(fragrances) || fragrances.length !== 92) {
  throw new Error(`fragrances は92件の配列である必要があります (実際: ${Array.isArray(fragrances) ? fragrances.length : typeof fragrances})`);
}
if (!Array.isArray(brands) || brands.length !== 47) {
  throw new Error(`brands は47件の配列である必要があります (実際: ${Array.isArray(brands) ? brands.length : typeof brands})`);
}

const body = `/* 自動生成: build-home-data.mjs。直接編集しないこと。 */
window.SILLAGE_FRAGRANCES=${JSON.stringify(fragrances)};
window.SILLAGE_BRANDS=${JSON.stringify(brands)};
`;

writeFileSync(OUT, body, "utf8");
console.log(`Wrote ${OUT} (${fragrances.length} fragrances, ${brands.length} brands, ${(body.length / 1024).toFixed(1)}KB)`);
