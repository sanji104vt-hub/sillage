import { readFileSync } from "node:fs";

export const FRAGRANCE_DATA_PATH = "data/fragrances.json";
export const EXPECTED_SCHEMA_VERSION = 2;
// 掲載数は増減しうるため固定値では縛らず、下限だけを安全弁として持つ。
// （データが空・壊れた状態でビルドが通ってしまう事故だけを防ぐ）
export const MIN_FRAGRANCE_COUNT = 50;

export function loadFragranceData(path = FRAGRANCE_DATA_PATH) {
  const document = JSON.parse(readFileSync(path, "utf8"));
  if (document.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
    throw new Error(`Unsupported fragrance schemaVersion: ${document.schemaVersion}`);
  }
  if (!Array.isArray(document.fragrances) || document.fragrances.length < MIN_FRAGRANCE_COUNT) {
    throw new Error(`Expected at least ${MIN_FRAGRANCE_COUNT} fragrances; got ${document.fragrances?.length ?? "invalid"}`);
  }
  return document;
}

export function loadFragrances(path = FRAGRANCE_DATA_PATH) {
  return loadFragranceData(path).fragrances;
}
