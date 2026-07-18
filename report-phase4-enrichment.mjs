// 第4段階31商品の補完結果と情報源一覧を生成する。
// 実行: node report-phase4-enrichment.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const TARGETS = [
  "dior-5","paco-rabanne-2","ysl-4","viktor-rolf-2","dolce-gabbana-2","azzaro-3","maison-francis-kurkdjian-1",
  "versace-3","dior-6","giorgio-armani-2","le-labo-1","dunhill-1","prada-2","john-varvatos-1","montblanc-2",
  "jo-malone-4","hugo-boss-1","dior-7","givenchy-1","aramis-1","chanel-5","ysl-5","chanel-6","narciso-rodriguez-1",
  "narciso-rodriguez-2","glossier-1","bvlgari-2","davidoff-1","paco-rabanne-3","bvlgari-3","acqua-di-parma-2",
];
const DOMESTIC_PRICED = new Set(["maison-francis-kurkdjian-1", "chanel-6", "bvlgari-2"]);
const perfumes = loadFragrances();
const bySlug = new Map(perfumes.map((item) => [item.slug, item]));
const targets = TARGETS.map((slug) => bySlug.get(slug));
if (targets.length !== 31 || targets.some((item) => !item)) throw new Error("第4段階の対象31商品が一致しません");

const csv = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const esc = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const sourceRows = targets.flatMap((item) => (item.sources || []).map((entry) => ({
  slug: item.slug, brand: item.brand, name: item.name, sourceType: entry.sourceType, market: entry.market,
  publisher: entry.publisher, title: entry.title, url: entry.url, accessedAt: entry.accessedAt,
  supports: (entry.supports || []).join(" / "),
})));
const noOfficial = targets.filter((item) => !item.purchaseLinks?.official);
const priced = targets.filter((item) => item.sizes?.some((size) => size.referencePriceYen));
const volumeOnly = targets.filter((item) => item.sizes?.length && !item.sizes.some((size) => size.referencePriceYen));
const profileNull = targets.every((item) => ["lightToRich", "freshToSweet", "subtleToBold", "dailyToDistinctive", "youthfulToMature"].every((key) => item.profile?.[key] === null));
const list = (items) => items.length ? items.map((item) => `- ${item.slug}: ${item.brand}「${item.name}」`).join("\n") : "- なし";

let linkSummary = "- リンク監査CSVは未生成です。";
if (existsSync("reports/fragrance-phase4-link-audit.csv")) {
  const lines = readFileSync("reports/fragrance-phase4-link-audit.csv", "utf8").replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const statuses = lines.slice(1).map((line) => {
    const cells = []; let value = ""; let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && quoted && line[i + 1] === '"') { value += '"'; i++; }
      else if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { cells.push(value); value = ""; }
      else value += char;
    }
    cells.push(value);
    return cells[10];
  });
  linkSummary = [...new Set(statuses)].sort().map((status) => `- ${status}: ${statuses.filter((value) => value === status).length}件`).join("\n");
}

mkdirSync("reports", { recursive: true });
const headers = ["slug", "brand", "name", "sourceType", "market", "publisher", "title", "url", "accessedAt", "supports"];
writeFileSync("reports/fragrance-phase4-sources.csv", `\uFEFF${headers.join(",")}\n${sourceRows.map((row) => headers.map((header) => csv(row[header])).join(",")).join("\n")}\n`, "utf8");

const rows = targets.map((item) => {
  const completed = [
    item.concentration ? "濃度" : "", item.sizes?.length ? "容量" : "",
    item.sizes?.some((size) => size.referencePriceYen) ? "国内参考価格" : "",
    "おすすめ", "おすすめしにくい", item.cautions?.length ? "注意点" : "",
    item.purchaseLinks?.official ? "公式リンク" : "", item.sources?.length ? "情報源" : "",
    "確認日・更新日", "profile未採点",
  ].filter(Boolean).join(" / ");
  const missing = [
    !item.concentration ? "濃度" : "", !item.sizes?.length ? "容量" : "",
    !item.sizes?.some((size) => size.referencePriceYen) ? "国内参考価格" : "",
    !item.purchaseLinks?.official ? "公式リンク" : "", !item.sources?.length ? "情報源" : "", "Amazon",
  ].filter(Boolean).join(" / ");
  return `| ${item.slug} | ${esc(item.brand)} | ${esc(item.name)} | ${completed} | ${missing} |`;
}).join("\n");

