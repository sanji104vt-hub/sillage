import { readFileSync } from "node:fs";

const taxFreeData = JSON.parse(readFileSync("data/tax-free-system.json", "utf8"));

export const taxFreeSystem = taxFreeData;
export const taxFreeVerifiedAt = taxFreeData.verifiedAt;
export const taxFreePeriods = taxFreeData.periods;
export const taxFreeSources = taxFreeData.sources;

// ここは JSON を読んで渡すだけに保つ。散文は build-i18n.mjs 側に置く
// （データ層に文章が混ざると、どちらを直せばよいか分からなくなる）。
export const taxFreeConsumptionTax = taxFreeData.consumptionTax;
export const taxFreeComparison = taxFreeData.comparison;
export const taxFreeAirportSteps = taxFreeData.airportSteps;
export const taxFreeFaq = taxFreeData.faq;
export const taxFreeConsumablesCap = taxFreeData.consumablesCapJpy;
export const taxFreeRefundMayBeLess = taxFreeData.refundMayBeLessThanTax;
export const taxFreeItemCategories = taxFreeData.itemCategories;
export const taxFreeExportPledge = taxFreeData.consumablesExportPledge;
export const taxFreeSeparateShipmentFrom = taxFreeData.separateShipmentExcludedFrom;
