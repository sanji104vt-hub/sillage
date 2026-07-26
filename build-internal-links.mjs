// フェーズ2内部リンク網:
// - 遅延読込HTMLに <section id="brand-index"> (47ブランドタイル)
// - 遅延読込HTMLに <section id="family-items"> (10系統 × 代表5本)
// - 各 brand-*.html 下部に「同じ系統の他ブランド」「登場記事」
// マーカー間を毎回差し替える(冪等)。既存のGA4/GSC/楽天IDは触らない。

import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const SITE = "https://sillage.asutelu.com";
const INDEX = "public/index.html";
const HOME_SCRIPT = "public/assets/home.js";
const HOME_FRAGMENT = "public/partials/home-deferred.html";
const COLUMNS_DIR = "public/columns";

const data = JSON.parse(readFileSync("data/fragrances.json", "utf8"));
const PERFUMES = data.fragrances || data;

const html = readFileSync(INDEX, "utf8");
const homeScript = readFileSync(HOME_SCRIPT, "utf8");
const homeFragment = readFileSync(HOME_FRAGMENT, "utf8");

const BRANDS = JSON.parse(readFileSync("data/brands.json", "utf8"));

// FAMILIES → FAM
function extractLine(marker) {
  const i = html.indexOf(marker);
  const end = html.indexOf("};", i);
  return html.slice(html.indexOf("{", i), end + 1);
}
const FAMILIES_START = homeScript.indexOf("const FAMILIES = [");
const FAMILIES_END = homeScript.indexOf("\n];", FAMILIES_START) + 2;
const FAMILIES = new Function(
  "return " + homeScript.slice(homeScript.indexOf("[", FAMILIES_START), FAMILIES_END).replace(/,(\s*\])/g, "$1"),
)();
const FAM = Object.fromEntries(FAMILIES.map((f) => [f.key, f]));

// ブランド名 → slug (brand-*.html のスラッグ部)
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

const escape = (s) =>
  String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ブランド統計: 掲載本数、主要系統(最頻)
function statsOf(brandName) {
  const items = PERFUMES.filter((p) => p.brand === brandName);
  const fCount = {};
  for (const p of items) fCount[p.family] = (fCount[p.family] || 0) + 1;
  const mainFamily = Object.entries(fCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  return { count: items.length, items, mainFamily, families: Object.keys(fCount) };
}

// -------- ①ブランドタイル ---------
function buildBrandIndex() {
  const brandsWithSlug = BRANDS
    .map((b) => ({ ...b, slug: BRAND_SLUG[b.name], stats: statsOf(b.name) }))
    .filter((b) => b.slug && b.stats.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  const tiles = brandsWithSlug.map((b) => {
    const famColor = FAM[b.stats.mainFamily]?.color || "#aeb0b6";
    return `<a class="brand-tile" href="/brand-${b.slug}.html">` +
      `<span class="bt-name">${escape(b.name)}</span>` +
      `<span class="bt-count">掲載 ${b.stats.count} 本</span>` +
      `<span class="bt-dot" style="background:${famColor}" aria-hidden="true"></span>` +
      `</a>`;
  }).join("");

  return `<section class="brand-index-section" id="brand-index" aria-label="ブランドから探す">
  <div class="section-head">
    <p class="kick">— brands ／ ${brandsWithSlug.length} houses</p>
    <h2>ブランドから探す</h2>
    <p class="section-copy">アルファベット順の47ブランド。タイルをクリックすると、そのブランドの掲載香水一覧・代表作・特徴を専用ページで確認できます。</p>
  </div>
  <div class="brand-index-grid">${tiles}</div>
</section>`;
}

// -------- ②系統別 代表5本 ---------
function buildFamilyItems() {
  const groups = FAMILIES.map((f) => {
    const items = PERFUMES
      .filter((p) => p.family === f.key && p.slug)
      .sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0))
      .slice(0, 5);
    return { fam: f, items };
  }).filter((g) => g.items.length > 0);

  const groupsHTML = groups.map((g) => {
    const links = g.items.map((p) =>
      `<a class="fi-item" href="/items/${p.slug}">` +
      `<span class="fi-brand">${escape(p.brand)}</span>` +
      `<span class="fi-name">${escape(p.name)}</span>` +
      `</a>`
    ).join("");
    return `<div class="fi-group">
      <div class="fi-head">
        <span class="fi-color" style="background:${g.fam.color}" aria-hidden="true"></span>
        <h3 class="fi-title">${escape(g.fam.ja)} <span class="fi-en">${escape(g.fam.en)}</span></h3>
      </div>
      <div class="fi-links">${links}</div>
    </div>`;
  }).join("");

  return `<section class="family-items-section" id="family-items" aria-label="香調から探す代表作">
  <div class="section-head">
    <p class="kick">— by family ／ 10 systems</p>
    <h2>香調から代表作を探す</h2>
    <p class="section-copy">香りの系統ごとに、掲載香水の中から新しいものを5本ずつピックアップしています。詳細ページへ直接遷移できます。</p>
  </div>
  <div class="family-items-grid">${groupsHTML}</div>
</section>`;
}

