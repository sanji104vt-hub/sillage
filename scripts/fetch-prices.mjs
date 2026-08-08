// 購入ボタンのリンク先そのものの現在価格を楽天APIから取得し、
// data/fragrances.json の price / priceValue / priceSize / priceTier などへ書き戻す。
//
// ■ 実行タイミング
//   ビルド時・メンテナンス時に手動で実行するスクリプト。
//   Cloudflare Workers のリクエスト処理中に楽天APIを呼んではいけない
//   (subrequest 上限に当たる)。サイトは書き戻された静的JSONを読むだけにする。
//
// ■ 認証情報（Somni と同じ楽天アプリを流用）
//   RAKUTEN_APP_ID        アプリケーションID（UUID）
//   RAKUTEN_ACCESS_KEY    アクセスキー（pk_...）※秘密情報
//   RAKUTEN_ORIGIN        アプリに登録した許可Webサイト（既定 https://sillage.asutelu.com/）
//   ※ 価格取得にアフィリエイトIDは不要なので渡さない。
//
// ■ 商品の特定方法（重要）
//   もしも経由URLの url= から楽天商品URL https://item.rakuten.co.jp/{shop}/{slug}/ を得る。
//   ここで {slug} は「商品URL」であって API の itemCode とは別物のことがある。
//   例: /cosmelink/b3348900627499/ の itemCode は cosmelink:10050208。
//   そのため itemCode 直引きは当てにできず、検索結果の itemUrl が
//   /{shop}/{slug}/ を含むことを必ず確認してから採用する。これが商品取り違えの防波堤。
//
// 実行: node scripts/fetch-prices.mjs [--dry-run] [--limit N] [--slug xxx]

import { readFileSync, writeFileSync, renameSync, unlinkSync, existsSync } from "node:fs";

const FILE = "data/fragrances.json";
const TMP = "data/fragrances.json.tmp";
const ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601";
const SLEEP_MS = 1200;          // 楽天APIは概ね1秒1リクエスト。並列実行はしない
const MAX_SHOP_PAGES = 5;       // ショップ全件走査の上限（大型店で無限に走らせない）
const CHANGE_ALERT = 0.20;      // 20%以上の変動は商品取り違えの疑いとして必ず報告

