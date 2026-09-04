import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadFragrances } from "./lib/fragrance-data.mjs";
import {
  englishBrands,
  englishProducts,
  englishSite,
  localizeProduct,
  translations,
} from "./lib/i18n.mjs";
import { cityName, stores, storesByArea, storesForBrand, storesForCity, storesVerifiedAt } from "./lib/store-data.mjs";
import { taxFreeAirportSteps, taxFreeComparison, taxFreeConsumablesCap, taxFreeConsumptionTax, taxFreeFaq, taxFreePeriods, taxFreeRefundMayBeLess, taxFreeSources, taxFreeVerifiedAt } from "./lib/tax-free-data.mjs";

const SITE = "https://sillage.asutelu.com";
const products = loadFragrances();
const localizedProducts = products.map(localizeProduct).filter(Boolean);
const publicI18n = "public/data/i18n";
const kyotoShops = storesForCity("kyoto");
const tokyoShops = storesForCity("tokyo");
const osakaShops = storesForCity("osaka");
const storeById = new Map(stores.map((store) => [store.id, store]));
const COUNTRY_NAMES = {
  AU: "Australia", FR: "France", IT: "Italy", UK: "United Kingdom", US: "United States",
};
const STORE_TYPE = {
  "custom-fragrance": "Custom fragrance",
  "brand-boutique": "Brand boutique",
  "multi-brand-specialist": "Niche & multi-brand specialist",
  "department-counter": "Department-store counter",
  "department-store": "Department store & beauty floor",
};

const esc = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");
const json = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");
const money = (value) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "JPY", maximumFractionDigits: 0,
}).format(value);
const dateEn = (value) => value
  ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Tokyo" })
      .format(new Date(`${value}T00:00:00+09:00`))
  : "";

const englishSupportLabel = (value) => value === true ? "Confirmed" : value === false ? "Japanese only" : "Not confirmed";
const taxFreeLabel = (value) => value === true ? "Confirmed" : value === false ? "Not offered" : "Not confirmed";

function representativeStores(list, limit = 6) {
  const selected = [];
  for (const city of ["tokyo", "kyoto", "osaka"]) {
    const store = list.find((entry) => entry.city === city);
    if (store) selected.push(store);
  }
  for (const store of list) {
    if (selected.length >= limit) break;
    if (!selected.includes(store)) selected.push(store);
  }
  return selected.slice(0, limit);
}

const guideLinks = (current = "") => `<nav class="guide-nav" aria-label="Japan fragrance shopping guides">${[
  ["tokyo", "Tokyo", "/en/guides/perfume-shopping-tokyo/"],
  ["kyoto", "Kyoto", "/en/guides/perfume-shopping-kyoto/"],
  ["osaka", "Osaka", "/en/guides/perfume-shopping-osaka/"],
  ["tax-free", "Tax-free shopping", "/en/guides/tax-free-perfume-shopping-japan/"],
].map(([key, label, href]) => key === current ? `<span aria-current="page">${label}</span>` : `<a href="${href}">${label}</a>`).join("")}</nav>`;

function renderStoreCard(store, index = null) {
  const number = index == null ? "" : `${String(index + 1).padStart(2, "0")} · `;
  const hours = store.openingHours ? `<div><dt>Opening hours</dt><dd>${esc(store.openingHours)}${store.closedDays ? `<br><small>Closed: ${esc(store.closedDays)}</small>` : ""}</dd></div>` : "";
  // 店舗が扱うブランドのうち、英語版にページがあるものへ導線を出す。
  // 本文の書き換えではなく、店舗データが既に持っている brands を使う。
  const brandNav = (store.brands || [])
    .map((slug) => brandDestination(slug))
    .filter(Boolean)
    .map((target) => `<a data-store-link="brand" data-store-id="${esc(store.id)}" href="${esc(target.url)}">${target.kind === "brand" ? "More about" : "See"} ${esc(target.name)}</a>`)
    .join("");
  return `<article class="shop" id="${esc(store.id)}"><p class="shop-number">${number}${esc(STORE_TYPE[store.storeType] || store.storeType)}</p><h3>${esc(store.nameEn)}</h3><p class="ja-name" lang="ja">${esc(store.nameJa)}</p><dl><div><dt>Area</dt><dd>${esc(store.area)}</dd></div><div><dt>Address</dt><dd>${esc(store.addressEn)}</dd></div><div><dt>Nearest station</dt><dd>${esc(store.nearestStation)}</dd></div>${hours}<div><dt>English support</dt><dd>${esc(englishSupportLabel(store.englishSupport))}</dd></div><div><dt>Tax-free shopping</dt><dd>${esc(taxFreeLabel(store.taxFree))}</dd></div></dl><div class="shop-links"><a data-store-link="official" data-store-id="${esc(store.id)}" data-store-city="${esc(store.city)}" href="${esc(store.officialUrl)}" target="_blank" rel="noopener noreferrer">Official information <span aria-hidden="true">↗</span></a><a data-store-link="maps" data-store-id="${esc(store.id)}" data-store-city="${esc(store.city)}" href="${esc(store.googleMapsUrl)}" target="_blank" rel="noopener noreferrer">Google Maps <span aria-hidden="true">↗</span></a>${brandNav}</div></article>`;
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.replace(/[ \t]+$/gm, ""), "utf8");
}

function head({
  title,
  description,
  canonical,
  robots = "index,follow",
  product = null,
  jaPath = "/",
  ogType = null,
  image = null,
}) {
  const jaUrl = product ? `${SITE}${product.routeJa}` : jaPath ? `${SITE}${jaPath}` : null;
  const enUrl = canonical;
  const socialImage = image || (product
    ? (String(product.img || "").startsWith("/") ? `${SITE}${product.img}` : product.img)
    : `${SITE}/ogp-default.png`);
  const alternates = [
    `<link rel="alternate" hreflang="en" href="${esc(enUrl)}">`,
    jaUrl ? `<link rel="alternate" hreflang="ja" href="${esc(jaUrl)}">` : "",
    `<link rel="alternate" hreflang="x-default" href="${esc(jaUrl || canonical)}">`,
  ].filter(Boolean).join("\n");
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="theme-color" content="#0d0e10">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<meta name="google-site-verification" content="UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q">
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-60BQRQWB5M"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-60BQRQWB5M');</script>
<link rel="canonical" href="${esc(canonical)}">
${alternates}
<meta property="og:type" content="${esc(ogType || (product ? "product" : "website"))}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(socialImage)}">
<meta property="og:site_name" content="Sillage">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(socialImage)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600&family=Cormorant:ital,wght@0,400;0,500;1,400&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">`;
}

const sharedCss = `<style>
:root{--bg:#0e0f13;--panel:#15161b;--line:#2c2d31;--ink:#e9e7e3;--muted:#9a9aa1;--gold:#c9b558;--rose:#c4889c}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:"Zen Kaku Gothic New",system-ui,sans-serif;line-height:1.75;-webkit-font-smoothing:antialiased}a{color:inherit}a:focus-visible,button:focus-visible,select:focus-visible{outline:2px solid var(--gold);outline-offset:4px}.topbar{min-height:64px;padding:12px clamp(18px,4vw,52px);display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:1px solid var(--line);background:rgba(14,15,19,.94);position:sticky;top:0;z-index:20}.logo{font:500 28px "Bodoni Moda",serif;letter-spacing:2px;text-decoration:none}.language{font-size:13px;color:var(--muted);text-underline-offset:4px}.wrap{width:min(1120px,calc(100% - 36px));margin:0 auto}.eyebrow{font:italic 17px "Cormorant",serif;color:var(--gold);letter-spacing:1px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:10px 18px;border:1px solid var(--gold);text-decoration:none;font-size:14px;background:#e7e3da;color:#15151a}.button.secondary{background:transparent;color:var(--ink);border-color:#55565c}.button[aria-disabled=true]{color:#77787e;border-color:#34353a;pointer-events:none}.section{padding:clamp(54px,8vw,96px) 0;border-top:1px solid var(--line)}.section h2{font:500 clamp(28px,4vw,42px) "Bodoni Moda",serif;margin:0 0 10px}.lede{max-width:680px;color:#b6b3ab}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:32px}.card{border-top:2px solid var(--accent,var(--gold));background:var(--panel);padding:24px;text-decoration:none;min-width:0}.card h3{font:500 22px "Bodoni Moda",serif;margin:0 0 8px}.card p{margin:0;color:var(--muted);font-size:14px}.card small{display:block;color:var(--gold);margin-top:18px}.product-card{display:grid;grid-template-columns:92px 1fr;gap:18px;align-items:center}.product-card img{width:92px;height:110px;object-fit:contain;background:#f2f0eb}.ja-name{display:block;color:#8c8c92;font-size:12px;margin-top:2px}footer{border-top:1px solid var(--line);padding:34px 18px;text-align:center;color:#77787e;font-size:12px}@media(max-width:760px){.cards{grid-template-columns:1fr}.topbar{min-height:58px}.product-card{grid-template-columns:78px 1fr}.product-card img{width:78px;height:96px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
</style>`;

const brandProductGroups = new Map();
for (const product of localizedProducts) {
  const group = brandProductGroups.get(product.brand) || [];
  group.push(product);
  brandProductGroups.set(product.brand, group);
}

const brandEntries = Object.entries(englishBrands)
  .map(([key, brand]) => ({ key, ...brand, products: brandProductGroups.get(key) || [] }))
  .filter((brand) => brand.products.length > 0)
  .sort((a, b) => b.products.length - a.products.length || a.nameEn.localeCompare(b.nameEn));

