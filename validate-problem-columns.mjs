import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PROBLEM_ARTICLES } from "./data/problem-columns.mjs";

const SITE = "https://sillage.asutelu.com";
const errors = [];
const slugs = new Set();
const fragranceData = JSON.parse(readFileSync(join("data", "fragrances.json"), "utf8")).fragrances;
const fragranceSlugs = new Set(fragranceData.map((item) => item.slug));

if (PROBLEM_ARTICLES.length !== 12) errors.push(`記事数が12件ではありません: ${PROBLEM_ARTICLES.length}`);

for (const article of PROBLEM_ARTICLES) {
  if (slugs.has(article.slug)) errors.push(`記事slug重複: ${article.slug}`);
  slugs.add(article.slug);
  if (article.sections.length < 3) errors.push(`本文セクション不足: ${article.slug}`);
  if (article.visual?.steps?.length < 4 || article.visual?.steps?.length > 5) errors.push(`図解ステップ数が範囲外: ${article.slug}`);
  if (article.featured.length < 3 || article.featured.length > 5) errors.push(`関連商品数が範囲外: ${article.slug}`);
  for (const slug of article.featured) {
    if (!fragranceSlugs.has(slug)) errors.push(`存在しない関連商品: ${article.slug} -> ${slug}`);
  }

  const file = join("public", "columns", `${article.slug}.html`);
  if (!existsSync(file)) {
    errors.push(`生成ページなし: ${file}`);
    continue;
  }
  const html = readFileSync(file, "utf8");
  const checks = [
    [`canonical`, `<link rel="canonical" href="${SITE}/columns/${article.slug}">`],
    [`GA4`, `G-60BQRQWB5M`],
    [`Search Console`, `UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q`],
    [`Article JSON-LD`, `"@type":"Article"`],
    [`FAQ JSON-LD`, `"@type":"FAQPage"`],
    [`図解`, `ACTION MAP`],
  ];
  for (const [label, value] of checks) {
    if (!html.includes(value)) errors.push(`${label}欠損: ${article.slug}`);
  }
  for (const slug of article.featured) {
    if (!html.includes(`/items/${slug}`)) errors.push(`関連商品リンク欠損: ${article.slug} -> ${slug}`);
  }
}

const guidePath = join("public", "guides.html");
if (!existsSync(guidePath)) {
  errors.push("guides.htmlがありません");
} else {
  const guideHtml = readFileSync(guidePath, "utf8");
  for (const article of PROBLEM_ARTICLES) {
    if (!guideHtml.includes(`/columns/${article.slug}`)) errors.push(`一覧リンク欠損: ${article.slug}`);
  }
  if (!guideHtml.includes(`"numberOfItems":12`)) errors.push("一覧のItemList件数が不正です");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${PROBLEM_ARTICLES.length} problem guides and ${new Set(PROBLEM_ARTICLES.flatMap((article) => article.featured)).size} related fragrances`);
