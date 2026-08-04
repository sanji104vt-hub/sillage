// 商品画像が「実写として実際に届いているか」を、外部URLに実リクエストを投げて監査する。
// 実行: node audit-product-images.mjs
//
// validate-fragrances.mjs とは役割を分けている:
//   validate-fragrances.mjs = 通信なし・結果が確定的。壊れていれば必ず落ちる。
//   このスクリプト            = 外部通信あり。楽天側の一時障害やレート制限で結果が揺れるため、
//                             デプロイを止める検証には使わず、手動または定期実行で使う。
//
// 判定方針（Sillageでの「画像あり」の定義）:
//   実写の商品画像が実際に表示される状態のみを「画像あり」とする。
//   img が自ドメインの意匠画像(/img/products/*)を指す商品は「実写なし」に数える。
import { existsSync, readFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const CONCURRENCY = 4;
const TIMEOUT_MS = 15000;
const UA = "Mozilla/5.0 (compatible; SillageImageAudit/1.0; +https://sillage.asutelu.com/)";

const fragrances = loadFragrances();

async function probe(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // 楽天CDNはHEADに正しく答えない場合があるためGETで取得し、実体の型とサイズを見る
    const response = await fetch(url, { headers: { "user-agent": UA }, signal: controller.signal });
    const bytes = (await response.arrayBuffer()).byteLength;
    const type = response.headers.get("content-type") || "";
    return { status: response.status, type, bytes, ok: response.ok && type.startsWith("image/") && bytes > 1000 };
  } catch (error) {
    return { status: "ERR", type: error.name === "AbortError" ? "timeout" : error.message, bytes: 0, ok: false };
  } finally {
    clearTimeout(timer);
  }
}

const external = [];
const designOnly = [];
const noImage = [];
for (const item of fragrances) {
  if (!item.img) noImage.push(item.slug);
  else if (String(item.img).startsWith("/img/products/")) designOnly.push(item.slug);
  else external.push(item);
}

const results = [];
const queue = [...external];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const item = queue.shift();
      results.push({ slug: item.slug, url: item.img, ...(await probe(item.img)) });
    }
  }),
);
results.sort((a, b) => a.slug.localeCompare(b.slug));

const broken = results.filter((result) => !result.ok);
const fallbackPath = (item) => item.designImage
  ? `public${item.designImage}`
  : String(item.img || "").startsWith("/img/products/")
  ? `public${item.img}`
  : `public/img/products/${item.slug}.png`;
const missingFallback = fragrances.filter((item) => !existsSync(fallbackPath(item)));

console.log(`商品総数: ${fragrances.length}`);
console.log(`実写URL登録あり: ${external.length}`);
console.log(`意匠画像を直接指定（実写なし）: ${designOnly.length}${designOnly.length ? ` — ${designOnly.join(", ")}` : ""}`);
console.log(`img未設定（実写なし）: ${noImage.length}${noImage.length ? ` — ${noImage.join(", ")}` : ""}`);
console.log(`実写が実際に表示される商品: ${external.length - broken.length} / ${fragrances.length}`);

if (broken.length) {
  console.error("\n実写画像が届いていない商品:");
  for (const result of broken) {
    console.error(`- ${result.slug}: ${result.status} ${result.type} ${result.bytes}B\n  ${result.url}`);
  }
}
if (missingFallback.length) {
  console.error("\n意匠画像（フォールバック）が存在しない商品:");
  for (const item of missingFallback) console.error(`- ${item.slug}: ${fallbackPath(item)}`);
}

if (broken.length || missingFallback.length) {
  process.exitCode = 1;
} else {
  console.log("\n商品画像監査: OK（登録済みの実写URLはすべて画像として応答）");
}
