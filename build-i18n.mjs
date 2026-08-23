import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadFragrances } from "./lib/fragrance-data.mjs";
import {
  englishProducts,
  englishSite,
  localizeProduct,
  translations,
} from "./lib/i18n.mjs";

const SITE = "https://sillage.asutelu.com";
const products = loadFragrances();
const localizedProducts = products.map(localizeProduct).filter(Boolean);
const publicI18n = "public/data/i18n";

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

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.replace(/[ \t]+$/gm, ""), "utf8");
}

function head({ title, description, canonical, robots = "index,follow", product = null }) {
  const jaUrl = product ? `${SITE}${product.routeJa}` : `${SITE}/`;
  const enUrl = canonical;
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
<link rel="alternate" hreflang="en" href="${esc(enUrl)}">
<link rel="alternate" hreflang="ja" href="${esc(jaUrl)}">
<link rel="alternate" hreflang="x-default" href="${esc(jaUrl)}">
<meta property="og:type" content="${product ? "product" : "website"}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:site_name" content="Sillage">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600&family=Cormorant:ital,wght@0,400;0,500;1,400&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">`;
}

const sharedCss = `<style>
:root{--bg:#0e0f13;--panel:#15161b;--line:#2c2d31;--ink:#e9e7e3;--muted:#9a9aa1;--gold:#c9b558;--rose:#c4889c}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:"Zen Kaku Gothic New",system-ui,sans-serif;line-height:1.75;-webkit-font-smoothing:antialiased}a{color:inherit}a:focus-visible,button:focus-visible,select:focus-visible{outline:2px solid var(--gold);outline-offset:4px}.topbar{min-height:64px;padding:12px clamp(18px,4vw,52px);display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:1px solid var(--line);background:rgba(14,15,19,.94);position:sticky;top:0;z-index:20}.logo{font:500 28px "Bodoni Moda",serif;letter-spacing:2px;text-decoration:none}.language{font-size:13px;color:var(--muted);text-underline-offset:4px}.wrap{width:min(1120px,calc(100% - 36px));margin:0 auto}.eyebrow{font:italic 17px "Cormorant",serif;color:var(--gold);letter-spacing:1px}.button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:10px 18px;border:1px solid var(--gold);text-decoration:none;font-size:14px;background:#e7e3da;color:#15151a}.button.secondary{background:transparent;color:var(--ink);border-color:#55565c}.button[aria-disabled=true]{color:#77787e;border-color:#34353a;pointer-events:none}.section{padding:clamp(54px,8vw,96px) 0;border-top:1px solid var(--line)}.section h2{font:500 clamp(28px,4vw,42px) "Bodoni Moda",serif;margin:0 0 10px}.lede{max-width:680px;color:#b6b3ab}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:32px}.card{border-top:2px solid var(--accent,var(--gold));background:var(--panel);padding:24px;text-decoration:none;min-width:0}.card h3{font:500 22px "Bodoni Moda",serif;margin:0 0 8px}.card p{margin:0;color:var(--muted);font-size:14px}.card small{display:block;color:var(--gold);margin-top:18px}.product-card{display:grid;grid-template-columns:92px 1fr;gap:18px;align-items:center}.product-card img{width:92px;height:110px;object-fit:contain;background:#f2f0eb}.ja-name{display:block;color:#8c8c92;font-size:12px;margin-top:2px}footer{border-top:1px solid var(--line);padding:34px 18px;text-align:center;color:#77787e;font-size:12px}@media(max-width:760px){.cards{grid-template-columns:1fr}.topbar{min-height:58px}.product-card{grid-template-columns:78px 1fr}.product-card img{width:78px;height:96px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
</style>`;

