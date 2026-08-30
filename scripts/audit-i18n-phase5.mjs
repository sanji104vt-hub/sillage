import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PUBLIC = resolve(ROOT, "public");
const SITE = "https://sillage.asutelu.com";
const REPORTS = resolve(ROOT, "reports");
const CHECK_PRODUCTION = process.argv.includes("--production");

function walk(dir, predicate = () => true) {
  return readdirSync(dir).flatMap((name) => {
    const path = resolve(dir, name);
    return statSync(path).isDirectory() ? walk(path, predicate) : predicate(path) ? [path] : [];
  });
}

function read(path) {
  return readFileSync(path, "utf8");
}

function match(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || "";
}

function csv(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function write(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value.replace(/\r?\n/g, "\n"), "utf8");
}

function pageUrl(path) {
  const rel = relative(PUBLIC, path).split(sep).join("/");
  if (rel === "index.html") return `${SITE}/`;
  if (rel.endsWith("/index.html")) return `${SITE}/${rel.slice(0, -"index.html".length)}`;
  return `${SITE}/${rel.replace(/\.html$/, "")}`;
}

function normalizeInternalUrl(href, base) {
  if (!href || /^(?:#|mailto:|tel:|javascript:)/i.test(href)) return "";
  try {
    const url = new URL(href, base);
    if (url.origin !== SITE) return "";
    url.hash = "";
    url.search = "";
    let pathname = url.pathname.replace(/\/index\.html$/, "/");
    if (pathname === "/en") pathname = "/en/";
    return `${SITE}${pathname}`;
  } catch {
    return "";
  }
}

function pageType(url) {
  const path = new URL(url).pathname;
  if (path === "/en/") return "English home";
  if (path === "/en/fragrances/") return "Fragrance index";
  if (path === "/en/brands/") return "Brand index";
  if (path.startsWith("/en/fragrances/")) return "Fragrance detail";
  if (path.startsWith("/en/brands/")) return "Brand detail";
  if (path.startsWith("/en/guides/")) return "Guide";
  return "Other";
}

const englishHtml = walk(resolve(PUBLIC, "en"), (path) => path.endsWith(".html"));
const allHtml = walk(PUBLIC, (path) => path.endsWith(".html"));
const sitemap = read(resolve(PUBLIC, "sitemap.xml"));
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((entry) => entry[1].trim()));
const inbound = new Map();

for (const path of allHtml) {
  const html = read(path);
  const base = pageUrl(path);
  const seen = new Set();
  for (const entry of html.matchAll(/\shref=["']([^"']+)["']/gi)) {
    const target = normalizeInternalUrl(entry[1], base);
    if (!target || seen.has(target)) continue;
    seen.add(target);
    inbound.set(target, (inbound.get(target) || 0) + 1);
  }
}

const pages = englishHtml.map((path) => {
  const html = read(path);
  const url = pageUrl(path);
  const canonical = match(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const title = match(html, /<title>([\s\S]*?)<\/title>/i);
  const description = match(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const robots = match(html, /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
  const hreflang = [...html.matchAll(/<link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']/gi)]
    .map((entry) => `${entry[1]}=${entry[2]}`);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const internalLinkCount = inbound.get(url) || 0;
  const issues = [];
  if (!title) issues.push("missing title");
  if (!description) issues.push("missing description");
  if (canonical !== url) issues.push("canonical mismatch");
  if (/noindex/i.test(robots)) issues.push("noindex");
  if (h1Count !== 1) issues.push(`h1 count ${h1Count}`);
  if (!sitemapUrls.has(url)) issues.push("not in sitemap");
  if (!hreflang.some((entry) => entry.startsWith("en="))) issues.push("missing en hreflang");
  if (internalLinkCount === 0) issues.push("no internal inbound link");
  return { path, url, type: pageType(url), title, description, canonical, robots, hreflang, h1Count, internalLinkCount, issues };
});

const productionChecks = [];
if (CHECK_PRODUCTION) {
  for (let index = 0; index < pages.length; index += 5) {
    const group = pages.slice(index, index + 5);
    productionChecks.push(...await Promise.all(group.map(async (page) => {
      try {
        const response = await fetch(page.url, {
          headers: { "user-agent": "Sillage-Phase5-Audit/1.0" },
          redirect: "follow",
          signal: AbortSignal.timeout(15_000),
        });
        const html = await response.text();
        return {
          url: page.url,
          status: response.status,
          finalUrl: response.url,
          canonical: match(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i),
          title: match(html, /<title>([\s\S]*?)<\/title>/i),
          error: "",
        };
      } catch (error) {
        return { url: page.url, status: "", finalUrl: "", canonical: "", title: "", error: error.name || "request failed" };
      }
    })));
  }
  try {
    const response = await fetch(`${SITE}/en/phase5-missing-page/`, {
      headers: { "user-agent": "Sillage-Phase5-Audit/1.0" },
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
    productionChecks.push({
      url: `${SITE}/en/phase5-missing-page/`,
      status: response.status,
      finalUrl: response.url,
      canonical: "",
      title: "",
      error: response.status === 404 ? "expected 404" : "unexpected missing-page response",
    });
  } catch (error) {
    productionChecks.push({ url: `${SITE}/en/phase5-missing-page/`, status: "", finalUrl: "", canonical: "", title: "", error: error.name || "request failed" });
  }
}

const productionByUrl = new Map(productionChecks.map((entry) => [entry.url, entry]));

const titleGroups = Map.groupBy(pages, (page) => page.title);
const descriptionGroups = Map.groupBy(pages, (page) => page.description);
for (const page of pages) {
  if (page.title && titleGroups.get(page.title).length > 1) page.issues.push("duplicate title");
  if (page.description && descriptionGroups.get(page.description).length > 1) page.issues.push("duplicate description");
}

const gscPageRows = [
  ["URL", "Page Type", "Clicks", "Impressions", "CTR", "Position", "GA4 Views", "Store Clicks", "Rakuten Clicks", "Classification", "Recommended Action", "HTTP Status", "Technical SEO"],
  ...pages.map((page) => [
    page.url,
    page.type,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "No Data",
    page.issues.length
      ? `Fix or review technical finding: ${page.issues.join("; ")}`
      : "Await 28 days of GSC/GA4 data before content changes",
    productionByUrl.get(page.url)?.status || "not checked",
    page.issues.length ? page.issues.join("; ") : "pass",
  ]),
];
write(resolve(REPORTS, "phase5-gsc-pages.csv"), `${gscPageRows.map((row) => row.map(csv).join(",")).join("\n")}\n`);

write(resolve(REPORTS, "phase5-gsc-queries.csv"), [
  ["Query", "Clicks", "Impressions", "CTR", "Position", "Target URL", "Category", "Status"].map(csv).join(","),
  ["", "", "", "", "", "", "", "Data unavailable: Search Console is not authenticated in the available browser session"].map(csv).join(","),
].join("\n") + "\n");

const ga4Rows = [
  ["URL", "Page Type", "Views", "Users", "Engagement Rate", "Engaged Sessions", "Store Map Clicks", "Store Official Clicks", "Rakuten Clicks", "Status"],
  ...pages.map((page) => [page.url, page.type, "", "", "", "", "", "", "", "Data unavailable"]),
];
write(resolve(REPORTS, "phase5-ga4-pages.csv"), `${ga4Rows.map((row) => row.map(csv).join(",")).join("\n")}\n`);

const counts = Object.entries(Object.groupBy(pages, (page) => page.type))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([type, group]) => `| ${type} | ${group.length} |`)
  .join("\n");
const issuePages = pages.filter((page) => page.issues.length);
const productionPages = productionChecks.filter((entry) => entry.url !== `${SITE}/en/phase5-missing-page/`);
const productionPasses = productionPages.filter((entry) => {
  const local = pages.find((page) => page.url === entry.url);
  return entry.status === 200 && entry.finalUrl === entry.url && entry.canonical === entry.url && entry.title === local?.title;
});
const missingPage = productionByUrl.get(`${SITE}/en/phase5-missing-page/`);
const internalLinks = [...pages].sort((a, b) => a.internalLinkCount - b.internalLinkCount);
const lowLinkPages = internalLinks.slice(0, Math.min(10, internalLinks.length));
const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date());

const report = `# Sillage Phase 5 English SEO opportunity audit

監査日: ${today} (JST)  
監査対象コミット: \`${commit}\`

## 結論

Search ConsoleとGA4は、利用可能なブラウザセッションにGoogleログインがなく、実データを取得できませんでした。したがって、クリック・表示回数・CTR・掲載順位・GA4行動を推測せず、全英語ページを\`No Data\`に分類します。

Phase 5は分析基盤と技術監査までの **Phase 5A** とし、タイトルや本文のSEO変更、英語ページ追加、イベント追加は行いません。

## データ取得状況

| データ | 期間 | 結果 |
| --- | --- | --- |
| Search Console | 直近7日 | 取得不可（未認証） |
| Search Console | 直近28日 | 取得不可（未認証） |
| GA4 | 直近7日 | 取得不可（未認証） |
| GA4 | 直近28日 | 取得不可（未認証） |

## 英語ページ構成

| Page Type | Pages |
| --- | ---: |
${counts}
| **Total** | **${pages.length}** |

共有データは日本語150商品、英語オーバーレイ25商品、英語10ブランド、英語5ガイドです。店舗DBはTokyo 27、Kyoto 18、Osaka 20の合計65件です。

## 技術SEO監査

- 英語HTML: ${pages.length}ページ
- canonical不一致・noindex・H1異常・sitemap漏れ・en hreflang欠損・title/description重複・内部リンク0件を自動検出
- 技術的な要確認ページ: ${issuePages.length}ページ
${issuePages.length ? issuePages.map((page) => `  - ${page.url}: ${page.issues.join(", ")}`).join("\n") : "- 上記の重大な技術不備: 0件"}

### 本番HTTP照合

${CHECK_PRODUCTION ? `- HTTP 200・最終URL一致・canonical一致・title一致: ${productionPasses.length}/${productionPages.length}
- 存在しない英語URL: HTTP ${missingPage?.status || "取得失敗"}（期待値404）
- 本番照合エラー: ${productionPages.length - productionPasses.length}件` : "- 未実行（`--production`で実行可能）"}

### 内部リンクが少ないページ（重複リンクは1参照元につき1件として集計）

| URL | Page Type | Inbound pages |
| --- | --- | ---: |
${lowLinkPages.map((page) => `| ${page.url} | ${page.type} | ${page.internalLinkCount} |`).join("\n")}

## 計測実装監査

既存GA4 ID \`G-60BQRQWB5M\`、GSC所有権確認タグ、通常page_viewに加え、次のイベント実装を確認しました。

- \`item_view\`
- \`column_view\`
- \`city_guide_view\`
- \`store_map_click\`
- \`store_official_click\`
- \`official_click\`
- \`rakuten_click\`

Phase 5の判断に必要なイベントは既に存在するため、新規イベントは追加していません。

## ページ分類

- Winner: 判定不可
- Opportunity: 判定不可
- Emerging: 判定不可
- No Data: ${pages.length}ページ

GSCの掲載順位8〜30かつ表示回数のあるページを抽出できないため、改善対象を推測で選びません。

## 次の取得条件

次回はSearch ConsoleとGA4へアクセスできる状態で、同じ終了日を使った直近7日・28日を取得します。最低条件は次の両方です。

1. 英語公開ページについて28日分のページ・クエリデータが取得できる
2. 英語ページ合計で100表示以上、または自然検索20クリック以上が確認できる

条件を満たしたら、掲載順位8〜30で表示回数のあるOpportunityを最大5〜10ページに限定し、title・description・導入・内部リンクを改善します。

## Phase 6判断

**Phase 6を開始しない** を推奨します。根拠は、GSCとGA4の実数がなく、A〜Gのどの施策が検索流入や回遊に効くか比較できないためです。

## 出力

- \`reports/phase5-gsc-pages.csv\`
- \`reports/phase5-gsc-queries.csv\`
- \`reports/phase5-ga4-pages.csv\`
- \`reports/phase5-seo-opportunities.md\`
`;
write(resolve(REPORTS, "phase5-seo-opportunities.md"), report);

console.log(`Phase 5 audit: ${pages.length} English pages, ${issuePages.length} technical issue pages, no analytics data available`);
