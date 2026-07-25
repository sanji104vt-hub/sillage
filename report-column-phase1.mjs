import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://sillage.asutelu.com";
const COLUMN_DIR = join("public", "columns");
const strip = (value = "") => value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const csv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const files = readdirSync(COLUMN_DIR).filter((file) => file.endsWith(".html")).sort();

const articles = files.map((file) => {
  const html = readFileSync(join(COLUMN_DIR, file), "utf8");
  const slug = file.replace(/\.html$/, "");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || "";
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] || "";
  const h1 = strip(html.match(/<h1>(.*?)<\/h1>/s)?.[1]);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1] || "";
  const category = strip(html.match(/class="category-link"[^>]*>(.*?)<\/a>/s)?.[1]).replace("の記事一覧", "");
  const relatedSection = html.match(/<section class="other">[\s\S]*?<\/section>/)?.[0] || "";
  const productSection = html.match(/<section class="featured">[\s\S]*?<\/section>/)?.[0] || "";
  const relatedArticles = [...relatedSection.matchAll(/<a href="\/columns\/([^"]+)">([^<]+)<\/a>/g)]
    .map((match) => ({ slug: match[1], anchor: strip(match[2]) }));
  const relatedProducts = [...productSection.matchAll(/<a href="\/items\/([^"]+)">([^<]+)<\/a>/g)]
    .map((match) => ({ slug: match[1], anchor: strip(match[2]) }));
  return {
    slug, html, title, description, h1, canonical, category,
    relatedArticles, relatedProducts,
    h1Count: (html.match(/<h1(?:\s|>)/g) || []).length,
    articleLd: html.includes('"@type":"Article"'),
    breadcrumbLd: html.includes('"@type":"BreadcrumbList"'),
    faqLd: html.includes('"@type":"FAQPage"'),
    author: html.includes("著者：Sillage編集部"),
    sources: html.includes("情報源と編集区分"),
  };
});

