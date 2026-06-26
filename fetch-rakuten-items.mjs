// 各香水のブランド+商品名で楽天市場（新API）を検索し、
//   rakuten(アフィリエイトURL) / img(実画像)
// を public/index.html の PERFUMES 配列に書き込む。
//
// 認証情報は環境変数:
//   RAKUTEN_APP_ID        アプリケーションID（UUID）
//   RAKUTEN_ACCESS_KEY    アクセスキー（pk_...）※秘密情報
//   RAKUTEN_AFFILIATE_ID  アフィリエイトID
//   RAKUTEN_ORIGIN        アプリ登録した「許可されたWebサイト」 (例 https://sillage.sanji-104vt.workers.dev)
//
// 実行: 上記4つを環境変数で渡して `node fetch-rakuten-items.mjs`
import { readFileSync, writeFileSync } from "node:fs";

const APP = process.env.RAKUTEN_APP_ID;
const KEY = process.env.RAKUTEN_ACCESS_KEY;
const AFF = process.env.RAKUTEN_AFFILIATE_ID;
const ORIGIN = process.env.RAKUTEN_ORIGIN;
if (!APP || !KEY || !AFF || !ORIGIN) {
  console.error("環境変数 RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY / RAKUTEN_AFFILIATE_ID / RAKUTEN_ORIGIN が必要です");
  process.exit(1);
}

const ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601";
const FILE = "public/index.html";
const html = readFileSync(FILE, "utf8");

const startKey = "const PERFUMES = [";
const startIdx = html.indexOf(startKey);
const arrStart = html.indexOf("[", startIdx);
// 配列終端は `\n];` を探す
const closeBracket = html.indexOf("\n];", arrStart) + 1;
const arrText = html.slice(arrStart, closeBracket + 1);

// JSの相対オブジェクト記法(キーがクオートなし、末尾カンマ等)を JSON に変換せず、
// eval ではなく `Function` で評価して安全側に。配列は値のみ。
const products = new Function("return " + arrText.replace(/,(\s*[\]\}])/g, "$1"))();

const BRAND_FIX = {
  "YSL": "イヴサンローラン",
  "CK": "カルバンクライン",
  "Calvin Klein": "カルバンクライン",
  "Hermès": "エルメス",
  "Hermes": "エルメス",
  "Acqua di Parma": "アクアディパルマ",
  "Atelier Cologne": "アトリエコロン",
  "Jo Malone": "ジョーマローン",
  "Tom Ford": "トムフォード",
  "Maison Margiela": "メゾンマルジェラ",
  "Maison Francis Kurkdjian": "メゾンフランシスクルジャン",
  "Parfums de Marly": "パルファムドマリー",
  "Viktor&Rolf": "ヴィクター&ロルフ",
  "Dolce&Gabbana": "ドルチェ&ガッバーナ",
  "Carolina Herrera": "キャロリーナヘレラ",
  "Thierry Mugler": "ティエリーミュグレー",
  "Mugler": "ミュグレー",
  "Marc Jacobs": "マークジェイコブス",
  "Jean Paul Gaultier": "ジャンポールゴルチエ",
  "Giorgio Armani": "ジョルジオアルマーニ",
  "Paco Rabanne": "パコラバンヌ",
  "Calvin Klein": "カルバンクライン",
  "Montblanc": "モンブラン",
  "Azzaro": "アザロ",
  "Versace": "ヴェルサーチ",
  "Gucci": "グッチ",
  "Chanel": "シャネル",
  "Dior": "ディオール",
  "Guerlain": "ゲラン",
  "Bvlgari": "ブルガリ",
  "Prada": "プラダ",
  "Nautica": "ノーティカ",
  "Brut": "ブルット",
};
const ASCII_FOLD = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
const buildKeyword = (p) => {
  const brand = BRAND_FIX[p.brand] || ASCII_FOLD(p.brand);
  // & / ＆ は楽天で無効になりやすい → スペースに
  const name = p.name.replace(/[&＆]/g, " ");
  return `${brand} ${name}`.replace(/\s+/g, " ").trim();
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const bigImg = (u) =>
  /_ex=\d+x\d+/.test(u) ? u.replace(/_ex=\d+x\d+/, "_ex=512x512") : u + (u.includes("?") ? "&" : "?") + "_ex=512x512";

async function search(keyword) {
  const url =
    ENDPOINT +
    "?format=json&hits=3&imageFlag=1&availability=1" +
    "&applicationId=" + APP +
    "&accessKey=" + KEY +
    "&affiliateId=" + AFF +
    "&keyword=" + encodeURIComponent(keyword);
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Origin: ORIGIN } });
    if (r.status === 200) return (await r.json()).Items?.[0]?.Item || null;
    if (r.status === 429) { await sleep(3000); continue; }
    console.warn(`  ! [${r.status}] ${keyword}: ${(await r.text()).slice(0, 160)}`);
    return null;
  }
  return null;
}

let matched = 0;
const missed = [];
for (const p of products) {
  const kw = buildKeyword(p);
  const it = await search(kw);
  if (it && (it.affiliateUrl || it.itemUrl)) {
    p.rakuten = it.affiliateUrl || it.itemUrl;
    const img = it.mediumImageUrls?.[0]?.imageUrl;
    if (img) p.img = bigImg(img);
    matched++;
    console.log(`  ✓ ${p.brand} ${p.name} → ${it.itemName.slice(0, 32)}…`);
  } else {
    missed.push(`${p.brand} ${p.name}`);
    console.log(`  － ${p.brand} ${p.name}（該当なし）`);
  }
  await sleep(1200);
}

// 元のオブジェクト記法(キーなしクオート)に近い形で書き戻すと差分が大きいので JSON で書き戻し
const newArr = "[\n" + products.map((p) => "  " + JSON.stringify(p)).join(",\n") + "\n]";
writeFileSync(FILE, html.slice(0, arrStart) + newArr + html.slice(closeBracket + 1));

console.log(`\n香水数: ${products.length} / マッチ: ${matched} / 未マッチ: ${missed.length}`);
if (missed.length) console.log("未マッチ:", missed.join(", "));
