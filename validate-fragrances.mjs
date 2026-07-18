// Sillageの商品データと生成済み商品詳細ページの欠損を集計する。
// 実行: node validate-fragrances.mjs
import { existsSync, readFileSync } from "node:fs";

const source = readFileSync("public/index.html", "utf8");
const start = source.indexOf("const PERFUMES = [");
const end = source.indexOf("\n];", start) + 2;
if (start < 0 || end < 2) throw new Error("public/index.html から PERFUMES を取得できません");
const arraySource = source.slice(source.indexOf("[", start), end).replace(/,(\s*\])/g, "$1");
const fragrances = new Function(`return ${arraySource}`)();
const slugs = JSON.parse(readFileSync("build-items-slugmap.json", "utf8"));

const missing = {
  "画像なし": 0,
  "価格なし": 0,
  "香調なし": 0,
  "トップノートなし": 0,
  "ミドルノートなし": 0,
  "ラストノートなし": 0,
  "シーンなし": 0,
  "季節なし": 0,
  "購入リンクなし": 0,
  "関連商品なし": 0,
  "SEOタイトルなし": 0,
  "SEO説明なし": 0,
};

const errors = [];
function validateInlineScripts(path, html) {
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)];
  scripts.forEach((match) => {
    try { new Function(match[1]); }
    catch (error) { errors.push(`JavaScript構文エラー: ${path} (${error.message})`); }
  });
}
validateInlineScripts("public/index.html", source);

fragrances.forEach((item, index) => {
  if (!item.img) missing["画像なし"]++;
  if (!item.price) missing["価格なし"]++;
  if (!item.family) missing["香調なし"]++;
  if (!item.top) missing["トップノートなし"]++;
  if (!item.mid) missing["ミドルノートなし"]++;
  if (!item.last) missing["ラストノートなし"]++;
  if (!item.scenes?.length) missing["シーンなし"]++;
  if (!item.seasons?.length) missing["季節なし"]++;
  if (!item.rakuten) missing["購入リンクなし"]++;

  const slug = slugs[index];
  const path = `public/items/${slug}.html`;
  if (!slug || !existsSync(path)) {
    errors.push(`生成ページなし: ${item.brand} ${item.name}`);
    missing["関連商品なし"]++;
    missing["SEOタイトルなし"]++;
    missing["SEO説明なし"]++;
    return;
  }
  const html = readFileSync(path, "utf8");
  validateInlineScripts(path, html);
  if (!/<title>[^<]+<\/title>/.test(html)) missing["SEOタイトルなし"]++;
  if (!/<meta name="description" content="[^"]+">/.test(html)) missing["SEO説明なし"]++;
  if (!html.includes('class="compare-card"')) missing["関連商品なし"]++;
  if ((html.match(/<h1\b/g) || []).length !== 1) errors.push(`h1が1件ではない: ${path}`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  const expectedUrl = `https://sillage.asutelu.com/items/${slug}`;
  if (canonical !== expectedUrl) errors.push(`canonical不一致: ${path}`);
  if (!html.includes("G-60BQRQWB5M") || !html.includes("UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q")) errors.push(`計測または認証タグなし: ${path}`);
  const compareCount = (html.match(/class="compare-card"/g) || []).length;
  if (compareCount > 3) errors.push(`類似商品が3件超: ${path}`);
  const buyLinks = [...html.matchAll(/<a class="buy"[^>]*rel="([^"]+)"/g)];
  if (item.rakuten && buyLinks.length !== 2) errors.push(`購入導線が上下2件ではない: ${path}`);
  if (!item.rakuten && buyLinks.length) errors.push(`購入リンクなし商品に導線あり: ${path}`);
  if (buyLinks.some((match) => !["sponsored", "noopener", "noreferrer"].every((rel) => match[1].includes(rel)))) errors.push(`購入リンクrel不足: ${path}`);
  if (item.img && !/<img class="photo"[^>]+alt="[^"]+"/.test(html)) errors.push(`商品画像altなし: ${path}`);
  if (!item.img && !html.includes('class="product-hero no-image"')) errors.push(`画像なしレイアウト未適用: ${path}`);

  const jsonBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const structured = [];
  for (const block of jsonBlocks) {
    try { structured.push(JSON.parse(block[1])); }
    catch { errors.push(`JSON-LD不正: ${path}`); }
  }
  const product = structured.find((data) => data?.["@type"] === "Product");
  const breadcrumb = structured.find((data) => data?.["@type"] === "BreadcrumbList");
  if (!product) errors.push(`Product JSON-LDなし: ${path}`);
  if (!breadcrumb) errors.push(`BreadcrumbListなし: ${path}`);
  if (product?.url !== expectedUrl) errors.push(`Product URL不一致: ${path}`);
  if (product?.aggregateRating || product?.offers) errors.push(`未検証の評価または価格情報を含む: ${path}`);
  const selfHref = `href="/items/${slug}"`;
  const comparisonArea = html.match(/<div class="compare-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] || "";
  if (comparisonArea.includes(selfHref)) errors.push(`類似商品に自身を含む: ${path}`);
});

console.log(`商品総数: ${fragrances.length}`);
for (const [label, count] of Object.entries(missing)) console.log(`${label}: ${count}`);
if (fragrances.length !== 92) errors.push(`商品総数が92件ではありません: ${fragrances.length}`);

if (errors.length) {
  console.error("\n検証エラー:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("\n商品ページ検証: OK");
}
