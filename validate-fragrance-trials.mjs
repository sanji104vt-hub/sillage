import { readFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const data = JSON.parse(readFileSync("data/fragrance-trials.json", "utf8"));
const fragrances = loadFragrances();
const validSlugs = new Set(fragrances.map((fragrance) => fragrance.slug));
const trials = data.trials;
const errors = [];
const today = new Date().toISOString().slice(0, 10);
const requiredTextFields = [
  "slug",
  "testedAt",
  "place",
  "application",
  "after30Minutes",
  "after3Hours",
  "nextDay",
  "oneMeter",
  "onClothing",
  "editorPreference",
];

if (data.schemaVersion !== 1) errors.push("schemaVersion は 1 である必要があります");
if (!Array.isArray(trials)) errors.push("trials は配列である必要があります");

const seen = new Set();
for (const [index, trial] of (Array.isArray(trials) ? trials : []).entries()) {
  const label = trial?.slug || `trials[${index}]`;
  if (!trial || typeof trial !== "object" || Array.isArray(trial)) {
    errors.push(`${label}: オブジェクトではありません`);
    continue;
  }
  for (const field of requiredTextFields) {
    if (typeof trial[field] !== "string" || !trial[field].trim()) {
      errors.push(`${label}: ${field} が空です`);
    }
  }
  if (!validSlugs.has(trial.slug)) errors.push(`${label}: 商品slugが存在しません`);
  if (seen.has(trial.slug)) errors.push(`${label}: 同一商品の記録が重複しています`);
  seen.add(trial.slug);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trial.testedAt || "") || trial.testedAt > today) {
    errors.push(`${label}: testedAt が不正または未来日です`);
  }
  if (!["skin", "blotter", "both"].includes(trial.medium)) {
    errors.push(`${label}: medium は skin / blotter / both のいずれかです`);
  }
  if (!Number.isInteger(trial.temperatureC) || trial.temperatureC < -20 || trial.temperatureC > 50) {
    errors.push(`${label}: temperatureC は -20〜50 の整数で記録してください`);
  }
}

for (const fragrance of fragrances) {
  const html = readFileSync(`public/items/${fragrance.slug}.html`, "utf8");
  const hasTrial = seen.has(fragrance.slug);
  const hasSection = html.includes('class="section editorial-trial"');
  if (hasTrial !== hasSection) {
    errors.push(`${fragrance.slug}: 試香データと公開セクションの有無が一致しません`);
  }
  if (hasSection && (/\b(?:undefined|null)\b/.test(html) || html.includes("未確認"))) {
    errors.push(`${fragrance.slug}: 試香メモに欠損値の表示があります`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Fragrance trials valid: ${trials.length} published / ${fragrances.length} products`);
