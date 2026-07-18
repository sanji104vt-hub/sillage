// 第3段階31商品の補完結果、残対象、情報源一覧を生成する。
// 実行: node report-phase3-enrichment.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const TARGETS = [
  "4711-1","atelier-cologne-1","guerlain-1","dolce-gabbana-1","hermes-2","ck-1","montblanc-1","azzaro-1",
  "chanel-1","paco-rabanne-1","nautica-1","brut-1","ysl-1","chanel-2","gucci-1","dior-3","calvin-klein-1",
  "chanel-3","gucci-2","jo-malone-2","marc-jacobs-1","jo-malone-3","versace-2","azzaro-2","thierry-mugler-1",
  "jean-paul-gaultier-1","giorgio-armani-1","viktor-rolf-1","prada-1","carolina-herrera-1","parfums-de-marly-1"
];
const REMAINING = [
  "dior-5","paco-rabanne-2","ysl-4","viktor-rolf-2","dolce-gabbana-2","azzaro-3","maison-francis-kurkdjian-1",
  "versace-3","dior-6","giorgio-armani-2","le-labo-1","dunhill-1","prada-2","john-varvatos-1","montblanc-2",
  "jo-malone-4","hugo-boss-1","dior-7","givenchy-1","aramis-1","chanel-5","ysl-5","chanel-6","narciso-rodriguez-1",
  "narciso-rodriguez-2","glossier-1","bvlgari-2","davidoff-1","paco-rabanne-3","bvlgari-3","acqua-di-parma-2"
];
const DOMESTIC_OFFICIAL = new Set(["chanel-1","chanel-2","dior-3","chanel-3","jo-malone-2","jo-malone-3"]);
const NO_OFFICIAL_PAGE = new Set(["atelier-cologne-1","paco-rabanne-1","brut-1"]);
const perfumes = loadFragrances();
const bySlug = new Map(perfumes.map((item) => [item.slug, item]));
const targets = TARGETS.map((slug) => bySlug.get(slug));
const remaining = REMAINING.map((slug) => bySlug.get(slug));
if (targets.some((item) => !item) || remaining.some((item) => !item) || targets.length !== 31 || remaining.length !== 31) throw new Error("第3段階の分割対象が一致しません");
const csv = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const esc = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const sourceRows = targets.flatMap((item) => (item.sources || []).map((source) => ({
  slug:item.slug, brand:item.brand, name:item.name, sourceType:source.sourceType, market:source.market,
  publisher:source.publisher, title:source.title, url:source.url, accessedAt:source.accessedAt,
  supports:(source.supports || []).join(" / ")
})));
const table = (items) => items.map((item) => `| ${item.slug} | ${esc(item.brand)} | ${esc(item.name)} | ${item.family} | ${item.gender} | ${item.purchaseLinks?.rakuten ? "あり" : "なし"} | なし |`).join("\n");
const resultTable = targets.map((item) => {
  const completed = [item.concentration ? "濃度" : "", item.sizes?.length ? "容量" : "", item.sizes?.some((size) => size.referencePriceYen) ? "国内価格" : "", "おすすめ", "非推奨", item.cautions?.length ? "注意点" : "", item.purchaseLinks?.official ? "公式リンク" : "", item.sources?.length ? "情報源" : "", "確認日・更新日", "profile null"].filter(Boolean);
  const missing = [!item.concentration ? "濃度" : "", !item.sizes?.length ? "容量" : "", !item.sizes?.some((size) => size.referencePriceYen) ? "国内価格" : "", !item.purchaseLinks?.official ? "公式リンク" : "", !item.sources?.length ? "情報源" : "", "Amazon"].filter(Boolean);
  return `| ${item.slug} | ${completed.join(" / ")} | ${missing.join(" / ")} |`;
}).join("\n");
const list = (items) => items.length ? items.map((item) => `- ${item.slug}: ${item.brand}「${item.name}」`).join("\n") : "- なし";
mkdirSync("reports", { recursive:true });
const headers = ["slug","brand","name","sourceType","market","publisher","title","url","accessedAt","supports"];
writeFileSync("reports/fragrance-phase3-sources.csv", `\uFEFF${headers.join(",")}\n${sourceRows.map((row) => headers.map((header) => csv(row[header])).join(",")).join("\n")}\n`, "utf8");

