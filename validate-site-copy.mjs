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

const deferred = readFileSync("public/partials/home-deferred.html", "utf8");
const orderedHomeMarkers = [
  'id="find-fragrances"',
  'id="fragrances"',
  'class="beginner-nav"',
  'id="diagnosis"',
  'id="popular-guides"',
  'id="scent-guide"',
  "— interactive timeline",
  'id="brands"',
  "— reading",
  "— compare",
];
let previousIndex = -1;
for (const marker of orderedHomeMarkers) {
  const markerIndex = deferred.indexOf(marker);
  if (markerIndex < 0 || markerIndex <= previousIndex) {
    throw new Error(`ホームのセクション順が不正です: ${marker}`);
  }
  previousIndex = markerIndex;
}
if (!index.includes('href="#diagnosis">自分に合う香りを診断する</a>')) {
  throw new Error("ヒーローの診断CTAが実際の診断セクションを指していません");
}

console.log(
  `Site copy valid: ${columnFiles.length} columns, ${Buffer.byteLength(index)} homepage bytes`,
);
