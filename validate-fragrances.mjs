// Sillageの商品データと生成済み商品詳細ページの欠損を集計する。
// 実行: node validate-fragrances.mjs
import { existsSync, readFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const source = readFileSync("public/index.html", "utf8");
const fragrances = loadFragrances();
const slugs = fragrances.map((item) => item.slug);
const PILOT_SLUGS = new Set([
  "dior-2", "ysl-2", "versace-1",
  "maison-margiela-1", "guerlain-3", "shiro-1", "aesop-1",
]);
const SECOND_BATCH_SLUGS = new Set([
  "jo-malone-1", "acqua-di-parma-1", "dior-1", "guerlain-2",
  "dior-4", "mugler-1", "ysl-3", "bvlgari-1", "chanel-4",
  "tom-ford-2", "creed-1", "diptyque-1", "byredo-1", "tom-ford-3",
  "le-labo-2", "maison-margiela-2", "giorgio-armani-3", "versace-4",
]);
const THIRD_BATCH_SLUGS = new Set([
  "4711-1", "guerlain-1", "dolce-gabbana-1", "hermes-2",
  "ck-1", "montblanc-1", "azzaro-1", "chanel-1", "paco-rabanne-1",
  "nautica-1", "chanel-2", "gucci-1", "dior-3",
  "calvin-klein-1", "chanel-3", "gucci-2", "jo-malone-2", "marc-jacobs-1",
  "jo-malone-3", "versace-2", "azzaro-2", "thierry-mugler-1",
  "giorgio-armani-1", "viktor-rolf-1", "prada-1", "carolina-herrera-1",
]);
const FOURTH_BATCH_SLUGS = new Set([
  "dior-5", "viktor-rolf-2", "maison-francis-kurkdjian-1",
  "versace-3", "dior-6", "giorgio-armani-2", "le-labo-1", "dunhill-1", "prada-2", "montblanc-2",
  "jo-malone-4", "hugo-boss-1", "dior-7", "aramis-1", "chanel-5", "chanel-6", "narciso-rodriguez-1",
  "narciso-rodriguez-2", "glossier-1", "bvlgari-2", "davidoff-1", "paco-rabanne-3", "bvlgari-3", "acqua-di-parma-2",
]);
const FIFTH_BATCH_SLUGS = new Set([
  // 2026-08-04 追加：Loewe 4商品(001マン/エセンシア/アグア エル クラシコ/アグア ドロップ)
  "loewe-1", "loewe-2", "loewe-3", "loewe-4",
  // 2026-08-04 追加：Ralph Lauren 6商品(Safari/Polo/Polo Blue/Polo Red/Ralph's Club EDP/Parfum)
  "ralph-lauren-1", "ralph-lauren-2", "ralph-lauren-3", "ralph-lauren-4", "ralph-lauren-5", "ralph-lauren-6",
  // 2026-08-05 追加：Lacoste L.12.12 Blanc 4商品
  "lacoste-l1212-blanc-edt-50", "lacoste-l1212-blanc-edp-50",
  "lacoste-l1212-blanc-eau-fraiche-edt-50", "lacoste-l1212-blanc-eau-intense-edt-100",
  // 2026-08-06 追加：既存4ブランドへの追補（Margiela 2 / Diptyque 4 / Prada 2）
  "maison-margiela-3", "maison-margiela-4",
  "diptyque-2", "diptyque-3", "diptyque-4", "diptyque-5",
  "prada-3", "prada-4",
]);
const SIXTH_BATCH_SLUGS = new Set([
  // 2026-08-09 追加：ブランドあたりの掲載本数を増やすための17商品（新規ブランドなし）
  "jo-malone-5", "jo-malone-6",
  "lacoste-5",
  "loewe-5", "loewe-6",
  "maison-margiela-5", "maison-margiela-6", "maison-margiela-7",
  "prada-5", "prada-6", "prada-7",
  "versace-5", "versace-6",
  "bvlgari-4",
  "guerlain-4", "guerlain-5", "guerlain-6",
]);
const SEVENTH_BATCH_SLUGS = new Set([
  // 2026-08-09 追加：インデックス未登録と判定されたブランドを厚くするための20商品
  "tom-ford-4", "tom-ford-5", "tom-ford-6", "tom-ford-7",
  "hugo-boss-2", "hugo-boss-3", "hugo-boss-4", "hugo-boss-5", "hugo-boss-6",
  "acqua-di-parma-3", "acqua-di-parma-4", "acqua-di-parma-5",
  "creed-2", "creed-3", "creed-4",
  "gucci-3", "gucci-4",
  "maison-francis-kurkdjian-2", "maison-francis-kurkdjian-3",
  "dunhill-2",
]);
const EIGHTH_BATCH_SLUGS = new Set([
  // 2026-08-09 追加：あと1〜2本で5本に届くブランドを埋める16商品
  // YSL はレディース2本だけの状態だったため、メンズ4本を入れて解消した
  "bvlgari-5", "bvlgari-6",
  "creed-5", "creed-6", "creed-7",
  "gucci-5", "gucci-6",
  "maison-francis-kurkdjian-4", "maison-francis-kurkdjian-5",
  "maison-francis-kurkdjian-6", "maison-francis-kurkdjian-7",
  "ysl-6", "ysl-7", "ysl-8", "ysl-9",
  "giorgio-armani-4",
]);
const ENRICHED_SLUGS = new Set([...PILOT_SLUGS, ...SECOND_BATCH_SLUGS, ...THIRD_BATCH_SLUGS, ...FOURTH_BATCH_SLUGS, ...FIFTH_BATCH_SLUGS, ...SIXTH_BATCH_SLUGS, ...SEVENTH_BATCH_SLUGS, ...EIGHTH_BATCH_SLUGS]);
const ENRICHMENT_FIELDS = [
  "concentration", "sizes", "recommendedFor", "notRecommendedFor", "cautions",
  "profile", "sources", "verifiedAt", "updatedAt",
];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
function validUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
  } catch { return false; }
}
// 楽天CDNの cabinet ディレクトリ名の形。ショップごとに命名規則が違うので、
// 実データから確認できた規則のみを登録する。プレースホルダ(/cabinet/c/ など)を
// そのまま登録してしまう事故を、ネットワークに出ずに検知するのが目的。
// 2026-07-30: 5商品が /cabinet/c/ のまま登録され、実写画像が404していた。
const RAKUTEN_CABINET_RULES = {
  // 03, 41, 91, 01c, 01b ... 2桁数字＋任意の1英字
  kousuimonogatari: { pattern: /^\d{2}[a-z]?$/, note: "2桁数字＋任意の英字1文字" },
  // 30, 00, 50_2 ... 2桁数字＋任意の _数字
  kousuiandco: { pattern: /^\d{2}(?:_\d)?$/, note: "2桁数字＋任意の_数字" },
};
function validateImageUrlShape(slug, img) {
  if (!img || String(img).startsWith("/img/products/")) return;
  const parsed = img.match(/\/@0_mall\/([^/]+)\/cabinet\/([^/]+)\//);
  if (!parsed) return;
  const [, mall, dir] = parsed;
  // 1英字だけのディレクトリは、規則を調べずに仮値を入れた痕跡として扱う
  if (/^[a-z]$/i.test(dir)) {
    errors.push(`楽天画像URLのcabinetディレクトリが英字1文字: ${slug} (/cabinet/${dir}/) — 仮値が残っている可能性`);
    return;
  }
  const rule = RAKUTEN_CABINET_RULES[mall];
  if (rule && !rule.pattern.test(dir)) {
    errors.push(`楽天画像URLのcabinetディレクトリが${mall}の規則(${rule.note})に合いません: ${slug} (/cabinet/${dir}/)`);
  }
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
const slugSet = new Set();
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
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || "")) errors.push(`slugが不正: ${slug || `index ${index}`}`);
  if (slugSet.has(slug)) errors.push(`slugが重複: ${slug}`);
  slugSet.add(slug);
  if (!item.purchaseLinks || !["official", "amazon", "rakuten"].every((key) => Object.hasOwn(item.purchaseLinks, key))) errors.push(`purchaseLinks構造が不正: ${slug}`);
  for (const platform of ["official", "amazon", "rakuten"]) {
    const link = item.purchaseLinks?.[platform];
    if (link !== null && (!validUrl(link?.url) || !validDate(link?.verifiedAt) || !["product", "search"].includes(link?.type))) errors.push(`${platform}リンクが不正: ${slug}`);
  }
  const isEnriched = ENRICHED_SLUGS.has(slug);
  const isSecondBatch = SECOND_BATCH_SLUGS.has(slug);
  if (isEnriched) {
    const concentration = item.concentration;
    if (concentration !== null && (!concentration?.value || !concentration?.label)) errors.push(`濃度の値または表示ラベルなし: ${slug}`);
    if (concentration === null && (item.sources || []).some((sourceEntry) => sourceEntry.supports?.includes("concentration"))) errors.push(`濃度出典があるのに値がnull: ${slug}`);
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
    if (!item.profile || item.profile.method !== "editorial-v1" || profileKeys.some((key) => item.profile[key] !== null && (!Number.isFinite(item.profile[key]) || item.profile[key] < 0 || item.profile[key] > 100))) errors.push(`profile構造が不正: ${slug}`);
    const sourceUrls = new Set();
    for (const sourceEntry of item.sources || []) {
      if (!validUrl(sourceEntry.url) || !sourceEntry.publisher || !sourceEntry.title || !validDate(sourceEntry.accessedAt)) errors.push(`情報源の必須値が不正: ${slug}`);
      if (!["official", "official-press", "authorized-distributor", "department-store", "authorized-retailer", "major-retailer"].includes(sourceEntry.sourceType)) errors.push(`情報源種別が不正: ${slug}`);
      if (!["JP", "US", "UK", "EU", "GLOBAL", "OTHER"].includes(sourceEntry.market)) errors.push(`情報源の市場区分が不正: ${slug}`);
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
  if (!Object.values(item.purchaseLinks || {}).some(Boolean) && !item.affiliateOfferKey) missing["購入リンクなし"]++;
  if (Object.hasOwn(item, "rakuten")) errors.push(`旧rakutenフィールドが残っています: ${slug}`);

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
  const purchaseCount = [item.purchaseLinks?.official?.url, item.purchaseLinks?.amazon?.url, item.purchaseLinks?.rakuten?.url].filter(Boolean).length;
  if (buyLinks.length !== purchaseCount * 2) errors.push(`購入導線数が不正: ${path} (${buyLinks.length}/${purchaseCount * 2})`);
  if (buyLinks.some((match) => !["noopener", "noreferrer"].every((rel) => match[1].includes(rel)))) errors.push(`購入リンクrel不足: ${path}`);
  const sponsoredCount = [item.purchaseLinks?.amazon?.url, item.purchaseLinks?.rakuten?.url].filter(Boolean).length * 2;
  if (buyLinks.filter((match) => match[1].includes("sponsored")).length !== sponsoredCount) errors.push(`広告リンクのsponsored指定が不正: ${path}`);
  if (isEnriched && (item.sources || []).length && !html.includes('class="section sources"')) errors.push(`情報源セクションなし: ${path}`);
  if (!isEnriched && html.includes('class="section sources"')) errors.push(`対象外商品に情報源セクションあり: ${path}`);
  if (isEnriched && !html.includes(`情報確認日：${Number(item.verifiedAt.slice(0, 4))}年`)) errors.push(`情報確認日表示なし: ${path}`);
  if (!isEnriched && html.includes("データ更新日：")) errors.push(`対象外商品に固定更新日あり: ${path}`);
  const localImageUrl = item.designImage || (String(item.img || "").startsWith("/img/products/") ? item.img : `/img/products/${slug}.png`);
  const localImagePath = `public${localImageUrl}`;
  // 実写＋意匠のハイブリッド: 実写(楽天CDN)を表示し、意匠画像はonerrorの保険として必ず残す。
  if (!existsSync(localImagePath)) errors.push(`自ドメイン商品画像なし: ${localImagePath}`);
  if (!html.includes(localImageUrl)) errors.push(`意匠画像への参照なし: ${path}`);
  // img が自ドメインの意匠画像を指す商品は「実写なし」扱い（onerrorは不要）
  const usesExternalPhoto = Boolean(item.img) && !String(item.img).startsWith("/img/products/");
  validateImageUrlShape(slug, item.img);
  const expectedPhoto = item.img || localImageUrl;
  if (!html.includes(`src="${expectedPhoto}"`)) errors.push(`商品画像srcが想定と不一致: ${path}`);
  if (usesExternalPhoto && !html.includes(`this.src='${localImageUrl}'`)) errors.push(`意匠画像へのフォールバック未設定: ${path}`);
  if (!html.includes('class="photo-family-tag"')) errors.push(`系統タグなし: ${path}`);
  if (!/<img class="photo"[^>]+alt="[^"]+"/.test(html)) errors.push(`商品画像altなし: ${path}`);

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
  const expectedProductImage = !item.img ? `https://sillage.asutelu.com${localImageUrl}`
    : String(item.img).startsWith("/") ? `https://sillage.asutelu.com${item.img}` : item.img;
  if (product?.image !== expectedProductImage) errors.push(`Product画像URL不一致: ${path}`);
  // 評価は編集部で検証していないので一切出さない。
  // 価格は楽天APIで購入リンク先そのものから取得した実測値のときだけ offers を認める。
  // 在庫は取得していないので availability は付けない。
  if (product?.aggregateRating) errors.push(`未検証の評価情報を含む: ${path}`);
  if (product?.offers) {
    const offer = product.offers;
    const offerValue = offer["@type"] === "AggregateOffer" ? offer.lowPrice : offer.price;
    if (item.priceSource !== "rakuten") errors.push(`実測価格の裏付けがない offers: ${path}`);
    if (offerValue !== item.priceValue) errors.push(`offers の価格がデータと不一致: ${path}`);
    if (offer.priceCurrency !== "JPY") errors.push(`offers の通貨がJPYでない: ${path}`);
    if (offer.availability) errors.push(`未確認の在庫状況(availability)を含む: ${path}`);
    if ((offer["@type"] === "AggregateOffer") !== Boolean(item.priceIsFrom)) {
      errors.push(`複数容量ページの offers 型が不適切: ${path}`);
    }
  } else if (item.priceSource === "rakuten") {
    errors.push(`実測価格があるのに offers がない: ${path}`);
  }

  // 実売価格として採用した商品は、掲載容量のいずれかと一致していなければならない。
  // 別容量の価格を採用すると価格帯フィルタが実態とずれる。
  if (item.priceSource === "rakuten") {
    const got = Number(String(item.priceSize ?? "").match(/(\d+(?:\.\d+)?)/)?.[1]);
    const ours = (item.sizes || []).map((size) => Number(size.volumeMl));
    if (!ours.some((n) => n === got)) errors.push(`実売価格の容量が掲載容量と不一致: ${path}`);
    if (item.priceSizeMismatch || item.priceSizeUnknown) {
      errors.push(`容量を採用できない印が付いたまま実売価格を採用: ${path}`);
    }
  }
  // 容量のフラグは対処方法が違うので、どちらか一方だけが立つようにする。
  // mismatch = 楽天リンクを単品ページへ差し替える / unknown = sizes を補う。
  if (item.priceSizeMismatch && item.priceSizeUnknown) {
    errors.push(`priceSizeMismatch と priceSizeUnknown が両方立っている: ${slug}`);
  }
  if (item.priceSizeUnknown && (item.sizes || []).length && item.priceSize) {
    errors.push(`照合できるのに priceSizeUnknown が立っている: ${slug}`);
  }
  // 作業管理用のフラグなので、ページにも配信JSONにも出さない。
  for (const flag of ["priceSizeMismatch", "priceSizeUnknown", "needsCorrectLink", "priceStaleRuns"]) {
    if (html.includes(flag)) errors.push(`${flag} がページに出力されている: ${path}`);
  }
  // 手入力のままの価格に取得日や容量が残っていると、取得していない価格を
  // 取得したように見せることになる。表示はこれらのフィールドから作られるので、
  // データ側で消えていることを確かめれば「2026年8月時点」の誤表示は起こらない。
  if (item.priceSource !== "rakuten") {
    for (const field of ["priceValue", "priceSize", "priceFetchedAt", "priceIsFrom"]) {
      if (item[field] !== undefined) errors.push(`手入力価格に ${field} が残っている: ${slug}`);
    }
  }
  const selfHref = `href="/items/${slug}"`;
  const comparisonArea = html.match(/<div class="compare-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] || "";
  if (comparisonArea.includes(selfHref)) errors.push(`類似商品に自身を含む: ${path}`);
});

console.log(`商品総数: ${fragrances.length}`);
for (const [label, count] of Object.entries(missing)) console.log(`${label}: ${count}`);
// 商品総数はソース(data/fragrances.json)が真値。固定値との比較はしない。



if (ENRICHED_SLUGS.size !== fragrances.length) errors.push(`補完済み商品数が掲載数と一致しません: ${ENRICHED_SLUGS.size} / ${fragrances.length}`);
const secondBatchItems = fragrances.filter((_, index) => SECOND_BATCH_SLUGS.has(slugs[index]));
const brandCounts = new Map();
for (const item of secondBatchItems) brandCounts.set(item.brand, (brandCounts.get(item.brand) || 0) + 1);
if (brandCounts.size < 15) errors.push(`第2段階のブランド数が15未満です: ${brandCounts.size}`);
if ([...brandCounts.values()].some((count) => count > 2)) errors.push("第2段階に同一ブランド3件以上があります");
// 2026-08-05: 「第2段階に楽天リンクあり・なしの両ケースがあること」は移行期の検査だった。
// 実写画像も楽天リンクも無い商品を全て取り下げた結果、掲載中の全商品が楽天リンクを持つ
// 状態になり、この条件は成立しなくなった。現在の掲載方針を表す検査に置き換える。
// 2026-08-08: 記事と別商品にリンクしていた商品が見つかり、正しいリンクが入るまで
// 楽天リンクを外す運用を始めた。外した商品は needsCorrectLink で追跡しているので、
// その印がある商品だけを例外として認める（印の無い商品は従来どおり不可）。
const noRakuten = fragrances.filter((item) => !item.purchaseLinks?.rakuten?.url && !item.needsCorrectLink);
if (noRakuten.length) {
  errors.push(`楽天リンクを持たない商品があります: ${noRakuten.map((item) => item.slug).join(", ")}`);
}
// 実写画像(楽天CDN)を持たない商品は掲載しない。意匠画像は onerror の保険であって「画像あり」ではない。
// ただし楽天リンクを外した商品は、その写真がリンク先＝別商品のものなので意匠画像に戻している。
const noPhoto = fragrances.filter((item) => (!item.img || String(item.img).startsWith("/img/products/"))
  && item.purchaseLinks?.rakuten?.url);
if (noPhoto.length) {
  errors.push(`実写画像を持たない商品があります: ${noPhoto.map((item) => item.slug).join(", ")}`);
}
// 別商品にリンクしていた商品の写真は、そのリンク先のボトル写真なので残してはいけない。
const wrongPhoto = fragrances.filter((item) => item.needsCorrectLink && !item.purchaseLinks?.rakuten?.url
  && String(item.img || "").includes("rakuten.co.jp"));
if (wrongPhoto.length) {
  errors.push(`リンクを外したのに楽天CDN画像が残っています: ${wrongPhoto.map((item) => item.slug).join(", ")}`);
}
// 楽天CDNの写真は、その楽天リンクの商品ページから取っている。リンクだけ差し替えて
// 写真を更新し忘れると、差し替え前の商品のボトル写真が残り続ける。
// 2026-08-08 のリンク差し替え作業で実際に起こりうると分かったので検査に入れる。
const shopOfLink = (item) => decodeURIComponent(
  new URL(item.purchaseLinks.rakuten.url).searchParams.get("url") || "",
).match(/item\.rakuten\.co\.jp\/([^/]+)\//)?.[1];
const photoShopMismatch = fragrances.filter((item) => {
  const mall = String(item.img || "").match(/@0_mall\/([^/]+)\//)?.[1];
  if (!mall || !item.purchaseLinks?.rakuten?.url) return false;
  return mall !== shopOfLink(item);
});
if (photoShopMismatch.length) {
  errors.push(`商品画像の出店者が楽天リンク先と違います（リンク差し替え時の更新漏れ）: ${photoShopMismatch.map((item) => item.slug).join(", ")}`);
}
// 同一メゾンが別ブランドとして重複登録されていないか（CK/Calvin Klein, Thierry Mugler/Mugler の再発防止）
const brandNames = [...new Set(fragrances.map((item) => item.brand))];
const brandSource = JSON.parse(readFileSync("data/brands.json", "utf8"));
const orphanBrands = brandNames.filter((name) => !brandSource.some((brand) => brand.name === name));
if (orphanBrands.length) errors.push(`BRANDSに定義が無いブランド: ${orphanBrands.join(", ")}`);
const emptyBrands = brandSource.filter((brand) => !brandNames.includes(brand.name));
if (emptyBrands.length) errors.push(`掲載0本のブランドがBRANDSに残っています: ${emptyBrands.map((b) => b.name).join(", ")}`);

// 内部の作業管理フラグが、ブラウザへ配信されるデータに混ざっていないか。
for (const deliverable of ["public/data/fragrances.json", "public/data/home-data.js"]) {
  const text = existsSync(deliverable) ? readFileSync(deliverable, "utf8") : "";
  for (const flag of ["priceSizeMismatch", "priceSizeUnknown", "needsCorrectLink", "priceStaleRuns"]) {
    if (text.includes(flag)) errors.push(`${flag} が配信データに含まれています: ${deliverable}`);
  }
}

if (errors.length) {
  console.error("\n検証エラー:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("\n商品ページ検証: OK");
}
