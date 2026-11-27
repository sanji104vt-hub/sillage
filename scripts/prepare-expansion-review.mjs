import { readFileSync, writeFileSync } from "node:fs";

// Read prior research supplied on the command line; never publish local source paths.
const [priorDirectory, demandFile] = process.argv.slice(2);
if (!priorDirectory || !demandFile) throw new Error("Pass prior delivery directory and demand research JSON");
const prior = ["publication-candidates.json", "information-eligible-with-conditions.json"].flatMap(file => JSON.parse(readFileSync(`${priorDirectory}/${file}`, "utf8")));
const selectedIds = [
  "prior-hermes-h24-edt", "bulk-c955d30f5270", "prior-hermes-terre-edt",
  "bulk-0ee36f05556f", "prior-byredo-mojave", "prior-byredo-bal-dafrique",
  "prior-le-labo-the-noir29", "prior-le-labo-bergamote22", "prior-prada-luna-rossa",
  "prior-ysl-y-edt", "bulk-cde47b06a14f", "bulk-9dfa07cbaf07", "bulk-18e5857b841a",
  "bulk-980e9ca2057c", "bulk-e0ae28eb6473", "bulk-27e524102dce",
  "bulk-93200555d977", "bulk-35e1a58965d5", "bulk-bda379c42267",
];
const cleanUrl = value => { const url = new URL(value); url.searchParams.delete("rafcid"); return url.toString(); };
const rows = selectedIds.map(id => {
  const p = prior.find(p => p.id === id);
  if (!p) throw new Error(`Missing prior candidate: ${id}`);
  const offer = p.selectedOffer;
  return { id, brand: p.brand, name: p.name, concentration: p.concentration, gender: p.gender,
    officialURL: p.officialURL, officialNotes: p.officialNotes, notesCheckedAt: p.checkedAt,
    retailerURL: cleanUrl(offer.retailerURL), sizeMl: offer.volumeMl, priorImageURL: offer.imageURL,
    priorPriceJPY: offer.retailerPriceJPY, status: "pending_current_checks" };
});
const demand = JSON.parse(readFileSync(demandFile, "utf8")).products;
for (const id of ["chanel-allure-homme", "ysl-y-edp", "ysl-lhomme", "creed-himalaya"]) {
  const p = demand.find(p => p.id === id);
  rows.push({ id, brand: p.brand, name: p.name, concentration: p.concentration, gender: "men",
    officialURL: p.officialURL, officialNotes: p.officialNotes, notesCheckedAt: p.checkedAt,
    retailerURL: cleanUrl(p.rakutenURL), sizeMl: p.sizeMl, status: "pending_current_checks" });
}
writeFileSync("reports/catalogue-expansion-candidates-2026-11-28.json", JSON.stringify({ baselineProducts: 209, baselineBrands: 46, candidates: rows }, null, 2) + "\n");
console.log(rows.map(p => `${p.id} | ${p.brand} | ${p.name} | ${p.concentration} | ${p.sizeMl} | ${p.retailerURL}`).join("\n"));
