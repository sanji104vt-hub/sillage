// 補完済み商品の購入リンクと情報源リンクを、低頻度で検査してCSVへ出力する。
// 実行: node audit-fragrance-data.mjs --links
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const PILOT_SLUGS = ["muji-1", "dior-2", "ysl-2", "versace-1", "tom-ford-1", "maison-margiela-1", "hermes-3", "guerlain-3", "shiro-1", "aesop-1"];
const SECOND_BATCH_SLUGS = ["jo-malone-1", "acqua-di-parma-1", "dior-1", "hermes-1", "guerlain-2", "dior-4", "mugler-1", "ysl-3", "bvlgari-1", "chanel-4", "tom-ford-2", "creed-1", "diptyque-1", "byredo-1", "tom-ford-3", "le-labo-2", "maison-margiela-2", "giorgio-armani-3", "issey-miyake-1", "versace-4"];
const TARGET_SLUGS = new Set([...PILOT_SLUGS, ...SECOND_BATCH_SLUGS]);
const REQUEST_DELAY_MS = 450;
const RETRY_DELAY_MS = 1600;
const TIMEOUT_MS = 12000;
const MAX_RETRIES = 1;
const MAX_REDIRECTS = 8;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const csv = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
function parsePerfumes() {
  const html = readFileSync("public/index.html", "utf8");
  const start = html.indexOf("const PERFUMES = [");
  const end = html.indexOf("\n];", start) + 2;
  if (start < 0 || end < 2) throw new Error("PERFUMESを取得できません");
  return new Function(`return ${html.slice(html.indexOf("[", start), end).replace(/,(\s*\])/g, "$1")}`)();
}
function validUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
  } catch { return false; }
}
function registrableMatch(actual, expected) {
  const a = String(actual || "").toLowerCase().replace(/^www\./, "");
  const e = String(expected || "").toLowerCase().replace(/^www\./, "");
  return a === e || a.endsWith(`.${e}`) || e.endsWith(`.${a}`);
}
function rakutenDestinationType(value) {
  try {
    const url = new URL(value);
    const destination = url.searchParams.get("pc");
    const target = destination ? decodeURIComponent(destination) : value;
    const host = new URL(target).hostname;
    if (host === "item.rakuten.co.jp" || host.endsWith(".item.rakuten.co.jp")) return "product";
    if (host === "search.rakuten.co.jp" || host.endsWith(".search.rakuten.co.jp")) return "search";
  } catch { /* URL形式エラーは別項目で扱う */ }
  return "unknown";
}
async function requestOnce(initialUrl) {
  let currentUrl = initialUrl;
  const redirects = [];
  for (let step = 0; step <= MAX_REDIRECTS; step++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": "Sillage-Link-Audit/1.0 (+https://sillage.asutelu.com/)" },
      });
      clearTimeout(timer);
      response.body?.cancel().catch(() => {});
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) return { httpStatus: response.status, finalUrl: currentUrl, redirects, error: "redirect_without_location" };
        const next = new URL(location, currentUrl).href;
        redirects.push(next);
        currentUrl = next;
        continue;
      }
      return { httpStatus: response.status, finalUrl: currentUrl, redirects, error: "" };
    } catch (error) {
      clearTimeout(timer);
      return { httpStatus: "", finalUrl: currentUrl, redirects, error: error?.name === "AbortError" ? "timeout" : String(error?.message || error) };
    }
  }
  return { httpStatus: "", finalUrl: currentUrl, redirects, error: "too_many_redirects" };
}
async function inspectUrl(url) {
  let result;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    result = await requestOnce(url);
    const retryable = result.error === "timeout" || result.httpStatus === 429 || Number(result.httpStatus) >= 500;
    if (!retryable || attempt === MAX_RETRIES) break;
    await sleep(RETRY_DELAY_MS);
  }
  return result;
}
function classify(result) {
  if (result.error === "timeout") return "timeout";
  if (result.error) return "manual_review";
  if ([404, 410].includes(result.httpStatus)) return "not_found";
  if (result.httpStatus === 403) return "blocked";
  if (result.httpStatus === 429) return "rate_limited";
  if (result.httpStatus >= 200 && result.httpStatus < 300) return result.redirects.length ? "redirect" : "ok";
  return "manual_review";
}

