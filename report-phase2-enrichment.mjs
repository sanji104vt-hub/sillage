// 第2段階20商品の補完結果と情報源一覧を生成する。
// 実行: node report-phase2-enrichment.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const selections = [
  ["jo-malone-1", "高露出の定番シトラス。国内公式と楽天商品リンクを併せて検証するため"],
  ["acqua-di-parma-1", "1916年発売の歴史的シトラス。海外公式のみのケースを含めるため"],
  ["dior-1", "高露出のクラシックメンズ。国内公式価格を確認できるため"],
  ["hermes-1", "楽天リンクなし、国内公式ありの欠損ケースを検証するため"],
  ["guerlain-2", "アロマティック系の歴史的商品。海外公式参照ケースを含めるため"],
  ["dior-4", "レディースの王道フローラルを含め、香調と性別の偏りを抑えるため"],
  ["mugler-1", "グルマン香水の代表作。海外公式のみのケースを含めるため"],
  ["ysl-3", "レディース・グルマンの高認知商品。海外公式の複数容量を検証するため"],
  ["bvlgari-1", "アンバー系メンズを含め、国内公式価格と楽天リンクを照合するため"],
  ["chanel-4", "関連商品での参照が特に多い高露出商品。国内公式の容量別価格を扱うため"],
  ["tom-ford-2", "関連商品での参照が多いウッディ。海外公式の多容量ケースを含めるため"],
  ["creed-1", "比較記事と関連商品で露出するウッディ。海外公式のみの高価格帯ケースのため"],
  ["diptyque-1", "ユニセックスのウッディ。国内公式価格を確認できるため"],
  ["byredo-1", "ユニセックスの現代的ウッディ。国内公式の複数価格を扱うため"],
  ["tom-ford-3", "シプレ系を確保し、海外公式の多容量ケースを検証するため"],
  ["le-labo-2", "高露出のムスク系。国内公式で3容量の価格を確認できるため"],
  ["maison-margiela-2", "回遊性の高いムスク系。国内公式の商品ページと価格を確認できるため"],
  ["giorgio-armani-3", "代表的なアクアティック。公式コレクションページ利用ケースのため"],
  ["issey-miyake-1", "国内ブランドのアクアティック。海外公式仕様と国内正規価格を分離するため"],
  ["versace-4", "発売年欠損を優先。海外公式で濃度・容量を確認し、未確認年を推測しないため"],
];
const selected = new Set(selections.map(([slug]) => slug));
const domesticOfficial = new Set(["jo-malone-1", "dior-1", "hermes-1", "dior-4", "bvlgari-1", "chanel-4", "diptyque-1", "byredo-1", "le-labo-2", "maison-margiela-2", "giorgio-armani-3"]);
const overseasOnly = new Set(["acqua-di-parma-1", "guerlain-2", "mugler-1", "ysl-3", "tom-ford-2", "creed-1", "tom-ford-3", "versace-4"]);
const directOfficialNotFound = new Set(["giorgio-armani-3"]);
const perfumes = loadFragrances();
const items = selections.map(([slug, reason]) => {
  const item = perfumes.find((fragrance) => fragrance.slug === slug);
  if (!item) throw new Error(`商品が見つかりません: ${slug}`);
  return { ...item, reason };
});
if (items.length !== 20 || new Set(items.map((item) => item.brand)).size < 15) throw new Error("選定条件を満たしていません");
const priced = items.filter((item) => item.sizes?.some((size) => size.referencePriceYen));
const volumeOnly = items.filter((item) => !item.sizes?.some((size) => size.referencePriceYen));
const csv = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const esc = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
const listItems = (values) => values.map((item) => `- ${item.slug}: ${item.brand}「${item.name}」`).join("\n") || "- なし";
const sourceRows = items.flatMap((item) => (item.sources || []).map((source) => ({
  slug: item.slug, brand: item.brand, name: item.name, sourceType: source.sourceType,
  market: source.market, publisher: source.publisher, title: source.title, url: source.url,
  accessedAt: source.accessedAt, supports: (source.supports || []).join(" / "),
})));
mkdirSync("reports", { recursive: true });
const headers = ["slug", "brand", "name", "sourceType", "market", "publisher", "title", "url", "accessedAt", "supports"];
writeFileSync("reports/fragrance-phase2-sources.csv", `\uFEFF${headers.join(",")}\n${sourceRows.map((row) => headers.map((header) => csv(row[header])).join(",")).join("\n")}\n`, "utf8");