// -------- ③ブランドページ下部セクション ---------
// 記事内でブランドが言及されているか (visible text で判定)
const columnFiles = readdirSync(COLUMNS_DIR).filter((f) => f.endsWith(".html"));
const articles = columnFiles.map((f) => {
  const raw = readFileSync(`${COLUMNS_DIR}/${f}`, "utf8");
  const title = (raw.match(/<title>([^<]+?)(?:\s*[｜|]\s*Sillage[^<]*)?<\/title>/) || [, ""])[1].trim();
  // <body> 内テキストで判定 (styleやheadのタグ属性値ノイズを回避)
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = (bodyMatch ? bodyMatch[1] : raw)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ");
  return { slug: f.replace(/\.html$/, ""), title, bodyText };
});

function articlesMentioning(brandName) {
  // ブランド英名 or 和名 (数字/記号含む) が本文に含まれる記事を返す
  const needle = brandName;
  return articles.filter((a) => a.bodyText.includes(needle));
}

function relatedBrands(brandName) {
  const target = statsOf(brandName);
  const targetBrand = BRANDS.find((b) => b.name === brandName);
  if (!target.mainFamily || !targetBrand) return [];
  return BRANDS
    .map((b) => ({ ...b, slug: BRAND_SLUG[b.name], stats: statsOf(b.name) }))
    // 「同じ系統を扱う」= その系統の香水を1本以上掲載しているブランド
    .filter((b) =>
      b.slug && b.name !== brandName && b.stats.count > 0 &&
      b.stats.families.includes(target.mainFamily)
    )
    .sort((a, b) => {
      // 同じ国が先, その後 掲載本数(全体)降順
      const cA = a.country === targetBrand.country ? 0 : 1;
      const cB = b.country === targetBrand.country ? 0 : 1;
      if (cA !== cB) return cA - cB;
      return b.stats.count - a.stats.count;
    })
    .slice(0, 4);
}

