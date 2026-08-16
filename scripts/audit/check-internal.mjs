// C. 内部整合性。ローカルの生成物だけを見るのでネットワークは使わない。
//
// C5 と C6 は過去に実際に取り違えが起きている（Moilum のアフィリエイトIDと
// GA4測定IDが混入した）。金銭と計測に直結するので必須の検査。

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const VALIDATORS = [
  "validate-site-routes", "validate-fragrances", "validate-columns", "validate-site-copy",
  "validate-featured-brands", "validate-quiz-recommendations", "validate-purchase-click-tracking",
  "validate-problem-columns", "validate-editorial-policy", "validate-product-comparisons",
  "validate-fragrance-trials", "validate-moshimo-offers",
];

const SILLAGE_AFFILIATE_ID = "5718841";
const MOILUM_AFFILIATE_ID = "5738711";
const SILLAGE_GA4 = "G-60BQRQWB5M";
const MOILUM_GA4 = "G-BC0FBSZSWX";

const INTERNAL_FLAGS = ["priceSizeMismatch", "priceSizeUnknown", "needsCorrectLink", "priceStaleRuns"];

export function checkInternal({ products, brandCount, columnSlugs, log = () => {} }) {
  const findings = [];
  const add = (level, code, title, detail) => findings.push({ level, code, title, detail });

  // C1 既存12バリデータ
  const failed = [];
  for (const name of VALIDATORS) {
    try {
      execFileSync("node", [`${name}.mjs`], { stdio: "pipe" });
    } catch (error) {
      const out = String(error.stdout || "") + String(error.stderr || "");
      failed.push({ name, out: out.split(/\r?\n/).filter(Boolean).slice(-6).join("\n") });
    }
  }
  log(`  C1 バリデータ      ${VALIDATORS.length - failed.length}/${VALIDATORS.length} OK`);
  for (const f of failed) add("high", "C1", `${f.name} が失敗しています`, { 出力: f.out });

  const index = readFileSync("public/index.html", "utf8");
  const homeData = existsSync("public/data/home-data.js") ? readFileSync("public/data/home-data.js", "utf8") : "";

  // C2 件数の一致
  const itemLinks = new Set([...index.matchAll(/href="\/items\/([a-z0-9-]+)"/g)].map((m) => m[1]));
  const brandLinks = new Set([...index.matchAll(/href="\/brand-([a-z0-9-]+)\.html"/g)].map((m) => m[1]));
  const columnLinks = new Set([...index.matchAll(/href="\/columns\/([a-z0-9-]+)"/g)].map((m) => m[1]));
  const counts = {
    商品: `データ${products.length} / トップのリンク${itemLinks.size}`,
    ブランド: `データ${brandCount} / トップのリンク${brandLinks.size}`,
    コラム: `生成${columnSlugs.length} / トップのリンク${columnLinks.size}`,
  };
  log(`  C2 件数の一致      ${counts.商品} ・ ${counts.ブランド} ・ ${counts.コラム}`);
  if (itemLinks.size !== products.length) add("medium", "C2", "商品数とトップページのリンク数が一致しません", counts);
  if (brandLinks.size !== brandCount) add("medium", "C2", "ブランド数とトップページのリンク数が一致しません", counts);
  if (columnLinks.size !== columnSlugs.length) add("medium", "C2", "コラム数とトップページのリンク数が一致しません", counts);

  // C3 押せないボタン
  const deadButtons = (index.match(/class="buy[^"]*"[^>]*href="#"/g) || []).length;
  log(`  C3 空ボタン        ${deadButtons}件`);
  if (deadButtons) add("high", "C3", "押せない購入ボタンがあります", { 件数: deadButtons });

  // C4 内部フラグの配信データへの漏れ
  const leaked = INTERNAL_FLAGS.filter((flag) => homeData.includes(flag));
  log(`  C4 内部フラグ漏れ  ${leaked.length}件`);
  if (leaked.length) add("high", "C4", "内部フラグが配信データに含まれています", { フラグ: leaked.join("、") });

  // C5 アフィリエイトID
  const ids = {};
  for (const p of products) {
    const url = p.purchaseLinks?.rakuten?.url;
    if (!url) continue;
    try {
      const id = new URL(url).searchParams.get("a_id") || "(なし)";
      ids[id] = (ids[id] || 0) + 1;
    } catch { ids["(解析不可)"] = (ids["(解析不可)"] || 0) + 1; }
  }
  log(`  C5 アフィリエイトID ${Object.entries(ids).map(([k, v]) => `${k}:${v}`).join(" / ")}`);
  const wrongId = Object.keys(ids).filter((id) => id !== SILLAGE_AFFILIATE_ID);
  if (wrongId.length) {
    add("high", "C5", "楽天リンクのアフィリエイトIDが Sillage のものではありません", {
      内訳: Object.entries(ids).map(([k, v]) => `${k}=${v}件`).join(" / "),
      注意: wrongId.includes(MOILUM_AFFILIATE_ID) ? "Moilum のIDが混入しています" : "",
    });
  }

  // C6 GA4測定ID
  const pages = ["public/index.html", ...readdirSync("public/items").slice(0, 3).map((f) => `public/items/${f}`)];
  const ga4Bad = [];
  for (const file of pages) {
    const html = readFileSync(file, "utf8");
    if (html.includes(MOILUM_GA4)) ga4Bad.push(`${file}: Moilum のIDが混入`);
    else if (!html.includes(SILLAGE_GA4)) ga4Bad.push(`${file}: Sillage のIDが見つからない`);
  }
  log(`  C6 GA4測定ID       ${ga4Bad.length ? "★" + ga4Bad.length + "件" : "正常"}`);
  for (const msg of ga4Bad) add("high", "C6", "GA4測定IDが不正です", { 詳細: msg });

  return { findings, counts };
}
