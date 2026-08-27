import { readFileSync } from "node:fs";

const taxFreeData = JSON.parse(readFileSync("data/tax-free-system.json", "utf8"));

export const taxFreeSystem = taxFreeData;
export const taxFreeVerifiedAt = taxFreeData.verifiedAt;
export const taxFreePeriods = taxFreeData.periods;
export const taxFreeSources = taxFreeData.sources;
