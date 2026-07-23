import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadFragranceData } from "./lib/fragrance-data.mjs";

const document = loadFragranceData();
const brands = JSON.parse(readFileSync("data/brands.json", "utf8"));

mkdirSync("public/data", { recursive: true });
writeFileSync("public/data/fragrances.json", JSON.stringify(document.fragrances), "utf8");
writeFileSync("public/data/brands.json", JSON.stringify(brands), "utf8");

const indexPath = "public/index.html";
let indexHtml = readFileSync(indexPath, "utf8");
const collectionPage = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Sillage 掲載香水一覧",
  url: "https://sillage.asutelu.com/",
  mainEntity: {
    "@type": "ItemList",
    name: "掲載香水",
    numberOfItems: document.fragrances.length,
  },
};
const collectionPattern = /<script id="home-collection-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/;
const collectionScript = indexHtml.match(collectionPattern);
if (!collectionScript) throw new Error("Homepage CollectionPage JSON-LD not found.");
if (JSON.stringify(JSON.parse(collectionScript[1])) !== JSON.stringify(collectionPage)) {
  indexHtml = indexHtml.replace(
    collectionScript[0],
    `<script id="home-collection-jsonld" type="application/ld+json">${JSON.stringify(collectionPage)}</script>`,
  );
  writeFileSync(indexPath, indexHtml, "utf8");
}

console.log(`Generated lazy homepage data (${document.fragrances.length} fragrances, ${brands.length} brands).`);