const brandHasDetail = (brandKey) => (brandProductGroups.get(brandKey)?.length || 0) >= 2;
const brandRouteJa = (brand) => `/brand-${brand.slug === "jo-malone-london" ? "jo-malone" : brand.slug}.html`;
const brandRouteEn = (brand) => brandHasDetail(brand.key) ? `/en/brands/${brand.slug}/` : "/en/brands/";

// 店舗データの brands（slug）から、英語版で実在するページへのリンクを解決する。
// ブランドページを持つのは商品2本以上のブランドだけなので、1本しかない
// ブランド（Aesop / Creed / Diptyque / Maison Margiela）はその商品ページへ向ける。
// 英語版に存在しないブランド（Amouage、Nishane など）は null を返し、リンクを作らない。
const brandBySlug = new Map(brandEntries.map((entry) => [entry.slug, entry]));
function brandDestination(slug) {
  const brand = brandBySlug.get(slug);
  if (!brand) return null;
  if (brandHasDetail(brand.key)) return { url: brandRouteEn(brand), name: brand.nameEn, kind: "brand" };
  const product = brand.products[0];
  return product ? { url: product.routeEn, name: brand.nameEn, kind: "product" } : null;
}

function renderHome() {
  const canonical = `${SITE}/en/`;
  const featured = localizedProducts.slice(0, 6).map((product) => `<a class="card product-card" href="${product.routeEn}" style="--accent:${product.family === "musk" ? "#aa92bf" : product.family === "woody" ? "#9d704d" : product.family === "amber" ? "#d09939" : "#7bb06d"}">
    <img src="${esc(product.img || `/img/products/${product.slug}.png`)}" alt="${esc(product.brandEn)} ${esc(product.nameEn)}" width="92" height="110" loading="lazy">
    <span><strong>${esc(product.brandEn)}</strong><br>${esc(product.nameEn)}<span class="ja-name" lang="ja">${esc(product.nameJa)}</span><small>View fragrance →</small></span>
  </a>`).join("\n");
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: "Sillage", url: canonical, description: englishSite.description, inLanguage: "en" };
  return `<!DOCTYPE html>
<html lang="en"><head>
${head({ title: englishSite.title, description: englishSite.description, canonical })}
<script type="application/ld+json">${json(website)}</script>
${sharedCss}
<style>.hero{min-height:66vh;display:grid;place-items:center;padding:80px 0}.hero h1{font:500 clamp(44px,8vw,84px)/1.06 "Bodoni Moda",serif;margin:12px 0 24px;max-width:900px}.hero p{max-width:700px;color:#b6b3ab;font-size:clamp(16px,2vw,19px)}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}.path-card{min-height:190px}.guide-pair{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:32px}.guide-pair .card{min-height:210px}@media(max-width:760px){.guide-pair{grid-template-columns:1fr}}</style>
</head><body>
<script defer src="/assets/analytics.js"></script>
<header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="/" hreflang="ja" lang="ja">日本語版へ</a></header>
<main>
  <section class="hero"><div class="wrap"><p class="eyebrow">Japan Fragrance Guide</p><h1>Find fragrance through scent, place and season.</h1><p>${esc(englishSite.description)} Japanese product names and Japan-specific price information remain visible, helping you identify the right bottle while shopping in Japan.</p><div class="actions"><a class="button" href="/en/guides/perfume-shopping-tokyo/">Shop fragrance in Tokyo</a><a class="button secondary" href="/en/fragrances/">Explore ${localizedProducts.length} fragrances</a></div></div></section>
  <section class="section" id="paths"><div class="wrap"><p class="eyebrow">Explore Sillage</p><h2>Choose a practical way in.</h2><p class="lede">Browse a curated English catalogue, understand the brands, or plan where to test fragrance during a visit to Japan.</p><div class="cards">
    <a class="card path-card" href="/en/fragrances/"><h3>Fragrances</h3><p>Compare ${localizedProducts.length} English product pages by scent family, season, occasion, gender and Japan price band.</p><small>Open fragrance catalogue →</small></a>
    <a class="card path-card" href="/en/brands/"><h3>Brands</h3><p>Explore ${brandEntries.length} brands represented in the English catalogue, with Japanese names and official links.</p><small>Browse brands →</small></a>
    <a class="card path-card" href="/en/guides/best-japanese-perfume-brands/"><h3>Japanese fragrance brands</h3><p>Start with six well-documented brands and learn what to look for before visiting a store in Japan.</p><small>Read the guide →</small></a>
  </div></div></section>
  <section class="section"><div class="wrap"><p class="eyebrow">Where to buy and try</p><h2>Plan fragrance shopping in Japan.</h2><div class="guide-pair"><a class="card" href="/en/guides/perfume-shopping-tokyo/"><h3>Perfume shopping in Tokyo</h3><p>Plan by area with ${tokyoShops.length} current brand boutiques, niche specialists and department-store counters verified from official sources.</p><small>Open the Tokyo guide →</small></a><a class="card" href="/en/guides/perfume-shopping-kyoto/"><h3>Perfume shopping in Kyoto</h3><p>Use a verified list of ${kyotoShops.length} custom-fragrance studios, niche stores and department-store beauty floors, grouped for travelers.</p><small>Open the Kyoto guide →</small></a><a class="card" href="/en/guides/perfume-shopping-osaka/"><h3>Perfume shopping in Osaka</h3><p>Compare ${osakaShops.length} officially documented fragrance boutiques, niche specialists and department-store beauty floors across Umeda, Shinsaibashi and Namba.</p><small>Open the Osaka guide →</small></a><a class="card" href="/en/guides/tax-free-perfume-shopping-japan/"><h3>Tax-free perfume shopping</h3><p>Understand the current system and the refund-method change from November 1, 2026 before you buy or leave Japan.</p><small>Read the tax-free guide →</small></a></div></div></section>
  <section class="section"><div class="wrap"><p class="eyebrow">Featured fragrances</p><h2>Begin with six well-documented products.</h2><p class="lede">Each English page is generated from the same source product record as the Japanese site, while official reference prices and retailer prices remain clearly separated.</p><div class="cards">${featured}</div><div class="actions"><a class="button secondary" href="/en/fragrances/">View all ${localizedProducts.length} English pages</a></div></div></section>
</main><footer><a href="/en/">Sillage</a> · Japan Fragrance Guide<br>Price and availability may change. Confirm current details with each retailer.</footer>
</body></html>`;
}

function renderList() {
  const canonical = `${SITE}/en/fragrances/`;
  const description = `Browse ${localizedProducts.length} fragrances with complete English pages, including scent notes, seasons, occasions and Japan price information.`;
  const available = {
    family: new Set(localizedProducts.map((product) => product.family)),
    season: new Set(localizedProducts.flatMap((product) => product.seasons || [])),
    scene: new Set(localizedProducts.flatMap((product) => product.scenes || [])),
    gender: new Set(localizedProducts.map((product) => product.gender)),
    price: new Set(localizedProducts.map((product) => product.priceTier).filter(Boolean)),
  };
  const options = (group, keys) => [...keys].map((key) => `<option value="${esc(key)}">${esc(translations.labels[group][key]?.en || key)}</option>`).join("");
  const cards = localizedProducts.map((product) => `<a class="card" href="${esc(product.routeEn)}" data-family="${esc(product.family)}" data-seasons="${esc((product.seasons || []).join(" "))}" data-scenes="${esc((product.scenes || []).join(" "))}" data-gender="${esc(product.gender)}" data-price="${esc(product.priceTier || "")}"><img src="${esc(product.img || `/img/products/${product.slug}.png`)}" alt="${esc(product.brandEn)} ${esc(product.nameEn)}" width="100" height="120" loading="lazy"><span><strong>${esc(product.brandEn)}</strong><br>${esc(product.nameEn)}<span class="ja-name" lang="ja">Japanese: ${esc(product.nameJa)}</span><span class="meta">${esc(product.familyEn)} · ${esc(translations.labels.priceTier[product.priceTier]?.en || product.priceTier)}</span><small>View English detail →</small></span></a>`).join("");
  return `<!DOCTYPE html><html lang="en"><head>
${head({ title: `Fragrances in Japan | Sillage`, description, canonical })}
${sharedCss}<style>.catalog-head{padding:72px 0 42px}.catalog-head h1{font:500 clamp(40px,7vw,70px) "Bodoni Moda",serif;margin:10px 0}.filters{display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:12px;padding:22px 0;border-block:1px solid var(--line)}label{display:grid;gap:7px;color:#9a9aa1;font-size:12px}select{width:100%;min-height:44px;background:#15161b;color:#e9e7e3;border:1px solid #3a3b40;padding:8px}.result-line{display:flex;justify-content:space-between;gap:20px;align-items:center;margin:30px 0}.reset{background:none;border:0;color:#c9b558;text-decoration:underline;cursor:pointer}.catalog{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-bottom:80px}.catalog .card{display:grid;grid-template-columns:100px 1fr;gap:16px;align-items:center;padding:18px}.catalog img{width:100px;height:120px;object-fit:contain;background:#f2f0eb}.meta{color:#9a9aa1;font-size:12px}.status{padding:42px 0;color:#9a9aa1}@media(max-width:900px){.filters{grid-template-columns:repeat(2,1fr)}.catalog{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){.catalog{grid-template-columns:1fr}.catalog .card{grid-template-columns:82px 1fr}.catalog img{width:82px;height:100px}.filters{grid-template-columns:1fr 1fr}}</style>
</head><body><script defer src="/assets/analytics.js"></script><header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="/" hreflang="ja" lang="ja">日本語版へ</a></header>
<main class="wrap"><header class="catalog-head"><p class="eyebrow">Fragrance catalogue</p><h1>Fragrances in Japan</h1><p class="lede">${localizedProducts.length} fragrances currently available in English. Our Japanese database includes ${products.length} fragrances, and more English pages are being added.</p></header>
<section class="filters" aria-label="Filter fragrances"><label>Scent family<select id="family"><option value="">All families</option>${options("family", available.family)}</select></label><label>Season<select id="season"><option value="">All seasons</option>${options("season", available.season)}</select></label><label>Occasion<select id="scene"><option value="">All occasions</option>${options("scene", available.scene)}</select></label><label>Gender<select id="gender"><option value="">All</option>${options("gender", available.gender)}</select></label><label>Japan price band<select id="price"><option value="">All prices</option>${options("priceTier", available.price)}</select></label></section>
<div class="result-line"><p id="count" aria-live="polite">${localizedProducts.length} fragrances currently available in English</p><button class="reset" type="button" id="reset">Clear filters</button></div><div id="catalog" class="catalog">${cards}</div><p id="empty" class="status" hidden>No fragrances match these filters.</p></main>
<footer><a href="/en/">Sillage</a> · Japan Fragrance Guide</footer>
<script>
const selects=["family","season","scene","gender","price"].map(id=>document.getElementById(id));
const cards=[...document.querySelectorAll("#catalog .card")];
const render=()=>{const [family,season,scene,gender,price]=selects.map(s=>s.value);let count=0;for(const card of cards){const show=(!family||card.dataset.family===family)&&(!season||card.dataset.seasons.split(" ").includes(season))&&(!scene||card.dataset.scenes.split(" ").includes(scene))&&(!gender||card.dataset.gender===gender)&&(!price||card.dataset.price===price);card.hidden=!show;if(show)count++}document.getElementById("count").textContent=count+' fragrance'+(count===1?'':'s')+' found';document.getElementById("empty").hidden=count!==0};
selects.forEach(s=>s.addEventListener("change",render));document.getElementById("reset").addEventListener("click",()=>{selects.forEach(s=>s.value="");render()});
</script></body></html>`;
}

