import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const COLUMN_DIR = join("public", "columns");
const files = readdirSync(COLUMN_DIR).filter((file) => file.endsWith(".html")).sort();
const strip = (value = "") => value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const rows = files.map((file) => {
  const html = readFileSync(join(COLUMN_DIR, file), "utf8");
  const slug = file.replace(/\.html$/, "");
  const title = strip(html.match(/<title>(.*?)<\/title>/s)?.[1]).replace(/｜Sillage.*$/, "");
  const h1 = strip(html.match(/<h1>(.*?)<\/h1>/s)?.[1]);
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] || "";
  const headings = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gs)].map((match) => strip(match[1]));
  const category = strip(html.match(/class="category-link"[^>]*>(.*?)<\/a>/s)?.[1]);
  const relatedProducts = (html.match(/href="\/items\//g) || []).length;
  const relatedArticles = (html.match(/<section class="other">[\s\S]*?<\/section>/)?.[0].match(/href="\/columns\//g) || []).length;
  return { slug, title, h1, description, headings, category, relatedProducts, relatedArticles };
});

const duplicateTopics = [
  ["香水の正しいつけ方", "how-to-wear", "全体の量・場所・タイミングを扱う親記事"],
  ["職場の香水量", "business-fragrance / office-perfume-amount", "business-fragranceを選び方の親、office-perfume-amountを職場の運用詳細として整理"],
  ["店頭試香", "blotter-vs-skin / perfume-store-comparison", "紙と肌の違い、店頭で比較する順番へ検索意図を分離"],
  ["プレゼント", "perfume-gift-mistakes", "失敗例に焦点を限定"],
  ["小分け", "perfume-decanting", "既存URLをアトマイザー手順の正規記事として維持"],
];

const lines = [
  "# Sillage コラム内容監査",
  "",
  `- 監査日: 2026-07-25`,
  `- 監査対象: ${rows.length}記事`,
  "- 生成元: `build-columns.mjs`、`data/problem-columns.mjs`",
  "- 公開形式: 初期HTMLへ本文を含む静的生成",
  "- 構造化データ: Article、BreadcrumbList、FAQPage",
  "- URL形式: `/columns/{slug}`（物理HTMLはWorkerで拡張子なしURLへ統一）",
  "- 一覧生成: `build-columns.mjs`が`public/guides.html`を生成",
  "- sitemap生成: `generate-seo.mjs`がcanonicalを収集",
  "- OGP画像: `lib/ogp-image.mjs`の香調別画像。該当しない記事は`ogp-default.png`",
  "- 著者・日付: 記事データの公開日・更新日をテンプレートで本文とArticleへ同期",
  "",
  "## 既存記事一覧と検索意図",
  "",
  "| slug | title / H1 | カテゴリ | 主な見出し | 関連商品 | 関連記事 |",
  "|---|---|---|---|---:|---:|",
  ...rows.map((row) => `| ${row.slug} | ${row.h1 || row.title} | ${row.category || "未分類"} | ${row.headings.slice(0, 3).join("／")} | ${row.relatedProducts} | ${row.relatedArticles} |`),
  "",
  "## 重複しやすい検索意図",
  "",
  "| テーマ | 対象 | 整理方針 |",
  "|---|---|---|",
  ...duplicateTopics.map((row) => `| ${row.join(" | ")} |`),
  "",
  "## 構造上の監査結果",
  "",
  "- 記事本文、H1、description、canonicalは静的HTMLへ出力されています。",
  "- 商品ページからは初心者・つけ方・濃度記事へ戻る導線があります。",
  "- 記事から商品ページへは既存商品データに基づく最大5件のリンクがあります。",
  "- 改善前は全記事を一列の一覧として扱い、カテゴリ説明・読む順番・著者と情報源の本文表示が不足していました。",
  "- 改善後は8カテゴリ、カテゴリ説明、最初に読む記事、著者・公開日・更新日、情報源と編集区分を共通テンプレートで表示します。",
  "",
  "## ビルド・検証・デプロイ方法",
  "",
  "1. `node build-columns.mjs`",
  "2. `node build-items.mjs`（商品ページを変更した場合）",
  "3. `node generate-seo.mjs`",
  "4. 各validateスクリプトと`git diff --check`",
  "5. 今回はpush・デプロイを行わず、2コミット作成後に停止",
  "",
];

writeFileSync(join("reports", "column-content-audit.md"), `${lines.join("\n")}\n`);
console.log(`Audited ${rows.length} columns`);
