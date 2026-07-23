import { readFileSync, readdirSync } from "node:fs";
import { loadSiteCopy } from "./lib/site-copy.mjs";

const copy = loadSiteCopy();
const index = readFileSync("public/index.html", "utf8");
const requiredHomepageValues = [
  copy.title,
  copy.description,
  copy.heroProductLine,
  copy.footerCopyright,
  "G-60BQRQWB5M",
  "UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q",
  "/manifest.webmanifest",
];

for (const value of requiredHomepageValues) {
  if (!index.includes(value)) throw new Error(`public/index.html: ${value} が見つかりません`);
}

for (const match of index.matchAll(
  /<script(?: id="[^"]+")? type="application\/ld\+json">([\s\S]*?)<\/script>/g,
)) {
  JSON.parse(match[1]);
}

const columnFiles = readdirSync("public/columns").filter((file) => file.endsWith(".html"));
for (const file of columnFiles) {
  const html = readFileSync(`public/columns/${file}`, "utf8");
  for (const value of [
    copy.footerLabel,
    "G-60BQRQWB5M",
    "UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q",
  ]) {
    if (!html.includes(value)) throw new Error(`${file}: ${value} が見つかりません`);
  }
}

const manifest = JSON.parse(readFileSync("public/manifest.webmanifest", "utf8"));
if (manifest.description !== copy.description || manifest.short_name !== copy.shortName) {
  throw new Error("manifest.webmanifest が data/site-copy.json と一致しません");
}

console.log(
  `Site copy valid: ${columnFiles.length} columns, ${Buffer.byteLength(index)} homepage bytes`,
);
