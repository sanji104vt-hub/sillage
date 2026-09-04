import { existsSync, readFileSync } from "node:fs";
import { taxFreeAirportSteps, taxFreeComparison, taxFreeConsumablesCap, taxFreeConsumptionTax, taxFreeFaq, taxFreePeriods, taxFreeRefundMayBeLess, taxFreeSources, taxFreeVerifiedAt } from "./lib/tax-free-data.mjs";

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

// 税率・上限・FAQ。税制の誤記は読者に実害が及ぶので、数値はデータ側で固定し
// 本文に出ていることまで検査する。2026-08-17 に楽天のエンドポイント廃止で
// 症状から原因が辿れなかったのと同じで、間違いは早い段階で止めるほうが安い。
assert(taxFreeConsumptionTax.standardRatePercent === 10, "Standard consumption tax rate must be 10");
assert(taxFreeConsumptionTax.reducedRatePercent === 8, "Reduced consumption tax rate must be 8");
assert(taxFreeConsumptionTax.fragranceRate === "standard", "Fragrance must be recorded as standard-rate");
assert(taxFreeConsumptionTax.reducedRateAppliesTo.length === 2, "Reduced-rate scope must list both categories (food/beverages, newspapers)");
assert(/^https:\/\/www\.nta\.go\.jp\//.test(taxFreeConsumptionTax.source), "Consumption tax rate needs a National Tax Agency source");
assert(html.includes("a standard rate of 10%") && html.includes("a reduced rate of 8%"), "Both consumption tax rates must be visible");
assert(html.includes("Fragrance is not in either category, so the standard 10% rate applies"), "Fragrance must be derived from the reduced-rate scope, not asserted alone");

// 税率を書く以上、全額が戻るとは限らないことを必ずセットで出す。
assert(taxFreeRefundMayBeLess === true, "Handling-fee caveat must stay recorded in data");
assert(html.includes("The refund amount may be less than the full tax amount"), "Refund-amount caveat missing");
assert(html.includes("Confirm the refund terms at the point of purchase"), "Refund terms instruction missing");

assert(taxFreeConsumablesCap.preRefund === 500000, "Consumables cap must be 500000 under the current procedure");
assert(taxFreeConsumablesCap.refund === null, "Consumables cap must be removed under the refund method");
assert(html.includes("¥500,000"), "Consumables cap is not visible");

assert(taxFreeComparison.length >= 5, "Comparison table needs at least 5 rows");
assert(html.includes("Scheduled changes to Japan's tax-free procedure"), "Comparison table missing");
assert(taxFreeAirportSteps.length >= 4, "Airport procedure needs at least 4 steps");
assert(html.includes("before you check your baggage with the airline"), "Baggage check-in warning missing");
assert(html.includes("Tax-free is not duty-free"), "Tax-free vs duty-free section missing");

assert(taxFreeFaq.length >= 5, "FAQPage needs at least 5 questions");
assert(html.includes('"@type":"FAQPage"'), "FAQPage structured data missing");
for (const entry of taxFreeFaq) assert(html.includes(entry.q.replaceAll("&", "&amp;")), `FAQ question missing from body: ${entry.q}`);

const bodyText = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
assert(bodyText.length >= 5000, `Tax-free guide is too short for the topic: ${bodyText.length} characters (needs 5000)`);

if (errors.length) {
  console.error("Tax-free guide validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Tax-free guide validation: OK (${taxFreeSources.length} official sources, verified ${taxFreeVerifiedAt})`);
