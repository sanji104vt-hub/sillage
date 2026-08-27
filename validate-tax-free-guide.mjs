import { existsSync, readFileSync } from "node:fs";
import { taxFreePeriods, taxFreeSources, taxFreeVerifiedAt } from "./lib/tax-free-data.mjs";

const path = "public/en/guides/tax-free-perfume-shopping-japan/index.html";
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const html = existsSync(path) ? readFileSync(path, "utf8") : "";

assert(Boolean(html), `Generated tax-free guide missing: ${path}`);
assert(taxFreePeriods.preRefund.until === "2026-10-31", "Current-system end date changed");
assert(taxFreePeriods.refund.from === "2026-11-01", "Refund-method start date changed");
assert(taxFreePeriods.refund.customsConfirmationWithinDays === 90, "90-day rule missing from data");
assert(taxFreeSources.length >= 4, "Official tax-free sources are incomplete");
assert(taxFreeSources.every((source) => source.sourceType === "official" && /^https:\/\//.test(source.url)), "Tax-free source must be an official HTTPS URL");
assert(html.includes("Until October 31, 2026") && html.includes("From November 1, 2026"), "Both 2026 procedure periods must be visible");
assert(html.includes("within 90 days of purchase"), "90-day departure rule is not visible");
assert(html.includes("Tax-free eligibility and aviation rules are separate"), "Perfume aviation disclaimer missing");
assert(html.includes("Sillage does not promise that perfume can be shipped internationally"), "International shipping non-promise missing");
assert(html.includes(`Last verified: ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Tokyo" }).format(new Date(`${taxFreeVerifiedAt}T00:00:00+09:00`))}`), "Last verified date missing");
assert(html.includes('<link rel="canonical" href="https://sillage.asutelu.com/en/guides/tax-free-perfume-shopping-japan/">'), "Tax-free canonical mismatch");
assert(!html.includes('hreflang="ja"'), "Tax-free guide must not invent a Japanese counterpart");
assert(html.includes('"@type":"Article"') && html.includes('"@type":"BreadcrumbList"'), "Tax-free structured data incomplete");
assert(html.includes('data-tax-free-guide="japan"'), "Tax-free analytics attribute missing");
assert(html.includes(":focus-visible") && html.includes("prefers-reduced-motion:reduce"), "Accessibility styles missing");
for (const source of taxFreeSources) assert(html.includes(source.url.replaceAll("&", "&amp;")), `Source link missing: ${source.publisher}`);

if (errors.length) {
  console.error("Tax-free guide validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Tax-free guide validation: OK (${taxFreeSources.length} official sources, verified ${taxFreeVerifiedAt})`);