function renderBrandIndex() {
  const canonical = `${SITE}/en/brands/`;
  const description = `Explore ${brandEntries.length} fragrance brands represented in Sillage's English Japan fragrance catalogue.`;
  const cards = brandEntries.map((brand) => {
    const destination = brandHasDetail(brand.key) ? brandRouteEn(brand) : brand.products[0].routeEn;
    const label = brandHasDetail(brand.key) ? "View brand and fragrances" : "View fragrance";
    return `<a class="card brand-card" href="${esc(destination)}"><p class="country">${esc(COUNTRY_NAMES[brand.country] || brand.country)}</p><h2>${esc(brand.nameEn)}</h2><span class="ja-name" lang="ja">${esc(brand.nameJa)}</span><p>${esc(brand.summaryEn)}</p><small>${brand.products.length} English fragrance page${brand.products.length === 1 ? "" : "s"} · ${label} →</small></a>`;
  }).join("");
  const collection = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Fragrance brands in Japan", description, url: canonical, inLanguage: "en" };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Sillage", item: `${SITE}/en/` },
    { "@type": "ListItem", position: 2, name: "Brands", item: canonical },
  ] };
  return `<!DOCTYPE html><html lang="en"><head>${head({ title: "Fragrance Brands in Japan | Sillage", description, canonical, jaPath: null })}<script type="application/ld+json">${json(collection)}</script><script type="application/ld+json">${json(breadcrumb)}</script>${sharedCss}<style>.intro{padding:72px 0 42px}.intro h1{font:500 clamp(40px,7vw,70px) "Bodoni Moda",serif;margin:10px 0}.brand-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;padding-bottom:84px}.brand-card h2{margin:2px 0;font:500 30px "Bodoni Moda",serif}.brand-card p{margin-top:14px}.country{color:var(--gold)!important;text-transform:uppercase;letter-spacing:1px;font-size:11px!important}@media(max-width:700px){.brand-grid{grid-template-columns:1fr}}</style></head><body><script defer src="/assets/analytics.js"></script><header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="/" hreflang="ja" lang="ja">日本語版へ</a></header><main class="wrap"><header class="intro"><p class="eyebrow">Brand directory</p><h1>Fragrance brands in Japan</h1><p class="lede">Only brands connected to a completed English product page are listed. Japanese names and official sites help you identify each brand while shopping in Japan.</p></header><div class="brand-grid">${cards}</div></main><footer><a href="/en/">Sillage</a> · Japan Fragrance Guide</footer></body></html>`;
}

function renderBrand(brand) {
  const canonical = `${SITE}${brandRouteEn(brand)}`;
  const description = `${brand.nameEn} fragrance guide for Japan, with ${brand.products.length} English product pages, Japanese names and official links.`;
  const cards = brand.products.map((product) => `<a class="card product-card" href="${esc(product.routeEn)}"><img src="${esc(product.img || `/img/products/${product.slug}.png`)}" alt="${esc(product.brandEn)} ${esc(product.nameEn)}" width="92" height="110" loading="lazy"><span><strong>${esc(product.nameEn)}</strong><span class="ja-name" lang="ja">${esc(product.nameJa)}</span><small>${esc(product.familyEn)} · View fragrance →</small></span></a>`).join("");
  const brandStores = storesForBrand(brand.slug);
  const whereToFind = brandStores.length ? `<section class="section"><div class="wrap"><p class="eyebrow">Japan store guide</p><h2>Where to Find ${esc(brand.nameEn)} in Japan</h2><p class="lede">These locations are confirmed to carry the brand. Individual fragrance stock is not confirmed; check the official store page before visiting.</p><div class="store-mini-grid">${representativeStores(brandStores).map((store) => `<article class="store-mini"><h3>${esc(store.nameEn)}</h3><p>${esc(cityName(store.city))} · ${esc(store.area)} · ${esc(store.nearestStation)}</p><a href="/en/guides/perfume-shopping-${esc(store.city)}/#${esc(store.id)}">View in the ${esc(cityName(store.city))} guide →</a></article>`).join("")}</div>${guideLinks()}</div></section>` : "";
  const collection = { "@context": "https://schema.org", "@type": "CollectionPage", name: `${brand.nameEn} fragrances in Japan`, description, url: canonical, inLanguage: "en", about: { "@type": "Brand", name: brand.nameEn } };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Sillage", item: `${SITE}/en/` },
    { "@type": "ListItem", position: 2, name: "Brands", item: `${SITE}/en/brands/` },
    { "@type": "ListItem", position: 3, name: brand.nameEn, item: canonical },
  ] };
  return `<!DOCTYPE html><html lang="en"><head>${head({ title: `${brand.nameEn} Fragrances in Japan | Sillage`, description, canonical, jaPath: brandRouteJa(brand) })}<script type="application/ld+json">${json(collection)}</script><script type="application/ld+json">${json(breadcrumb)}</script>${sharedCss}<style>.brand-hero{padding:76px 0 58px}.brand-hero h1{font:500 clamp(44px,8vw,78px) "Bodoni Moda",serif;margin:8px 0}.brand-meta{color:var(--gold);letter-spacing:1px;text-transform:uppercase;font-size:12px}.official{margin-top:28px}.store-mini-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:28px}.store-mini{border-top:1px solid var(--gold);padding:18px 0}.store-mini h3{font:500 20px "Bodoni Moda",serif;margin:0}.store-mini p{color:var(--muted);font-size:13px}.store-mini a{color:var(--gold);font-size:13px}@media(max-width:760px){.store-mini-grid{grid-template-columns:1fr}}</style></head><body data-page-type="brand"><script defer src="/assets/analytics.js"></script><header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="${esc(brandRouteJa(brand))}" hreflang="ja" lang="ja">日本語のブランドページ</a></header><main><section class="brand-hero"><div class="wrap"><p class="eyebrow">Brand guide</p><h1>${esc(brand.nameEn)}</h1><p class="ja-name" lang="ja">Japanese name: ${esc(brand.nameJa)}</p><p class="brand-meta">${esc(COUNTRY_NAMES[brand.country] || brand.country)} · ${brand.products.length} English fragrance pages</p><p class="lede">${esc(brand.summaryEn)}</p><p class="official"><a class="button secondary" href="${esc(brand.officialSite)}" target="_blank" rel="noopener noreferrer">Official site <span aria-hidden="true">↗</span></a></p></div></section><section class="section"><div class="wrap"><p class="eyebrow">English catalogue</p><h2>${esc(brand.nameEn)} fragrances</h2><div class="cards">${cards}</div></div></section>${whereToFind}</main><footer><a href="/en/brands/">Back to brands</a></footer></body></html>`;
}

function articleLd({ headline, description, canonical, modified }) {
  return { "@context": "https://schema.org", "@type": "Article", headline, description, url: canonical, mainEntityOfPage: canonical, inLanguage: "en", dateModified: modified, author: { "@type": "Organization", name: "Sillage Editorial" }, publisher: { "@type": "Organization", name: "Sillage", url: `${SITE}/en/` } };
}

function breadcrumbLd(items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })) };
}

