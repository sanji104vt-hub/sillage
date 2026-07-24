// public配下のcanonical URLを唯一の正として sitemap.xml / robots.txt を生成する。
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const PUBLIC = "public";
const SITE = "https://sillage.asutelu.com";

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(path) : entry.name.endsWith(".html") ? [path] : [];
  });
}

const rows = htmlFiles(PUBLIC).filter((path) => !path.split(/[\\/]/).includes("partials")).map((path) => {
  const html = readFileSync(path, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  if (!canonical) throw new Error(`canonical missing: ${relative(PUBLIC, path)}`);
  if (!canonical.startsWith(`${SITE}/`)) throw new Error(`unexpected canonical host: ${canonical}`);
  return { path: relative(PUBLIC, path).replaceAll("\\", "/"), canonical };
});

const unique = new Set(rows.map((row) => row.canonical));
if (unique.size !== rows.length) throw new Error(`duplicate canonical: ${rows.length - unique.size}`);

const sitemapPath = join(PUBLIC, "sitemap.xml");
const previous = readFileSync(sitemapPath, "utf8");
const previousOrder = [...previous.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const previousRank = new Map(previousOrder.map((url, index) => [url, index]));
const rank = (path) => path === "index.html" ? 0 : path.startsWith("columns/") ? 1 : path.startsWith("brand-") ? 2 : 3;
rows.sort((a, b) => {
  const ai = previousRank.get(a.canonical);
  const bi = previousRank.get(b.canonical);
  if (ai != null && bi != null) return ai - bi;
  if (ai != null) return -1;
  if (bi != null) return 1;
  return rank(a.path) - rank(b.path) || a.canonical.localeCompare(b.canonical, "en");
});

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const urls = rows.map(({ path, canonical }) => {
  const isHome = path === "index.html";
  const isColumn = path.startsWith("columns/");
  const changefreq = isHome || isColumn ? "weekly" : "monthly";
  const priority = isHome ? "1.0" : isColumn ? "0.8" : path.startsWith("brand-") ? "0.6" : "0.5";
  return `  <url><loc>${escapeXml(canonical)}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}).join("\n");
writeFileSync(sitemapPath, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(PUBLIC, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Generated sitemap.xml and robots.txt for ${rows.length} canonical URLs`);
