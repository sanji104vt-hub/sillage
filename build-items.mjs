// 92香水の個別ページ /items/{slug}.html を生成する
// - 商品データは data/fragrances.json、表示ラベルは index.html から取得
// - 同系統(family)の他香水3本を related linkに
// - ブランドページへのリンクとBreadcrumbList JSON-LDを付与
// - 楽天アフィリエイトURLはPERFUMESに埋め込み済みのものを使用
// - データにない情報の創作/レビュー捏造は禁止(既存データのみ)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";
import { familyOgpUrl } from "./lib/ogp-image.mjs";
import { loadSiteCopy } from "./lib/site-copy.mjs";

const homeScript = readFileSync("public/assets/home.js", "utf8");
const SITE_COPY = loadSiteCopy();
const SITE = SITE_COPY.siteUrl.replace(/\/$/, "");
const PERFUMES = loadFragrances();
const TRIAL_DATA = JSON.parse(readFileSync("data/fragrance-trials.json", "utf8"));
const TRIALS = new Map((TRIAL_DATA.trials || []).map((trial) => [trial.slug, trial]));

// BRANDS を抽出
const BRANDS = JSON.parse(readFileSync("data/brands.json", "utf8"));

// FAMILIES → FAM
function extractLine(marker) {
  const i = homeScript.indexOf(marker);
  if (i < 0) throw new Error(`${marker} が public/assets/home.js に見つかりません`);
  const end = homeScript.indexOf("};", i);
  return homeScript.slice(homeScript.indexOf("{", i), end + 1);
}
const FAMILIES_START = homeScript.indexOf("const FAMILIES = [");
const FAMILIES_END = homeScript.indexOf("\n];", FAMILIES_START) + 2;
if (FAMILIES_START < 0 || FAMILIES_END < 2) throw new Error("FAMILIES が public/assets/home.js に見つかりません");
const FAMILIES = new Function("return " + homeScript.slice(homeScript.indexOf("[", FAMILIES_START), FAMILIES_END).replace(/,(\s*\])/g, "$1"))();
const FAM = Object.fromEntries(FAMILIES.map(f => [f.key, f]));
const SCENE = new Function("return " + extractLine("const SCENE="))();
const SEASON = new Function("return " + extractLine("const SEASON="))();
const PRICE = new Function("return " + extractLine("const PRICE="))();
const PRICE_RANK = { petit: 1, mid: 2, high: 3 };
// 第2段階で既に商品/検索ラベルを公開済みの商品。その他は移行前の「確認」表示を維持する。
const TYPED_PURCHASE_LABEL_SLUGS = new Set([
  "jo-malone-1", "acqua-di-parma-1", "dior-1", "hermes-1", "guerlain-2",
  "dior-4", "mugler-1", "ysl-3", "bvlgari-1", "chanel-4", "tom-ford-2",
  "creed-1", "diptyque-1", "byredo-1", "tom-ford-3", "le-labo-2",
  "maison-margiela-2", "giorgio-armani-3", "issey-miyake-1", "versace-4",
]);

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

const itemsWithSlug = PERFUMES;

const escape = s => String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const escapeJson = s => JSON.stringify(String(s || ""));
const formatDate = value => {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[1]}年${Number(match[2])}月${Number(match[3])}日` : String(value || "");
};
const formatSizes = sizes => (sizes || []).map((size) => {
  const volume = `${Number(size.volumeMl)}mL`;
  return size.referencePriceYen
    ? `${volume}：参考価格 ${Number(size.referencePriceYen).toLocaleString("ja-JP")}円（税込）`
    : volume;
}).join(" / ");
const trialMediumLabel = medium => ({
  skin: "肌",
  blotter: "ムエット",
  both: "肌とムエット",
}[medium] || medium);

const filterUrl = (field, value) => `/?${field}=${encodeURIComponent(value)}#fragrances`;

function uniqueRelated(p, all) {
  const result = [];
  const append = (candidates) => candidates.forEach((candidate) => {
    if (candidate.slug !== p.slug && !result.some((item) => item.slug === candidate.slug)) result.push(candidate);
  });
  append(all.filter((q) => q.brand === p.brand));
  append(all.filter((q) => q.family === p.family));
  append(all.filter((q) => (q.scenes || []).some((scene) => (p.scenes || []).includes(scene))));
  return result.slice(0, 3);
}