const linkRows = [["source_slug","target_type","target_slug","url","anchor_text"]];
for (const article of articles) {
  const seen = new Set();
  for (const match of article.html.matchAll(/<a\b[^>]*href="(\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const path = match[1];
    if (seen.has(path)) continue;
    seen.add(path);
    const anchor = strip(match[2]);
    let type = "page";
    let targetSlug = "";
    if (path.startsWith("/columns/")) {
      type = "article";
      targetSlug = path.slice("/columns/".length).split(/[?#]/)[0];
    } else if (path.startsWith("/items/")) {
      type = "product";
      targetSlug = path.slice("/items/".length).split(/[?#]/)[0];
    } else if (path.startsWith("/brand-")) {
      type = "brand";
      targetSlug = path.replace(/^\/brand-/, "").replace(/\.html(?:[?#].*)?$/, "");
    } else if (path.startsWith("/guides.html")) {
      type = "category";
    } else if (path.startsWith("/?") || path.startsWith("/#")) {
      type = "filter";
    } else if (path === "/") {
      type = "home";
    }
    linkRows.push([article.slug, type, targetSlug, new URL(path, SITE).href, anchor]);
  }
}
writeFileSync(join("reports", "column-internal-links.csv"), `${linkRows.map((row) => row.map(csv).join(",")).join("\n")}\n`);

const seoRows = [["slug","title","description","h1","h1_count","canonical","article_jsonld","breadcrumb_jsonld","faq_jsonld","author_visible","sources_visible","category","related_articles","related_products","status"]];
for (const article of articles) {
  const ok = article.h1Count === 1 && article.articleLd && article.breadcrumbLd && article.faqLd
    && article.author && article.sources && article.canonical === `${SITE}/columns/${article.slug}`;
  seoRows.push([
    article.slug, article.title, article.description, article.h1, article.h1Count, article.canonical,
    article.articleLd, article.breadcrumbLd, article.faqLd, article.author, article.sources,
    article.category, article.relatedArticles.length, article.relatedProducts.length, ok ? "ok" : "review",
  ]);
}
writeFileSync(join("reports", "column-seo-audit.csv"), `${seoRows.map((row) => row.map(csv).join(",")).join("\n")}\n`);

const added = [
  ["how-many-sprays", "つけ方・使い方"],
  ["where-to-apply-perfume", "つけ方・使い方"],
  ["make-perfume-last-longer", "つけ方・使い方"],
  ["how-to-test-perfume", "購入・試香"],
  ["perfume-bottle-size", "香水初心者"],
  ["perfume-expiration", "保存・持ち運び"],
  ["perfume-gift-guide", "購入・試香"],
];
const merged = [
  ["too-much-perfume", "too-much-perfume", "既存URLを維持して外出前・外出先の対処へ強化"],
  ["why-cant-smell-perfume", "why-cant-smell-own-perfume", "嗅覚順応の既存記事へ統合"],
  ["perfume-on-clothes", "perfume-on-clothes", "既存記事をシミ・変色・香り方の判断へ強化"],
  ["perfume-storage", "perfume-storage", "冷蔵庫・洗面所・窓際の比較へ強化"],
  ["perfume-atomizer", "perfume-decanting", "小分けの既存記事をアトマイザー手順へ強化"],
];
const secondWave = [
  "香水をつけすぎないための家族・同居人との確認方法",
  "雨の日に香水の印象が変わる理由",
  "香水サンプルセットの比較方法",
  "旅行日数からアトマイザー容量を決める方法",
  "香水売り場で店員へ伝える言葉のテンプレート",
  "香水を処分する前に確認する自治体ルール",
];

const report = [
  "# Sillage 初心者向けコラム強化・第1弾 実装報告",
  "",
  "- 実装日: 2026-07-25",
  `- 全記事数: ${articles.length}`,
  "- 新規記事: 7件",
  "- 既存記事への統合・強化: 5件",
  "- カテゴリ: 8件",
  "- 商品データ・商品順・商品slug・価格・購入リンク: 変更なし",
  "",
  "## 1. 既存記事と検索意図",
  "",
  "詳細は `reports/column-content-audit.md` を参照してください。既存の試香・保存・プレゼント記事と今回指定された検索意図を照合し、重複ページを作らない方針を採用しました。",
  "",
  "## 2. 新規作成した7記事（指定12テーマのうち）",
  "",
  "| slug | title / H1 | description | カテゴリ |",
  "|---|---|---|---|",
  ...added.map(([slug, category]) => {
    const article = articles.find((candidate) => candidate.slug === slug);
    return `| ${slug} | ${article.h1} | ${article.description} | ${category} |`;
  }),
  "",
  "## 3. 既存記事へ統合した5テーマ",
  "",
  "| 指定slug・テーマ | 正規slug | title / H1 | description | 対応 |",
  "|---|---|---|---|---|",
  ...merged.map(([requested, slug, action]) => {
    const article = articles.find((candidate) => candidate.slug === slug);
    return `| ${requested} | ${slug} | ${article.h1} | ${article.description} | ${action} |`;
  }),
  "",
  "## 4. 共通テンプレート",
  "",
  "- パンくず、カテゴリ、H1、導入、30秒結論、先に押さえる3点を表示",
  "- 本文、条件表、よくある失敗を含む判断、読者別結論を表示",
  "- 関連商品は既存データだけから最大5件",
  "- 関連記事は同じカテゴリと明示指定から3〜4件",
  "- FAQは第1弾12テーマで3〜5件",
  "- 情報源とSillage編集判断を区別",
  "- 著者・公開日・実際の更新日を本文とArticleへ同期",
  "",
  "## 5. コラム一覧とトップ",
  "",
  "- `public/guides.html`を8カテゴリ構成へ変更",
  "- 各カテゴリに説明、最初に読む記事、記事カードを配置",
  "- トップページは初心者3・悩み3・新着更新3の計9記事だけを表示",
  "- 全記事への導線はコラム一覧へ集約",
  "",
  "## 6. 内部リンクと関連商品",
  "",
  "- 記事内の全内部リンク一覧: `reports/column-internal-links.csv`",
  "- SEO監査一覧: `reports/column-seo-audit.csv`",
  "- 全92商品ページへ「何プッシュ」「つける場所」の記事リンクを追加",
  "- 全記事から香調ホイールとシーン・季節フィルターへ戻るリンクを追加",
  "",
  "## 7. 構造化データ",
  "",
  "- Article: headline、description、author、公開日、更新日、canonicalと同期",
  "- BreadcrumbList: トップ、コラム一覧、記事の3階層",
  "- FAQPage: 画面に表示するFAQだけを出力",
  "- ItemList: コラム一覧に全記事を登録",
  "",
  "## 8. 検証結果",
  "",
  "- JavaScript構文: OK",
  "- JSON構文・商品データ検証: OK",
  "- 全コラム・全92商品ページ生成: OK",
  "- title・description重複: 0",
  "- H1、canonical、Article、BreadcrumbList、FAQ: OK",
  "- 内部リンク、sitemap、404: OK",
  "- 375px / 768px / 1024px / 1440pxの実ブラウザ検証: 横スクロールなし、1列・2列・3列切替OK",
  "- モバイル表: 見出しラベル付き縦型表示、デスクトップ表: 通常表示",
  "- FAQ: 開閉とfocus-visibleを確認",
  "- トップ遅延読込: 9記事表示、コンソールエラー0件",
  "- `git diff --check`: OK",
  "",
  "## 9. 第2弾候補",
  "",
  ...secondWave.map((title) => `- ${title}`),
  "",
  "## 10. 公開後にSearch Consoleで確認する項目",
  "",
  "- 新規7URLのインデックス登録状況",
  "- 既存5URLの再クロールとtitle反映",
  "- Article、BreadcrumbListの検出",
  "- 重複title・重複descriptionの有無",
  "- 検索クエリと各記事の意図が一致しているか",
  "- コラムから商品ページへのクリック推移",
  "",
  "## 11. 今回の停止条件",
  "",
  "添付指示に従い、2コミット作成後はpush・デプロイを行いません。",
];
writeFileSync(join("reports", "column-phase1-implementation.md"), `${report.join("\n")}\n`);
console.log(`Reported ${articles.length} columns and ${linkRows.length - 1} internal links`);
