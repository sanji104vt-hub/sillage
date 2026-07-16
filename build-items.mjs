// 92香水の個別ページ /items/{slug}.html を生成する
// - PERFUMES 配列と BRANDS 配列を index.html から抽出
// - 同系統(family)の他香水3本を related linkに
// - ブランドページへのリンクとBreadcrumbList JSON-LDを付与
// - 楽天アフィリエイトURLはPERFUMESに埋め込み済みのものを使用
// - データにない情報の創作/レビュー捏造は禁止(既存データのみ)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const html = readFileSync("public/index.html", "utf8");

// PERFUMES を抽出
const pStart = html.indexOf("const PERFUMES = [");
const pArr = html.slice(html.indexOf("[", pStart), html.indexOf("\n];", pStart) + 2);
const PERFUMES = new Function("return " + pArr.replace(/,(\s*\])/g, "$1"))();

// BRANDS を抽出
const bStart = html.indexOf("const BRANDS = [");
const bArr = html.slice(html.indexOf("[", bStart), html.indexOf("\n];", bStart) + 2);
const BRANDS = new Function("return " + bArr.replace(/,(\s*\])/g, "$1"))();

// FAMILIES → FAM
function extractLine(marker) {
  const i = html.indexOf(marker);
  const end = html.indexOf("};", i);
  return html.slice(html.indexOf("{", i), end + 1);
}
const FAMILIES_START = html.indexOf("const FAMILIES = [");
const FAMILIES_END = html.indexOf("\n];", FAMILIES_START) + 2;
const FAMILIES = new Function("return " + html.slice(html.indexOf("[", FAMILIES_START), FAMILIES_END).replace(/,(\s*\])/g, "$1"))();
const FAM = Object.fromEntries(FAMILIES.map(f => [f.key, f]));
const SCENE = new Function("return " + extractLine("const SCENE="))();
const SEASON = new Function("return " + extractLine("const SEASON="))();
const PRICE = new Function("return " + extractLine("const PRICE="))();

// ブランド名 → ブランドスラッグ(brand-*.htmlのファイル名部分)
const BRAND_SLUG = {
  "Jo Malone": "jo-malone", "Acqua di Parma": "acqua-di-parma", "Dior": "dior",
  "Hermès": "hermes", "4711": null, "Atelier Cologne": "atelier-cologne",
  "Guerlain": "guerlain", "無印良品": "muji", "Dolce&Gabbana": "dolce-gabbana",
  "CK": "ck", "Montblanc": "montblanc", "Azzaro": "azzaro", "Chanel": "chanel",
  "Paco Rabanne": "paco-rabanne", "Nautica": "nautica", "Brut": "brut",
  "YSL": "ysl", "Gucci": "gucci", "Calvin Klein": "calvin-klein",
  "Marc Jacobs": "marc-jacobs", "Versace": "versace", "Tom Ford": "tom-ford",
  "Mugler": "mugler", "Thierry Mugler": "thierry-mugler",
  "Jean Paul Gaultier": "jean-paul-gaultier", "Giorgio Armani": "giorgio-armani",
  "Viktor&Rolf": "viktor-rolf", "Prada": "prada", "Carolina Herrera": "carolina-herrera",
  "Parfums de Marly": "parfums-de-marly", "Maison Margiela": "maison-margiela",
  "Bvlgari": "bvlgari", "Maison Francis Kurkdjian": "maison-francis-kurkdjian",
  "Creed": "creed", "Le Labo": "le-labo", "Diptyque": "diptyque", "Byredo": "byredo",
  "Dunhill": "dunhill", "John Varvatos": "john-varvatos", "Hugo Boss": "hugo-boss",
  "Givenchy": "givenchy", "Aramis": "aramis", "SHIRO": "shiro",
  "Narciso Rodriguez": "narciso-rodriguez", "Glossier": "glossier",
  "Aesop": "aesop", "Davidoff": "davidoff", "Issey Miyake": "issey-miyake",
};

