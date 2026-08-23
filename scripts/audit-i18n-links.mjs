import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadFragrances } from "../lib/fragrance-data.mjs";

const LIVE = process.argv.includes("--live");
const products = loadFragrances();
const output = "reports/i18n-phase0/links.csv";
mkdirSync("reports/i18n-phase0", { recursive: true });
const csv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

function destinationUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "af.moshimo.com") {
      const destination = parsed.searchParams.get("url");
      return destination ? decodeURIComponent(destination) : url;
    }
    return url;
  } catch { return url; }
}

const rows = [];
for (const product of products) {
  for (const shop of ["official", "amazon", "rakuten"]) {
    const link = product.purchaseLinks?.[shop];
    if (link?.url) rows.push({ slug: product.slug, kind: shop, sourceUrl: link.url, checkedUrl: destinationUrl(link.url) });
  }
  for (const source of product.sources || []) rows.push({ slug: product.slug, kind: "source", sourceUrl: source.url, checkedUrl: source.url });
}

const unique = new Map();
for (const row of rows) {
  const key = row.checkedUrl;
  if (!unique.has(key)) unique.set(key, { ...row, usedBy: [] });
  unique.get(key).usedBy.push(`${row.slug}:${row.kind}`);
}

async function check(entry) {
  if (!/^https?:\/\//.test(entry.checkedUrl)) return { ...entry, status: "invalid", httpStatus: "", redirectTo: "" };
  if (!LIVE) return { ...entry, status: "not_checked", httpStatus: "", redirectTo: "" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    let response = await fetch(entry.checkedUrl, {
      method: "HEAD", redirect: "manual", signal: controller.signal,
      headers: { "user-agent": "SillageLinkAudit/1.0 (+https://sillage.asutelu.com/)" },
    });
    if ([405, 501].includes(response.status)) response = await fetch(entry.checkedUrl, {
      method: "GET", redirect: "manual", signal: controller.signal,
      headers: { "user-agent": "SillageLinkAudit/1.0 (+https://sillage.asutelu.com/)", range: "bytes=0-1023" },
    });
    const code = response.status;
    const location = response.headers.get("location") || "";
    const status = code >= 200 && code < 300 ? "ok"
      : code >= 300 && code < 400 ? "redirect"
      : [404, 410].includes(code) ? "not_found"
      : code === 403 ? "blocked"
      : code === 429 ? "rate_limited"
      : code >= 500 ? "manual_review"
      : "manual_review";
    return { ...entry, status, httpStatus: code, redirectTo: location };
  } catch (error) {
    return { ...entry, status: error?.name === "AbortError" ? "timeout" : "manual_review", httpStatus: "", redirectTo: "", error: String(error?.message || error) };
  } finally { clearTimeout(timer); }
}

const entries = [...unique.values()];
const results = new Array(entries.length);
let cursor = 0;
async function worker() {
  while (cursor < entries.length) {
    const index = cursor++;
    results[index] = await check(entries[index]);
    if (LIVE) await new Promise((resolve) => setTimeout(resolve, 250));
  }
}
await Promise.all(Array.from({ length: LIVE ? 3 : 1 }, worker));

writeFileSync(output, [
  ["status", "httpStatus", "kind", "slug", "sourceUrl", "checkedUrl", "redirectTo", "usedBy", "error"],
  ...results.map((row) => [row.status, row.httpStatus, row.kind, row.slug, row.sourceUrl, row.checkedUrl, row.redirectTo, row.usedBy.join("|"), row.error || ""]),
].map((row) => row.map(csv).join(",")).join("\n") + "\n");

const counts = Object.groupBy(results, (row) => row.status);
console.log(`Link audit: ${results.length} unique destinations from ${rows.length} references (${LIVE ? "live" : "static"}).`);
for (const [status, group] of Object.entries(counts)) console.log(`${status}: ${group.length}`);
console.log(`Report: ${output}`);