export async function runLinkAudit() {
  const fragrances = parsePerfumes();
  const slugs = JSON.parse(readFileSync("build-items-slugmap.json", "utf8"));
  const entries = [];
  fragrances.forEach((item, index) => {
    const slug = slugs[index];
    if (!TARGET_SLUGS.has(slug)) return;
    for (const platform of ["official", "amazon", "rakuten"]) {
      const link = item.purchaseLinks?.[platform];
      if (link === null || link === undefined) continue;
      entries.push({ slug, brand: item.brand, name: item.name, category: "purchase", label: platform, url: link.url ?? "", declaredType: link.type ?? "", expectedDomain: platform === "rakuten" ? "rakuten.co.jp" : validUrl(link.url) ? new URL(link.url).hostname : "" });
    }
    for (const [sourceIndex, source] of (item.sources || []).entries()) {
      entries.push({ slug, brand: item.brand, name: item.name, category: "source", label: `${sourceIndex + 1}:${source.sourceType || "unspecified"}`, url: source.url ?? "", declaredType: "", expectedDomain: validUrl(source.url) ? new URL(source.url).hostname : "" });
    }
  });
  const counts = new Map();
  for (const entry of entries) counts.set(entry.url, (counts.get(entry.url) || 0) + 1);
  const rows = [];
  for (const entry of entries) {
    const formatValid = validUrl(entry.url);
    if (!formatValid) {
      rows.push({ ...entry, detectedType: "", formatValid: false, duplicateCount: counts.get(entry.url) || 0, status: "manual_review", httpStatus: "", finalUrl: "", redirectCount: 0, domainMatch: false, checkedAt: new Date().toISOString(), note: entry.url ? "invalid_url" : "empty_url" });
      continue;
    }
    const result = await inspectUrl(entry.url);
    let status = classify(result);
    const finalHost = validUrl(result.finalUrl) ? new URL(result.finalUrl).hostname : "";
    const domainMatch = entry.label === "rakuten" ? finalHost.endsWith("rakuten.co.jp") : registrableMatch(finalHost, entry.expectedDomain);
    const detectedType = entry.label === "rakuten" ? rakutenDestinationType(entry.url) : "";
    const notes = [];
    if (!domainMatch) notes.push("domain_mismatch");
    if (entry.label === "rakuten" && entry.declaredType && detectedType !== "unknown" && entry.declaredType !== detectedType) notes.push("link_type_mismatch");
    if ((counts.get(entry.url) || 0) > 1) notes.push("duplicate_url_across_fields");
    if (notes.some((note) => ["domain_mismatch", "link_type_mismatch"].includes(note)) && ["ok", "redirect"].includes(status)) status = "manual_review";
    rows.push({ ...entry, detectedType, formatValid: true, duplicateCount: counts.get(entry.url) || 0, status, httpStatus: result.httpStatus, finalUrl: result.finalUrl, redirectCount: result.redirects.length, domainMatch, checkedAt: new Date().toISOString(), note: [result.error, ...notes].filter(Boolean).join(";") });
    await sleep(REQUEST_DELAY_MS);
  }
  const headers = ["slug", "brand", "name", "category", "label", "declaredType", "detectedType", "url", "formatValid", "duplicateCount", "status", "httpStatus", "finalUrl", "redirectCount", "expectedDomain", "domainMatch", "checkedAt", "note"];
  mkdirSync("reports", { recursive: true });
  writeFileSync("reports/fragrance-link-audit.csv", `\uFEFF${headers.join(",")}\n${rows.map((row) => headers.map((header) => csv(row[header])).join(",")).join("\n")}\n`, "utf8");
  const statusCounts = Object.groupBy ? Object.entries(Object.groupBy(rows, (row) => row.status)).map(([key, values]) => `${key}=${values.length}`).join(", ") : [...new Set(rows.map((row) => row.status))].map((status) => `${status}=${rows.filter((row) => row.status === status).length}`).join(", ");
  console.log(`Link audit: ${rows.length} URLs (${statusCounts})`);
  console.log("Generated reports/fragrance-link-audit.csv");
  return rows;
}

if (process.argv[1]?.endsWith("audit-fragrance-links.mjs")) await runLinkAudit();
