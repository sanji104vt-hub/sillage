import { readFileSync } from "node:fs";
import vm from "node:vm";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const script = readFileSync("public/assets/quiz-recommendation.js", "utf8");
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(script, sandbox);

const recommend = sandbox.SillageQuizRecommendation?.recommend;
if (typeof recommend !== "function") throw new Error("商品推薦関数を読み込めません");

const fragrances = loadFragrances();
const families = [...new Set(fragrances.map((item) => item.family))];
const scenes = [...new Set(fragrances.flatMap((item) => item.scenes))];
const seasons = [...new Set(fragrances.flatMap((item) => item.seasons))];
const prices = [...new Set(fragrances.map((item) => item.priceTier))];
const validSlugs = new Set(fragrances.map((item) => item.slug));
const quietFamilies = new Set(["citrus", "musk", "aquatic", "aromatic"]);
const distinctiveFamilies = new Set(["chypre", "amber", "gourmand", "fruity", "floral"]);
let cases = 0;

for (const family of families) {
  for (const scene of scenes) {
    for (const season of seasons) {
      for (const price of prices) {
        const result = recommend(fragrances, {
          fam: { [family]: 3 },
          scene: { [scene]: 3 },
          season: { [season]: 3 },
          price: { [price]: 3 },
        });
        const products = [result.primary, result.calm, result.distinctive];
        const slugs = products.map((item) => item?.slug);
        if (products.some((item) => !item || !validSlugs.has(item.slug))) {
          throw new Error(`${family}/${scene}/${season}/${price}: 存在しない商品が推薦されました`);
        }
        if (new Set(slugs).size !== 3) {
          throw new Error(`${family}/${scene}/${season}/${price}: 推薦商品が重複しています`);
        }
        if (!quietFamilies.has(result.calm.family)) {
          throw new Error(`${family}/${scene}/${season}/${price}: 控えめな代替の香調が基準外です`);
        }
        if (!distinctiveFamilies.has(result.distinctive.family)) {
          throw new Error(`${family}/${scene}/${season}/${price}: 個性的な代替の香調が基準外です`);
        }
        cases++;
      }
    }
  }
}

const index = readFileSync("public/index.html", "utf8");
const fragment = readFileSync("public/partials/home-deferred.html", "utf8");
const homeScript = readFileSync("public/assets/home.js", "utf8");
const recommendationScriptIndex = index.indexOf("/assets/quiz-recommendation.js");
const homeScriptIndex = index.indexOf("/assets/home.js");

if (recommendationScriptIndex < 0 || recommendationScriptIndex > homeScriptIndex) {
  throw new Error("商品推薦スクリプトがhome.jsより先に読み込まれていません");
}
if (!fragment.includes("あなたに合う香水診断")) throw new Error("診断見出しが商品推薦向けではありません");
for (const role of ["第一候補", "控えめな代替", "個性的な代替"]) {
  if (!homeScript.includes(role)) throw new Error(`診断結果に「${role}」がありません`);
}
if (!homeScript.includes("ブランド傾向")) throw new Error("従来のブランド診断が補助結果として残っていません");

console.log(`Quiz recommendations valid: ${cases} attribute combinations, 3 unique products each`);