function brandPageAppendix(brandName) {
  const rel = relatedBrands(brandName);
  const arts = articlesMentioning(brandName);
  if (rel.length === 0 && arts.length === 0) return "";
  const mainFamKey = statsOf(brandName).mainFamily;
  const mainFamLabel = FAM[mainFamKey]?.ja || "";

  const relHTML = rel.length ? `<section class="related-brands">
  <h2>同じ ${escape(mainFamLabel)} 系統の他のブランド</h2>
  <div class="rb-list">${rel.map((r) => {
    const c = FAM[r.stats.mainFamily]?.color || "#aeb0b6";
    return `<a class="rb-item" href="/brand-${r.slug}.html">
      <span class="rb-dot" style="background:${c}" aria-hidden="true"></span>
      <span class="rb-name">${escape(r.name)}</span>
      <span class="rb-meta">${escape(r.country)} ／ 掲載 ${r.stats.count} 本</span>
    </a>`;
  }).join("")}</div>
</section>` : "";

  const artHTML = arts.length ? `<section class="brand-articles">
  <h2>${escape(brandName)} が登場する記事</h2>
  <ul class="ba-list">${arts.map((a) =>
    `<li><a href="/columns/${a.slug}">${escape(a.title)}</a></li>`
  ).join("")}</ul>
</section>` : "";

  return `<!-- generated:brand-appendix:start -->
<style data-brand-appendix>
.related-brands,.brand-articles{margin-top:34px;border-top:1px solid #2c2d31;padding-top:24px}
.related-brands h2,.brand-articles h2{font-family:"Cormorant",serif;font-style:italic;font-weight:500;font-size:18px;color:#aeb0b6;letter-spacing:.5px;margin-bottom:14px}
.rb-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}
.rb-item{display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid #2c2d31;border-radius:6px;color:#e9e7e3;text-decoration:none;transition:border-color .15s}
.rb-item:hover{border-color:#c4c6cc}
.rb-dot{width:10px;height:10px;border-radius:50%;flex:0 0 10px}
.rb-name{font-size:14px;font-weight:500;flex:1}
.rb-meta{font-size:11px;color:#8c8c92;letter-spacing:.5px}
.ba-list{list-style:none;padding:0;margin:0}
.ba-list li{border-bottom:1px solid #1d1e21}
.ba-list li a{display:block;color:#cfcdca;text-decoration:none;font-size:13.5px;padding:11px 0}
.ba-list li a:hover{color:#fff}
</style>
${relHTML}
${artHTML}
<!-- generated:brand-appendix:end -->`;
}

// -------- インデックスへセクション挿入 (idempotent) ---------
const START1 = "<!-- generated:brand-index:start -->";
const END1 = "<!-- generated:brand-index:end -->";
const START2 = "<!-- generated:family-items:start -->";
const END2 = "<!-- generated:family-items:end -->";

const brandIndexBlock = `${START1}\n${buildBrandIndex()}\n${END1}`;
const familyItemsBlock = `${START2}\n${buildFamilyItems()}\n${END2}`;

let out = homeFragment;

// 既存マーカー間があれば差し替え、なければ挿入
function upsert(text, start, end, block, insertAfterAnchor) {
  const s = text.indexOf(start);
  if (s !== -1) {
    const e = text.indexOf(end);
    return text.slice(0, s) + block + text.slice(e + end.length);
  }
  const idx = text.indexOf(insertAfterAnchor);
  if (idx === -1) throw new Error("anchor not found: " + insertAfterAnchor);
  const insertAt = idx + insertAfterAnchor.length;
  return text.slice(0, insertAt) + "\n\n" + block + "\n" + text.slice(insertAt);
}

// ①ブランドタイル: <section class="brand-grid" id="brandGrid"></section> の直後
out = upsert(out, START1, END1, brandIndexBlock,
  `<section class="brand-grid" id="brandGrid"></section>`);

// ②系統別代表: <section class="guide-grid" id="guideGrid"></section> の直後
out = upsert(out, START2, END2, familyItemsBlock,
  `<section class="guide-grid" id="guideGrid"></section>`);