function renderHome() {
  const canonical = `${SITE}/en/`;
  const featured = localizedProducts.slice(0, 5).map((product) => `<a class="card product-card" href="${product.routeEn}" style="--accent:${product.family === "musk" ? "#aa92bf" : product.family === "woody" ? "#9d704d" : product.family === "amber" ? "#d09939" : "#7bb06d"}">
    <img src="${esc(product.img || `/img/products/${product.slug}.png`)}" alt="${esc(product.brandEn)} ${esc(product.nameEn)}" width="92" height="110" loading="lazy">
    <span><strong>${esc(product.brandEn)}</strong><br>${esc(product.nameEn)}<span class="ja-name" lang="ja">${esc(product.nameJa)}</span><small>View fragrance →</small></span>
  </a>`).join("\n");
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: "Sillage", url: canonical, description: englishSite.description, inLanguage: "en" };
  return `<!DOCTYPE html>
<html lang="en"><head>
${head({ title: englishSite.title, description: englishSite.description, canonical })}
<script type="application/ld+json">${json(website)}</script>
${sharedCss}
<style>.hero{min-height:66vh;display:grid;place-items:center;padding:80px 0}.hero h1{font:500 clamp(44px,8vw,84px)/1.06 "Bodoni Moda",serif;margin:12px 0 24px;max-width:900px}.hero p{max-width:660px;color:#b6b3ab;font-size:clamp(16px,2vw,19px)}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}.path-card{min-height:170px}.coming{color:#77787e;font-size:12px;text-transform:uppercase;letter-spacing:1px}</style>
</head><body>
<script defer src="/assets/analytics.js"></script>
<header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="/" hreflang="ja" lang="ja">日本語版へ</a></header>
<main>
  <section class="hero"><div class="wrap"><p class="eyebrow">Japan Fragrance Guide</p><h1>Find fragrance through scent, place and season.</h1><p>${esc(englishSite.description)} Japanese names and Japan-specific price information stay visible, so you can identify the right product while shopping in Japan.</p><div class="actions"><a class="button" href="/en/fragrances/">Explore fragrances</a><a class="button secondary" href="#paths">Choose a path</a></div></div></section>
  <section class="section" id="paths"><div class="wrap"><p class="eyebrow">Explore Sillage</p><h2>Choose how you want to look.</h2><p class="lede">Phase 1 opens the English fragrance catalogue and five verified pilot pages. The remaining guides will be added without changing the Japanese site.</p><div class="cards">
    <a class="card path-card" href="/en/fragrances/"><h3>Fragrances</h3><p>Filter all ${products.length} listings by scent family, season, occasion, gender and price band.</p><small>Open catalogue →</small></a>
    <div class="card path-card"><span class="coming">Phase 2</span><h3>Brands</h3><p>Brand profiles with Japanese names, country of origin and official links.</p></div>
    <div class="card path-card"><span class="coming">Phase 2</span><h3>Fragrance Finder</h3><p>A guided route from scent preference to a short list of products.</p></div>
    <div class="card path-card"><span class="coming">Phase 2</span><h3>Guides</h3><p>Practical shopping, testing and wearing guidance for visitors to Japan.</p></div>
    <div class="card path-card"><span class="coming">Phase 2</span><h3>Cities</h3><p>Kyoto will be the first city guide after its shop data is re-verified.</p></div>
  </div></div></section>
  <section class="section"><div class="wrap"><p class="eyebrow">English pilot</p><h2>Five fragrance pages to start.</h2><p class="lede">Each page uses the same source product record as the Japanese site. No duplicate prices or affiliate links are maintained.</p><div class="cards">${featured}</div></div></section>
</main><footer><a href="/en/">Sillage</a> · Japan Fragrance Guide<br>Price and availability may change. Confirm current details with each retailer.</footer>
</body></html>`;
}