function directCompetitors(p, all) {
  const scored = all
    .filter((candidate) => candidate.slug !== p.slug)
    .map((candidate, index) => {
      const sharedScenes = (candidate.scenes || []).filter((scene) => (p.scenes || []).includes(scene)).length;
      const sharedSeasons = (candidate.seasons || []).filter((season) => (p.seasons || []).includes(season)).length;
      const score =
        (candidate.family === p.family ? 8 : 0) +
        (candidate.brand !== p.brand ? 4 : 0) +
        sharedScenes * 2 +
        sharedSeasons +
        (candidate.priceTier && candidate.priceTier === p.priceTier ? 1 : 0);
      return { candidate, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);
  const differentBrands = scored.filter(({ candidate }) => candidate.brand !== p.brand);
  const pool = differentBrands.length >= 2 ? differentBrands : scored;
  return pool.slice(0, 2).map(({ candidate }) => candidate);
}

function comparisonLabel(p, candidate) {
  if ((PRICE_RANK[candidate.priceTier] || 0) < (PRICE_RANK[p.priceTier] || 0)) return "価格帯を抑えやすい";
  if (!(p.scenes || []).includes("business") && (candidate.scenes || []).includes("business")) return "ビジネス向け";
  if (!(p.scenes || []).includes("date") && (candidate.scenes || []).includes("date")) return "デート向け";
  return "";
}

function comparisonReason(p, candidate) {
  const reasons = [];
  if (candidate.family === p.family) reasons.push(`同じ${FAM[p.family]?.ja || p.family}香調`);
  const sharedScenes = (candidate.scenes || []).filter((scene) => (p.scenes || []).includes(scene));
  if (sharedScenes.length) reasons.push(`${sharedScenes.map((scene) => SCENE[scene] || scene).join("・")}で比較しやすい`);
  if (candidate.priceTier && candidate.priceTier === p.priceTier) reasons.push("同じ価格帯");
  return reasons.slice(0, 2).join(" ／ ") || "近い利用条件";
}

function comparisonRows(p, candidate) {
  const rows = [];
  const append = (label, current, other) => {
    if (current && other) rows.push({ label, current, other });
  };
  append("香調", FAM[p.family]?.ja || p.family, FAM[candidate.family]?.ja || candidate.family);
  append("濃度", p.concentration?.label, candidate.concentration?.label);
  append("価格帯", PRICE[p.priceTier] || p.priceTier, PRICE[candidate.priceTier] || candidate.priceTier);
  append("シーン", (p.scenes || []).map((scene) => SCENE[scene] || scene).join(" / "), (candidate.scenes || []).map((scene) => SCENE[scene] || scene).join(" / "));
  append("季節", (p.seasons || []).map((season) => SEASON[season] || season).join(" / "), (candidate.seasons || []).map((season) => SEASON[season] || season).join(" / "));
  append("トップ", p.top, candidate.top);
  append("ミドル", p.mid, candidate.mid);
  append("ラスト", p.last, candidate.last);
  append("編集見立て", p.verdict, candidate.verdict);
  return rows;
}

function pageHTML(p, related, competitors, trial) {
  const famLabel = FAM[p.family]?.ja || p.family;
  const famColor = FAM[p.family]?.color || "#aeb0b6";
  const ogImage = familyOgpUrl(p.family);
  const seasons = (p.seasons || []).map(s => SEASON[s] || s).join(" / ");
  const scenes = (p.scenes || []).map(s => SCENE[s] || s).join(" / ");
  const priceTier = PRICE[p.priceTier] || "";
  const brandSlug = BRAND_SLUG[p.brand];
  const brandLink = brandSlug ? `/brand-${brandSlug}.html` : null;
  const url = `${SITE}/items/${p.slug}`;
  const title = `${p.name}（${p.brand}）はどんな匂い？香調・持続・合うシーン｜Sillage`;
  const desc = `${p.brand}「${p.name}」の香調(トップ・ミドル・ラスト)、季節・シーン、価格帯、Sillageの見立てをまとめています。`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": SITE_COPY.shortName, "item": SITE_COPY.siteUrl },
      ...(brandLink ? [{ "@type": "ListItem", "position": 2, "name": p.brand, "item": `${SITE}${brandLink}` }] : []),
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
    ...(ogImage ? { "image": ogImage } : {}),
  };

  const officialUrl = p.purchaseLinks?.official?.url || "";
  const amazonUrl = p.purchaseLinks?.amazon?.url || "";
  const rakutenUrl = p.purchaseLinks?.rakuten?.url || "";
  const purchaseLabel = (link, shop) => !TYPED_PURCHASE_LABEL_SLUGS.has(p.slug)
    ? `${shop}で確認`
    : link?.type === "search" ? `${shop}で検索` : link?.type === "product" ? `${shop}で商品を見る` : `${shop}で確認`;
  const purchaseButtons = [
    officialUrl ? `<a class="buy buy-official" href="${escape(officialUrl)}" target="_blank" rel="noopener noreferrer" data-purchase-shop="official" data-product-id="${escape(p.slug)}">${purchaseLabel(p.purchaseLinks?.official, "公式サイト")} <span aria-hidden="true">↗</span><span class="sr-only">（外部サイト）</span></a>` : "",
    amazonUrl ? `<a class="buy" href="${escape(amazonUrl)}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-purchase-shop="amazon" data-product-id="${escape(p.slug)}">${purchaseLabel(p.purchaseLinks?.amazon, "Amazon")} <span aria-hidden="true">↗</span><span class="sr-only">（広告・外部サイト）</span></a>` : "",
    rakutenUrl ? `<a class="buy" href="${escape(rakutenUrl)}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-purchase-shop="rakuten" data-product-id="${escape(p.slug)}">${purchaseLabel(p.purchaseLinks?.rakuten, "楽天市場")} <span aria-hidden="true">↗</span><span class="sr-only">（広告・外部サイト）</span></a>` : "",
  ].filter(Boolean).join("");
  const hasSponsoredPurchase = Boolean(amazonUrl || rakutenUrl);
  const sizeSummary = formatSizes(p.sizes);
  const recommendationItems = (p.recommendedFor || []).map((item) => `<li>${escape(item.text)}</li>`).join("");
  const notRecommendationItems = (p.notRecommendedFor || []).map((item) => `<li>${escape(item.text)}</li>`).join("");
  const cautionItems = (p.cautions || []).map((item) => `<li>${escape(item)}</li>`).join("");
  const sourceLabels = {
    official: "公式",
    "official-press": "公式発表",
    "authorized-distributor": "正規取扱店",
    "department-store": "百貨店",
    "authorized-retailer": "正規取扱店",
    "major-retailer": "主要販売店",
  };
  const sourceItems = (p.sources || []).map((source) => `<li><span class="source-type">${sourceLabels[source.sourceType] || "情報源"}</span><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.publisher || source.title)} — ${escape(source.title)} <span aria-hidden="true">↗</span><span class="sr-only">（外部サイト）</span></a><span class="source-date">確認日：${escape(formatDate(source.accessedAt))}</span></li>`).join("");
  const notes = [
    { key: "top", label: "つけた直後", time: "トップノートの目安", value: p.top },
    { key: "mid", label: "30分〜数時間", time: "ミドルノートの目安", value: p.mid },
    { key: "last", label: "数時間後", time: "ラストノートの目安", value: p.last },
  ].filter((note) => note.value);
  const sceneTags = (p.scenes || []).map((scene) => `<a class="tag" href="${filterUrl("scene", scene)}"><span>${escape(SCENE[scene] || scene)}</span><span class="sr-only">の香水一覧へ</span></a>`).join("");
  const seasonTags = (p.seasons || []).map((season) => `<a class="tag" href="${filterUrl("season", season)}"><span>${escape(SEASON[season] || season)}</span><span class="sr-only">向けの香水一覧へ</span></a>`).join("");
  const relatedCards = related.map((r) => {
    const label = comparisonLabel(p, r);
    const relation = r.brand === p.brand ? "同じブランド" : r.family === p.family ? "同じ香調" : "近い利用シーン";
    return `<article class="compare-card">
      <p class="compare-reason">${escape(relation)}</p>
      <p class="compare-brand">${escape(r.brand)}</p>
      <h3><a href="/items/${r.slug}">${escape(r.name)}</a></h3>
      <dl><div><dt>香調</dt><dd>${escape(FAM[r.family]?.ja || r.family)}</dd></div><div><dt>価格帯</dt><dd>${escape(PRICE[r.priceTier] || r.priceTier || "")}</dd></div></dl>
      ${label ? `<p class="compare-label">違い：${escape(label)}</p>` : ""}
      <a class="detail-link" href="/items/${r.slug}">香りを詳しく見る <span aria-hidden="true">→</span></a>
    </article>`;
  }).join("");
  const directComparisonCards = competitors.map((candidate, index) => {
    const rows = comparisonRows(p, candidate);
    const currentDifference = comparisonLabel(candidate, p);
    const candidateDifference = comparisonLabel(p, candidate);
    const pairId = `direct-compare-${index + 1}`;
    return `<section class="direct-pair" aria-labelledby="${pairId}" data-competitor="${escape(candidate.slug)}">
      <p class="direct-relation">${escape(comparisonReason(p, candidate))}</p>
      <h3 class="direct-title" id="${pairId}"><span>${escape(p.name)}</span><i>vs</i><a href="/items/${candidate.slug}">${escape(candidate.name)}</a></h3>
      <table class="direct-table">
        <thead><tr><th scope="col">比較軸</th><th scope="col">${escape(p.brand)}<small>${escape(p.name)}</small></th><th scope="col">${escape(candidate.brand)}<small>${escape(candidate.name)}</small></th></tr></thead>
        <tbody>${rows.map((row) => `<tr><th scope="row">${escape(row.label)}</th><td>${escape(row.current)}</td><td>${escape(row.other)}</td></tr>`).join("")}</tbody>
      </table>
      ${(currentDifference || candidateDifference) ? `<div class="direct-choice" aria-label="既存データから確認できる違い">${currentDifference ? `<p><b>${escape(p.name)}</b><span>${escape(currentDifference)}</span></p>` : ""}${candidateDifference ? `<p><b>${escape(candidate.name)}</b><span>${escape(candidateDifference)}</span></p>` : ""}</div>` : ""}
      <a class="detail-link" href="/items/${candidate.slug}">${escape(candidate.name)}の詳細を見る <span aria-hidden="true">→</span></a>
    </section>`;
  }).join("");
  const trialFacts = trial ? [
    ["試香日", formatDate(trial.testedAt)],
    ["場所", trial.place],
    ["方法", `${trialMediumLabel(trial.medium)} ／ ${trial.application}`],
    ["気温", `${trial.temperatureC}℃`],
  ] : [];
  const trialObservations = trial ? [
    ["30分後", trial.after30Minutes],
    ["3時間後", trial.after3Hours],
    ["翌日", trial.nextDay],
    ["周囲約1m", trial.oneMeter],
    ["服への残り方", trial.onClothing],
  ] : [];

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
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
${ogImage ? `<meta property="og:image" content="${escape(ogImage)}">${p.img ? "" : "\n"}` : ""}
<meta property="og:site_name" content="${escape(SITE_COPY.siteName)}">
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
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
a:focus-visible,button:focus-visible{outline:2px solid #e9e7e3;outline-offset:4px}
article{max-width:1060px}
.product-hero{display:grid;grid-template-columns:minmax(260px,420px) minmax(0,1fr);gap:clamp(36px,7vw,84px);align-items:center;margin-bottom:58px}
.product-hero.no-image{grid-template-columns:minmax(0,720px);justify-content:center}
.product-visual{min-width:0}.product-visual .photo{width:100%;max-width:420px;margin:0;background:#fafaf7;padding:clamp(18px,4vw,38px);border-radius:4px}
.product-copy{min-width:0}.eyebrow{font-family:"Cormorant",serif;font-style:italic;font-size:13px;letter-spacing:1.2px;color:#8c8c92;margin-bottom:9px}
.product-copy h1{font-size:clamp(28px,4.8vw,46px);line-height:1.35;overflow-wrap:anywhere}.product-copy .h1sub{margin-bottom:18px}
.hero-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px 22px;margin:24px 0 28px;padding:20px 0;border-top:1px solid #2c2d31;border-bottom:1px solid #2c2d31}
.hero-facts div{min-width:0}.hero-facts dt{font-family:"Cormorant",serif;font-style:italic;font-size:13px;color:#8c8c92}.hero-facts dd{font-size:14px;color:#e1dfda;margin-top:2px;overflow-wrap:anywhere}
.price-note{display:block;font-size:10.5px;color:#77787e;margin-top:3px}.updated{font-size:11.5px;color:#77787e;margin-top:15px}
.ad-note{font-size:11px;color:#8c8c92;margin:0 0 9px;line-height:1.7}.hero-actions{margin-bottom:0}
.section{padding:42px 0;border-top:1px solid #2c2d31}.section-kicker{font-family:"Cormorant",serif;font-style:italic;color:#8c8c92;font-size:14px;letter-spacing:.7px}
.section h2{font-family:"Shippori Mincho",serif;font-size:clamp(22px,3vw,30px);font-weight:600;letter-spacing:.5px;margin:3px 0 20px;color:#f0eeea}
.decision{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(220px,.8fr);gap:26px}.decision .verdict{margin:0}.decision-list{display:grid;gap:16px}
.decision-list dt{font-family:"Cormorant",serif;font-style:italic;color:#8c8c92;font-size:13px}.decision-list dd{color:#dedbd5;font-size:14px;margin-top:3px}
.decision-list ul{list-style:none;display:grid;gap:6px}.decision-list li{position:relative;padding-left:15px}.decision-list li::before{content:"";position:absolute;left:0;top:.78em;width:5px;height:1px;background:#8c8c92}
.scent-timeline{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:0}.scent-timeline::before{content:"";position:absolute;top:18px;left:16.66%;right:16.66%;height:1px;background:#44454a}
.note-stage{position:relative;padding:0 24px 0 0;min-width:0}.note-stage+.note-stage{padding-left:24px}.note-dot{position:relative;z-index:1;display:block;width:9px;height:9px;margin:14px 0 22px;border-radius:50%;background:var(--note-color);box-shadow:0 0 0 6px #0d0e10}
.note-stage h3{font-family:"Shippori Mincho",serif;font-size:17px;color:#ece9e3}.note-time{font-size:11px;color:#77787e;margin-top:2px}.note-name{font-size:14px;color:#cfcac3;line-height:1.8;margin-top:10px}
.timeline-note{font-size:11px;color:#77787e;margin-top:22px;line-height:1.75}
.usage-groups{display:grid;grid-template-columns:1fr 1fr;gap:28px}.usage-group h3{font-family:"Cormorant",serif;font-style:italic;font-size:15px;font-weight:500;color:#aeb0b6;margin-bottom:10px}.tags{display:flex;flex-wrap:wrap;gap:9px}
.tag{display:inline-flex;align-items:center;min-height:42px;padding:8px 15px;border:1px solid #34353a;color:#d8d5cf;text-decoration:none;font-size:13px;transition:border-color .18s,color .18s}.tag:hover{border-color:#aeb0b6;color:#fff}
.compare-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.compare-card{max-width:none;padding:22px 0 0;border-top:2px solid #34353a}.compare-reason{font-size:10.5px;letter-spacing:1.3px;color:#8c8c92;text-transform:uppercase}.compare-brand{font-family:"Bodoni Moda",serif;font-size:11px;letter-spacing:2px;color:#9a9a9f;margin-top:17px}.compare-card h3{font-family:"Shippori Mincho",serif;font-size:18px;line-height:1.5;margin:5px 0 16px}.compare-card h3 a{color:#f0eeea;text-decoration:none}.compare-card h3 a:hover{text-decoration:underline}
.compare-card dl{display:grid;gap:5px}.compare-card dl div{display:grid;grid-template-columns:55px 1fr;font-size:12px}.compare-card dt{color:#77787e}.compare-card dd{color:#bbb8b2}.compare-label{display:inline-block;margin-top:14px;padding:5px 9px;background:#191a1d;color:#c9b558;font-size:11px}.detail-link{display:inline-block;margin-top:18px;color:#cfcdca;text-decoration:none;border-bottom:1px solid #55565b;font-family:"Cormorant",serif;font-style:italic;font-size:15px}
.direct-list{display:grid;gap:42px}.direct-pair{border-top:1px solid #3a3b40;padding-top:22px}.direct-relation{font-size:11px;letter-spacing:1.1px;color:#8c8c92}.direct-title{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:14px;align-items:center;margin:9px 0 22px;font-family:"Shippori Mincho",serif;font-size:clamp(17px,2.4vw,23px);font-weight:500;line-height:1.45}.direct-title span,.direct-title a{overflow-wrap:anywhere}.direct-title a{color:#f0eeea;text-decoration:none}.direct-title a:hover{text-decoration:underline}.direct-title i{font:italic 14px "Cormorant",serif;color:#77787e}.direct-table{width:100%;table-layout:fixed;border-collapse:collapse}.direct-table th,.direct-table td{padding:11px 12px;border-bottom:1px solid #2a2b30;text-align:left;vertical-align:top;overflow-wrap:anywhere}.direct-table thead th{font:500 12px "Shippori Mincho",serif;color:#e8e5df}.direct-table thead th:first-child{width:94px;color:#77787e}.direct-table thead small{display:block;margin-top:3px;font:11px "Zen Kaku Gothic New",sans-serif;color:#8c8c92}.direct-table tbody th{font-size:11px;color:#8c8c92}.direct-table tbody td{font-size:12.5px;line-height:1.72;color:#cfccc6}.direct-choice{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:18px}.direct-choice p{border-left:2px solid #55565b;padding:8px 11px;background:#141517}.direct-choice b,.direct-choice span{display:block}.direct-choice b{font-size:11px;color:#d9d6d0}.direct-choice span{font-size:11px;color:#c9b558;margin-top:3px}.compare-method{font-size:11px;color:#77787e;line-height:1.8;margin:-8px 0 24px}
.trial-intro{max-width:720px;color:#c9c6c0;font-size:13.5px;line-height:1.9}.trial-facts{display:flex;flex-wrap:wrap;gap:8px 22px;margin:20px 0 26px;padding:15px 0;border-top:1px solid #2c2d31;border-bottom:1px solid #2c2d31}.trial-facts div{display:flex;gap:8px}.trial-facts dt{font-size:11px;color:#77787e}.trial-facts dd{font-size:11px;color:#d7d4ce}.trial-observations{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}.trial-observations div{border-top:2px solid #4e4f54;padding-top:12px;min-width:0}.trial-observations dt{font-family:"Cormorant",serif;font-style:italic;color:#a5a6ab;font-size:13px}.trial-observations dd{margin-top:7px;font-size:12.5px;color:#d8d5cf;line-height:1.8;overflow-wrap:anywhere}.trial-preference{margin-top:24px;padding-left:16px;border-left:2px solid #c9b558;color:#dedbd5;font-size:13.5px;line-height:1.9}.trial-preference b{display:block;margin-bottom:4px;font-size:10.5px;letter-spacing:1px;color:#c9b558}.trial-disclaimer{margin-top:14px;color:#77787e;font-size:10.5px;line-height:1.75}
.journey-links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px}.journey-links a{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:52px;border-bottom:1px solid #242529;color:#d5d2cc;text-decoration:none;font-size:13.5px}.journey-links a:hover{color:#fff}.purchase-bottom{padding:28px;background:#141517;border-left:3px solid ${famColor}}.purchase-bottom h2{margin-bottom:10px}.purchase-bottom .actions{margin:16px 0 0}
.buy-official{background:transparent;color:#e9e7e3;border:1px solid #67686e}.sources details{border-top:1px solid #2c2d31;border-bottom:1px solid #2c2d31}.sources summary{cursor:pointer;min-height:52px;display:flex;align-items:center;color:#d8d5cf;font-size:14px}.sources summary::marker{color:#8c8c92}.source-list{list-style:none;padding:4px 0 18px;display:grid;gap:15px}.source-list li{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;align-items:start}.source-type{font-size:10px;letter-spacing:1px;border:1px solid #3a3b40;padding:2px 7px;color:#aeb0b6}.source-list a{color:#d8d5cf;text-decoration:none;font-size:13px;overflow-wrap:anywhere}.source-list a:hover{text-decoration:underline}.source-date{grid-column:2;font-size:10.5px;color:#77787e}
@media(max-width:767px){article{padding-top:30px}.product-hero{grid-template-columns:1fr;gap:30px;margin-bottom:40px}.product-visual{order:2}.product-copy{order:1}.product-visual .photo{max-width:330px;margin:0 auto}.hero-facts{grid-template-columns:1fr 1fr}.decision{grid-template-columns:1fr}.scent-timeline{grid-template-columns:1fr;gap:24px}.scent-timeline::before{top:4px;bottom:4px;left:4px;right:auto;width:1px;height:auto}.note-stage,.note-stage+.note-stage{padding:0 0 0 27px}.note-dot{position:absolute;left:0;top:0;margin:8px 0}.usage-groups,.compare-grid,.journey-links{grid-template-columns:1fr}.compare-grid{gap:30px}.direct-title{gap:9px}.direct-table th,.direct-table td{padding:9px 7px}.direct-table thead th:first-child{width:65px}.direct-choice{grid-template-columns:1fr}.trial-observations{grid-template-columns:1fr}.purchase-bottom{padding:24px 18px}.buy{width:100%}}
@media(max-width:420px){.hero-facts{grid-template-columns:1fr}.pr-tag{font-size:9.5px;padding:4px 8px}.product-copy h1{font-size:28px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
</style>
</head>
<body>
<header class="topbar">
  <a class="logo" href="/">Sillage</a>
  <span class="pr-tag">PR・アフィリエイト広告を含みます</span>
</header>
<article>
  <p class="crumb"><a href="/">Sillage</a>${brandLink ? ` ／ <a href="${brandLink}">${escape(p.brand)}</a>` : ""} ／ ${escape(p.name)}</p>
  <section class="product-hero${p.img ? "" : " no-image"}" aria-labelledby="product-title">
    ${p.img ? `<div class="product-visual"><img class="photo" src="${escape(p.img)}" alt="${escape(p.brand)} ${escape(p.name)}の商品画像" fetchpriority="high"></div>` : ""}
    <div class="product-copy">
      <p class="eyebrow">Fragrance detail</p>
      <p class="brand-line">${brandLink ? `<a href="${brandLink}" style="color:inherit;text-decoration:none">${escape(p.brand)}</a>` : escape(p.brand)}</p>
      <h1 id="product-title">${escape(p.name)}</h1>
      <p class="h1sub">${escape(p.brand)} — ${escape(famLabel)}</p>
      <a class="fam-pill" style="background:${famColor};text-decoration:none" href="${filterUrl("family", p.family)}">${escape(famLabel)}</a>
      <dl class="hero-facts">
        <div><dt>香調ファミリー</dt><dd>${escape(famLabel)}</dd></div>
        ${p.concentration?.label ? `<div><dt>香水濃度</dt><dd>${escape(p.concentration.label)}</dd></div>` : ""}
        ${sizeSummary ? `<div><dt>容量・参考価格</dt><dd>${escape(sizeSummary)}${(p.sizes || []).some((size) => size.referencePriceYen) ? `<span class="price-note">公式確認時の税込価格。変更される場合があります</span>` : ""}</dd></div>` : ""}
        ${scenes ? `<div><dt>主な利用シーン</dt><dd>${escape(scenes)}</dd></div>` : ""}
        ${seasons ? `<div><dt>主な季節</dt><dd>${escape(seasons)}</dd></div>` : ""}
        ${p.price && !(p.sizes || []).some((size) => size.referencePriceYen) ? `<div><dt>参考価格</dt><dd>${escape(p.price)}<span class="price-note">販売店や時期により変動します</span></dd></div>` : !p.price && priceTier ? `<div><dt>価格帯</dt><dd>${escape(priceTier)}</dd></div>` : ""}
        ${p.releaseYear ? `<div><dt>発売年</dt><dd>${p.releaseYear}年</dd></div>` : ""}
      </dl>
      ${purchaseButtons ? `${hasSponsoredPurchase ? `<p class="ad-note">PR：Amazon・楽天市場へのリンクにはアフィリエイト広告を含みます。</p>` : ""}<div class="actions hero-actions">${purchaseButtons}</div>` : ""}
      ${p.updatedAt ? `<p class="updated">データ更新日：${escape(formatDate(p.updatedAt))}</p>` : ""}
      ${p.verifiedAt ? `<p class="updated">情報確認日：${escape(formatDate(p.verifiedAt))}</p>` : ""}
    </div>
  </section>

  ${(p.verdict || scenes || seasons) ? `<section class="section" aria-labelledby="decision-title">
    <p class="section-kicker">At a glance</p>
    <h2 id="decision-title">この香水が合う人</h2>
    <div class="decision">
      ${p.verdict ? `<p class="verdict"><span class="vlabel">Sillage の見立て</span>${escape(p.verdict)}</p>` : ""}
      <dl class="decision-list">
        ${recommendationItems ? `<div><dt>おすすめする人</dt><dd><ul>${recommendationItems}</ul></dd></div>` : ""}
        ${notRecommendationItems ? `<div><dt>おすすめしにくい人</dt><dd><ul>${notRecommendationItems}</ul></dd></div>` : ""}
        ${scenes ? `<div><dt>使いやすい場面</dt><dd>${escape(scenes)}</dd></div>` : ""}
        ${seasons ? `<div><dt>似合う季節</dt><dd>${escape(seasons)}</dd></div>` : ""}
        ${cautionItems ? `<div><dt>商品固有の注意点</dt><dd><ul>${cautionItems}</ul></dd></div>` : ""}
      </dl>
    </div>
  </section>` : ""}

  ${notes.length ? `<section class="section" aria-labelledby="timeline-title">
    <p class="section-kicker">Scent over time</p>
    <h2 id="timeline-title">香りの時間変化</h2>
    <div class="scent-timeline" aria-label="${escape(p.name)}の香りの変化">
      ${notes.map((note, index) => `<div class="note-stage" style="--note-color:${index === 0 ? "#e9e7e3" : index === 1 ? "#c9b558" : "#c4889c"}"><span class="note-dot" aria-hidden="true"></span><h3>${note.label}</h3><p class="note-time">${note.time}</p><p class="note-name">${escape(note.value)}</p></div>`).join("")}
    </div>
    <p class="timeline-note">時間表記は一般的な香り方の目安です。肌質、気温、つける量によって変化の速さや感じ方は異なります。</p>
  </section>` : ""}

  ${(sceneTags || seasonTags) ? `<section class="section" aria-labelledby="usage-title">
    <p class="section-kicker">When to wear</p>
    <h2 id="usage-title">使用シーンと季節</h2>
    <div class="usage-groups">
      ${sceneTags ? `<div class="usage-group"><h3>シーンから探す</h3><div class="tags">${sceneTags}</div></div>` : ""}
      ${seasonTags ? `<div class="usage-group"><h3>季節から探す</h3><div class="tags">${seasonTags}</div></div>` : ""}
    </div>
  </section>` : ""}

  ${trial ? `<section class="section editorial-trial" aria-labelledby="editorial-trial-title">
    <p class="section-kicker">Sillage wear test</p>
    <h2 id="editorial-trial-title">編集部試香メモ</h2>
    <p class="trial-intro">公開情報ではなく、Sillage編集部が記録した一条件での観察です。肌質・気温・使用量によって感じ方は変わります。</p>
    <dl class="trial-facts">${trialFacts.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl>
    <dl class="trial-observations">${trialObservations.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl>
    <p class="trial-preference"><b>編集者の好み</b>${escape(trial.editorPreference)}</p>
    <p class="trial-disclaimer">このメモはブランドの公式説明や性能保証ではありません。</p>
  </section>` : ""}

  ${directComparisonCards ? `<section class="section" aria-labelledby="direct-compare-title">
    <p class="section-kicker">Direct comparison</p>
    <h2 id="direct-compare-title">近い香水との違い</h2>
    <p class="compare-method">比較は掲載中の香調・ノート・濃度・価格帯・シーン・季節と「Sillageの見立て」だけを使用しています。未確認の点数・評価は加えていません。</p>
    <div class="direct-list">${directComparisonCards}</div>
  </section>` : ""}

  ${relatedCards ? `<section class="section" aria-labelledby="compare-title">
    <p class="section-kicker">Compare</p>
    <h2 id="compare-title">ほかの候補も見る</h2>
    <div class="compare-grid">${relatedCards}</div>
  </section>` : ""}

  <section class="section" aria-labelledby="journey-title">
    <p class="section-kicker">Explore Sillage</p>
    <h2 id="journey-title">香り選びをもう少し深く</h2>
    <nav class="journey-links" aria-label="関連ページ">
      ${brandLink ? `<a href="${brandLink}"><span>同じブランドの香水を見る</span><span aria-hidden="true">→</span></a>` : ""}
      <a href="${filterUrl("family", p.family)}"><span>同じ香調の香水を見る</span><span aria-hidden="true">→</span></a>
      <a href="/columns/first-fragrance"><span>初心者向け香水ガイド</span><span aria-hidden="true">→</span></a>
      <a href="/columns/how-to-wear"><span>香水の正しいつけ方</span><span aria-hidden="true">→</span></a>
      <a href="/columns/concentration-guide"><span>EDT・EDP・パルファムの違い</span><span aria-hidden="true">→</span></a>
    </nav>
  </section>

  ${sourceItems ? `<section class="section sources" aria-labelledby="sources-title"><p class="section-kicker">References</p><h2 id="sources-title">情報源</h2><details><summary>確認した情報源を表示する</summary><ul class="source-list">${sourceItems}</ul></details></section>` : ""}

  ${purchaseButtons ? `<section class="section purchase-bottom" aria-labelledby="purchase-title"><p class="section-kicker">Purchase</p><h2 id="purchase-title">購入前に販売状況を確認する</h2>${hasSponsoredPurchase ? `<p class="ad-note">PR：Amazon・楽天市場へのリンクはアフィリエイト広告です。価格や在庫は販売先で最新情報をご確認ください。</p>` : `<p class="ad-note">価格や在庫は公式サイトで最新情報をご確認ください。</p>`}<div class="actions">${purchaseButtons}</div></section>` : ""}
  <a class="backhome" href="/#fragrances">← 香水一覧へ戻る</a>
</article>
<footer>
  当サイトはアフィリエイトプログラムを利用し、商品紹介により収益を得ています。本文はブランドおよび商品の公開情報をもとにした当サイト編集部の記述であり、ブランドからの提供文ではありません。<br>
  <a href="/">${escape(SITE_COPY.footerLabel)}</a>
</footer>
<script>
document.addEventListener("click",function(event){
  const link=event.target.closest("a[data-purchase-shop]");
  if(!link)return;
  const position=link.closest(".hero-actions")?"hero":"bottom";
  if(typeof window.gtag==="function"){
    window.gtag("event","purchase_link_click",{
      product_id:link.dataset.productId,
      purchase_shop:link.dataset.purchaseShop,
      button_position:position,
      destination_url:link.href,
      transport_type:"beacon"
    });
  }
});
</script>
</body>
</html>`;
}

// 出力
if (!existsSync("public/items")) mkdirSync("public/items", { recursive: true });

let totalSize = 0;
let maxSize = 0;
for (const p of itemsWithSlug) {
  // 同ブランド → 同香調 → 共通シーンの順で、根拠のある候補を最大3本。
  const related = uniqueRelated(p, itemsWithSlug);
  const competitors = directCompetitors(p, itemsWithSlug);
  const trial = TRIALS.get(p.slug) || null;
  const html = pageHTML(p, related, competitors, trial).replace(/[ \t]+$/gm, "");
  const path = `public/items/${p.slug}.html`;
  writeFileSync(path, html);
  totalSize += html.length;
  if (html.length > maxSize) maxSize = html.length;
}

console.log(`Generated ${itemsWithSlug.length} item pages`);
console.log(`Avg size: ${Math.round(totalSize / itemsWithSlug.length)} bytes`);
console.log(`Max size: ${maxSize} bytes (${(maxSize / 1024).toFixed(1)}KB)`);
