import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const LIVE = process.argv.includes("--live");
const stores = JSON.parse(readFileSync("data/stores.json", "utf8")).stores;
const taxFreeSources = JSON.parse(readFileSync("data/tax-free-system.json", "utf8")).sources;
const output = "reports/i18n-phase4-store-link-audit.csv";
const csv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const references = [...stores.flatMap((store) => [
  { storeId: store.id, city: store.city, kind: "official", url: store.officialUrl },
  { storeId: store.id, city: store.city, kind: "google_maps", url: store.googleMapsUrl },
  ...(store.sources || []).map((source) => ({ storeId: store.id, city: store.city, kind: "source", url: source.url })),
]), ...taxFreeSources.map((source, index) => ({ storeId: `tax-free-source-${index + 1}`, city: "japan", kind: "tax_free_source", url: source.url }))];
const unique = new Map();
for (const reference of references) {
  if (!unique.has(reference.url)) unique.set(reference.url, { ...reference, usedBy: [] });
  unique.get(reference.url).usedBy.push(`${reference.storeId}:${reference.kind}`);
}

async function check(entry) {
  try {
    const parsed = new URL(entry.url);
    if (parsed.protocol !== "https:") return { ...entry, status: "manual_review", httpStatus: "", redirectTo: "", redirectDomain: "", error: "non-HTTPS URL" };
  } catch {
    return { ...entry, status: "manual_review", httpStatus: "", redirectTo: "", redirectDomain: "", error: "invalid URL" };
  }
  if (!LIVE) return { ...entry, status: "not_checked", httpStatus: "", redirectTo: "", redirectDomain: "", error: "" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    let response = await fetch(entry.url, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
      headers: { "user-agent": "SillageStoreAudit/1.0 (+https://sillage.asutelu.com/)" },
    });
    // Some commerce CMS routes return 404 to HEAD while serving the same URL by GET.
    // Recheck definitive broken statuses once before classifying the link.
    if ([404, 405, 410, 501].includes(response.status)) response = await fetch(entry.url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { "user-agent": "SillageStoreAudit/1.0 (+https://sillage.asutelu.com/)", range: "bytes=0-1023" },
    });
    const code = response.status;
    const redirectTo = response.headers.get("location") || "";
    let redirectDomain = "";
    try { redirectDomain = redirectTo ? new URL(redirectTo, entry.url).hostname : ""; } catch { /* report blank */ }
    const status = code >= 200 && code < 300 ? "ok"
      : code >= 300 && code < 400 ? "redirect"
      : [404, 410].includes(code) ? "not_found"
      : code === 403 ? "blocked"
      : code === 429 ? "rate_limited"
      : "manual_review";
    return { ...entry, status, httpStatus: code, redirectTo, redirectDomain, error: "" };
  } catch (error) {
    return { ...entry, status: error?.name === "AbortError" ? "timeout" : "manual_review", httpStatus: "", redirectTo: "", redirectDomain: "", error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const entry of unique.values()) {
  results.push(await check(entry));
  if (LIVE) await new Promise((resolve) => setTimeout(resolve, 350));
}

mkdirSync("reports", { recursive: true });
writeFileSync(output, [
  ["status", "httpStatus", "kind", "storeId", "city", "url", "redirectTo", "redirectDomain", "usedBy", "error"],
  ...results.map((row) => [row.status, row.httpStatus, row.kind, row.storeId, row.city, row.url, row.redirectTo, row.redirectDomain, row.usedBy.join("|"), row.error]),
].map((row) => row.map(csv).join(",")).join("\n") + "\n", "utf8");

const counts = Object.groupBy(results, (row) => row.status);
console.log(`Store link audit: ${results.length} unique URLs (${LIVE ? "live" : "static"})`);
for (const [status, rows] of Object.entries(counts)) console.log(`${status}: ${rows.length}`);
console.log(`Report: ${output}`);
if ((counts.not_found || []).length) process.exitCode = 1;