function renderList() {
  const canonical = `${SITE}/en/fragrances/`;
  const description = `Browse ${products.length} fragrances listed by Sillage, with filters for scent family, season, occasion, gender and Japan price band.`;
  return `<!DOCTYPE html><html lang="en"><head>
${head({ title: `Fragrances in Japan | Sillage`, description, canonical, robots: "noindex,follow" })}
${sharedCss}<style>.catalog-head{padding:72px 0 42px}.catalog-head h1{font:500 clamp(40px,7vw,70px) "Bodoni Moda",serif;margin:10px 0}.filters{display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:12px;padding:22px 0;border-block:1px solid var(--line)}label{display:grid;gap:7px;color:#9a9aa1;font-size:12px}select{width:100%;min-height:44px;background:#15161b;color:#e9e7e3;border:1px solid #3a3b40;padding:8px}.result-line{display:flex;justify-content:space-between;gap:20px;align-items:center;margin:30px 0}.reset{background:none;border:0;color:#c9b558;text-decoration:underline;cursor:pointer}.catalog{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-bottom:80px}.catalog .card{display:grid;grid-template-columns:100px 1fr;gap:16px;align-items:center;padding:18px}.catalog img{width:100px;height:120px;object-fit:contain;background:#f2f0eb}.meta{color:#9a9aa1;font-size:12px}.status{padding:42px 0;color:#9a9aa1}@media(max-width:900px){.filters{grid-template-columns:repeat(2,1fr)}.catalog{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){.catalog{grid-template-columns:1fr}.catalog .card{grid-template-columns:82px 1fr}.catalog img{width:82px;height:100px}.filters{grid-template-columns:1fr 1fr}}</style>
</head><body><script defer src="/assets/analytics.js"></script><header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="/" hreflang="ja" lang="ja">日本語版へ</a></header>
<main class="wrap"><header class="catalog-head"><p class="eyebrow">Fragrance catalogue</p><h1>Fragrances in Japan</h1><p class="lede">The catalogue shares the Japanese product database. Five products currently have complete English detail pages; other cards lead to their Japanese source page.</p></header>
<section class="filters" aria-label="Filter fragrances"><label>Scent family<select id="family"><option value="">All families</option></select></label><label>Season<select id="season"><option value="">All seasons</option></select></label><label>Occasion<select id="scene"><option value="">All occasions</option></select></label><label>Gender<select id="gender"><option value="">All</option></select></label><label>Japan price band<select id="price"><option value="">All prices</option></select></label></section>
<div class="result-line"><p id="count" aria-live="polite">Loading fragrances…</p><button class="reset" type="button" id="reset">Clear filters</button></div><div id="catalog" class="catalog" aria-busy="true"></div><p id="error" class="status" hidden>Fragrance data could not be loaded. Please try again later.</p></main>
<footer><a href="/en/">Sillage</a> · Japan Fragrance Guide</footer>
<script>
const selects=["family","season","scene","gender","price"].map(id=>document.getElementById(id));
const esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
Promise.all([fetch("/data/fragrances.json").then(r=>{if(!r.ok)throw Error(r.status);return r.json()}),fetch("/data/i18n/translations.json").then(r=>r.json()),fetch("/data/i18n/products.en.json").then(r=>r.json()),fetch("/data/i18n/brands.en.json").then(r=>r.json())]).then(([items,t,p,b])=>{
 const labels=t.labels,localized=p.products,brands=b.brands;
 const groups={family:labels.family,season:labels.season,scene:labels.scene,gender:labels.gender,price:labels.priceTier};
 for(const select of selects)for(const [key,value] of Object.entries(groups[select.id]))select.insertAdjacentHTML("beforeend",'<option value="'+esc(key)+'">'+esc(value.en)+'</option>');
 const render=()=>{const [family,season,scene,gender,price]=selects.map(s=>s.value);const filtered=items.filter(x=>(!family||x.family===family)&&(!season||x.seasons.includes(season))&&(!scene||x.scenes.includes(scene))&&(!gender||x.gender===gender)&&(!price||x.priceTier===price));
  document.getElementById("count").textContent=filtered.length+' fragrance'+(filtered.length===1?'':'s')+' found';
  document.getElementById("catalog").innerHTML=filtered.map(x=>{const l=localized[x.slug],brand=brands[x.brand],href=l&&brand?'/en/fragrances/'+brand.slug+'/'+l.englishSlug+'/':'/items/'+x.slug;const name=l?l.nameEn:x.name;return '<a class="card" href="'+esc(href)+'"><img src="'+esc(x.img||'/img/products/'+x.slug+'.png')+'" alt="'+esc(x.brand)+' '+esc(name)+'" width="100" height="120" loading="lazy"><span><strong>'+esc(brand?.nameEn||x.brand)+'</strong><br>'+esc(name)+'<span class="ja-name" lang="ja">'+esc(x.name)+'</span><span class="meta">'+esc(labels.family[x.family]?.en||x.family)+' · '+esc(labels.priceTier[x.priceTier]?.en||x.priceTier)+'</span>'+(l?'<small>English detail →</small>':'<small>Japanese detail →</small>')+'</span></a>'}).join("");document.getElementById("catalog").setAttribute("aria-busy","false");};
 selects.forEach(s=>s.addEventListener("change",render));document.getElementById("reset").addEventListener("click",()=>{selects.forEach(s=>s.value="");render()});render();
}).catch(()=>{document.getElementById("count").hidden=true;document.getElementById("catalog").hidden=true;document.getElementById("error").hidden=false});
</script></body></html>`;
}

