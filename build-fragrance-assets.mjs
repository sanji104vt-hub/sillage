import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadFragranceData } from "./lib/fragrance-data.mjs";

const document = loadFragranceData();
mkdirSync("public/data", { recursive: true });
writeFileSync(
  "public/data/fragrances.js",
  `/* Generated from data/fragrances.json. Do not edit directly. */\nwindow.SILLAGE_FRAGRANCE_SCHEMA_VERSION=${document.schemaVersion};\nwindow.SILLAGE_FRAGRANCES=${JSON.stringify(document.fragrances)};\n`,
  "utf8",
);
const indexPath = "public/index.html";
let indexHtml = readFileSync(indexPath, "utf8");
const familiesStart = indexHtml.indexOf("const FAMILIES = [");
const familiesEnd = indexHtml.indexOf("\n];", familiesStart) + 2;
const families = new Function(`return ${indexHtml.slice(indexHtml.indexOf("[", familiesStart), familiesEnd).replace(/,(\s*\])/g, "$1")}`)();
const familyLabels = Object.fromEntries(families.map((family) => [family.key, family.ja]));
const itemList = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Sillage 掲載メンズ香水一覧",
  numberOfItems: document.fragrances.length,
  itemListElement: document.fragrances.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: item.name,
      brand: { "@type": "Brand", name: item.brand },
      category: familyLabels[item.family] || item.family,
      description: item.verdict,
    },
  })),
};
const scripts = [...indexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
const itemListScript = scripts.find((match) => {
  try { return JSON.parse(match[1])["@type"] === "ItemList"; } catch { return false; }
});
if (!itemListScript) throw new Error("ItemList JSON-LD not found in public/index.html");
if (JSON.stringify(JSON.parse(itemListScript[1])) !== JSON.stringify(itemList)) {
  indexHtml = indexHtml.replace(itemListScript[0], `<script type="application/ld+json">${JSON.stringify(itemList)}</script>`);
  writeFileSync(indexPath, indexHtml, "utf8");
}
console.log(`Generated public/data/fragrances.js (${document.fragrances.length} fragrances).`);
