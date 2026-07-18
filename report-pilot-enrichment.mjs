// Sillageの代表10商品について、補完結果と出典一覧を生成する。
// 実行: node report-pilot-enrichment.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const fragrances = loadFragrances();

const selections = [
  ["muji-1", "必須対象。プチプラのシトラスで、楽天リンクなし・公式商品ページ未確認の欠損ケースを検証するため。"],
  ["dior-2", "関連商品導線で露出が多い主要ブランドのアロマティック。EDTと国内公式価格を検証するため。"],
  ["ysl-2", "フローラルの主要商品。EDPと複数容量、公式楽天リンクを持つケースを検証するため。"],
  ["versace-1", "フルーティ系の主要商品。EDTと海外公式情報、日本の楽天リンクを併存させるケースのため。"],
  ["tom-ford-1", "露出が多いグルマン。EDP・複数容量・楽天リンクなしの高価格帯ケースのため。"],
  ["maison-margiela-1", "露出が多いアンバー。EDTと複数容量、公式ノート構成が充実したケースのため。"],
  ["hermes-3", "露出が多いウッディ。EDT・国内公式価格・楽天リンクなしのケースのため。"],
  ["guerlain-3", "歴史的なシプレ。EDP・国内公式価格・公式在庫切れ表示のケースのため。"],
  ["shiro-1", "露出が多い国産ムスク。EDP・国内公式価格・公式在庫切れ表示のケースのため。"],
  ["aesop-1", "露出が多いアクアティック。EDP・国内公式価格・複数容量展開の一部確認ケースのため。"],
];

const items = selections.map(([slug, reason]) => {
  const item = fragrances.find((fragrance) => fragrance.slug === slug);
  if (!item) throw new Error(`商品が見つかりません: ${slug}`);
  return { ...item, reason };
});

const fields = ["concentration", "sizes", "recommendedFor", "notRecommendedFor", "cautions", "profile", "purchaseLinks", "sources", "verifiedAt"];
const present = (item, field) => {
  const value = item[field];
  if (field === "profile") return Boolean(value) && value.method === "editorial-v1";
  if (field === "purchaseLinks") return Boolean(value) && Object.values(value).some(Boolean);
  if (field === "concentration") return Boolean(value?.value && value?.label);
  return Array.isArray(value) ? value.length > 0 : value != null && value !== "";
};
const label = {
  concentration: "香水濃度", sizes: "容量・参考価格", recommendedFor: "おすすめする人",
  notRecommendedFor: "おすすめしにくい人", cautions: "商品固有の注意点", profile: "プロフィール構造",
  purchaseLinks: "購入リンク", sources: "情報源", verifiedAt: "情報確認日",
};
const esc = value => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const csv = value => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const rows = items.map((item) => {
  const completed = fields.filter((field) => present(item, field)).map((field) => label[field]);
  const missing = fields.filter((field) => !present(item, field)).map((field) => label[field]);
  return { item, completed, missing };
});

const sourceRows = items.flatMap((item) => (item.sources || []).map((sourceEntry) => ({
  商品ID: item.slug,
  ブランド: item.brand,
  商品名: item.name,
  種別: "公式",
  媒体名: sourceEntry.publisher,
  ページタイトル: sourceEntry.title,
  URL: sourceEntry.url,
  確認日: sourceEntry.accessedAt,
  根拠項目: (sourceEntry.supports || []).join(" / "),
})));

mkdirSync("reports", { recursive: true });
const sourceHeaders = ["商品ID", "ブランド", "商品名", "種別", "媒体名", "ページタイトル", "URL", "確認日", "根拠項目"];
writeFileSync(
  "reports/fragrance-pilot-sources.csv",
  `\uFEFF${sourceHeaders.join(",")}\n${sourceRows.map((row) => sourceHeaders.map((header) => csv(row[header])).join(",")).join("\n")}\n`,
  "utf8",
);

const table = rows.map(({ item, completed, missing }) =>
  `| ${item.slug} | ${esc(item.brand)} | ${esc(item.name)} | ${esc(completed.join("、") || "なし")} | ${esc(missing.join("、") || "なし")} |`,
).join("\n");
const sourceList = sourceRows.length
  ? sourceRows.map((row) => `- ${row.商品ID}: [${row.媒体名} — ${row.ページタイトル}](${row.URL})（${row.根拠項目}）`).join("\n")
  : "- なし";
const report = `# Sillage 代表10商品データ補完レポート

## 選定した10商品と理由

${items.map((item, index) => `${index + 1}. **${item.slug} — ${item.brand}「${item.name}」**\n   - ${item.reason}`).join("\n")}

10ブランド・10香調に分散し、楽天リンクあり7件／なし3件、EDT・EDPの両方を含めました。

## 商品ごとの補完結果

| 商品ID | ブランド | 商品名 | 補完できた項目 | 補完できなかった項目 |
|---|---|---|---|---|
${table}

プロフィールは全10件に構造だけを追加し、5軸の数値は評価基準未策定のためすべて null のままです。

## 使用した情報源

${sourceList}

詳細は reports/fragrance-pilot-sources.csv に、1商品・1情報源を1行として収録しています。

## 公式リンクを見つけられなかった商品

- muji-1 — 無印良品「オードトワレ シトラス」
  - 現行の公式商品ページを確認できなかったため、濃度・容量・公式購入リンク・出典は欠損のままです。

## データ構造上の問題

- 正規化前は商品データが public/index.html の大きなインライン配列にありましたが、現在は data/fragrances.jsonへ移行済みです。
- 正規化前は商品IDが配列順に依存していましたが、現在は各商品内の固定slugへ移行済みです。
- 既存の楽天URLと新しい purchaseLinks.rakuten が移行期間中は重複します。全件展開前に正規フィールドを一本化する必要があります。
- 既存の price は文字列の概算値で、確認日・容量・出典を持ちません。確認済み価格は sizes 内へ分離しました。
- sourceTypeは今回すべてブランド公式のため表示側で「公式」としています。正規取扱店を使う段階で列挙値を正式に定義する必要があります。

## 全92件へ展開する際に必要な工程の分類

### 自動化できる項目

- データ構造、日付形式、URL形式、容量・価格の数値検証
- 同一容量、出典URL、編集文言の重複検出
- 商品ページ生成、空セクション抑止、構造化データと内部リンクの回帰検査
- 補完前後の対象商品ID比較と、対象外商品への意図しないフィールド追加検出

### 人間の確認が必要な項目

- 同名商品の濃度・発売世代・容量違いの同定
- 公式ページと国内正規流通の販売状況、税込価格、リフィル仕様の確認
- 既存ノート構成と公式表現の対応確認
- recommendedFor、notRecommendedFor、商品固有cautionsの編集判断
- 楽天商品ページが対象濃度・容量と一致しているかの目視確認

## 更新日固定問題

- 原因は build-items.mjs の LAST_UPDATED 定数を全92ページへ出力していたことです。
- 定数を廃止し、商品データに updatedAt がある場合だけ「データ更新日」を表示します。
- 今回実際に変更した10件だけに updatedAt と verifiedAt を設定し、対象外82件へ日付を自動投入しません。
`;
writeFileSync("reports/fragrance-pilot-enrichment.md", report, "utf8");

console.log(`Pilot items: ${items.length}`);
console.log(`Source rows: ${sourceRows.length}`);
console.log("Generated reports/fragrance-pilot-enrichment.md");
console.log("Generated reports/fragrance-pilot-sources.csv");