// ガイドの末尾に置く導線。ガイドから商品・ブランドへ辿れない状態だったため、
// 記事を読み終えた読者の行き先を明示する。本文は書き換えない。
const guideCta = (heading, lead, items) => `<section class="guide-cta"><div class="wrap"><h2>${heading}</h2>${lead ? `<p class="lede">${lead}</p>` : ""}<ul>${items.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul></div></section>`;

// 店舗ガイド3本で共通の導線。免税ガイドを必ず含める（2026年11月1日の改正は
// 訪日客にとって重要で、店舗ガイドを読む人と関心が一致するため）。
const beforeYouGo = () => guideCta(
  "Before you go",
  "Check what these shops carry before visiting.",
  [
    ["/en/fragrances/", `Browse ${localizedProducts.length} fragrances with Japanese retail prices`],
    ["/en/brands/", "Browse brands available in Japan"],
    ["/en/guides/tax-free-perfume-shopping-japan/", "Tax-free rules changing 1 November 2026"],
  ],
);

const guideCss = `<style>.guide-hero{padding:76px 0 58px}.guide-hero h1{font:500 clamp(40px,7vw,70px)/1.12 "Bodoni Moda",serif;margin:10px 0}.notice{border-left:2px solid var(--gold);padding:14px 18px;color:#b6b3ab;background:var(--panel);margin-top:30px}.shop-list{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.shop{background:var(--panel);border-top:2px solid var(--gold);padding:24px;min-width:0}.shop h3{font:500 25px "Bodoni Moda",serif;margin:4px 0}.shop-number{color:var(--gold);font-size:11px;text-transform:uppercase;letter-spacing:.8px}.shop dl{margin:22px 0}.shop dl div{display:grid;grid-template-columns:120px 1fr;gap:12px;border-top:1px solid var(--line);padding:10px 0}.shop dt{color:#8c8c92;font-size:12px}.shop dd{margin:0;overflow-wrap:anywhere}.shop-links{display:flex;gap:16px;flex-wrap:wrap}.shop-links a{color:var(--gold);text-underline-offset:4px}.area-block{padding:48px 0;border-top:1px solid var(--line)}.area-block h2{font:500 clamp(28px,4vw,40px) "Bodoni Moda",serif}.quick-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:28px}.quick{border-top:1px solid var(--gold);padding:18px 0}.quick strong{display:block;font:500 25px "Bodoni Moda",serif}.guide-tips{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.guide-tips h3{font:500 22px "Bodoni Moda",serif}.guide-nav{display:flex;gap:10px;flex-wrap:wrap;margin-top:32px}.guide-nav a,.guide-nav span{border:1px solid var(--line);padding:8px 12px;font-size:13px;text-decoration:none}.guide-nav a{color:var(--gold)}.guide-nav span{color:var(--muted)}.guide-cta{padding:52px 0;border-top:1px solid var(--line)}.guide-cta h2{font:500 clamp(28px,4vw,40px) "Bodoni Moda",serif;margin:0 0 10px}.guide-cta ul{list-style:none;padding:0;margin:24px 0 0;display:grid;gap:1px;background:var(--line)}.guide-cta li{background:var(--panel)}.guide-cta a{display:block;padding:18px 20px;color:var(--gold);text-decoration:none;border-left:2px solid transparent}.guide-cta a:hover{border-left-color:var(--gold)}@media(max-width:760px){.shop-list,.quick-grid,.guide-tips{grid-template-columns:1fr}.shop dl div{grid-template-columns:1fr;gap:2px}}</style>`;

function renderKyotoGuide() {
  const canonical = `${SITE}/en/guides/perfume-shopping-kyoto/`;
  const headline = `Where to Buy Perfume in Kyoto: ${kyotoShops.length} Fragrance Shops`;
  const description = `A traveler-focused guide to ${kyotoShops.length} verified fragrance shops in Kyoto, including custom fragrance studios, niche stores and department-store beauty floors.`;
  const cards = kyotoShops.map((shop, index) => renderStoreCard(shop, index)).join("");
  const itemList = { "@context": "https://schema.org", "@type": "ItemList", numberOfItems: kyotoShops.length, itemListElement: kyotoShops.map((shop, index) => ({ "@type": "ListItem", position: index + 1, name: shop.nameEn, url: `${canonical}#${shop.id}` })) };
  const article = articleLd({ headline, description, canonical, modified: storesVerifiedAt });
  const breadcrumb = breadcrumbLd([{ name: "Sillage", url: `${SITE}/en/` }, { name: "Kyoto perfume shopping", url: canonical }]);
  return `<!DOCTYPE html><html lang="en"><head>${head({ title: `${headline} | Sillage`, description, canonical, jaPath: "/columns/kyoto-fragrance-shops", ogType: "article" })}<script type="application/ld+json">${json(article)}</script><script type="application/ld+json">${json(breadcrumb)}</script><script type="application/ld+json">${json(itemList)}</script>${sharedCss}${guideCss}</head><body data-page-type="column" data-column-slug="perfume-shopping-kyoto" data-column-title="${esc(headline)}" data-column-category="travel" data-city-guide="kyoto"><script defer src="/assets/analytics.js"></script><header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="/columns/kyoto-fragrance-shops" hreflang="ja" lang="ja">日本語の京都ガイド</a></header><main><header class="guide-hero"><div class="wrap"><p class="eyebrow">Kyoto fragrance guide</p><h1>${headline}</h1><p class="lede">${description}</p><div class="notice"><strong>Before you visit:</strong> opening hours and store services can change. Check the official page on the day of your visit. English assistance and tax-free shopping are marked “Not confirmed” unless verified by the store.</div><p>Last verified: ${dateEn(storesVerifiedAt)}</p>${guideLinks("kyoto")}</div></header><section class="section"><div class="wrap"><h2>${kyotoShops.length} places to explore</h2><div class="shop-list">${cards}</div><p class="notice">Tax-free eligibility and procedures can change. Read the <a href="/en/guides/tax-free-perfume-shopping-japan/">Japan tax-free perfume shopping guide</a> and confirm the store's current procedure.</p></div></section>${beforeYouGo()}</main><footer><a href="/en/">Sillage</a> · Japan Fragrance Guide</footer></body></html>`;
}

function renderTokyoGuide() {
  const canonical = `${SITE}/en/guides/perfume-shopping-tokyo/`;
  const headline = `Where to Buy and Try Perfume in Tokyo: ${tokyoShops.length} Stores`;
  const description = `A verified, area-by-area guide to ${tokyoShops.length} fragrance boutiques, niche specialists and department-store counters in Tokyo.`;
  const areas = storesByArea("tokyo");
  const areaSections = [...areas].map(([area, areaStores]) => `<section class="area-block" id="area-${esc(area.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}"><div class="wrap"><p class="eyebrow">Tokyo by area</p><h2>${esc(area)}</h2><p class="lede">${areaStores.length} current location${areaStores.length === 1 ? "" : "s"}. Brand availability is confirmed; individual product stock is not.</p><div class="shop-list">${areaStores.map((store) => renderStoreCard(store)).join("")}</div></div></section>`).join("");
  const boutiques = tokyoShops.filter((store) => store.storeType === "brand-boutique").length;
  const specialists = tokyoShops.filter((store) => store.storeType === "multi-brand-specialist").length;
  const taxFree = tokyoShops.filter((store) => store.taxFree === true).length;
  const itemList = { "@context": "https://schema.org", "@type": "ItemList", numberOfItems: tokyoShops.length, itemListElement: tokyoShops.map((shop, index) => ({ "@type": "ListItem", position: index + 1, name: shop.nameEn, url: `${canonical}#${shop.id}` })) };
  const article = articleLd({ headline, description, canonical, modified: storesVerifiedAt });
  const breadcrumb = breadcrumbLd([{ name: "Sillage", url: `${SITE}/en/` }, { name: "Tokyo perfume shopping", url: canonical }]);
  return `<!DOCTYPE html><html lang="en"><head>${head({ title: `${headline} | Sillage`, description, canonical, jaPath: null, ogType: "article" })}<script type="application/ld+json">${json(article)}</script><script type="application/ld+json">${json(breadcrumb)}</script><script type="application/ld+json">${json(itemList)}</script>${sharedCss}${guideCss}</head><body data-page-type="column" data-column-slug="perfume-shopping-tokyo" data-column-title="${esc(headline)}" data-column-category="travel" data-city-guide="tokyo"><script defer src="/assets/analytics.js"></script><header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="/en/guides/perfume-shopping-osaka/">Osaka guide</a></header><main><header class="guide-hero"><div class="wrap"><p class="eyebrow">Tokyo fragrance guide</p><h1>${headline}</h1><p class="lede">${description}</p><div class="actions"><a class="button" href="#area-ginza">Start with Ginza</a><a class="button secondary" href="#area-omotesando-aoyama">Explore Omotesando & Aoyama</a></div><div class="notice"><strong>Before you visit:</strong> Sillage confirms the store and brand, not live stock of an individual fragrance. Opening hours and services can change. Check the official page on the day of your visit.</div><div class="quick-grid"><div class="quick"><strong>${boutiques}</strong> brand boutiques</div><div class="quick"><strong>${specialists}</strong> niche specialists</div><div class="quick"><strong>${taxFree}</strong> tax-free locations confirmed by official sources</div></div><p>Last verified: ${dateEn(storesVerifiedAt)}</p>${guideLinks("tokyo")}</div></header><section class="section"><div class="wrap"><p class="eyebrow">Quick planning</p><h2>Choose an area before a brand.</h2><div class="guide-tips"><div><h3>Ginza & Marunouchi</h3><p>Combine flagship boutiques, department-store counters and niche selection in a compact central area.</p></div><div><h3>Shibuya & Harajuku</h3><p>Useful for contemporary niche stores and brand counters near major visitor routes.</p></div><div><h3>Omotesando & Aoyama</h3><p>Best for stand-alone boutiques where you can explore a brand's wider fragrance world.</p></div></div></div></section>${areaSections}<section class="section"><div class="wrap"><p class="eyebrow">Japanese fragrance</p><h2>Start with Japanese brands and stores.</h2><p class="lede">SHIRO has several officially confirmed Tokyo fragrance locations. NOSE SHOP also documents Japanese and international niche brands by store. Product stock changes, so use each official link before visiting.</p><p><a class="button secondary" href="/en/guides/best-japanese-perfume-brands/">Explore Japanese perfume brands</a></p><p><a href="/en/guides/tax-free-perfume-shopping-japan/">Read the Japan tax-free perfume shopping guide →</a></p></div></section>${beforeYouGo()}</main><footer><a href="/en/">Sillage</a> · Japan Fragrance Guide</footer></body></html>`;
}

