// 生成済みのブランド・記事・商品ページへ共通SEO要素を安全に追記する。
// 既存コンテンツや計測タグは削除せず、何度実行しても同じ結果になる。
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const PUBLIC = "public";
const SITE = "https://sillage.asutelu.com";
const GA4_ID = "G-60BQRQWB5M";
const ARTICLE_PUBLISHED = "2026-07-07T15:18:04+09:00";
const ARTICLE_MODIFIED = "2026-07-16T00:00:00+09:00";

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

for (const path of files.filter((p) => p.includes(`${join(PUBLIC, "items")}`))) {
  const html = readFileSync(path, "utf8");
  const productMatch = jsonLdBlocks(html).find((m) => {
    try { return JSON.parse(m[1])["@type"] === "Product"; } catch { return false; }
  });
  if (!productMatch) continue;
  const product = JSON.parse(productMatch[1]);
  itemMap.set(`${product.brand?.name}\u0000${product.name}`, product.url.replace(SITE, ""));
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
      html = html.replace(/<h3>([^<]+)<\/h3>/g, (full, name) => {
        const href = itemMap.get(`${brand}\u0000${name}`);
        return href ? `<h3><a href="${href}">${name}</a></h3>` : full;
      });
      if (!html.includes('.p-item h3 a{')) {
        html = html.replace('.p-item h3{', '.p-item h3 a{color:inherit;text-decoration:none}.p-item h3 a:hover{text-decoration:underline}.p-item h3{');
      }
    }
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
    }
  }

  if (rel.startsWith("columns/")) {
    html = replaceJsonLd(html, (data) => data?.["@type"] === "Article", (data) => ({
      ...data,
      datePublished: data.datePublished || ARTICLE_PUBLISHED,
      dateModified: ARTICLE_MODIFIED,
    }));
  }

  if (html !== before) {
    writeFileSync(path, html);
    changed++;
  }
}

console.log(`Enhanced ${changed} static HTML pages`);
