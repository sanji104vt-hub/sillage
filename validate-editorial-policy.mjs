import { readFileSync } from "node:fs";

const about = readFileSync("public/about.html", "utf8");
const errors = [];
const required = [
  "id=\"update-policy\"",
  "半年に一度を目安",
  "月1回を目安に自動監査",
  "404・410は要修正",
  "403・429・タイムアウト",
  "国内価格を確認できた時だけ",
  "推測で廃番扱いにはしません",
  "Sillageの見立て",
  "実際に試香し",
  "G-60BQRQWB5M",
  "UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q",
];

for (const text of required) {
  if (!about.includes(text)) errors.push(`編集方針の必須項目がありません: ${text}`);
}
if (about.includes("メンズを中心とした")) errors.push("総合香水サイトと矛盾する旧表現が残っています");

for (const file of [
  "public/items/dior-2.html",
  "public/columns/how-to-wear.html",
  "public/guides.html",
]) {
  const html = readFileSync(file, "utf8");
  if (!html.includes("/about.html#update-policy")) errors.push(`更新ポリシー導線がありません: ${file}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Editorial policy valid: schedule, evidence rules, corrections and cross-page links");