function renderOsakaGuide() {
  const canonical = `${SITE}/en/guides/perfume-shopping-osaka/`;
  const headline = `Where to Buy and Try Perfume in Osaka: ${osakaShops.length} Stores`;
  const description = `A verified, area-by-area guide to ${osakaShops.length} fragrance boutiques, niche specialists and department-store beauty floors in Osaka.`;
  const areas = storesByArea("osaka");
  const areaSections = [...areas].map(([area, areaStores]) => `<section class="area-block" id="area-${esc(area.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}"><div class="wrap"><p class="eyebrow">Osaka by area</p><h2>${esc(area)}</h2><p class="lede">${areaStores.length} documented location${areaStores.length === 1 ? "" : "s"}. Brand presence is confirmed from official sources; stock of an individual fragrance is not.</p><div class="shop-list">${areaStores.map((store) => renderStoreCard(store)).join("")}</div></div></section>`).join("");
  const boutiques = osakaShops.filter((store) => store.storeType === "brand-boutique").length;
  const specialists = osakaShops.filter((store) => store.storeType === "multi-brand-specialist").length;
  const departmentStores = osakaShops.filter((store) => ["department-store", "department-counter"].includes(store.storeType)).length;
  const taxFree = osakaShops.filter((store) => store.taxFree === true).length;
  const itemList = { "@context": "https://schema.org", "@type": "ItemList", numberOfItems: osakaShops.length, itemListElement: osakaShops.map((shop, index) => ({ "@type": "ListItem", position: index + 1, name: shop.nameEn, url: `${canonical}#${shop.id}` })) };
  const article = articleLd({ headline, description, canonical, modified: storesVerifiedAt });
  const breadcrumb = breadcrumbLd([{ name: "Sillage", url: `${SITE}/en/` }, { name: "Osaka perfume shopping", url: canonical }]);
  return `<!DOCTYPE html><html lang="en"><head>${head({ title: `${headline} | Sillage`, description, canonical, jaPath: null, ogType: "article" })}<script type="application/ld+json">${json(article)}</script><script type="application/ld+json">${json(breadcrumb)}</script><script type="application/ld+json">${json(itemList)}</script>${sharedCss}${guideCss}</head><body data-page-type="column" data-column-slug="perfume-shopping-osaka" data-column-title="${esc(headline)}" data-column-category="travel" data-city-guide="osaka"><script defer src="/assets/analytics.js"></script><header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="/en/guides/perfume-shopping-tokyo/">Tokyo guide</a></header><main><header class="guide-hero"><div class="wrap"><p class="eyebrow">Osaka fragrance guide</p><h1>${headline}</h1><p class="lede">${description}</p><div class="actions"><a class="button" href="#area-umeda-osaka-station">Start with Umeda</a><a class="button secondary" href="#area-shinsaibashi">Explore Shinsaibashi</a></div><div class="notice"><strong>Before you visit:</strong> opening hours, services and brand line-ups can change. Sillage confirms documented store or brand presence, not live stock of a specific fragrance. Check the official page on the day.</div><div class="quick-grid"><div class="quick"><strong>${boutiques}</strong> brand boutiques</div><div class="quick"><strong>${specialists}</strong> niche specialists</div><div class="quick"><strong>${departmentStores}</strong> department-store entries</div><div class="quick"><strong>${taxFree}</strong> locations with tax-free service confirmed by an official source</div></div><p>Last verified: ${dateEn(storesVerifiedAt)}</p>${guideLinks("osaka")}</div></header><section class="section"><div class="wrap"><p class="eyebrow">Quick planning</p><h2>Choose a compact shopping area.</h2><div class="guide-tips"><div><h3>Umeda & Osaka Station</h3><p>Combine major department-store beauty floors, LUCUA and Grand Front around a large transport hub.</p></div><div><h3>Shinsaibashi</h3><p>Pair department-store counters with a niche specialist and nearby brand boutiques along the central shopping district.</p></div><div><h3>Namba & Minamihorie</h3><p>Use Namba for a broad beauty floor, then visit Minamihorie when a stand-alone <a href="/en/brands/le-labo/">Le Labo</a> boutique suits your route.</p></div></div></div></section>${areaSections}<section class="section"><div class="wrap"><h2>Tax-free shopping in Osaka</h2><p class="lede">“Confirmed” means an official store or department-store source documents a tax-free service. Eligibility, participating counters and procedures can still vary. It does not confirm tax-free treatment for every product or every visitor.</p><p><a class="button secondary" href="/en/guides/tax-free-perfume-shopping-japan/">Read the Japan tax-free guide</a></p></div></section>${beforeYouGo()}</main><footer><a href="/en/">Sillage</a> · Japan Fragrance Guide</footer></body></html>`;
}

