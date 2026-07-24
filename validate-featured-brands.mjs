import { readFileSync } from "node:fs";

const partial = readFileSync("public/partials/home-deferred.html", "utf8");
const script = readFileSync("public/assets/home.js", "utf8");
const errors = [];

if (!partial.includes("<h2>注目ブランド</h2>")) errors.push("注目ブランド見出しがありません");
if (!partial.includes("人気・売上順位ではありません")) errors.push("選定基準の注記がありません");
if (partial.includes("ブランドランキング")) errors.push("根拠が曖昧なランキング表記が残っています");
if (!script.includes("function buildFeaturedBrands()")) errors.push("注目ブランド生成関数がありません");
if (script.includes("function buildRanking()")) errors.push("旧ランキング関数が残っています");
if (!script.includes('<span class="rk">PICK</span>')) errors.push("順位を示さないPICK表記がありません");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Featured brand labeling valid: no popularity or sales ranking claim");
