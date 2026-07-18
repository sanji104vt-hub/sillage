// 生成済みのブランド・記事・商品ページへ共通SEO要素を安全に追記する。
// 既存コンテンツや計測タグは削除せず、何度実行しても同じ結果になる。
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const PUBLIC = "public";
const SITE = "https://sillage.asutelu.com";
const GA4_ID = "G-60BQRQWB5M";
const ARTICLE_PUBLISHED = "2026-07-07T15:18:04+09:00";
const ARTICLE_MODIFIED = "2026-07-16T22:00:00+09:00";

const SHARE_CSS = `<style data-sillage-share>
.share-tools{margin-top:34px;padding-top:24px;border-top:1px solid #2c2d31}
.share-tools p{font-family:"Cormorant",serif;font-style:italic;font-size:14px;color:#8c8c92;margin-bottom:12px}
.share-actions-social{display:flex;flex-wrap:wrap;gap:9px}
.share-actions-social a,.share-actions-social button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:8px 17px;border:1px solid #34353a;border-radius:999px;background:transparent;color:#e9e7e3;text-decoration:none;font:500 12px/1.4 "Zen Kaku Gothic New",sans-serif;cursor:pointer}
.share-actions-social a:hover,.share-actions-social button:hover{border-color:#c4c6cc}
.featured-products{margin-top:34px;border-top:1px solid #2c2d31;padding-top:24px}
.featured-products h2{font-family:"Cormorant",serif;font-style:italic;font-weight:500;font-size:18px;color:#aeb0b6;letter-spacing:.5px;margin-bottom:14px}
.featured-products a{display:block;color:#cfcdca;text-decoration:none;font-size:13.5px;padding:10px 0;border-bottom:1px solid #1d1e21}
.featured-products a:hover{color:#fff}
</style>`;

function addShareTools(html, title, canonical, marker) {
  if (!title || !canonical || html.includes('class="share-tools"')) return html;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(canonical)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(canonical)}`;
  const block = `<section class="share-tools" aria-label="このページを共有">
    <p>share ／ このページが役立ったら共有</p>
    <div class="share-actions-social"><a href="${xUrl}" target="_blank" rel="noopener">Xで共有</a><a href="${lineUrl}" target="_blank" rel="noopener">LINEで送る</a><button type="button" onclick="shareSillage(this)">共有・リンクコピー</button></div>
  </section>`;
  html = html.replace("</head>", `${SHARE_CSS}\n</head>`);
  html = html.replace(marker, `${block}\n  ${marker}`);
  return html.replace("</body>", `<script>async function shareSillage(button){if(navigator.share){try{await navigator.share({title:document.title,url:location.href});return}catch(error){if(error&&error.name==='AbortError')return}}if(navigator.clipboard){await navigator.clipboard.writeText(location.href);button.textContent='コピーしました'}}</script>\n</body>`);
}

const GA4 = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA4_ID}');
</script>`;

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith(".html") ? [path] : [];
  });
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
}

function replaceJsonLd(html, predicate, update) {
  for (const match of jsonLdBlocks(html)) {
    let data;
    try { data = JSON.parse(match[1]); } catch { continue; }
    if (!predicate(data)) continue;
    const next = `<script type="application/ld+json">${JSON.stringify(update(data))}</script>`;
    return html.slice(0, match.index) + next + html.slice(match.index + match[0].length);
  }
  return html;
}

const files = htmlFiles(PUBLIC);
const itemMap = new Map();
const itemData = [];

for (const path of files.filter((p) => p.includes(`${join(PUBLIC, "items")}`))) {
  const html = readFileSync(path, "utf8");
  const productMatch = jsonLdBlocks(html).find((m) => {
    try { return JSON.parse(m[1])["@type"] === "Product"; } catch { return false; }
  });
  if (!productMatch) continue;
  const product = JSON.parse(productMatch[1]);
  const image = product.image || html.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
  const item = { brand: product.brand?.name, name: product.name, url: product.url.replace(SITE, ""), image };
  itemMap.set(`${item.brand}\u0000${item.name}`, item.url);
  itemData.push(item);
}

const brandMap = new Map();
for (const path of files.filter((p) => relative(PUBLIC, p).replaceAll("\\", "/").startsWith("brand-"))) {
  const html = readFileSync(path, "utf8");
  const collection = jsonLdBlocks(html).map((m) => {
    try { return JSON.parse(m[1]); } catch { return null; }
  }).find((data) => data?.["@type"] === "CollectionPage");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  if (collection?.about?.name && canonical) brandMap.set(collection.about.name, canonical.replace(SITE, ""));
}

