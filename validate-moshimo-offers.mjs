// Lacoste L.12.12 Blanc 4商品のもしも生成HTMLと商品対応を監査する。
// 実行: node validate-moshimo-offers.mjs
import { readFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";
import { MOSHIMO_AFFILIATE_OFFERS } from "./data/moshimo-affiliate-offers.mjs";

const EXPECTED = Object.freeze({
  "lacoste-l1212-blanc-edt-50": { concentration: "Eau de Toilette", volumeMl: 50, itemToken: "fr3386460149105", productText: "L.12.12 ブラン EDT・SP 50ml" },
  "lacoste-l1212-blanc-edp-50": { concentration: "Eau de Parfum", volumeMl: 50, itemToken: "fr3386460149099", productText: "L.12.12 ブラン EDP・SP 50ml" },
  "lacoste-l1212-blanc-eau-fraiche-edt-50": { concentration: "Eau de Toilette", volumeMl: 50, itemToken: "fr3386460149143", productText: "L.12.12 ブラン オーフレッシュ EDT・SP 50ml" },
  "lacoste-l1212-blanc-eau-intense-edt-100": { concentration: "Eau de Toilette", volumeMl: 100, itemToken: "fr3616303459895", productText: "L.12.12 ブラン オーインテンス EDT・SP 100ml" },
});

const errors = [];
const fragrances = loadFragrances();
const keyedProducts = fragrances.filter((item) => item.affiliateOfferKey);

if (Object.keys(MOSHIMO_AFFILIATE_OFFERS).length !== 4) errors.push("もしも静的HTMLが4件ではありません");
if (keyedProducts.length !== 4) errors.push(`もしも商品紐付けが4件ではありません: ${keyedProducts.length}`);

for (const [slug, expected] of Object.entries(EXPECTED)) {
  const item = fragrances.find((candidate) => candidate.slug === slug);
  const offer = MOSHIMO_AFFILIATE_OFFERS[slug];
  if (!item) { errors.push(`商品データなし: ${slug}`); continue; }
  if (!offer) { errors.push(`もしも静的HTMLなし: ${slug}`); continue; }
  if (item.affiliateOfferKey !== slug) errors.push(`もしもキー不一致: ${slug}`);
  if (item.concentration?.value !== expected.concentration) errors.push(`濃度不一致: ${slug}`);
  if (item.sizes?.length !== 1 || item.sizes[0]?.volumeMl !== expected.volumeMl) errors.push(`容量不一致: ${slug}`);
  if (!offer.html.includes(expected.itemToken) || !offer.html.includes(expected.productText)) errors.push(`商品URLまたは商品名不一致: ${slug}`);
  for (const parameter of ["a_id=5718841", "p_id=54", "pc_id=54", "pl_id=616"]) {
    if (!offer.html.includes(parameter)) errors.push(`もしもパラメータ欠損: ${slug} ${parameter}`);
  }
  if ((offer.html.match(/<a href="\/\/af\.moshimo\.com\/af\/c\/click\?/g) || []).length !== 1) errors.push(`クリックリンク数が不正: ${slug}`);
  if ((offer.html.match(/<img src="\/\/i\.moshimo\.com\/af\/i\/impression\?/g) || []).length !== 1) errors.push(`インプレッションタグ数が不正: ${slug}`);
  if (!offer.html.includes('width="1" height="1"')) errors.push(`1×1指定なし: ${slug}`);
  const rawAffiliateHref = offer.html.match(/<a href="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&").replace(/^\/\//, "https://");
  const rawImageSrc = offer.html.match(/<a[^>]*><img src="([^"]+)"/)?.[1]?.replace(/^\/\//, "https://");
  if (item.purchaseLinks?.rakuten?.url !== rawAffiliateHref) errors.push(`楽天ボタンURLがもしも原文と不一致: ${slug}`);
  if (item.purchaseLinks?.rakuten?.type !== "product") errors.push(`楽天リンク種別がproductではありません: ${slug}`);
  const expectedMainImage = rawImageSrc?.replace("_ex=128x128", "_ex=512x512");
  if (item.img !== expectedMainImage) errors.push(`メイン商品画像が同一楽天商品の512px画像と不一致: ${slug}`);
  if (!item.designImage?.startsWith("/img/products/") || !item.designImage.endsWith(".svg")) errors.push(`意匠画像フォールバックなし: ${slug}`);

  const pagePath = `public/items/${slug}.html`;
  const html = readFileSync(pagePath, "utf8");
  if (!html.includes(offer.html)) errors.push(`生成HTMLがもしも原文と一致しません: ${slug}`);
  if (html.includes("&lt;a href=&quot;//af.moshimo.com")) errors.push(`もしもHTMLが文字列表示されています: ${slug}`);
  if ((html.match(/\/af\/i\/impression\?a_id=5718841/g) || []).length !== 1) errors.push(`生成ページのインプレッション数が不正: ${slug}`);
  if ((html.match(/\/af\/c\/click\?a_id=5718841/g) || []).length !== 3) errors.push(`生成ページのクリックリンク数が不正: ${slug}`);
  if (!html.includes(`<img class="photo" src="${item.img}"`)) errors.push(`メイン商品画像が楽天画像ではありません: ${slug}`);
  if (!html.includes(`this.src='${item.designImage}'`)) errors.push(`メイン画像のフォールバック参照なし: ${slug}`);
  if ((html.match(/>楽天で価格を見る /g) || []).length !== 2) errors.push(`楽天で価格を見るボタンが上下2か所にありません: ${slug}`);
  const purchaseSection = html.match(/<section class="section purchase-bottom"[\s\S]*?<\/section>/)?.[0] || "";
  if (!purchaseSection.includes(offer.html)) errors.push(`もしもHTMLが購入セクション外です: ${slug}`);
  if (!purchaseSection.includes("アフィリエイト広告")) errors.push(`広告表示なし: ${slug}`);
}

const offerKeys = new Set(Object.keys(MOSHIMO_AFFILIATE_OFFERS));
for (const item of keyedProducts) {
  if (!offerKeys.has(item.affiliateOfferKey)) errors.push(`未定義のもしもキー: ${item.slug}`);
}

if (errors.length) {
  console.error("もしも商品リンク検証エラー:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("もしも商品リンク検証: OK（4商品の実物画像・楽天価格ボタン・原文HTML・インプレッションタグ一致）");
}