// 各香水のスラッグを {brand-slug}-{index-in-brand} で生成
const brandCounter = {};
const itemsWithSlug = PERFUMES.map((p, idx) => {
  const bs = BRAND_SLUG[p.brand];
  if (!bs) {
    // ブランドページを持たないブランド(4711等)は brand を kebab 化
    const fallback = p.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `item-${idx+1}`;
    brandCounter[fallback] = (brandCounter[fallback] || 0) + 1;
    return { ...p, slug: `${fallback}-${brandCounter[fallback]}`, idx };
  }
  brandCounter[bs] = (brandCounter[bs] || 0) + 1;
  return { ...p, slug: `${bs}-${brandCounter[bs]}`, idx };
});

const escape = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const escapeJson = s => JSON.stringify(String(s || ""));

function pageHTML(p, related) {
  const famLabel = FAM[p.family]?.ja || p.family;
  const famColor = FAM[p.family]?.color || "#aeb0b6";
  const seasons = (p.seasons || []).map(s => SEASON[s] || s).join(" / ");
  const scenes = (p.scenes || []).map(s => SCENE[s] || s).join(" / ");
  const priceTier = PRICE[p.priceTier] || "";
  const brandSlug = BRAND_SLUG[p.brand];
  const brandLink = brandSlug ? `/brand-${brandSlug}.html` : null;
  const url = `https://sillage.asutelu.com/items/${p.slug}`;
  const title = `${p.name}（${p.brand}）はどんな匂い？香調・持続・合うシーン｜Sillage`;
  const desc = `${p.brand}「${p.name}」の香調(トップ・ミドル・ラスト)、季節・シーン、価格帯、Sillageの見立てをまとめています。`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Sillage", "item": "https://sillage.asutelu.com/" },
      ...(brandLink ? [{ "@type": "ListItem", "position": 2, "name": p.brand, "item": `https://sillage.asutelu.com${brandLink}` }] : []),
      { "@type": "ListItem", "position": brandLink ? 3 : 2, "name": p.name, "item": url },
    ]
  };
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.name,
    "brand": { "@type": "Brand", "name": p.brand },
    "category": famLabel,
    "description": p.verdict || desc,
    "url": url,
    ...(p.img ? { "image": p.img } : {}),
  };

  const buyBtn = p.rakuten
    ? `<a class="buy" href="${escape(p.rakuten)}" target="_blank" rel="nofollow sponsored noopener">楽天で見る</a>`
    : `<a class="buy" href="/" rel="nofollow">Sillageトップへ</a>`;

  const relatedLinks = related.map(r => `<a href="/items/${r.slug}"><b>${escape(r.brand)}</b> ${escape(r.name)}</a>`).join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escape(title)}</title>