function renderTaxFreeGuide() {
  const canonical = `${SITE}/en/guides/tax-free-perfume-shopping-japan/`;
  const headline = "Tax-Free Perfume Shopping in Japan: 2026 Change Guide";
  const description = "How tax-free perfume shopping in Japan works through October 31, 2026 and what changes under the refund method from November 1, 2026.";
  const article = articleLd({ headline, description, canonical, modified: taxFreeVerifiedAt });
  const breadcrumb = breadcrumbLd([{ name: "Sillage", url: `${SITE}/en/` }, { name: "Tax-free perfume shopping", url: canonical }]);
  const sources = taxFreeSources.map((source) => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)} — ${esc(source.title)} <span aria-hidden="true">↗</span></a></li>`).join("");

  // 制度変更の対比。読者が最初に知りたいのは「何が変わるか」で、購入日が
  // 10月31日か11月1日かで扱いが変わる。旅行日程に直結するので上に置く。
  const comparisonRows = taxFreeComparison.map((row) => `<tr><th scope="row">${esc(row.item)}</th><td>${esc(row.preRefund)}</td><td>${esc(row.refund)}</td></tr>`).join("");
  const comparisonTable = `<div class="table-scroll"><table class="compare"><caption>Scheduled changes to Japan's tax-free procedure</caption><thead><tr><td></td><th scope="col">${esc(taxFreePeriods.preRefund.label)}</th><th scope="col">${esc(taxFreePeriods.refund.label)}</th></tr></thead><tbody>${comparisonRows}</tbody></table></div>`;

  // 空港での手順。荷物を預ける前に税関へ、が実務上いちばん重要。
  const airportList = taxFreeAirportSteps.map((step) => `<li>${esc(step)}</li>`).join("");

  // FAQ は本文と JSON-LD を同じ配列から作る。両者が食い違わないようにするため。
  const faqBody = taxFreeFaq.map((entry) => `<article class="faq-item"><h3>${esc(entry.q)}</h3><p>${esc(entry.a)}</p></article>`).join("");
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: taxFreeFaq.map((entry) => ({
    "@type": "Question", name: entry.q, acceptedAnswer: { "@type": "Answer", text: entry.a },
  })) };

  const cap = taxFreeConsumablesCap.preRefund.toLocaleString("en-US");
  return `<!DOCTYPE html><html lang="en"><head>${head({ title: `${headline} | Sillage`, description, canonical, jaPath: null, ogType: "article" })}<script type="application/ld+json">${json(article)}</script><script type="application/ld+json">${json(breadcrumb)}</script><script type="application/ld+json">${json(faqLd)}</script>${sharedCss}${guideCss}<style>.periods{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:32px}.period{background:var(--panel);border-top:2px solid var(--gold);padding:26px}.period h2{font:500 30px "Bodoni Moda",serif}.steps{counter-reset:steps;display:grid;gap:16px}.steps li{list-style:none;border-top:1px solid var(--line);padding:18px 0}.steps li::before{counter-increment:steps;content:counter(steps,decimal-leading-zero);display:block;color:var(--gold);font:italic 18px "Cormorant",serif}.official-sources li{margin:12px 0;overflow-wrap:anywhere}.table-scroll{overflow-x:auto;margin-top:30px}.compare{border-collapse:collapse;width:100%;min-width:560px}.compare caption{text-align:left;color:var(--muted);font-size:12px;padding-bottom:12px}.compare th,.compare td{border-top:1px solid var(--line);padding:14px 16px;text-align:left;vertical-align:top;font-weight:400}.compare thead th{color:var(--gold);font-size:12px;text-transform:uppercase;letter-spacing:.8px}.compare tbody th{color:#8c8c92;font-size:13px;width:30%}.faq-list{display:grid;gap:1px;background:var(--line);margin-top:28px}.faq-item{background:var(--panel);padding:22px 24px}.faq-item h3{font:500 21px "Bodoni Moda",serif;margin:0 0 8px}.faq-item p{color:#b6b3ab;margin:0}@media(max-width:760px){.periods{grid-template-columns:1fr}}</style></head><body data-page-type="column" data-column-slug="tax-free-perfume-shopping-japan" data-column-title="${esc(headline)}" data-column-category="travel" data-tax-free-guide="japan"><script defer src="/assets/analytics.js"></script><header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="/en/guides/perfume-shopping-osaka/">Osaka guide</a></header><main><header class="guide-hero"><div class="wrap"><p class="eyebrow">Japan visitor guide</p><h1>${headline}</h1><p class="lede">${description}</p><div class="notice"><strong>Plan by purchase date:</strong> Japan is scheduled to change its tax-free shopping procedure on November 1, 2026. Rules, participating stores and departure procedures may be updated, so confirm the official guidance before travel.</div><p>Last verified: ${dateEn(taxFreeVerifiedAt)}</p>${guideLinks("tax-free")}</div></header><section class="section"><div class="wrap"><p class="eyebrow">Two systems in 2026</p><h2>Check which date applies to your purchase.</h2><div class="periods"><article class="period"><p class="eyebrow">${esc(taxFreePeriods.preRefund.label)}</p><h2>Tax exemption at the store</h2><p>Eligible non-resident visitors generally present the required passport at a participating tax-free store and complete the current procedure when purchasing. Customs may check tax-free goods when you leave Japan.</p></article><article class="period"><p class="eyebrow">${esc(taxFreePeriods.refund.label)}</p><h2>Pay first, then receive a refund</h2><p>Under the scheduled refund method, travelers pay the tax-inclusive amount at purchase. After customs confirms the goods are being taken out of Japan, the tax-equivalent amount is refunded through the participating business's process.</p></article></div>${comparisonTable}<p class="lede">Both columns describe the procedure at the store and at departure. Whether a specific purchase qualifies depends on the store, the traveler's status and the goods. Confirm with the retailer before buying.</p></div></section>

<section class="section"><div class="wrap"><p class="eyebrow">Consumption tax</p><h2>Which rate applies to fragrance.</h2><p class="lede">Japan's consumption tax has two rates: a standard rate of ${taxFreeConsumptionTax.standardRatePercent}% and a reduced rate of ${taxFreeConsumptionTax.reducedRatePercent}%. The reduced rate applies only to food and beverages (excluding alcohol and dining out) and to newspapers published at least twice a week under a subscription contract. Fragrance is not in either category, so the standard ${taxFreeConsumptionTax.standardRatePercent}% rate applies.</p><div class="notice"><strong>The refund amount may be less than the full tax amount.</strong> Some retailers or refund operators charge a handling fee. Confirm the refund terms at the point of purchase.</div><p>The reduced-rate categories are listed by the National Tax Agency. The source is linked at the end of this guide, so you can check whether an item you plan to buy falls inside them.</p></div></section>

<section class="section"><div class="wrap"><p class="eyebrow">Two different systems</p><h2>Tax-free is not duty-free.</h2><p class="lede">Travelers often use the two words interchangeably. In Japan they refer to different things, and only one of them is what this guide covers.</p><div class="guide-tips"><div><h3>Tax-free</h3><p>Stores in the city. The subject is Japan's consumption tax (standard rate ${taxFreeConsumptionTax.standardRatePercent}%). You buy the product, then complete the procedure for taking it out of Japan. <strong>This is what Sillage covers.</strong></p></div><div><h3>Duty-free</h3><p>Shops inside the airport after security. The subject is customs duty and taxes on specific goods such as alcohol and tobacco. The rules, the goods and the procedure are different.</p></div></div><p>A fragrance counter in a department store is tax-free shopping. A fragrance shop past passport control is duty-free. The price difference between them is not a simple comparison, because the taxes involved are not the same.</p></div></section><section class="section"><div class="wrap"><p class="eyebrow">From November 1, 2026</p><h2>The planned refund flow</h2><ol class="steps"><li>Buy at a participating tax-free store and pay the tax-inclusive price.</li><li>Keep the purchased perfume and the passport or other required travel document available for departure procedures.</li><li>Leave Japan within ${taxFreePeriods.refund.customsConfirmationWithinDays} days of purchase.</li><li>Present the tax-free goods for customs confirmation when leaving Japan, following the current airport or port instructions.</li><li>After confirmation, receive the tax-equivalent refund through the participating business's stated method.</li></ol><div class="notice"><strong>Airport procedure may change:</strong> the counter, timing and digital steps can vary by departure point and official implementation. Allow time and follow Japan Customs, airport and retailer instructions.</div></div></section>

<section class="section"><div class="wrap"><p class="eyebrow">At the airport</p><h2>Go to customs before you check your bag.</h2><p class="lede">This is where the refund method most often goes wrong, and it is rarely spelled out. Customs has to see the goods. If the perfume is already inside a suitcase that has been handed to the airline, it cannot be presented.</p><ol class="steps">${airportList}</ol><div class="notice"><strong>Timing matters.</strong> If you arrive close to boarding, the confirmation may not be completed, and a refund may not be possible. Treat the customs step as part of your departure schedule, not as something to do if there is time left.</div></div></section>

<section class="section"><div class="wrap"><p class="eyebrow">Fragrance specifics</p><h2>What changes for perfume.</h2><p class="lede">Fragrance is treated as a consumable under the tax-free system, so the changes to consumables apply directly to it.</p><div class="guide-tips"><div><h3>The ¥${cap} cap is removed</h3><p>Through ${dateEn(taxFreePeriods.preRefund.until)}, consumables have a purchase cap of ¥${cap}. Under the refund method this cap is scheduled to be removed, which matters if you plan to buy several bottles of niche fragrance in one visit.</p></div><div><h3>Special packaging ends</h3><p>The sealed-packaging requirement for consumables is scheduled to be removed. This is a change to packaging, not permission to use the product.</p></div><div><h3>Using it in Japan</h3><p>Customs confirmation requires that the goods are leaving Japan. If you open and use the perfume during your stay, you may be unable to complete the confirmation, and therefore unable to receive the refund.</p></div></div><div class="notice"><strong>The end of special packaging is widely misread.</strong> No seal does not mean free to use. The condition that the goods leave Japan is unchanged.</div></div></section>

<section class="section"><div class="wrap"><p class="eyebrow">The 90-day rule</p><h2>Leave Japan within ${taxFreePeriods.refund.customsConfirmationWithinDays} days of purchase.</h2><p class="lede">Under the refund method, the purchase and the departure are linked by a time limit. If you leave Japan more than ${taxFreePeriods.refund.customsConfirmationWithinDays} days after buying, the purchase does not meet the condition.</p><p>For a short trip this is rarely an issue. It matters for long stays. A student, a working-holiday visitor or anyone on a multi-month stay may buy something early in the stay and depart well past the limit. In that case the purchase would not qualify, even though the same person on a two-week trip would have had no problem.</p><p>If your stay is long, consider the timing of the purchase in relation to your departure date, and confirm the current conditions with the retailer.</p></div></section><section class="section"><div class="wrap"><p class="eyebrow">Perfume-specific caution</p><h2>Tax-free eligibility and aviation rules are separate.</h2><p class="lede">A perfume purchase being tax-free does not mean it can be carried on an aircraft without restriction. Fragrance contains liquid and often alcohol. Check your airline and departure airport rules for cabin baggage, checked baggage, container size and total quantity.</p><div class="notice"><strong>Shipping is not a guaranteed workaround.</strong> Since April 1, 2025, goods personally mailed overseas by the purchaser do not qualify for the current tax-free procedure. A store's own export or delivery service is separate and must be confirmed with that retailer. Sillage does not promise that perfume can be shipped internationally.</div></div></section><section class="section"><div class="wrap"><p class="eyebrow">Common questions</p><h2>Questions travelers ask.</h2><div class="faq-list">${faqBody}</div></div></section><section class="section"><div class="wrap"><p class="eyebrow">Official references</p><h2>Confirm before you buy.</h2><p class="lede">This guide summarizes official visitor, tourism, tax and customs information. The official pages control if requirements change.</p><ul class="official-sources">${sources}</ul>${guideLinks("tax-free")}</div></section>${guideCta(
    "What to buy",
    "Fragrance counts as a consumable item under the tax-free system. The &yen;500,000 cap on consumables is scheduled to be removed on 1 November 2026.",
    [
      ["/en/fragrances/", "Fragrances with Japanese retail prices"],
      ["/en/guides/best-japanese-perfume-brands/", "Japanese brands you can only find here"],
      ["/en/guides/perfume-shopping-tokyo/", "Where to buy in Tokyo"],
    ],
  )}</main><footer><a href="/en/">Sillage</a> · Japan Fragrance Guide</footer></body></html>`;
}

