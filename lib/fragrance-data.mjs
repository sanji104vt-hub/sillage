import { readFileSync } from "node:fs";

export const FRAGRANCE_DATA_PATH = "data/fragrances.json";
export const EXPECTED_SCHEMA_VERSION = 2;
export const EXPECTED_FRAGRANCE_COUNT = 92;

export function loadFragranceData(path = FRAGRANCE_DATA_PATH) {
  const document = JSON.parse(readFileSync(path, "utf8"));
  if (document.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
    throw new Error(`Unsupported fragrance schemaVersion: ${document.schemaVersion}`);
  }
  if (!Array.isArray(document.fragrances) || document.fragrances.length !== EXPECTED_FRAGRANCE_COUNT) {
    throw new Error(`Expected ${EXPECTED_FRAGRANCE_COUNT} fragrances; got ${document.fragrances?.length ?? "invalid"}`);
  }
  return document;
}

export function loadFragrances(path = FRAGRANCE_DATA_PATH) {
  return loadFragranceData(path).fragrances;
}