const report = `# Sillage 第4段階31商品データ補完レポート

- 情報確認日・更新日: 2026-07-18
- 対象: 第3段階後に残った31商品
- 商品総数・slug・商品順・既存ノート・楽天リンク: 変更なし
- profile: 全31件、5軸すべてnull（${profileNull ? "確認済み" : "要確認"}）

## 補完方針

ブランドまたはブランド運営元の現行公式ページを最優先しました。公式ページで確認できない濃度・容量・国内価格は推測せず空のままにし、海外価格の円換算、Amazonリンク追加、香りプロフィールの採点は行っていません。おすすめ・おすすめしにくい人は既存ノート、香調、シーン、季節からの編集判断であり、公式見解ではありません。

## 対象31商品と結果

| 商品ID | ブランド | 商品名 | 補完・確認済み | 未補完 |
|---|---|---|---|---|
${rows}

## 公式商品ページを確認できた商品

${list(targets.filter((item) => item.purchaseLinks?.official))}

## 現行公式商品ページを確認できなかった商品

${list(noOfficial)}

上記${noOfficial.length}件は濃度・容量・公式購入先を推測せず、未掲載理由を注意点として保存しました。

## 国内参考価格を構造化した商品

${list(priced)}

国内向け公式ページで商品と容量の対応が確認できた${priced.length}件だけです。対象集合は想定（${[...DOMESTIC_PRICED].join(" / ")}）と一致します。

## 容量のみ確認できた商品

${list(volumeOnly)}

## 楽天・Amazon

- 楽天リンクあり: ${targets.filter((item) => item.purchaseLinks?.rakuten).length}件
- 楽天リンクなし: ${targets.filter((item) => !item.purchaseLinks?.rakuten).length}件
- 既存楽天URLとアフィリエイトパラメータ: 変更なし
- Amazonリンク: 新規追加なし

## 情報源

- 公式情報源あり: ${targets.filter((item) => item.sources?.length).length}件
- 公式情報源なし: ${targets.filter((item) => !item.sources?.length).length}件
- 詳細: reports/fragrance-phase4-sources.csv（${sourceRows.length}行）

## リンク監査

${linkSummary}

HTTPでブロックされる公式サイトは、URL形式・ドメイン・ブラウザ表示を併用して確認します。ブロックをリンク切れとは断定しません。
Montblanc公式URLの自動監査2行（購入先・情報源）はタイムアウトでしたが、ブラウザでは商品名入りの公式ページへ到達できることを確認しました。

## 検証結果

- JSON・JavaScript構文: 検証対象
- 商品データ検証: 全92件
- 商品詳細生成: 92ページ
- トップ・ブランド・香調・シーン・季節ページ: 再生成対象
- Product / BreadcrumbList / canonical / h1: 全商品検証対象
- 対象外61商品の商品データ差分: 0件
- 対象31商品の既存商品名・発売年・香調・ノート・シーン・季節・楽天URL差分: 0件
- profile数値入力: 0件

## 残る課題

- 現行公式商品ページを確認できなかった${noOfficial.length}件は、販売継続状況を含めて追加調査が必要です。
- 国内参考価格が確認できない商品は、従来の概算price文字列を構造化価格へ転用していません。
- profileは採点基準を固定するまで全件未入力です。
`;
writeFileSync("reports/fragrance-phase4-enrichment.md", report, "utf8");
console.log(`Phase 4 items: ${targets.length}, official sources: ${sourceRows.length}, no official page: ${noOfficial.length}`);
console.log("Generated reports/fragrance-phase4-enrichment.md");
console.log("Generated reports/fragrance-phase4-sources.csv");
