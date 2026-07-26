import { readFileSync, writeFileSync } from "node:fs";
import { loadSiteCopy } from "./lib/site-copy.mjs";

const copy = loadSiteCopy();
const indexPath = "public/index.html";

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
      if (value["@type"] === "WebSite") {
        value.name = copy.siteName;
        value.alternateName = copy.shortName;
        value.url = copy.siteUrl;
        value.description = copy.description;
      } else if (value["@type"] === "Organization") {
        value.name = copy.shortName;
        value.alternateName = copy.siteName;
        value.url = copy.siteUrl;
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
index = replaceRequired(index, /<meta property="og:site_name" content="[^"]*">/, `<meta property="og:site_name" content="${copy.siteName}">`, "og:site_name");
index = replaceRequired(index, /<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${copy.title}">`, "twitter:title");
index = replaceRequired(index, /<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${copy.description}">`, "twitter:description");
index = replaceRequired(index, /<span class="h1-sub">[\s\S]*?<\/span>/, `<span class="h1-sub">${copy.heroProductLine}</span>`, "hero product line");
index = replaceRequired(
  index,
  /(<section class="hero">[\s\S]*?<div class="hero-copy">[\s\S]*?<\/h1>\s*)<p>[\s\S]*?<\/p>/,
  `$1<p>${copy.heroDescription}</p>`,
  "hero description",
);
index = replaceRequired(index, /<p class="copy">[\s\S]*?<\/p>/, `<p class="copy">${copy.footerCopyright}</p>`, "homepage footer");
index = syncJsonLd(index);

if (/<link rel="manifest"[^>]*>/.test(index)) {
  index = index.replace(/<link rel="manifest"[^>]*>/, '<link rel="manifest" href="/manifest.webmanifest">');
} else {
  index = index.replace(
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="manifest" href="/manifest.webmanifest">',
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
    {
      src: "/favicon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any",
    },
  ],
};
writeFileSync("public/manifest.webmanifest", `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Synchronized site copy: ${copy.title}`);
