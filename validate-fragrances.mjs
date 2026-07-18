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
const PILOT_SLUGS = new Set([
  "muji-1", "dior-2", "ysl-2", "versace-1", "tom-ford-1",
  "maison-margiela-1", "hermes-3", "guerlain-3", "shiro-1", "aesop-1",
]);
const ENRICHMENT_FIELDS = [
  "concentration", "sizes", "recommendedFor", "notRecommendedFor", "cautions",
  "profile", "purchaseLinks", "sources", "verifiedAt", "updatedAt",
];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const today = new Date().toISOString().slice(0, 10);
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
function validUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
  } catch { return false; }
}
function validDate(value) {
  if (!ISO_DATE.test(String(value || ""))) return false;
  return new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

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
  const slug = slugs[index];
  const isPilot = PILOT_SLUGS.has(slug);
  if (isPilot) {
    const concentration = item.concentration;
    if (slug !== "muji-1" && (!concentration?.value || !concentration?.label)) errors.push(`濃度の値または表示ラベルなし: ${slug}`);
    if (slug === "muji-1" && concentration !== null) errors.push(`未確認濃度がnullではない: ${slug}`);
    if (!Array.isArray(item.sizes)) errors.push(`sizesが配列ではない: ${slug}`);
    const seenVolumes = new Set();
    for (const size of item.sizes || []) {
      if (!Number.isFinite(size.volumeMl) || size.volumeMl <= 0) errors.push(`容量が正の数ではない: ${slug}`);
      if (seenVolumes.has(size.volumeMl)) errors.push(`同一容量が重複: ${slug} ${size.volumeMl}mL`);
      seenVolumes.add(size.volumeMl);
      if (hasOwn(size, "referencePriceYen") && (!Number.isInteger(size.referencePriceYen) || size.referencePriceYen <= 0)) errors.push(`参考価格が正の整数ではない: ${slug}`);
      if (hasOwn(size, "priceVerifiedAt") && !validDate(size.priceVerifiedAt)) errors.push(`価格確認日が不正: ${slug}`);
      if (size.sourceUrl && !validUrl(size.sourceUrl)) errors.push(`容量出典URLが不正: ${slug}`);
    }
    for (const field of ["recommendedFor", "notRecommendedFor"]) {
      if (!Array.isArray(item[field]) || item[field].length > 3) errors.push(`${field}が配列でないか3件超: ${slug}`);
      if ((item[field] || []).some((entry) => entry.basis !== "editorial" || !entry.text)) errors.push(`${field}の編集判断ラベル不足: ${slug}`);
    }
    const recommendedTexts = new Set((item.recommendedFor || []).map((entry) => entry.text));
    if ((item.notRecommendedFor || []).some((entry) => recommendedTexts.has(entry.text))) errors.push(`おすすめ対象と非推奨の文言が重複: ${slug}`);
    if (!Array.isArray(item.cautions) || item.cautions.length > 3) errors.push(`cautionsが配列でないか3件超: ${slug}`);
    const profileKeys = ["lightToRich", "freshToSweet", "subtleToBold", "dailyToDistinctive", "youthfulToMature"];
    if (!item.profile || item.profile.method !== "editorial-v1" || profileKeys.some((key) => item.profile[key] !== null)) errors.push(`profileの保留構造が不正: ${slug}`);
    for (const platform of ["official", "amazon", "rakuten"]) {
      const link = item.purchaseLinks?.[platform];
      if (link !== null && (!validUrl(link?.url) || !validDate(link?.verifiedAt))) errors.push(`${platform}リンクが不正: ${slug}`);
    }
    const sourceUrls = new Set();
    for (const sourceEntry of item.sources || []) {
      if (!validUrl(sourceEntry.url) || !sourceEntry.publisher || !sourceEntry.title || !validDate(sourceEntry.accessedAt)) errors.push(`情報源の必須値が不正: ${slug}`);
      if (sourceUrls.has(sourceEntry.url)) errors.push(`出典URLが重複: ${slug}`);
      sourceUrls.add(sourceEntry.url);
      for (const support of sourceEntry.supports || []) {
        const exists = support === "notes" ? Boolean(item.top || item.mid || item.last) : hasOwn(item, support) && item[support] != null;
        if (!exists) errors.push(`supportsが存在しない項目を参照: ${slug} ${support}`);
      }
    }
    if (!validDate(item.verifiedAt) || item.verifiedAt > today) errors.push(`verifiedAtが不正または未来日: ${slug}`);
    if (!validDate(item.updatedAt) || item.updatedAt > today) errors.push(`updatedAtが不正または未来日: ${slug}`);
  } else {
    const unexpected = ENRICHMENT_FIELDS.filter((field) => hasOwn(item, field));
    if (unexpected.length) errors.push(`対象外商品に補完項目あり: ${slug} (${unexpected.join(", ")})`);
  }
  if (!item.img) missing["画像なし"]++;
  if (!item.price) missing["価格なし"]++;
  if (!item.family) missing["香調なし"]++;
  if (!item.top) missing["トップノートなし"]++;
  if (!item.mid) missing["ミドルノートなし"]++;
  if (!item.last) missing["ラストノートなし"]++;
  if (!item.scenes?.length) missing["シーンなし"]++;
  if (!item.seasons?.length) missing["季節なし"]++;
  if (!item.rakuten) missing["購入リンクなし"]++;

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
  const buyLinks = [...html.matchAll(/<a class="buy[^"]*"[^>]*rel="([^"]+)"/g)];
  const purchaseCount = [item.purchaseLinks?.official?.url, item.purchaseLinks?.amazon?.url, item.purchaseLinks?.rakuten?.url || item.rakuten].filter(Boolean).length;
  if (buyLinks.length !== purchaseCount * 2) errors.push(`購入導線数が不正: ${path} (${buyLinks.length}/${purchaseCount * 2})`);
  if (buyLinks.some((match) => !["noopener", "noreferrer"].every((rel) => match[1].includes(rel)))) errors.push(`購入リンクrel不足: ${path}`);
  const sponsoredCount = [item.purchaseLinks?.amazon?.url, item.purchaseLinks?.rakuten?.url || item.rakuten].filter(Boolean).length * 2;
  if (buyLinks.filter((match) => match[1].includes("sponsored")).length !== sponsoredCount) errors.push(`広告リンクのsponsored指定が不正: ${path}`);
  if (isPilot && (item.sources || []).length && !html.includes('class="section sources"')) errors.push(`情報源セクションなし: ${path}`);
  if (!isPilot && html.includes('class="section sources"')) errors.push(`対象外商品に情報源セクションあり: ${path}`);
  if (isPilot && !html.includes(`情報確認日：${Number(item.verifiedAt.slice(0, 4))}年`)) errors.push(`情報確認日表示なし: ${path}`);
  if (!isPilot && html.includes("データ更新日：")) errors.push(`対象外商品に固定更新日あり: ${path}`);
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