let changed = 0;
for (const path of files) {
  const rel = relative(PUBLIC, path).replaceAll("\\", "/");
  if (rel === "index.html") continue;
  let html = readFileSync(path, "utf8");
  const before = html;

  if (!html.includes(GA4_ID)) {
    const marker = html.match(/<meta name="google-site-verification"[^>]*>/)?.[0];
    if (!marker) throw new Error(`GSC tag not found: ${rel}`);
    html = html.replace(marker, `${marker}\n${GA4}`);
  }

  if (rel.startsWith("brand-") && rel.endsWith(".html")) {
    const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1];
    if (canonical && !html.includes('property="og:url"')) {
      html = html.replace('<meta property="og:title"', `<meta property="og:type" content="website"><meta property="og:url" content="${canonical}"><meta property="og:title"`);
    }
    if (title && description && !html.includes('name="twitter:title"')) {
      html = html.replace('<meta name="twitter:card" content="summary_large_image">', `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}">`);
    }

    const collection = jsonLdBlocks(html).map((m) => {
      try { return JSON.parse(m[1]); } catch { return null; }
    }).find((data) => data?.["@type"] === "CollectionPage");
    const brand = collection?.about?.name;
    if (brand) {
      const image = itemData.find((item) => item.brand === brand && item.image)?.image;
      if (image) {
        html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${image}">`);
      } else {
        html = html.replace(/<meta property="og:image" content="[^"]*">/, "");
        html = html.replace('<meta name="twitter:card" content="summary_large_image">', '<meta name="twitter:card" content="summary">');
      }
      html = html.replace(/<h3>([^<]+)<\/h3>/g, (full, name) => {
        const href = itemMap.get(`${brand}\u0000${name}`);
        return href ? `<h3><a href="${href}">${name}</a></h3>` : full;
      });
      if (!html.includes('.p-item h3 a{')) {
        html = html.replace('.p-item h3{', '.p-item h3 a{color:inherit;text-decoration:none}.p-item h3 a:hover{text-decoration:underline}.p-item h3{');
      }
    }
    html = addShareTools(html, title, canonical, "<footer>");
  }

  if (rel.startsWith("items/")) {
    const productBlock = jsonLdBlocks(html).map((m) => {
      try { return JSON.parse(m[1]); } catch { return null; }
    }).find((data) => data?.["@type"] === "Product");
    if (productBlock) {
      const uniqueTitle = `${productBlock.name}（${productBlock.brand?.name}）はどんな匂い？香調・持続・合うシーン｜Sillage`;
      html = html.replace(/<title>.*?<\/title>/s, `<title>${uniqueTitle}</title>`);
      const image = html.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
      if (image && !productBlock.image) {
        html = replaceJsonLd(html, (data) => data?.["@type"] === "Product", (data) => ({ ...data, image }));
      }
      const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
      html = addShareTools(html, uniqueTitle, canonical, '<a class="backhome"');
    }
  }

  if (rel.startsWith("columns/")) {
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
    const relatedBrands = [];
    html = html.replace(/<a href="\/#brands">([^<]+)<\/a>/g, (full, brand) => {
      const href = brandMap.get(brand);
      if (!href) return full;
      relatedBrands.push(brand);
      return `<a href="${href}">${brand}</a>`;
    });
    if (!relatedBrands.length) {
      for (const match of html.matchAll(/<a href="\/brand-[^"]+">([^<]+)<\/a>/g)) relatedBrands.push(match[1]);
    }
    const featured = [...new Set(relatedBrands)].map((brand) => itemData.find((item) => item.brand === brand)).filter(Boolean).slice(0, 4);
    if (featured.length) {
      const links = featured.map((item) => `<a href="${item.url}">${item.brand}「${item.name}」の香りを詳しく見る →</a>`).join("");
      const section = `<div class="featured-products"><h2>関連する香水を詳しく見る</h2>${links}</div>`;
      if (html.includes('class="featured-products"')) {
        html = html.replace(/<div class="featured-products">[\s\S]*?<\/div>/, section);
      } else {
        html = html.replace(/(<div class="related">[\s\S]*?<div class="chips">[\s\S]*?<\/div>\s*<\/div>)/, `$1\n  ${section}`);
      }
    }
    const image = featured.find((item) => item.image)?.image;
    if (image && !html.includes('property="og:image"')) {
      html = html.replace(/(<meta property="og:url" content="[^"]+">)/, `$1\n<meta property="og:image" content="${image}">`);
      html = html.replace('<meta name="twitter:card" content="summary">', '<meta name="twitter:card" content="summary_large_image">');
    }
    html = replaceJsonLd(html, (data) => data?.["@type"] === "Article", (data) => ({
      ...data,
      datePublished: data.datePublished || ARTICLE_PUBLISHED,
      dateModified: ARTICLE_MODIFIED,
      ...(!data.image && image ? { image } : {}),
    }));
    html = addShareTools(html, title, canonical, '<a class="backhome"');
  }

  if (html !== before) {
    writeFileSync(path, html);
    changed++;
  }
}

console.log(`Enhanced ${changed} static HTML pages`);
