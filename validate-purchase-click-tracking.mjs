import { readFileSync } from "node:fs";
import { join } from "node:path";

const products = JSON.parse(readFileSync(join("data", "fragrances.json"), "utf8")).fragrances;
const errors = [];
let trackedLinks = 0;

for (const product of products) {
  const html = readFileSync(join("public", "items", `${product.slug}.html`), "utf8");
  const expected = Object.entries(product.purchaseLinks || {}).filter(([, link]) => link?.url);
  for (const [shop, link] of expected) {
    const shopMarker = `data-purchase-shop="${shop}"`;
    const productMarker = `data-product-id="${product.slug}"`;
    const occurrences = html.split(shopMarker).length - 1;
    if (occurrences !== 2) errors.push(`${product.slug}: ${shop}の計測リンクが上下2箇所ではありません (${occurrences})`);
    if (!html.includes(productMarker)) errors.push(`${product.slug}: product_idがありません`);
    if ((shop === "amazon" || shop === "rakuten") && !html.includes(`rel="nofollow sponsored noopener noreferrer"`)) {
      errors.push(`${product.slug}: ${shop}の広告relが不正です`);
    }
    if (shop === "official" && html.includes(`href="${link.url}" target="_blank" rel="nofollow sponsored`)) {
      errors.push(`${product.slug}: 公式リンクにsponsoredが付いています`);
    }
    trackedLinks += occurrences;
  }
  if (expected.length && !html.includes(`"purchase_link_click"`)) errors.push(`${product.slug}: GA4イベントがありません`);
  if (expected.length && !html.includes(`button_position:position`)) errors.push(`${product.slug}: ボタン位置がありません`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Purchase click tracking valid: ${products.length} pages, ${trackedLinks} rendered links`);