<meta name="description" content="${escape(desc)}">
<meta name="google-site-verification" content="UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q" />
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-60BQRQWB5M"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-60BQRQWB5M');
</script>
<link rel="canonical" href="${url}">
<meta property="og:type" content="product">
<meta property="og:title" content="${escape(p.name)}｜${escape(p.brand)}｜Sillage">
<meta property="og:description" content="${escape(desc)}">
<meta property="og:url" content="${url}">
${p.img ? `<meta property="og:image" content="${escape(p.img)}">` : ""}
<meta property="og:site_name" content="Sillage（シヤージュ）">
<meta name="twitter:card" content="summary${p.img ? "_large_image" : ""}">
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
<script type="application/ld+json">${JSON.stringify(product)}</script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d0e10;color:#e9e7e3;font-family:"Zen Kaku Gothic New","Noto Sans JP",system-ui,sans-serif;line-height:1.7;-webkit-font-smoothing:antialiased}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:14px clamp(16px,4vw,48px);border-bottom:1px solid #2c2d31;background:rgba(13,14,16,.84)}
.logo{font-family:"Bodoni Moda",serif;font-weight:500;font-size:24px;letter-spacing:2px;color:#e9e7e3;text-decoration:none}
.pr-tag{font-size:11px;letter-spacing:1.5px;color:#8c8c92;border:1px solid #2c2d31;border-radius:999px;padding:5px 12px}
article{max-width:760px;margin:0 auto;padding:44px clamp(18px,4vw,40px) 60px}
.crumb{font-family:"Cormorant",serif;font-style:italic;font-size:14px;color:#8c8c92;margin-bottom:22px}
.crumb a{color:#aeb0b6;text-decoration:none}
.crumb a:hover{text-decoration:underline}
.brand-line{font-family:"Bodoni Moda",serif;font-size:13px;letter-spacing:3px;color:#9a9a9f;text-transform:uppercase;margin-bottom:10px}
h1{font-family:"Shippori Mincho",serif;font-weight:600;font-size:clamp(24px,4.5vw,32px);line-height:1.5;color:#fff;letter-spacing:1px;margin-bottom:8px}
.h1sub{font-family:"Cormorant",serif;font-style:italic;font-size:16px;color:#8c8c92;margin-bottom:22px}
.fam-pill{display:inline-block;font-size:12px;padding:5px 12px;border-radius:999px;color:#0d0e10;font-weight:600;font-family:"Shippori Mincho",serif;margin-bottom:20px}
.photo{width:100%;max-width:340px;margin:0 auto 26px;display:block;background:#fafaf7;padding:22px;border-radius:6px}
.pyramid{border:1px solid #2c2d31;border-radius:4px;padding:22px;margin-bottom:24px}
.pyramid .row{display:flex;gap:12px;padding:9px 0;font-size:14px}
.pyramid .row+.row{border-top:1px dashed #2c2d31}
.pyramid .lv{font-family:"Cormorant",serif;font-style:italic;font-size:14px;color:#aeb0b6;min-width:60px;flex:0 0 60px;letter-spacing:.5px}
.pyramid .lv-top{color:#e9e7e3}
.pyramid .lv-mid{color:#c9b558}
.pyramid .lv-last{color:#c4889c}
.pyramid .val{color:#cfcdca;flex:1}
.meta-grid{display:grid;grid-template-columns:110px 1fr;gap:10px 16px;font-size:14px;margin-bottom:26px}
.meta-grid dt{font-family:"Cormorant",serif;font-style:italic;color:#8c8c92;letter-spacing:.5px}
.meta-grid dd{color:#cfcdca}
.verdict{background:#141517;border-left:3px solid ${famColor};padding:16px 18px;font-size:14.5px;line-height:1.9;color:#e9e7e3;margin-bottom:28px;border-radius:0 4px 4px 0}
.verdict .vlabel{display:block;font-family:"Cormorant",serif;font-style:italic;font-size:14px;color:#aeb0b6;margin-bottom:6px;letter-spacing:.5px}
.actions{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:36px}
.buy{display:inline-flex;align-items:center;justify-content:center;font-family:"Cormorant",serif;font-style:italic;font-size:16px;letter-spacing:.5px;color:#0d0e10;background:#c4c6cc;border-radius:999px;padding:12px 26px;min-height:44px;text-decoration:none;transition:opacity .18s}
.buy:hover{opacity:.88}
.brand-link{display:inline-flex;align-items:center;min-height:44px;font-family:"Cormorant",serif;font-style:italic;font-size:15px;color:#aeb0b6;border:1px solid #2c2d31;border-radius:999px;padding:0 22px;text-decoration:none;transition:border-color .18s}
.brand-link:hover{border-color:#c4c6cc;color:#fff}
.related,.disc{margin-top:32px;border-top:1px solid #2c2d31;padding-top:22px}
.related h2{font-family:"Cormorant",serif;font-style:italic;font-weight:500;font-size:18px;color:#aeb0b6;letter-spacing:.5px;margin-bottom:14px}
.related a{display:block;color:#cfcdca;text-decoration:none;font-size:13.5px;padding:11px 0;border-bottom:1px solid #1d1e21;min-height:44px;display:flex;align-items:center;gap:8px}
.related a b{font-family:"Bodoni Moda",serif;font-size:11.5px;letter-spacing:2px;color:#9a9a9f;text-transform:uppercase}
.related a:hover{color:#fff}
.backhome{display:inline-block;margin-top:36px;font-family:"Cormorant",serif;font-style:italic;font-size:16px;color:#e9e7e3;border-bottom:1px solid #c4c6cc;padding-bottom:2px;text-decoration:none}
footer{background:#141517;padding:32px clamp(16px,4vw,48px);border-top:1px solid #2c2d31;font-size:12px;color:#8c8c92;line-height:1.8}
footer a{color:#aeb0b6}
</style>
</head>
<body>
<header class="topbar">
  <a class="logo" href="/">Sillage</a>
  <span class="pr-tag">PR・アフィリエイト広告を含みます</span>
</header>
<article>
  <p class="crumb"><a href="/">Sillage</a>${brandLink ? ` ／ <a href="${brandLink}">${escape(p.brand)}</a>` : ""} ／ ${escape(p.name)}</p>
  <p class="brand-line">${escape(p.brand)}</p>
  <h1>${escape(p.name)}</h1>
  <p class="h1sub">${escape(p.brand)} — ${escape(famLabel)}</p>
  <span class="fam-pill" style="background:${famColor}">${escape(famLabel)}</span>
  ${p.img ? `<img class="photo" src="${escape(p.img)}" alt="${escape(p.brand)} ${escape(p.name)}" loading="lazy">` : ""}
  <div class="pyramid">
    <div class="row"><span class="lv lv-top">Top</span><span class="val">${escape(p.top)}</span></div>
    <div class="row"><span class="lv lv-mid">Middle</span><span class="val">${escape(p.mid)}</span></div>
    <div class="row"><span class="lv lv-last">Last</span><span class="val">${escape(p.last)}</span></div>
  </div>
  <dl class="meta-grid">
    <dt>系統</dt><dd>${escape(famLabel)}</dd>
    <dt>シーン</dt><dd>${escape(scenes)}</dd>
    <dt>季節</dt><dd>${escape(seasons)}</dd>
    <dt>価格帯</dt><dd>${escape(priceTier)}（${escape(p.price || "")}）</dd>
    ${p.releaseYear ? `<dt>発売</dt><dd>${p.releaseYear}年</dd>` : ""}
  </dl>
  <p class="verdict"><span class="vlabel">Sillage の見立て</span>${escape(p.verdict || "")}</p>
  <div class="actions">
    ${buyBtn}
    ${brandLink ? `<a class="brand-link" href="${brandLink}">${escape(p.brand)}の特集ページ →</a>` : ""}
  </div>
  <div class="related">
    <h2>同じ ${escape(famLabel)} の香水</h2>
    ${relatedLinks || "<p>関連香水はありません。</p>"}
  </div>
  <a class="backhome" href="/">← Sillage トップへ（他の香水を探す）</a>
</article>
<footer>
  当サイトはアフィリエイトプログラムを利用し、商品紹介により収益を得ています。本文はブランドおよび商品の公開情報をもとにした当サイト編集部の記述であり、ブランドからの提供文ではありません。<br>
  <a href="/">Sillage（シヤージュ）— 香りで選ぶメンズ香水比較</a>
</footer>
</body>
</html>`;
}

// 出力
if (!existsSync("public/items")) mkdirSync("public/items", { recursive: true });

let totalSize = 0;
let maxSize = 0;
const slugMap = {}; // idx → slug for card link injection
for (const p of itemsWithSlug) {
  // 同family 3本(自身以外)
  const related = itemsWithSlug
    .filter(q => q.family === p.family && q.slug !== p.slug)
    .sort(() => Math.random() - 0.5)  // 決定的にはならないが表示バラつき用
    .slice(0, 3);
  const html = pageHTML(p, related);
  const path = `public/items/${p.slug}.html`;
  writeFileSync(path, html);
  totalSize += html.length;
  if (html.length > maxSize) maxSize = html.length;
  slugMap[p.idx] = p.slug;
}

// slugMap を JSON 出力(index.html への埋め込み用)
writeFileSync("build-items-slugmap.json", JSON.stringify(itemsWithSlug.map(p => p.slug)));

console.log(`Generated ${itemsWithSlug.length} item pages`);
console.log(`Avg size: ${Math.round(totalSize / itemsWithSlug.length)} bytes`);
console.log(`Max size: ${maxSize} bytes (${(maxSize / 1024).toFixed(1)}KB)`);
