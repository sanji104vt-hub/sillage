import { readFileSync, writeFileSync } from "node:fs";
import { loadSiteCopy } from "./lib/site-copy.mjs";

const copy = loadSiteCopy();
const indexPath = "public/index.html";

// 掲載件数はデータの実数を唯一の真値とする。
// 2026-08-05: 商品追加のたびに index.html / about.html / site-copy.json の
// 件数を手で書き換えていたため、Lacoste 追加時に #resultsSummary だけ
// 95 のまま取り残された。以後は毎ビルドでここから流し込む。
const FRAGRANCE_COUNT = JSON.parse(readFileSync("data/fragrances.json", "utf8")).fragrances.length;
// site-copy.json の文言はテンプレートとして使い、件数トークンを実数へ差し替える。
// 古い件数をテンプレート内へ固定しないことで、管理値の取り残しを防ぐ。
const heroProductLine = copy.heroProductLine.replace("{fragranceCount}", String(FRAGRANCE_COUNT));

function replaceRequired(source, pattern, replacement, label) {
  if (!pattern.test(source)) throw new Error(`Missing ${label}.`);
  return source.replace(pattern, replacement);
}

function syncJsonLd(html) {
  return html.replace(
    /<script(?: id="([^"]+)")? type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (script, id, json) => {
      let value;
      try {
        value = JSON.parse(json);
      } catch {
        return script;
      }
      // Google への「名乗り」は英字表記に統一し、読み仮名を alternateName に置く。
      // 画面表示（title / h1）は「Sillage（シヤージュ）」のまま維持する。
      if (value["@type"] === "WebSite") {
        value.name = copy.shortName;
        value.alternateName = copy.readingName;
        value.url = copy.siteUrl;
        value.description = copy.description;
      } else if (value["@type"] === "Organization") {
        value.name = copy.shortName;
        value.alternateName = copy.readingName;
        value.url = copy.siteUrl;
        value.logo = `${copy.siteUrl.replace(/\/$/, "")}/ogp-default.png`;
        value.description = copy.description;
      } else if (value["@type"] === "CollectionPage") {
        value.name = `${copy.shortName} 掲載香水一覧`;
        value.url = copy.siteUrl;
        value.description = copy.description;
      }
      const idAttribute = id ? ` id="${id}"` : "";
      return `<script${idAttribute} type="application/ld+json">${JSON.stringify(value)}</script>`;
    },
  );
}

let index = readFileSync(indexPath, "utf8");
index = replaceRequired(index, /<title>.*?<\/title>/s, `<title>${copy.title}</title>`, "homepage title");
index = replaceRequired(
  index,
  /<meta name="description" content="[^"]*">/,
  `<meta name="description" content="${copy.description}">`,
  "homepage description",
);
index = replaceRequired(index, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${copy.title}">`, "og:title");
index = replaceRequired(index, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${copy.description}">`, "og:description");
index = replaceRequired(index, /<meta property="og:site_name" content="[^"]*">/, `<meta property="og:site_name" content="${copy.shortName}">`, "og:site_name");
index = replaceRequired(index, /<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${copy.title}">`, "twitter:title");
index = replaceRequired(index, /<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${copy.description}">`, "twitter:description");
index = replaceRequired(index, /<span class="h1-sub">[\s\S]*?<\/span>/, `<span class="h1-sub">${heroProductLine}</span>`, "hero product line");
// 掲載件数の表示は4箇所。すべて実数から流し込み、手作業での書き換えを不要にする。
index = replaceRequired(
  index,
  /(<div class="section-head" id="find-fragrances">[\s\S]*?<p class="section-copy">)全\d+件から/,
  `$1全${FRAGRANCE_COUNT}件から`,
  "find-fragrances count",
);
index = replaceRequired(
  index,
  /(<span class="count" id="resultsSummary"[^>]*>)全<b>\d+<\/b>件の香水/,
  `$1全<b>${FRAGRANCE_COUNT}</b>件の香水`,
  "resultsSummary count",
);
index = replaceRequired(
  index,
  /(<div class="big">)掲載香水は全\d+件です/,
  `$1掲載香水は全${FRAGRANCE_COUNT}件です`,
  "noscript count",
);
index = replaceRequired(
  index,
  /(<section class="hero">[\s\S]*?<div class="hero-copy">[\s\S]*?<\/h1>\s*)<p>[\s\S]*?<\/p>/,
  `$1<p>${copy.heroDescription}</p>`,
  "hero description",
);
index = replaceRequired(index, /<p class="copy">[\s\S]*?<\/p>/, `<p class="copy">${copy.footerCopyright}</p>`, "homepage footer");
index = syncJsonLd(index);

// manifest は PWA 用 PNG アイコンを持つ site.webmanifest に統一する。
if (/<link rel="manifest"[^>]*>/.test(index)) {
  index = index.replace(/<link rel="manifest"[^>]*>/, '<link rel="manifest" href="/site.webmanifest">');
} else {
  index = index.replace(
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg">',
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n<link rel="manifest" href="/site.webmanifest">',
  );
}
if (!/<meta name="theme-color"/.test(index)) {
  index = index.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<meta name="theme-color" content="#0d0e10">',
  );
}
writeFileSync(indexPath, index, "utf8");

for (const path of ["public/about.html", "public/privacy.html", "public/contact.html"]) {
  let html = readFileSync(path, "utf8");
  html = replaceRequired(
    html,
    /<p style="margin-top:14px">© 2026 Sillage — [\s\S]*?<\/p>/,
    `<p style="margin-top:14px">${copy.footerCopyright}</p>`,
    `${path} footer`,
  );
  // og:site_name も英字表記に統一する（title / h1 の表示は変えない）
  html = replaceRequired(
    html,
    /<meta property="og:site_name" content="[^"]*">/,
    `<meta property="og:site_name" content="${copy.shortName}">`,
    `${path} og:site_name`,
  );
  // about.html のサイト説明にも掲載件数があるため実数へ追従させる
  if (/香水\d+本/.test(html)) {
    html = html.replace(/香水\d+本/g, `香水${FRAGRANCE_COUNT}本`);
  }
  writeFileSync(path, html, "utf8");
}

const manifest = {
  name: copy.title,
  short_name: copy.shortName,
  description: copy.description,
  lang: "ja",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#0d0e10",
  theme_color: "#0d0e10",
  icons: [
    { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  ],
};
writeFileSync("public/site.webmanifest", `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Synchronized site copy: ${copy.title}`);