// CSS の追加 (idempotent) — <style> 末尾に注入
const CSS_START = "/* generated:internal-links:start */";
const CSS_END = "/* generated:internal-links:end */";
const CSS = `
${CSS_START}
.brand-index-section, .family-items-section{max-width:1240px;margin:56px auto 0;padding:0 clamp(16px,4vw,48px) 24px}
.brand-index-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-top:22px}
.brand-tile{display:flex;flex-direction:column;gap:4px;padding:14px 16px;border:1px solid #2c2d31;border-radius:6px;background:#141517;color:#e9e7e3;text-decoration:none;position:relative;min-height:74px;transition:border-color .15s, transform .15s}
.brand-tile:hover{border-color:#c4c6cc;transform:translateY(-1px)}
.brand-tile .bt-name{font-family:"Shippori Mincho",serif;font-weight:500;font-size:15px;color:#f0eeea;line-height:1.35}
.brand-tile .bt-count{font-family:"Bodoni Moda",serif;font-size:11px;color:#8c8c92;letter-spacing:1.5px}
.brand-tile .bt-dot{position:absolute;top:14px;right:14px;width:8px;height:8px;border-radius:50%}
.family-items-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:22px}
.fi-group{background:#141517;border:1px solid #2c2d31;border-radius:6px;padding:18px 18px 8px}
.fi-head{display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #2c2d31}
.fi-color{width:10px;height:10px;border-radius:50%}
.fi-title{font-family:"Shippori Mincho",serif;font-weight:600;font-size:16px;color:#f0eeea;margin:0}
.fi-en{font-family:"Bodoni Moda",serif;font-style:italic;font-size:11px;letter-spacing:2px;color:#8c8c92;margin-left:8px}
.fi-links{display:flex;flex-direction:column}
.fi-item{display:flex;flex-direction:column;padding:9px 0;border-bottom:1px solid #1d1e21;color:#cfcdca;text-decoration:none}
.fi-item:last-child{border-bottom:none}
.fi-item:hover{color:#fff}
.fi-brand{font-family:"Bodoni Moda",serif;font-size:10.5px;letter-spacing:1.5px;color:#9a9a9f;text-transform:uppercase}
.fi-name{font-family:"Shippori Mincho",serif;font-weight:500;font-size:14px;margin-top:2px}
@media(max-width:768px){
  .brand-index-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
  .brand-tile{min-height:70px;padding:12px 14px}
  .brand-tile .bt-name{font-size:14px}
  .fi-item{padding:12px 0;min-height:44px}
}
${CSS_END}
`;
writeFileSync(HOME_FRAGMENT, out);

let indexOut = html;
if (indexOut.includes(CSS_START)) {
  const s = indexOut.indexOf(CSS_START);
  const e = indexOut.indexOf(CSS_END) + CSS_END.length;
  indexOut = indexOut.slice(0, s) + CSS.trim() + indexOut.slice(e);
} else {
  indexOut = indexOut.replace("</style>", CSS.trim() + "\n</style>");
}

writeFileSync(INDEX, indexOut);

// -------- ブランドページ更新 ---------
const brandFiles = readdirSync("public").filter((f) => /^brand-.*\.html$/.test(f));
let touched = 0;
for (const f of brandFiles) {
  const path = `public/${f}`;
  const src = readFileSync(path, "utf8");
  // h1 からブランド名を推定できる場合もあるが、確実性のためスラッグ→BRANDS逆引き
  const slug = f.replace(/^brand-/, "").replace(/\.html$/, "");
  const brandEntry = Object.entries(BRAND_SLUG).find(([, s]) => s === slug);
  const brandName = brandEntry ? brandEntry[0] : null;
  if (!brandName) continue;

  const block = brandPageAppendix(brandName);
  if (!block) continue;

  let next = src;
  const START = "<!-- generated:brand-appendix:start -->";
  const END = "<!-- generated:brand-appendix:end -->";
  const s = next.indexOf(START);
  if (s !== -1) {
    const e = next.indexOf(END) + END.length;
    next = next.slice(0, s) + block + next.slice(e);
  } else {
    // <footer> の直前に挿入
    const anchor = "<footer>";
    const idx = next.indexOf(anchor);
    if (idx === -1) continue;
    next = next.slice(0, idx) + block + "\n" + next.slice(idx);
  }
  if (next !== src) {
    writeFileSync(path, next);
    touched++;
  }
}

console.log(`brand tiles: ${BRANDS.filter((b) => BRAND_SLUG[b.name]).length}`);
console.log(`family groups: ${FAMILIES.length}`);
console.log(`brand pages touched: ${touched}/${brandFiles.length}`);
