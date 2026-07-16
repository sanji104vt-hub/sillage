// デプロイ後、sitemap内の正規URLをIndexNow対応検索エンジンへ通知する。
import { readFileSync } from "node:fs";

const SITE = "https://sillage.asutelu.com";
const HOST = "sillage.asutelu.com";
const KEY = "7f4d2c8b91e643a0b57c2d18e4f09a63";
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const sitemap = readFileSync("public/sitemap.xml", "utf8");
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

if (!urlList.length) throw new Error("sitemap.xmlにURLがありません");
if (urlList.some((url) => !url.startsWith(`${SITE}/`))) throw new Error("別ドメインのURLが含まれています");

let keyReady = false;
for (let attempt = 0; attempt < 5; attempt++) {
  try {
    const response = await fetch(KEY_LOCATION, { cache: "no-store" });
    keyReady = response.ok && (await response.text()).trim() === KEY;
  } catch {}
  if (keyReady) break;
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
if (!keyReady) throw new Error(`IndexNowキーを本番で確認できません: ${KEY_LOCATION}`);

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow送信失敗: ${response.status} ${await response.text()}`);
}

console.log(`IndexNow accepted ${urlList.length} canonical URLs (${response.status})`);