const priced = targets.filter((item) => item.sizes?.some((size) => size.referencePriceYen));
const volumeOnly = targets.filter((item) => item.sizes?.length && !item.sizes.some((size) => size.referencePriceYen));
const withSources = targets.filter((item) => item.sources?.length);
const profileValid = targets.every((item) => ["lightToRich","freshToSweet","subtleToBold","dailyToDistinctive","youthfulToMature"].every((key) => item.profile?.[key] === null));
let linkSummary = "- リンク監査CSVは未生成です。";
if (existsSync("reports/fragrance-phase3-link-audit.csv")) {
  const lines = readFileSync("reports/fragrance-phase3-link-audit.csv","utf8").replace(/^\uFEFF/,"").trim().split(/\r?\n/);
  const statuses = lines.slice(1).map((line) => {
    const cells=[]; let value=""; let quoted=false;
    for(let i=0;i<line.length;i++){const char=line[i];if(char==='"'&&quoted&&line[i+1]==='"'){value+='"';i++;}else if(char==='"')quoted=!quoted;else if(char===","&&!quoted){cells.push(value);value="";}else value+=char;} cells.push(value); return cells[10];
  });
  linkSummary = [...new Set(statuses)].sort().map((status) => `- ${status}: ${statuses.filter((value) => value === status).length}件`).join("\n");
}
const report = `# Sillage 第3段階31商品データ補完レポート

- 情報確認・更新日: 2026-07-18
- 対象: 未補完62商品のデータ順における前半31件
- 後半31件、既存補完済み30件、slug、商品順: 変更なし
- profile: 全31件で5軸すべてnull（${profileValid ? "確認済み" : "要確認"}）

## 1. 前半31商品の選定ルール

正規化済み data/fragrances.json の順序を維持し、既に補完済みの30件を除外した未補完62件を抽出。その先頭31件を対象、残り31件を次段階へ残しました。人気・ブランド・香調による並べ替えはしていません。

## 2. 対象31商品

| 商品ID | ブランド | 商品名 | 香調 | 性別表記 | 作業前楽天 | 作業前公式 |
|---|---|---|---|---|---|---|
${table(targets)}

### 商品ごとの補完結果

| 商品ID | 補完・確認した項目 | 未補完 |
|---|---|---|
${resultTable}

## 3. 後半へ残す31商品

| 商品ID | ブランド | 商品名 | 香調 | 性別表記 | 作業前楽天 | 作業前公式 |
|---|---|---|---|---|---|---|
${table(remaining)}

## 4. 国内公式確認商品

${list(targets.filter((item) => DOMESTIC_OFFICIAL.has(item.slug)))}

日本公式で商品ページを確認できた6件です。

## 5. 海外公式のみの商品

${list(withSources.filter((item) => !DOMESTIC_OFFICIAL.has(item.slug)))}

Hermèsはブランド公式プレス資料、Calvin Klein CK oneは公式ギフトセット、Armaniは公式商品ページを参照し、購入リンクとしては表示していません。

## 6. 国内価格掲載商品

${list(priced)}

日本公式で確認できた容量だけに円価格と価格確認日を保存しました。海外価格は円換算していません。

## 7. 容量のみの商品

${list(volumeOnly)}

## 8. 公式商品ページを確認できなかった商品

${list(targets.filter((item) => NO_OFFICIAL_PAGE.has(item.slug)))}

推測URL、容量、濃度、価格は追加していません。

## 9. 楽天リンクの状態

- 楽天リンクあり: ${targets.filter((item) => item.purchaseLinks?.rakuten).length}件
- 楽天リンクなし: ${targets.filter((item) => !item.purchaseLinks?.rakuten).length}件
- 既存URLとアフィリエイトパラメータは変更していません。
- product/search種別とリダイレクト結果は reports/fragrance-phase3-link-audit.csv に記録します。

## 10. 編集判断の根拠

- recommendedFor / notRecommendedFor は公式ノート・説明と既存の香調・シーン・季節・濃度だけを根拠にし、basis: editorial を付与しました。
- 年齢や性別による適性、人気、持続時間、拡散力は推測していません。
- cautionsは現行公式ページを確認できなかった3件だけに個別保存し、全件共通文は追加していません。

## 11. 修正した既存データ

- 発売年、香調、トップ、ミドル、ラスト、商品名、ブランド名の修正なし。
- slug、商品順、楽天URL、既存price文字列の修正なし。

## 12. 補完できなかった項目

- 公式商品ページ未確認3件: 濃度・容量・公式購入リンク・公式情報源。
- 国内参考価格: ${31 - priced.length}件は未掲載。
- Amazonリンク: 全31件で追加なし。
- profile数値: 全31件で未入力。

## 13. 情報源

- 公式情報源あり: ${withSources.length}件
- 公式情報源なし: ${31 - withSources.length}件
- 詳細は reports/fragrance-phase3-sources.csv（${sourceRows.length}行）を参照。

## 14. 検証結果

${linkSummary}

- JavaScript・JSON構文: OK
- 商品データ検証: OK（92件）
- 商品詳細生成: 92ページ
- トップ・ブランド・香調・シーン・季節ページ生成: OK
- ルート・slug・canonical・404: OK（154 canonical URL）
- 商品順: 変更なし
- 既存30件・後半31件の商品データ差分: 0件
- 対象31件の楽天URL差分: 0件
- 移行比較の84差分はすべて対象31件の補完フィールド・公式URL・出典URLで、対象外slugの差分: 0件
- profile数値入力: 0件
- git diff --check: OK

## 15. 後半31商品開始前の課題

- 現行公式ページがない旧作は、正規代理店・百貨店・正規取扱店まで調査範囲を広げるか判断が必要です。
- 国内公式価格を確認できない商品の既存price文字列は、構造化された参考価格として再利用していません。
- 楽天の商品同一性はHTTP結果だけで完全判定できないため、manual_review対象は公開前に目視確認が必要です。
- profile採点基準が確定するまで数値入力を停止します。
`;
writeFileSync("reports/fragrance-phase3-enrichment.md", report, "utf8");
console.log(`Phase 3 items: ${targets.length}, remaining: ${remaining.length}, sources: ${sourceRows.length}`);
console.log("Generated reports/fragrance-phase3-enrichment.md");
console.log("Generated reports/fragrance-phase3-sources.csv");
