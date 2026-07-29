// ホームで使う香水・ブランドを、同期的に読み込める classic script として出力する。
// fetch の完了を待たずに PERFUMES / BRANDS が確定するため、
// 遅延読み込みのトリガー漏れでコンテンツが消える事故が起きない。
import { readFileSync, writeFileSync } from "node:fs";

const OUT = "public/data/home-data.js";

const fragrances = JSON.parse(readFileSync("public/data/fragrances.json", "utf8"));
const brands = JSON.parse(readFileSync("public/data/brands.json", "utf8"));

// 件数は data/ 側の実数に追従させる（商品の増減でビルドが落ちないようにする）
const sourceFragrances = JSON.parse(readFileSync("data/fragrances.json", "utf8")).fragrances;
const sourceBrands = JSON.parse(readFileSync("data/brands.json", "utf8"));
if (!Array.isArray(fragrances) || fragrances.length !== sourceFragrances.length) {
  throw new Error(`fragrances が data/fragrances.json と一致しません (配信 ${Array.isArray(fragrances) ? fragrances.length : typeof fragrances} / ソース ${sourceFragrances.length})`);
}
if (!Array.isArray(brands) || brands.length !== sourceBrands.length) {
  throw new Error(`brands が data/brands.json と一致しません (配信 ${Array.isArray(brands) ? brands.length : typeof brands} / ソース ${sourceBrands.length})`);
}

const body = `/* 自動生成: build-home-data.mjs。直接編集しないこと。 */
window.SILLAGE_FRAGRANCES=${JSON.stringify(fragrances)};
window.SILLAGE_BRANDS=${JSON.stringify(brands)};
`;

writeFileSync(OUT, body, "utf8");
console.log(`Wrote ${OUT} (${fragrances.length} fragrances, ${brands.length} brands, ${(body.length / 1024).toFixed(1)}KB)`);