function renderProduct(product) {
  const canonical = `${SITE}${product.routeEn}`;
  const description = `${product.nameEn} by ${product.brandEn}: ${product.familyEn} fragrance notes, sizes, seasons, occasions and purchase information for Japan.`;
  const brandUrlJa = `/brand-${product.brand === "Jo Malone" ? "jo-malone" : product.brandSlugEn}.html`;
  const officialPrices = product.japanAvailability.officialPrices.map((entry) => `<div><dt>${entry.volumeMl} mL</dt><dd>${money(entry.priceJpy)} <small>official reference price in Japan${entry.checkedAt ? `, checked ${dateEn(entry.checkedAt)}` : ""}</small></dd></div>`).join("");
  const retail = product.japanAvailability.retailPrice && product.japanAvailability.purchaseLinks.rakuten
    ? `<div><dt>${esc(product.japanAvailability.retailPrice.volume || "Rakuten listing")}</dt><dd>${product.japanAvailability.retailPrice.isFrom ? "from " : ""}${money(product.japanAvailability.retailPrice.priceJpy)} <small>Rakuten price checked ${dateEn(product.japanAvailability.retailPrice.checkedAt)}</small></dd></div>` : "";
  const purchase = [
    product.japanAvailability.purchaseLinks.official ? `<a class="button buy buy-official" data-purchase-shop="official" data-product-id="${esc(product.slug)}" href="${esc(product.japanAvailability.purchaseLinks.official.url)}" target="_blank" rel="noopener noreferrer">Official site <span aria-hidden="true">↗</span></a>` : "",
    product.japanAvailability.purchaseLinks.rakuten ? `<a class="button buy" data-purchase-shop="rakuten" data-product-id="${esc(product.slug)}" href="${esc(product.japanAvailability.purchaseLinks.rakuten.url)}" target="_blank" rel="nofollow sponsored noopener noreferrer">Check on Rakuten <span aria-hidden="true">↗</span></a>` : "",
  ].filter(Boolean).join("");
  const sourceList = (product.sources || []).map((source) => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)} — <span lang="${/[ぁ-んァ-ン一-龠]/.test(source.title) ? "ja" : "en"}">${esc(source.title)}</span> <span aria-hidden="true">↗</span></a>${source.accessedAt ? ` <small>accessed ${dateEn(source.accessedAt)}</small>` : ""}</li>`).join("");
  const productLd = { "@context": "https://schema.org", "@type": "Product", name: product.nameEn, alternateName: product.nameJa, brand: { "@type": "Brand", name: product.brandEn }, category: product.familyEn, description, url: canonical, image: String(product.img || "").startsWith("/") ? `${SITE}${product.img}` : product.img };
  const breadcrumbLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Sillage", item: `${SITE}/en/` },
    { "@type": "ListItem", position: 2, name: "Fragrances", item: `${SITE}/en/fragrances/` },
    { "@type": "ListItem", position: 3, name: product.nameEn, item: canonical },
  ] };
  return `<!DOCTYPE html><html lang="en"><head>