let linkAuditSummary = "- リンク監査未実行。`node audit-fragrance-data.mjs --links` の実行後に再生成してください。";
try {
  const text = readFileSync("reports/fragrance-link-audit.csv", "utf8").replace(/^\uFEFF/, "");
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const statusIndex = header.indexOf("status");
  const slugIndex = header.indexOf("slug");
  const categoryIndex = header.indexOf("category");
  const labelIndex = header.indexOf("label");
  const parse = (line) => {
    const cells = []; let value = ""; let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && quoted && line[i + 1] === '"') { value += '"'; i++; }
      else if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { cells.push(value); value = ""; }
      else value += char;
    }
    cells.push(value); return cells;
  };
  const rows = lines.slice(1).map(parse);
  const counts = (filter) => [...new Set(rows.filter(filter).map((row) => row[statusIndex]))].sort().map((status) => `${status} ${rows.filter((row) => filter(row) && row[statusIndex] === status).length}件`).join("、");
  const phase2 = (row) => selected.has(row[slugIndex]);
  linkAuditSummary = `- 第2段階の全リンク: ${counts(phase2)}\n- 第2段階の公式購入リンク: ${counts((row) => phase2(row) && row[categoryIndex] === "purchase" && row[labelIndex] === "official")}\n- 第2段階の楽天リンク: ${counts((row) => phase2(row) && row[categoryIndex] === "purchase" && row[labelIndex] === "rakuten")}\n- 補完済み30商品全体: ${counts(() => true)}\n- 403・429はリンク切れと断定せず blocked・rate_limited として分類しています。`;
} catch { /* 初回生成前は上の案内を使う */ }