function renderJapaneseBrandsGuide() {
  const canonical = `${SITE}/en/guides/best-japanese-perfume-brands/`;
  const headline = "Japanese Perfume Brands to Explore in Japan";
  const description = "An editorial introduction to six well-documented Japanese fragrance brands, with official links and practical notes for travelers shopping in Japan.";
  const brands = [
    { name: "SHIRO", nameJa: "シロ", href: "https://shiro-shiro.jp/ec/Facet?category_0=11ae1111000", text: "A Japanese beauty brand with a broad fragrance collection. Savon Eau de Parfum is one familiar entry point; check the official Japan site for current sizes and prices." },
    { name: "J-Scent", nameJa: "ジェイセント", href: "https://luzfragrance.com/j-scent/", extra: "https://j-scent-global.com/", text: "A fragrance line developed around images and cultural references associated with Japan. The official global site is useful for visitors who want English-language brand context." },
    { name: "SHOLAYERED", nameJa: "ショーレイヤード", href: "https://sholayered.jp/en/", text: "A Made-in-Japan fragrance brand built around wearing scents alone or in layers. Its official English site explains the concept, and the Kyoto guide includes its Sanjo store." },
    { name: "AUX PARADIS", nameJa: "オゥパラディ", href: "https://www.auxparadis.com/message/", text: "A Japanese fragrance brand that describes its products in relation to Japan's air, climate and skin. Confirm current products, shop locations and prices on the official site." },
    { name: "KITOWA", nameJa: "キトワ", href: "https://www.kitowa.co.jp/en/pages/our-brand", text: "A Japanese maison fragrance brand established in 2018, drawing on Japanese aromatic woods and a long incense tradition. Its official English brand page explains the philosophy and current fragrance categories." },
    { name: "Parfum Satori", nameJa: "パルファン サトリ", href: "https://www.parfumsatori.com/", extra: "https://parfum-satori.com/?mode=f39", text: "A Japanese perfume house founded in 2000 by perfumer Satori Osawa. The official site documents its collections and a Roppongi flagship; confirm opening details before visiting." },
  ];
  const cards = brands.map((brand, index) => `<article class="brand-guide"><p class="number">0${index + 1}</p><h2>${esc(brand.name)}</h2><p class="ja-name" lang="ja">${esc(brand.nameJa)}</p><p>${esc(brand.text)}</p><p><a href="${esc(brand.href)}" target="_blank" rel="noopener noreferrer">Official site <span aria-hidden="true">↗</span></a>${brand.extra ? ` · <a href="${esc(brand.extra)}" target="_blank" rel="noopener noreferrer">Official global site <span aria-hidden="true">↗</span></a>` : ""}</p></article>`).join("");
  const article = articleLd({ headline, description, canonical, modified: "2026-08-26" });
  const breadcrumb = breadcrumbLd([{ name: "Sillage", url: `${SITE}/en/` }, { name: "Japanese perfume brands", url: canonical }]);
  return `<!DOCTYPE html><html lang="en"><head>${head({ title: `${headline} | Sillage`, description, canonical, jaPath: null, ogType: "article" })}<script type="application/ld+json">${json(article)}</script><script type="application/ld+json">${json(breadcrumb)}</script>${sharedCss}${guideCss}<style>.brand-guides{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;padding-bottom:88px}.brand-guide{background:var(--panel);border-top:2px solid var(--gold);padding:28px}.brand-guide h2{font:500 30px "Bodoni Moda",serif;margin:0}.brand-guide .number{color:var(--gold);font:italic 18px "Cormorant",serif}.brand-guide a{color:var(--gold);text-underline-offset:4px}@media(max-width:720px){.brand-guides{grid-template-columns:1fr}}</style></head><body data-page-type="column" data-column-slug="best-japanese-perfume-brands" data-column-title="${esc(headline)}" data-column-category="brands"><script defer src="/assets/analytics.js"></script><header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="/" hreflang="ja" lang="ja">日本語版へ</a></header><main><header class="guide-hero"><div class="wrap"><p class="eyebrow">Japan fragrance culture</p><h1>${headline}</h1><p class="lede">${description}</p><p>This is not a popularity ranking. We selected brands with accessible official information and a clear connection to fragrance in Japan. Product availability may change, so use the official links before visiting or buying.</p>${guideLinks()}</div></header><section class="section"><div class="wrap"><div class="brand-guides">${cards}</div><div class="notice"><h2>How to use this guide</h2><p>Start with the brand concept, then test on paper and skin if possible. Japanese names remain visible to make store communication easier. Sillage does not create product pages for items that are absent from its source database.</p><p>Plan by city with the verified <a href="/en/guides/perfume-shopping-tokyo/">Tokyo</a>, <a href="/en/guides/perfume-shopping-kyoto/">Kyoto</a> and <a href="/en/guides/perfume-shopping-osaka/">Osaka</a> guides.</p></div></div></section>${guideCta(
    "Where to try them",
    "",
    [
      ["/en/guides/perfume-shopping-tokyo/", "Tokyo shops carrying Japanese brands"],
      ["/en/guides/perfume-shopping-kyoto/", "Kyoto shops"],
      ["/en/guides/perfume-shopping-osaka/", "Osaka shops"],
      ["/en/fragrances/", "Browse all fragrances"],
    ],
  )}</main><footer><a href="/en/">Sillage</a> · Japan Fragrance Guide</footer></body></html>`;
}