const APP = process.env.RAKUTEN_APP_ID;
const KEY = process.env.RAKUTEN_ACCESS_KEY;
const ORIGIN = process.env.RAKUTEN_ORIGIN || "https://sillage.asutelu.com/";
if (!APP || !KEY) {
  console.error("環境変数 RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が必要です");
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const LIMIT = Number((args.find((a) => a.startsWith("--limit")) || "").split("=")[1] || 0)
  || (args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : 0);
const ONLY_SLUG = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const yen = (n) => "¥" + Number(n).toLocaleString("ja-JP");
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

// 実売価格ベースの価格帯。定価ベースだった頃より全体に下がる想定。
function tierOf(value) {
  if (value < 5000) return "petit";
  if (value < 12000) return "mid";
  return "high";
}

// もしも経由URL → { shop, slug }
function parseRakutenTarget(moshimoUrl) {
  try {
    const target = decodeURIComponent(new URL(moshimoUrl).searchParams.get("url") || "");
    const m = target.match(/item\.rakuten\.co\.jp\/([^/]+)\/([^/?#]+)/);
    return m ? { shop: m[1], slug: m[2] } : null;
  } catch { return null; }
}

// itemName から容量を拾う。複数容量が並ぶ商品は最小容量＋「〜」表記にする。
function parseSize(itemName) {
  const matches = [...String(itemName || "").matchAll(/(\d+(?:\.\d+)?)\s*(ml|mL|ML|ｍｌ)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 2000);
  const unique = [...new Set(matches)].sort((a, b) => a - b);
  if (!unique.length) return { size: null, isFrom: false };
  // 楽天の itemPrice は複数構成のとき通常「最小構成」の価格
  return { size: `${unique[0]}ml`, isFrom: unique.length > 1 };
}

async function callApi(query) {
  const url = `${ENDPOINT}?format=json&applicationId=${APP}&accessKey=${KEY}&${query}`;
  const response = await fetch(url, {
    headers: { Origin: ORIGIN, "User-Agent": "Mozilla/5.0 (compatible; SillagePriceBot/1.0)" },
  });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* 非JSONはそのまま扱えない */ }
  return { status: response.status, json, text };
}

const itemsOf = (json) => (json?.Items || []).map((x) => x.Item || x);

// 検索結果から「リンク先そのもの」を選ぶ。itemUrl が一致しないものは絶対に採用しない。
function pickExact(items, shop, slug) {
  const needle = `/${shop}/${slug}/`;
  return items.find((item) => String(item.itemUrl || "").includes(needle)) || null;
}

// 多段フォールバック。段ごとに1リクエストずつ、必ず itemUrl 一致を確認する。
async function lookup(product, target) {
  const { shop, slug } = target;
  const attempts = [];

  // 1) ショップ内をURLスラッグで検索（最も当たりやすい）
  attempts.push({
    label: "shop+slug",
    query: `shopCode=${encodeURIComponent(shop)}&keyword=${encodeURIComponent(slug)}&hits=30`,
  });
  // 2) itemCode 直引き（スラッグと商品番号が一致するショップで有効）
  attempts.push({ label: "itemCode", query: `itemCode=${encodeURIComponent(`${shop}:${slug}`)}` });
  // 3) ショップ内を商品名で検索
  attempts.push({
    label: "shop+name",
    query: `shopCode=${encodeURIComponent(shop)}&keyword=${encodeURIComponent(product.name)}&hits=30`,
  });

  for (const attempt of attempts) {
    const { json } = await callApi(attempt.query);
    const hit = pickExact(itemsOf(json), shop, slug);
    await sleep(SLEEP_MS);
    if (hit) return { hit, via: attempt.label };
  }

  // 4) ショップ全件を先頭から走査（上限あり。大型店は諦める）
  for (let page = 1; page <= MAX_SHOP_PAGES; page++) {
    const { json } = await callApi(`shopCode=${encodeURIComponent(shop)}&hits=30&page=${page}`);
    const items = itemsOf(json);
    const hit = pickExact(items, shop, slug);
    await sleep(SLEEP_MS);
    if (hit) return { hit, via: `shop-page${page}` };
    if (!items.length) break;
  }
  return { hit: null, via: null };
}

// ---------------------------------------------------------------- main
const document = JSON.parse(readFileSync(FILE, "utf8"));
let products = document.fragrances;
if (ONLY_SLUG) products = products.filter((p) => p.slug === ONLY_SLUG);
if (LIMIT) products = products.slice(0, LIMIT);

const before = new Map(document.fragrances.map((p) => [p.slug, { price: p.price, tier: p.priceTier, value: p.priceValue }]));
const succeeded = [];
const failed = [];
const bigChanges = [];
const tierChanges = [];

console.log(`対象 ${products.length} 件 / 1件あたり最大 ${3 + MAX_SHOP_PAGES} リクエスト・間隔 ${SLEEP_MS}ms`);
console.log(`Origin: ${ORIGIN}${DRY_RUN ? "  (dry-run: 書き込みなし)" : ""}\n`);

let index = 0;
for (const product of products) {
  index++;
  const link = product.purchaseLinks?.rakuten?.url;
  const target = link ? parseRakutenTarget(link) : null;
  if (!target) {
    product.priceSource = "manual-stale";
    failed.push({ slug: product.slug, reason: "楽天リンクなし/URL解析不可" });
    continue;
  }

  let result;
  try {
    result = await lookup(product, target);
  } catch (error) {
    result = { hit: null, via: null, error: String(error?.message || error) };
  }

  if (!result.hit || !Number.isFinite(Number(result.hit.itemPrice))) {
    // 取得失敗時は既存 price を残す。priceFetchedAt も更新しない。
    product.priceSource = "manual-stale";
    failed.push({ slug: product.slug, reason: result.error || `${target.shop}/${target.slug} を特定できず` });
    console.log(`  ${String(index).padStart(3)}/${products.length} ✗ ${product.slug} (${target.shop})`);
    continue;
  }

  const value = Number(result.hit.itemPrice);
  const { size, isFrom } = parseSize(result.hit.itemName);
  const prev = before.get(product.slug);

  product.price = yen(value) + (isFrom ? "〜" : "");
  product.priceValue = value;
  product.priceSize = size;
  product.priceFetchedAt = today;
  product.priceSource = "rakuten";
  if (isFrom) product.priceIsFrom = true; else delete product.priceIsFrom;
  const newTier = tierOf(value);
  if (prev?.tier && prev.tier !== newTier) tierChanges.push({ slug: product.slug, from: prev.tier, to: newTier });
  product.priceTier = newTier;

  // 旧価格が数値で取れる場合だけ変動率を見る（旧値は "¥15,000前後" のような文字列）
  const prevValue = Number.isFinite(prev?.value) ? prev.value : Number(String(prev?.price || "").replace(/[^\d]/g, "")) || null;
  if (prevValue && Math.abs(value - prevValue) / prevValue >= CHANGE_ALERT) {
    bigChanges.push({ slug: product.slug, from: prev.price, to: product.price, rate: ((value - prevValue) / prevValue * 100).toFixed(0) });
  }

  succeeded.push(product.slug);
  console.log(`  ${String(index).padStart(3)}/${products.length} ✓ ${product.slug.padEnd(34)} ${product.price.padStart(10)} ${String(size || "-").padEnd(7)} (${result.via})`);
}

// ------------------------------------------------------- 書き込み（原子的）
if (!DRY_RUN) {
  // 全件終わってから一括で書く。途中終了で JSON が壊れないよう temp → rename。
  writeFileSync(TMP, JSON.stringify(document, null, 2) + "\n");
  JSON.parse(readFileSync(TMP, "utf8")); // 壊れていないか読み直して確認
  renameSync(TMP, FILE);
} else if (existsSync(TMP)) {
  unlinkSync(TMP);
}

// ------------------------------------------------------------- サマリ出力
const dist = { petit: 0, mid: 0, high: 0 };
for (const p of document.fragrances) if (dist[p.priceTier] !== undefined) dist[p.priceTier]++;

console.log("\n" + "=".repeat(64));
console.log(`取得成功: ${succeeded.length}件 / 取得失敗: ${failed.length}件`);
if (failed.length) {
  console.log("\n取得失敗:");
  for (const f of failed) console.log(`  - ${f.slug}  (${f.reason})`);
}
console.log(`\n価格が${CHANGE_ALERT * 100}%以上変動: ${bigChanges.length}件`);
for (const c of bigChanges) console.log(`  - ${c.slug.padEnd(34)} ${String(c.from).padStart(12)} → ${String(c.to).padStart(10)}  (${c.rate > 0 ? "+" : ""}${c.rate}%)`);
console.log(`\ntier が変わった商品: ${tierChanges.length}件`);
for (const c of tierChanges) console.log(`  - ${c.slug.padEnd(34)} ${c.from} → ${c.to}`);
console.log(`\ntier 分布: petit ${dist.petit} / mid ${dist.mid} / high ${dist.high}`);
if (dist.high < 5) console.log("  ※ high が5件未満です。閾値の再検討を推奨します。");
console.log("=".repeat(64));