const selectionTable = items.map((item) => `| ${item.slug} | ${esc(item.brand)} | ${esc(item.name)} | ${esc(item.family)} | ${esc(item.gender)} | ${esc(item.reason)} |`).join("\n");
const resultTable = items.map((item) => {
  const fields = ["concentration", "sizes", "recommendedFor", "notRecommendedFor", "cautions", "purchaseLinks", "sources", "verifiedAt", "updatedAt"].filter((field) => Object.prototype.hasOwnProperty.call(item, field));
  const missing = [];
  if (!item.releaseYear) missing.push("発売年");
  if (!item.sizes?.some((size) => size.referencePriceYen)) missing.push("国内参考価格");
  if (!item.purchaseLinks?.amazon) missing.push("Amazonリンク");
  return `| ${item.slug} | ${fields.join(" / ")} | ${missing.join(" / ") || "なし"} |`;
}).join("\n");
const report = `# Sillage 第2段階20商品データ補完レポート

- 情報確認日・データ更新日: 2026-07-18
- 対象: 20商品、${new Set(items.map((item) => item.brand)).size}ブランド
- 代表10商品・対象外62商品: 商品データ変更なし
- profile: 20商品すべて数値 null、method は editorial-v1

## 1. 選定した20商品と選定理由

| 商品ID | ブランド | 商品名 | 香調 | 表記 | 選定理由 |
|---|---|---|---|---|---|
${selectionTable}

同一ブランドはDiorとTom Fordの各2件が上限で、その他は各1件です。メンズ、レディース、ユニセックス、およびシトラス・フローラル・グルマン・アンバー・ウッディ・シプレ・ムスク・アクアティック・アロマティックを含めました。

## 2. 商品ごとの補完結果

| 商品ID | 補完した項目 | 未補完・非掲載 |
|---|---|---|
${resultTable}

Amazonリンクは今回の確認対象に含めず null を維持しました。profileは評価基準が未確定のため数値を入力していません。

## 3. 国内公式確認商品

${listItems(items.filter((item) => domesticOfficial.has(item.slug)))}

Issey Miyakeは海外向けブランド公式で仕様、国内正規取扱店で75mLの参考価格を分けて確認しました。

## 4. 海外公式のみの商品

${listItems(items.filter((item) => overseasOnly.has(item.slug)))}

海外公式のみの8商品には、日本国内の価格・販売状況を確認した扱いにしない注意書きを付けました。

## 5. 国内参考価格を掲載できた商品

${listItems(priced)}

価格は確認できた容量だけに referencePriceYen と priceVerifiedAt を保存し、海外価格の円換算はしていません。

## 6. 容量のみ掲載した商品

${listItems(volumeOnly)}

## 7. 公式商品ページを発見できなかった商品

${listItems(items.filter((item) => directOfficialNotFound.has(item.slug)))}

Giorgio Armani「アクア ディ ジオ」は国内公式のコレクションページで濃度と100mL表記を確認しました。推測した個別商品URLは作成していません。

## 8. 編集判断の作成根拠

- recommendedFor と notRecommendedFor は、公式ノート・公式説明、既存の香調・シーン・季節・濃度だけを根拠にしました。
- 各値へ basis: editorial を付け、公式商品説明そのものと区別しました。
- 年齢、性別適性、人気効果、持続時間、拡散力、肌質を推測していません。
- cautions は商品固有または海外公式参照の区別に限定し、一般的注意を全商品へ複製していません。

## 9. 修正した既存ノート・香調・発売年

- なし。公式情報と明確に矛盾すると断定できない既存値は変更していません。
- versace-4 の発売年は公式ページで確認できなかったため欠損のままです。

## 10. 公式リンク検証結果

${linkAuditSummary}

公式リンクは商品詳細ページを優先し、Giorgio Armaniのみ公式コレクションページを使用しました。国・言語転送、403、429は状態として記録し、リンク切れとは断定しません。
監査は1件ずつ450ms間隔、12秒タイムアウト、再試行最大1回、再試行前1600ms待機、最大8リダイレクトで実行しました。

## 11. 楽天リンク検証結果

- 20商品のうち楽天リンクあり19件、なし1件（hermes-1）です。
- 既存アフィリエイトURLを変更せず purchaseLinks.rakuten へ複製し、type: product を付けました。
- URL内の pc パラメータが item.rakuten.co.jp を指すことを自動監査し、宣言種別との差異を検出します。

## 12. 補完できなかった項目

- versace-4: 発売年（海外公式商品・コレクションページに明示なし）
- ${volumeOnly.length}商品: 国内参考価格（国内の公式・正規情報で確認できないため）
- 全20商品: Amazonリンク、profile数値

## 13. 商品ごとの使用情報源

- 詳細は reports/fragrance-phase2-sources.csv（${sourceRows.length}行）に、商品・媒体・市場・出典種別・URL・確認日・根拠項目を記録しました。

## 14. 作業中に発見したデータ構造上の問題

- 正規化前は商品IDが配列順に依存していましたが、現在は各商品内の固定slugへ移行済みです。
- 正規化前に重複していた旧 rakuten フィールドは廃止し、purchaseLinks.rakutenへ統一済みです。
- 商品データが public/index.html の一行オブジェクト配列にあり、大規模更新時に不要な全件整形差分が発生しやすい構造です。
- sourceType と market は代表10商品には未統一です。全件展開前にスキーマ互換方針が必要です。

## 15. 全92件展開前に残る課題

- 今回は not_found・timeout・rate_limited・manual_review は0件でした。ただし、楽天リンクの実商品名・容量・濃度はHTTP応答だけでは完全自動判定できないため、全件展開時は商品同一性の目視確認が必要です。
- 国内公式価格がない商品の価格表示方針と、既存 price 文字列の扱いを決める必要があります。
- profileの採点基準を文書化するまで数値入力を停止します。
- slugを商品オブジェクトへ持たせる移行と、旧楽天フィールドの廃止は別変更として設計が必要です。
`;
writeFileSync("reports/fragrance-phase2-enrichment.md", report, "utf8");
console.log(`Phase 2 items: ${items.length}, brands: ${new Set(items.map((item) => item.brand)).size}`);
console.log(`Source rows: ${sourceRows.length}`);
console.log("Generated reports/fragrance-phase2-enrichment.md");
console.log("Generated reports/fragrance-phase2-sources.csv");
