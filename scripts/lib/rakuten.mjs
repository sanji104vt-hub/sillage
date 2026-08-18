// 楽天商品の特定と容量読み取り。fetch-prices.mjs と週次監査の両方が使う。
//
// ここに切り出しているのは「リンク先の商品を取り違えない」ための判定で、
// 二重に持つと片方だけ直して食い違う。挙動は fetch-prices.mjs のものと同一。

export const ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";
export const SLEEP_MS = 1200;      // 楽天APIは概ね1秒1リクエスト。並列実行はしない
export const MAX_SHOP_PAGES = 5;   // ショップ全件走査の上限（大型店で無限に走らせない）

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// もしも経由URL → { shop, slug, url }（url はもしもを剥がした素の楽天商品URL）
export function parseRakutenTarget(moshimoUrl) {
  try {
    const target = decodeURIComponent(new URL(moshimoUrl).searchParams.get("url") || "");
    const m = target.match(/item\.rakuten\.co\.jp\/([^/]+)\/([^/?#]+)/);
    return m ? { shop: m[1], slug: m[2], url: target } : null;
  } catch { return null; }
}

// itemName から容量を拾う。複数容量が並ぶ商品は最小容量＋「〜」表記にする。
//
// 楽天の商品名は表記がばらつくので、先に NFKC 正規化して吸収する。
//   全角 ｍｌ／ＭＬ → ml／ML、全角数字 １００ → 100、全角空白 → 半角空白、
//   合字 ㎖ → ml。そのうえで大文字小文字を無視して照合する（ml/mL/ML/Ml）。
// 「100ml/3.3oz」のような oz 併記は ml 側だけが拾われる（oz にはマッチしない）。
export function parseSize(itemName) {
  const text = String(itemName || "").normalize("NFKC");
  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*ml/gi)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 2000);
  const unique = [...new Set(matches)].sort((a, b) => a - b);
  if (!unique.length) return { size: null, isFrom: false };
  // 楽天の itemPrice は複数構成のとき通常「最小構成」の価格
  return { size: `${unique[0]}ml`, isFrom: unique.length > 1 };
}

// "50ml" "50mL" "50ML" "50 mL" を同じ 50 として扱う。数値だけ取り出して比較する。
export function mlOf(value) {
  const n = Number(String(value ?? "").match(/(\d+(?:\.\d+)?)/)?.[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const itemsOf = (json) => (json?.Items || []).map((x) => x.Item || x);

// 検索結果から「リンク先そのもの」を選ぶ。itemUrl が一致しないものは絶対に採用しない。
// 楽天のURLスラッグと API の itemCode は別物のことがあるため、これが取り違えの防波堤。
export function pickExact(items, shop, slug) {
  const needle = `/${shop}/${slug}/`;
  return items.find((item) => String(item.itemUrl || "").includes(needle)) || null;
}

// 多段フォールバック。段ごとに1リクエストずつ、必ず itemUrl 一致を確認する。
// callApi は呼び出し側から渡す（認証情報とガードは各スクリプトが持つ）。
export async function lookup({ callApi, product, target, sleepMs = SLEEP_MS, maxShopPages = MAX_SHOP_PAGES }) {
  const { shop, slug } = target;
  const attempts = [
    // 1) ショップ内をURLスラッグで検索（最も当たりやすい）
    { label: "shop+slug", query: `shopCode=${encodeURIComponent(shop)}&keyword=${encodeURIComponent(slug)}&hits=30` },
    // 2) itemCode 直引き（スラッグと商品番号が一致するショップで有効）
    { label: "itemCode", query: `itemCode=${encodeURIComponent(`${shop}:${slug}`)}` },
    // 3) ショップ内を商品名で検索
    { label: "shop+name", query: `shopCode=${encodeURIComponent(shop)}&keyword=${encodeURIComponent(product.name)}&hits=30` },
  ];

  for (const attempt of attempts) {
    const { json } = await callApi(attempt.query);
    const hit = pickExact(itemsOf(json), shop, slug);
    await sleep(sleepMs);
    if (hit) return { hit, via: attempt.label };
  }

  // 4) ショップ全件を先頭から走査（上限あり。大型店は諦める）
  for (let page = 1; page <= maxShopPages; page++) {
    const { json } = await callApi(`shopCode=${encodeURIComponent(shop)}&hits=30&page=${page}`);
    const items = itemsOf(json);
    const hit = pickExact(items, shop, slug);
    await sleep(sleepMs);
    if (hit) return { hit, via: `shop-page${page}` };
    if (!items.length) break;
  }
  return { hit: null, via: null };
}