${head({ title: `${product.nameEn} by ${product.brandEn} | Sillage`, description, canonical, product })}
<script type="application/ld+json">${json(productLd)}</script><script type="application/ld+json">${json(breadcrumbLd)}</script>
${sharedCss}<style>.crumb{padding:28px 0;color:#8c8c92;font-size:12px}.hero{display:grid;grid-template-columns:minmax(280px,.88fr) 1.12fr;gap:clamp(34px,6vw,76px);align-items:center;padding:20px 0 72px}.visual{background:#f2f0eb;min-height:430px;display:grid;place-items:center}.visual img{width:88%;height:400px;object-fit:contain}.brand-name{font:italic 19px "Cormorant",serif;color:#c9b558}.hero h1{font:500 clamp(38px,6vw,66px)/1.08 "Bodoni Moda",serif;margin:8px 0}.ja-product{color:#9a9aa1;margin:0 0 24px}.facts,.prices{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:#2c2d31;border:1px solid #2c2d31}.facts div,.prices div{background:#15161b;padding:15px}.facts dt,.prices dt{font-size:11px;color:#8c8c92;text-transform:uppercase;letter-spacing:.8px}.facts dd,.prices dd{margin:4px 0 0}.notes{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:34px}.note{border-top:2px solid #c9b558;padding-top:18px}.note h3{font:500 22px "Bodoni Moda",serif;margin:0}.note p{color:#b6b3ab}.purchase{margin-top:28px}.purchase .button{margin:0 8px 8px 0}.ad{color:#8c8c92;font-size:12px}.source-list{padding-left:20px}.source-list li{margin:10px 0}.source-list small,.prices small{display:block;color:#77787e}@media(max-width:760px){.hero{grid-template-columns:1fr}.visual{min-height:300px}.visual img{height:300px}.facts,.prices{grid-template-columns:1fr}.notes{grid-template-columns:1fr}.purchase .button{width:100%;margin-right:0}}</style>
</head><body data-page-type="item" data-item-slug="${esc(product.slug)}" data-item-name="${esc(product.nameEn)}" data-item-brand="${esc(product.brandEn)}" data-item-family="${esc(product.family)}" data-price-tier="${esc(product.priceTier || "")}"><script defer src="/assets/analytics.js"></script>
<header class="topbar"><a class="logo" href="/en/">Sillage</a><a class="language" href="${product.routeJa}" hreflang="ja" lang="ja">日本語の商品ページ</a></header><main class="wrap"><nav class="crumb" aria-label="Breadcrumb"><a href="/en/">Sillage</a> / <a href="/en/fragrances/">Fragrances</a> / ${esc(product.nameEn)}</nav>
<section class="hero"><div class="visual"><img src="${esc(product.img || `/img/products/${product.slug}.png`)}" alt="${esc(product.brandEn)} ${esc(product.nameEn)} bottle" width="640" height="640" fetchpriority="high"></div><div><p class="brand-name"><a href="${esc(brandUrlJa)}" hreflang="ja">${esc(product.brandEn)}</a></p><h1>${esc(product.nameEn)}</h1><p class="ja-product" lang="ja">Japanese name: ${esc(product.nameJa)}</p><dl class="facts"><div><dt>Scent family</dt><dd>${esc(product.familyEn)}</dd></div>${product.concentrationEn ? `<div><dt>Concentration</dt><dd>${esc(product.concentrationEn)}</dd></div>` : ""}${product.sizes?.length ? `<div><dt>Sizes listed</dt><dd>${product.sizes.map((size) => `${size.volumeMl} mL`).join(" / ")}</dd></div>` : ""}<div><dt>Gender listing</dt><dd>${esc(product.genderEn)}</dd></div>${product.scenesEn.length ? `<div><dt>Occasions</dt><dd>${esc(product.scenesEn.join(" / "))}</dd></div>` : ""}${product.seasonsEn.length ? `<div><dt>Seasons</dt><dd>${esc(product.seasonsEn.join(" / "))}</dd></div>` : ""}</dl>${purchase ? `<div class="purchase"><p class="ad">${product.japanAvailability.purchaseLinks.rakuten ? "PR: Rakuten links are affiliate links. " : ""}Prices and availability can change.</p>${purchase}</div>` : ""}</div></section>
<section class="section"><p class="eyebrow">Scent over time</p><h2>Fragrance notes</h2><div class="notes"><div class="note"><h3>Top</h3><p>${esc(product.notes.top)}</p></div><div class="note"><h3>Middle</h3><p>${esc(product.notes.mid)}</p></div><div class="note"><h3>Last</h3><p>${esc(product.notes.last)}</p></div></div><p class="lede">Note stages describe the listed composition, not measured wear time. How a fragrance develops varies by skin, climate and application.</p></section>
${officialPrices || retail ? `<section class="section"><p class="eyebrow">Japan market</p><h2>Price information in Japan</h2><p class="lede">Official reference prices and retailer prices are kept separate. They may refer to different sizes and dates.</p><dl class="prices">${officialPrices}${retail}</dl></section>` : ""}
${sourceList ? `<section class="section"><p class="eyebrow">References</p><h2>Sources</h2><ul class="source-list">${sourceList}</ul></section>` : ""}
</main><footer><a href="/en/fragrances/">Back to fragrances</a><br>Information is based on the same product record used by the Japanese Sillage site.</footer></body></html>`;
}

rmSync("public/en", { recursive: true, force: true });
write("public/en/index.html", renderHome());
write("public/en/fragrances/index.html", renderList());
for (const product of localizedProducts) write(join("public", product.routeEn, "index.html"), renderProduct(product));

mkdirSync(publicI18n, { recursive: true });
write(`${publicI18n}/translations.json`, JSON.stringify(translations));
write(`${publicI18n}/products.en.json`, JSON.stringify({ schemaVersion: 1, products: englishProducts }));
write(`${publicI18n}/brands.en.json`, readFileSync("data/i18n/brands.en.json", "utf8"));

console.log(`Generated English foundation: home, catalogue and ${localizedProducts.length} pilot product pages.`);
