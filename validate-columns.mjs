import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://sillage.asutelu.com";
const COLUMN_DIR = join("public", "columns");
const files = readdirSync(COLUMN_DIR).filter((file) => file.endsWith(".html")).sort();
const errors = [];
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
const targetSlugs = [
  "how-many-sprays",
  "where-to-apply-perfume",
  "too-much-perfume",
  "why-cant-smell-own-perfume",
  "make-perfume-last-longer",
  "perfume-on-clothes",
  "how-to-test-perfume",
  "perfume-bottle-size",
  "perfume-expiration",
  "perfume-storage",
  "perfume-gift-guide",
  "perfume-decanting",
];

if (files.length !== 33) errors.push(`記事数が33件ではありません: ${files.length}`);
for (const forbidden of ["why-cant-smell-perfume.html", "perfume-atomizer.html"]) {
  if (existsSync(join(COLUMN_DIR, forbidden))) errors.push(`重複する検索意図の記事が生成されています: ${forbidden}`);
}

function duplicate(map, value, slug, label) {
  if (!value) {
    errors.push(`${slug}: ${label}欠損`);
    return;
  }
  if (map.has(value)) errors.push(`${slug}: ${label}重複 (${map.get(value)})`);
  map.set(value, slug);
}

function internalExists(href) {
  const path = href.split(/[?#]/)[0];
  if (path === "/") return existsSync(join("public", "index.html"));
  if (path.startsWith("/columns/")) return existsSync(join(COLUMN_DIR, `${path.slice("/columns/".length)}.html`));
  if (path.startsWith("/items/")) return existsSync(join("public", "items", `${path.slice("/items/".length)}.html`));
  return existsSync(join("public", path.replace(/^\//, "")));
}

for (const file of files) {
  const slug = file.replace(/\.html$/, "");
  const html = readFileSync(join(COLUMN_DIR, file), "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || "";
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] || "";
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1] || "";
  duplicate(titles, title, slug, "title");
  duplicate(descriptions, description, slug, "description");
  duplicate(canonicals, canonical, slug, "canonical");
  if (canonical !== `${SITE}/columns/${slug}`) errors.push(`${slug}: canonical不一致`);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) errors.push(`${slug}: H1数が1ではありません`);
  for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(block[1]);
    } catch {
      errors.push(`${slug}: JSON-LDの構文が不正です`);
    }
  }
  for (const marker of [
    `"@type":"Article"`,
    `"@type":"BreadcrumbList"`,
    `"@type":"FAQPage"`,
    `著者：Sillage編集部`,
    `公開日：`,
    `更新日：`,
    `class="category-link"`,
    `情報源と編集区分`,
    `編集方針・更新ポリシー`,
    `G-60BQRQWB5M`,
    `UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q`,
    `<caption>`,
  ]) {
    if (!html.includes(marker)) errors.push(`${slug}: 必須要素欠損 ${marker}`);
  }
  const relatedSection = html.match(/<section class="other">[\s\S]*?<\/section>/)?.[0] || "";
  const productSection = html.match(/<section class="featured">[\s\S]*?<\/section>/)?.[0] || "";
  const relatedCount = (relatedSection.match(/href="\/columns\//g) || []).length;
  const productCount = (productSection.match(/href="\/items\//g) || []).length;
  if (relatedCount < 3 || relatedCount > 5) errors.push(`${slug}: 関連記事数 ${relatedCount}`);
  if (productCount > 5) errors.push(`${slug}: 関連商品が5件を超えています`);
  if (targetSlugs.includes(slug)) {
    const faqCount = (html.match(/<section class="faq">[\s\S]*?<\/section>/)?.[0].match(/<details>/g) || []).length;
    if (faqCount < 3 || faqCount > 5) errors.push(`${slug}: FAQ数 ${faqCount}`);
    if (productCount < 3) errors.push(`${slug}: 関連商品不足 ${productCount}`);
    if (!html.includes('href="/#fragrance-wheel"') && !html.includes('href="/#find-fragrances"')) {
      errors.push(`${slug}: 香調またはシーン一覧へのリンクがありません`);
    }
  }
  const hrefs = [...html.matchAll(/href="(\/[^"#]+(?:#[^"]*)?)"/g)].map((match) => match[1]);
  for (const href of new Set(hrefs)) {
    if (!internalExists(href)) errors.push(`${slug}: 内部リンク切れ ${href}`);
  }
}

const guides = readFileSync(join("public", "guides.html"), "utf8");
for (const category of ["beginner", "how-to", "trouble", "buying", "care", "scene", "knowledge", "comparison"]) {
  if (!guides.includes(`id="category-${category}"`)) errors.push(`一覧カテゴリ欠損: ${category}`);
}
for (const file of files) {
  const slug = file.replace(/\.html$/, "");
  if (!guides.includes(`/columns/${slug}`)) errors.push(`一覧に記事がありません: ${slug}`);
}

const home = readFileSync(join("public", "index.html"), "utf8");
const homeBlock = home.match(/<!-- generated:home-columns:start -->([\s\S]*?)<!-- generated:home-columns:end -->/)?.[1] || "";
const homeLinks = [...homeBlock.matchAll(/href="\/columns\/([^"]+)"/g)].map((match) => match[1]);
if (homeLinks.length !== 9 || new Set(homeLinks).size !== 9) errors.push(`トップ記事数または重複が不正: ${homeLinks.length}/${new Set(homeLinks).size}`);
if (!homeBlock.includes('href="/guides.html"')) errors.push("トップからコラム一覧へのリンクがありません");

const sitemap = readFileSync(join("public", "sitemap.xml"), "utf8");
for (const file of files) {
  const slug = file.replace(/\.html$/, "");
  if (!sitemap.includes(`<loc>${SITE}/columns/${slug}</loc>`)) errors.push(`sitemap欠損: ${slug}`);
}

const itemFiles = readdirSync(join("public", "items")).filter((file) => file.endsWith(".html"));
for (const file of itemFiles) {
  const html = readFileSync(join("public", "items", file), "utf8");
  for (const slug of ["how-many-sprays", "where-to-apply-perfume"]) {
    if (!html.includes(`/columns/${slug}`)) errors.push(`${file}: 商品からコラムへのリンク欠損 ${slug}`);
  }
}

// 存在しないURLの404応答は、静的404ファイルではなくWorker経由で
// validate-site-routes.mjs が確認する。

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Columns valid: ${files.length} articles, 8 categories, 9 homepage picks, ${itemFiles.length} product backlinks`);
