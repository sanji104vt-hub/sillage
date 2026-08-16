// Sillage 週次監査のエントリポイント。
//
// 検知と報告だけを行い、data/ 配下は一切書き換えない。
// 書き出すのは reports/ の下だけ。
//
// 実行:
//   export RAKUTEN_APP_ID='...' RAKUTEN_ACCESS_KEY='...'
//   export RAKUTEN_ORIGIN='https://sillage.asutelu.com/'
//   node scripts/audit/run.mjs [--no-issue] [--limit N]

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { checkRakuten } from "./check-rakuten.mjs";
import { checkAssets } from "./check-assets.mjs";
import { checkInternal } from "./check-internal.mjs";
import { buildReport, weekLabel, fileIssue } from "./report.mjs";

const SITE = "https://sillage.asutelu.com";
const SITE_HOST = "sillage.asutelu.com";
const DATA = "data/fragrances.json";
const STATE = "reports/state.json";
const REPO = process.env.AUDIT_REPO || "sanji104vt-hub/sillage";

const args = process.argv.slice(2);
const NO_ISSUE = args.includes("--no-issue");
const LIMIT = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : 0;

const appId = process.env.RAKUTEN_APP_ID;
const accessKey = process.env.RAKUTEN_ACCESS_KEY;
const origin = process.env.RAKUTEN_ORIGIN || `${SITE}/`;

if (!appId || !accessKey) {
  console.error("環境変数 RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が必要です");
  process.exit(1);
}
// 他サイトの値が残っていると認証が通らず全件「取得失敗」になる。過去に実際に起きた。
if (!origin.includes(SITE_HOST)) {
  console.error(`RAKUTEN_ORIGIN が Sillage のものではありません: ${origin}`);
  process.exit(1);
}
if (!existsSync(DATA)) {
  console.error(`${DATA} が見つかりません。Sillage のリポジトリルートで実行してください。`);
  process.exit(1);
}

const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
const dataHashBefore = sha(DATA);

const document = JSON.parse(readFileSync(DATA, "utf8"));
const products = LIMIT ? document.fragrances.slice(0, LIMIT) : document.fragrances;
const brands = JSON.parse(readFileSync("data/brands.json", "utf8"));
const brandSlugs = readdirSync("public")
  .filter((f) => /^brand-.+\.html$/.test(f))
  .map((f) => f.replace(/^brand-|\.html$/g, ""));
const columnSlugs = readdirSync("public/columns")
  .filter((f) => f.endsWith(".html"))
  .map((f) => f.replace(/\.html$/, ""));
const familyKeys = ["citrus", "aromatic", "floral", "fruity", "gourmand", "amber", "woody", "chypre", "musk", "aquatic"];

const label = weekLabel();
console.log(`Sillage 週次監査 ${label}`);
console.log(`対象: 商品${products.length} / ブランド${brands.length} / コラム${columnSlugs.length}\n`);

// --- C 内部整合性（ネットワーク不要なので先に回す）
console.log("[C] 内部整合性");
const internal = checkInternal({ products, brandCount: brands.length, columnSlugs, log: console.log });

// --- B 死活
console.log("\n[B] 画像とページの死活");
const assets = await checkAssets({ site: SITE, products, brandSlugs, columnSlugs, familyKeys, log: console.log });

// --- A 楽天照合（1.2秒間隔・逐次。150件で約3分）
console.log("\n[A] 楽天リンクの照合（1.2秒間隔・逐次）");
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : null;
if (!state) console.log("  前週の記録がないため、変化の検出は行わず記録のみ作成します");
const started = Date.now();
const rakuten = await checkRakuten({
  products, state: state?.items || null, appId, accessKey, origin,
  log: (line) => { if (/✗/.test(line)) console.log(line); },
});
const elapsedSec = (Date.now() - started) / 1000;

// --- 集計
const findings = [...internal.findings, ...assets.findings, ...rakuten.findings];
const high = findings.filter((f) => f.level === "high");
const medium = findings.filter((f) => f.level === "medium");

const report = buildReport({
  label,
  counts: { products: products.length, brands: brands.length, columns: columnSlugs.length },
  findings,
  assetSummary: assets.summary,
  checkedRakuten: rakuten.checked,
  elapsedSec,
});

mkdirSync("reports", { recursive: true });
writeFileSync(`reports/${label}.md`, report, "utf8");
writeFileSync(STATE, JSON.stringify({ updatedAt: new Date().toISOString(), items: rakuten.nextState }, null, 2) + "\n", "utf8");

// データを書き換えていないことを実行後に確認する
const dataHashAfter = sha(DATA);
if (dataHashBefore !== dataHashAfter) {
  console.error("\n★ data/fragrances.json が変更されました。監査は検知のみのはずです。");
  process.exit(1);
}

console.log(`\n${"=".repeat(60)}`);
console.log(`深刻度「高」: ${high.length}件 / 「中」: ${medium.length}件`);
console.log(`楽天照合: ${rakuten.checked}件 / 所要 ${Math.round(elapsedSec)}秒`);
console.log(`レポート: reports/${label}.md`);
console.log(`data/fragrances.json は未変更（${dataHashBefore.slice(0, 12)}）`);
console.log("=".repeat(60));

for (const f of high) {
  console.log(`  [高] ${f.slug || ""} ${f.title}${f.known ? "（既知）" : ""}`);
}

// Issue は「高」があるときだけ。毎週鳴らすと通知が形骸化する。
if (high.length && !NO_ISSUE) {
  try {
    const result = fileIssue({ label, high, repo: REPO });
    console.log(`\nIssue: ${result.action === "create" ? result.url : `#${result.number} にコメントを追加`}`);
  } catch (error) {
    console.error(`\nIssueの起票に失敗しました: ${String(error?.message || error).slice(0, 200)}`);
  }
} else if (!high.length) {
  console.log("\n深刻度「高」なし。Issueは起票しません。");
}