function renderProduct(product) {
  const canonical = `${SITE}${product.routeEn}`;
  const description = `${product.nameEn} by ${product.brandEn}: ${product.familyEn} fragrance notes, sizes, seasons, occasions and purchase information for Japan.`;
  const brand = brandEntries.find((entry) => entry.key === product.brand);
  const brandUrl = brand ? brandRouteEn(brand) : "/en/brands/";

  // 同じブランドの他の商品。1商品しかないブランド（Aesop / Creed / Diptyque /
  // Maison Margiela）ではセクション自体を出さない。最大4本まで。
  const siblings = (brand?.products || []).filter((entry) => entry.slug !== product.slug).slice(0, 4);
  const alsoBy = siblings.length ? `<section class="section"><p class="eyebrow">More from this brand</p><h2>Other fragrances by ${esc(product.brandEn)}</h2><div class="try-grid">${siblings.map((entry) => `<article><h3>${esc(entry.nameEn)}</h3><p class="ja-name" lang="ja">${esc(entry.nameJa)}</p><p>${esc(entry.familyEn)}</p><a href="${esc(entry.routeEn)}">View fragrance &rarr;</a></article>`).join("")}</div>${brandHasDetail(brand.key) ? `<p><a href="${esc(brandUrl)}">All ${esc(product.brandEn)} fragrances &rarr;</a></p>` : ""}</section>` : "";
  const officialPrices = product.japanAvailability.officialPrices.map((entry) => `<div><dt>${entry.volumeMl} mL</dt><dd>${money(entry.priceJpy)} <small>official reference price in Japan${entry.checkedAt ? `, checked ${dateEn(entry.checkedAt)}` : ""}</small></dd></div>`).join("");
  const retail = product.japanAvailability.retailPrice && product.japanAvailability.purchaseLinks.rakuten
    ? `<div><dt>${esc(product.japanAvailability.retailPrice.volume || "Rakuten listing")}</dt><dd>${product.japanAvailability.retailPrice.isFrom ? "from " : ""}${money(product.japanAvailability.retailPrice.priceJpy)} <small>Rakuten price checked ${dateEn(product.japanAvailability.retailPrice.checkedAt)}</small></dd></div>` : "";
  const purchase = [
    product.japanAvailability.purchaseLinks.official ? `<a class="button buy buy-official" data-purchase-shop="official" data-product-id="${esc(product.slug)}" href="${esc(product.japanAvailability.purchaseLinks.official.url)}" target="_blank" rel="noopener noreferrer">Official site <span aria-hidden="true">↗</span></a>` : "",
    product.japanAvailability.purchaseLinks.rakuten ? `<a class="button buy" data-purchase-shop="rakuten" data-product-id="${esc(product.slug)}" href="${esc(product.japanAvailability.purchaseLinks.rakuten.url)}" target="_blank" rel="nofollow sponsored noopener noreferrer">Buy on Rakuten Japan <span aria-hidden="true">↗</span></a>` : "",
  ].filter(Boolean).join("");
  const sourceList = (product.sources || []).map((source) => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)} — <span lang="${/[ぁ-んァ-ン一-龠]/.test(source.title) ? "ja" : "en"}">${esc(source.title)}</span> <span aria-hidden="true">↗</span></a>${source.accessedAt ? ` <small>accessed ${dateEn(source.accessedAt)}</small>` : ""}</li>`).join("");
  const tryStores = product.japanAvailability.whereToTry.map((entry) => storeById.get(entry.storeId)).filter(Boolean);
  const whereToTry = tryStores.length ? `<section class="section where-to-try"><p class="eyebrow">Japan store guide</p><h2>Where to explore ${esc(product.brandEn)} in Japan</h2><p class="lede">These stores are confirmed to carry the brand. This does not confirm stock of ${esc(product.nameEn)}; check the official store information before visiting.</p><div class="try-grid">${representativeStores(tryStores).map((store) => `<article><h3>${esc(store.nameEn)}</h3><p>${esc(cityName(store.city))} · ${esc(store.area)} · ${esc(store.nearestStation)}</p><a href="/en/guides/perfume-shopping-${esc(store.city)}/#${esc(store.id)}">View store details →</a></article>`).join("")}</div><p><a href="/en/guides/tax-free-perfume-shopping-japan/">How tax-free perfume shopping in Japan works →</a></p></section>` : "";
  const editorial = product.editorial ? `<section class="section editorial"><p class="eyebrow">Sillage editorial view</p><h2>Who this fragrance may suit</h2><p class="lede">${esc(product.editorial.summary)}</p><div class="editorial-grid">${product.editorial.recommendedFor?.length ? `<div><h3>Good match for</h3><ul>${product.editorial.recommendedFor.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>` : ""}${product.editorial.notRecommendedFor?.length ? `<div><h3>Consider another option if</h3><ul>${product.editorial.notRecommendedFor.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>` : ""}${product.editorial.cautions?.length ? `<div><h3>Before buying</h3><ul>${product.editorial.cautions.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>` : ""}</div><p class="editorial-note">This is Sillage's editorial interpretation of the listed composition and product attributes, not a claim made by the brand. Test on skin when possible.</p></section>` : "";
  const productLd = { "@context": "https://schema.org", "@type": "Product", name: product.nameEn, alternateName: product.nameJa, brand: { "@type": "Brand", name: product.brandEn }, category: product.familyEn, description, url: canonical, image: String(product.img || "").startsWith("/") ? `${SITE}${product.img}` : product.img };
  const breadcrumbLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Sillage", item: `${SITE}/en/` },
    { "@type": "ListItem", position: 2, name: "Fragrances", item: `${SITE}/en/fragrances/` },
    { "@type": "ListItem", position: 3, name: product.nameEn, item: canonical },
  ] };
  return `<!DOCTYPE html><html lang="en"><head>
${head({ title: `${product.nameEn} by ${product.brandEn} | Sillage`, description, canonical, product })}
<script type="application/ld+json">${json(productLd)}</script><script type="application/ld+json">${json(breadcrumbLd)}</script>
${sharedCss}<style>.crumb{padding:28px 0;color:#8c8c92;font-size:12px}.hero{display:grid;grid-template-columns:minmax(280px,.88fr) 1.12fr;gap:clamp(34px,6vw,76px);align-items:center;padding:20px 0 72px}.visual{background:#f2f0eb;min-height:430px;display:grid;place-items:center}.visual img{width:88%;height:400px;object-fit:contain}.brand-name{font:italic 19px "Cormorant",serif;color:#c9b558}.hero h1{font:500 clamp(38px,6vw,66px)/1.08 "Bodoni Moda",serif;margin:8px 0}.ja-product{color:#9a9aa1;margin:0 0 24px}.facts,.prices{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:#2c2d31;border:1px solid #2c2d31}.facts div,.prices div{background:#15161b;padding:15px}.facts dt,.prices dt{font-size:11px;color:#8c8c92;text-transform:uppercase;letter-spacing:.8px}.facts dd,.prices dd{margin:4px 0 0}.notes{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:34px}.note{border-top:2px solid #c9b558;padding-top:18px}.note h3{font:500 22px "Bodoni Moda",serif;margin:0}.note p{color:#b6b3ab}.purchase{margin-top:28px}.purchase .button{margin:0 8px 8px 0}.ad{color:#8c8c92;font-size:12px}.source-list{padding-left:20px}.source-list li{margin:10px 0}.source-list small,.prices small{display:block;color:#77787e}.editorial-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:30px}.editorial-grid>div{border-top:1px solid var(--gold);padding-top:16px}.editorial-grid h3{font:500 21px "Bodoni Moda",serif}.editorial-grid ul{padding-left:20px;color:#b6b3ab}.editorial-note{color:#8c8c92;font-size:12px;margin-top:28px}.try-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:28px}.try-grid article{border-top:1px solid var(--gold);padding-top:16px}.try-grid h3{font:500 20px "Bodoni Moda",serif;margin:0}.try-grid p{color:var(--muted);font-size:13px}.try-grid a{color:var(--gold);font-size:13px}@media(max-width:760px){.hero{grid-template-columns:1fr}.visual{min-height:300px}.visual img{height:300px}.facts,.prices{grid-template-columns:1fr}.notes,.editorial-grid,.try-grid{grid-template-columns:1fr}.purchase .button{width:100%;margin-right:0}}</style>
</head><body data-page-type="item" data-item-slug="${esc(product.slug)}" data-item-name="${esc(product.nameEn)}" data-item-brand="${esc(product.brandEn)}" data-item-family="${esc(product.family)}" data-price-tier="${esc(product.priceTier || "")}"><script defer src="/assets/analytics.js"></script>
<header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="${product.routeJa}" hreflang="ja" lang="ja">日本語の商品ページ</a></header><main class="wrap"><nav class="crumb" aria-label="Breadcrumb"><a href="/en/">Sillage</a> / <a href="/en/fragrances/">Fragrances</a> / ${esc(product.nameEn)}</nav>
<section class="hero"><div class="visual"><img src="${esc(product.img || `/img/products/${product.slug}.png`)}" alt="${esc(product.brandEn)} ${esc(product.nameEn)} bottle" width="640" height="640" fetchpriority="high"></div><div><p class="brand-name"><a href="${esc(brandUrl)}">${esc(product.brandEn)}</a></p><h1>${esc(product.nameEn)}</h1><p class="ja-product" lang="ja">Japanese name: ${esc(product.nameJa)}</p><dl class="facts"><div><dt>Scent family</dt><dd>${esc(product.familyEn)}</dd></div>${product.concentrationEn ? `<div><dt>Concentration</dt><dd>${esc(product.concentrationEn)}</dd></div>` : ""}${product.sizes?.length ? `<div><dt>Sizes listed</dt><dd>${product.sizes.map((size) => `${size.volumeMl} mL`).join(" / ")}</dd></div>` : ""}${product.releaseYear ? `<div><dt>Release year</dt><dd>${esc(product.releaseYear)}</dd></div>` : ""}<div><dt>Gender listing</dt><dd>${esc(product.genderEn)}</dd></div>${product.scenesEn.length ? `<div><dt>Occasions</dt><dd>${esc(product.scenesEn.join(" / "))}</dd></div>` : ""}${product.seasonsEn.length ? `<div><dt>Seasons</dt><dd>${esc(product.seasonsEn.join(" / "))}</dd></div>` : ""}${product.verifiedAt ? `<div><dt>Last verified</dt><dd>${dateEn(product.verifiedAt)}</dd></div>` : ""}</dl>${purchase ? `<div class="purchase"><p class="ad">${product.japanAvailability.purchaseLinks.rakuten ? "PR: Rakuten links are affiliate links for purchases on Rakuten Japan. " : ""}Prices and availability can change.</p>${purchase}</div>` : ""}</div></section>
<section class="section"><p class="eyebrow">Scent over time</p><h2>Fragrance notes</h2><div class="notes"><div class="note"><h3>Top</h3><p>${esc(product.notes.top)}</p></div><div class="note"><h3>Middle</h3><p>${esc(product.notes.mid)}</p></div><div class="note"><h3>Last</h3><p>${esc(product.notes.last)}</p></div></div><p class="lede">Note stages describe the listed composition, not measured wear time. How a fragrance develops varies by skin, climate and application.</p></section>
${editorial}
${whereToTry}
${alsoBy}
${officialPrices || retail ? `<section class="section"><p class="eyebrow">Japan market</p><h2>Price information in Japan</h2><p class="lede">Official reference prices and retailer prices are kept separate. They may refer to different sizes and dates.</p>${officialPrices ? `<h3>Official Japan Price</h3><dl class="prices">${officialPrices}</dl>` : ""}${retail ? `<h3>Rakuten Market Price</h3><dl class="prices">${retail}</dl>` : ""}</section>` : ""}
${sourceList ? `<section class="section"><p class="eyebrow">References</p><h2>Sources</h2><ul class="source-list">${sourceList}</ul></section>` : ""}
</main><footer><a href="/en/fragrances/">Back to fragrances</a><br>Information is based on the same product record used by the Japanese Sillage site.</footer></body></html>`;
}

rmSync("public/en", { recursive: true, force: true });
write("public/en/index.html", renderHome());
write("public/en/fragrances/index.html", renderList());
write("public/en/brands/index.html", renderBrandIndex());
for (const brand of brandEntries.filter((entry) => brandHasDetail(entry.key))) {
  write(join("public/en/brands", brand.slug, "index.html"), renderBrand(brand));
}
write("public/en/guides/perfume-shopping-kyoto/index.html", renderKyotoGuide());
write("public/en/guides/perfume-shopping-tokyo/index.html", renderTokyoGuide());
write("public/en/guides/perfume-shopping-osaka/index.html", renderOsakaGuide());
write("public/en/guides/tax-free-perfume-shopping-japan/index.html", renderTaxFreeGuide());
write("public/en/guides/best-japanese-perfume-brands/index.html", renderJapaneseBrandsGuide());
for (const product of localizedProducts) write(join("public", product.routeEn, "index.html"), renderProduct(product));

mkdirSync(publicI18n, { recursive: true });
write(`${publicI18n}/translations.json`, JSON.stringify(translations));
write(`${publicI18n}/products.en.json`, JSON.stringify({ schemaVersion: 1, products: englishProducts }));
write(`${publicI18n}/brands.en.json`, readFileSync("data/i18n/brands.en.json", "utf8"));
write("public/data/stores.json", readFileSync("data/stores.json", "utf8"));
write("public/data/tax-free-system.json", readFileSync("data/tax-free-system.json", "utf8"));

console.log(`Generated English Phase 4: home, catalogue, ${localizedProducts.length} product pages, ${brandEntries.length} brand entries, ${brandEntries.filter((entry) => brandHasDetail(entry.key)).length} brand pages and 5 guides from ${stores.length} stores.`);
