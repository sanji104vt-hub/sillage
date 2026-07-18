// Sillageの全香水データを読み取り専用で監査し、CSVとMarkdownを生成する。
// 実行: node audit-fragrance-data.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadFragrances } from "./lib/fragrance-data.mjs";

const EXPECTED_TOTAL = 92;
const sourcePath = "public/index.html";
const source = readFileSync(sourcePath, "utf8");
const fragrances = loadFragrances();
const slugs = fragrances.map((item) => item.slug);

function extractArray(marker) {
  const start = source.indexOf(marker);
  const end = source.indexOf("\n];", start) + 2;
  if (start < 0 || end < 2) throw new Error(`${marker} を取得できません`);
  const text = source.slice(source.indexOf("[", start), end).replace(/,(\s*\])/g, "$1");
  return new Function(`return ${text}`)();
}

function extractObject(marker) {
  const start = source.indexOf(marker);
  const end = source.indexOf("};", start) + 1;
  if (start < 0 || end < 1) throw new Error(`${marker} を取得できません`);
  return new Function(`return ${source.slice(source.indexOf("{", start), end)}`)();
}

const families = extractArray("const FAMILIES = [");
const familyLabels = Object.fromEntries(families.map((family) => [family.key, family.ja]));
const sceneLabels = extractObject("const SCENE=");
const seasonLabels = extractObject("const SEASON=");

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
function pick(object, keys) {
  for (const key of keys) if (hasOwn(object, key)) return object[key];
  return undefined;
}
function pickWithPresence(object, keys) {
  for (const key of keys) if (hasOwn(object, key)) return { present: true, value: object[key], key };
  return { present: false, value: undefined, key: keys[0] };
}
function missing(value) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
function display(value) {
  if (missing(value)) return "";
  if (Array.isArray(value)) return value.some((item) => typeof item === "object") ? JSON.stringify(value) : value.join(" / ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
function normalizeText(value) {
  return String(value || "").normalize("NFKC").replace(/\s+/g, " ").trim();
}
function decodeHtml(value) {
  return String(value || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}
function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}
function percent(count) {
  return `${((count / fragrances.length) * 100).toFixed(1)}%`;
}
function escapeMarkdown(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}
function validExternalUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

const integrityErrors = [];
const linkAudit = {
  Amazon: { missing: 0, empty: [], invalid: [], values: new Map() },
  楽天: { missing: 0, empty: [], invalid: [], values: new Map() },
  公式: { missing: 0, empty: [], invalid: [], values: new Map() },
};

const rows = fragrances.map((fragrance, index) => {
  const id = slugs[index];
  if (!id) integrityErrors.push(`商品IDなし: index ${index}`);
  const itemPath = id ? `public/items/${id}.html` : "";
  let itemHtml = "";
  try { itemHtml = readFileSync(itemPath, "utf8"); }
  catch { integrityErrors.push(`商品ページなし: ${itemPath || `index ${index}`}`); }

  const compareArea = itemHtml.match(/<div class="compare-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[1] || "";
  const generatedRelated = [...compareArea.matchAll(/href="\/items\/([^"]+)"/g)].map((match) => match[1]);
  const related = [...new Set(display(pick(fragrance, ["related", "relatedItems"]))
    ? [display(pick(fragrance, ["related", "relatedItems"]))]
    : generatedRelated)];
  const seoTitle = decodeHtml(pick(fragrance, ["seoTitle"]) || itemHtml.match(/<title>(.*?)<\/title>/s)?.[1] || "");
  const seoDescription = decodeHtml(pick(fragrance, ["seoDescription"]) || itemHtml.match(/<meta name="description" content="([^"]*)">/)?.[1] || "");
  const updated = itemHtml.match(/データ更新日：([^<]+)</)?.[1]?.trim() || "";

  function structuredLink(platform, legacyKeys) {
    if (hasOwn(fragrance, "purchaseLinks") && hasOwn(fragrance.purchaseLinks || {}, platform)) {
      const entry = fragrance.purchaseLinks[platform];
      return { present: true, value: entry?.url ?? null, key: `purchaseLinks.${platform}` };
    }
    return pickWithPresence(fragrance, legacyKeys);
  }
  const profile = fragrance.profile;
  const profileValues = profile && ["lightToRich", "freshToSweet", "subtleToBold", "dailyToDistinctive", "youthfulToMature"]
    .some((key) => Number.isFinite(profile[key])) ? profile : undefined;

  const links = {
    Amazon: structuredLink("amazon", ["amazon", "amazonUrl"]),
    楽天: structuredLink("rakuten", []),
    公式: structuredLink("official", ["official", "officialUrl"]),
  };
  for (const [platform, entry] of Object.entries(links)) {
    const audit = linkAudit[platform];
    if (!entry.present) {
      audit.missing++;
      continue;
    }
    const value = String(entry.value ?? "").trim();
    if (!value) {
      audit.empty.push(id);
      continue;
    }
    if (!validExternalUrl(value)) audit.invalid.push({ id, value });
    const products = audit.values.get(value) || [];
    products.push(id);
    audit.values.set(value, products);
  }

  return {
    "商品ID": id || "",
    "ブランド": fragrance.brand,
    "商品名": fragrance.name,
    "香水濃度": fragrance.concentration?.label || pick(fragrance, ["strength"]),
    "容量": (fragrance.sizes || []).map((size) => `${size.volumeMl}mL`),
    "参考価格": (fragrance.sizes || []).filter((size) => size.referencePriceYen).map((size) => `${size.volumeMl}mL ${size.referencePriceYen}円`).join(" / ") || fragrance.price,
    "発売年": fragrance.releaseYear,
    "トップノート": fragrance.top,
    "ミドルノート": fragrance.mid,
    "ラストノート": fragrance.last,
    "香調": fragrance.family ? (familyLabels[fragrance.family] || fragrance.family) : "",
    "シーン": (fragrance.scenes || []).map((scene) => sceneLabels[scene] || scene),
    "季節": (fragrance.seasons || []).map((season) => seasonLabels[season] || season),
    "おすすめする人": (fragrance.recommendedFor || []).map((entry) => entry.text),
    "おすすめしにくい人": (fragrance.notRecommendedFor || []).map((entry) => entry.text),
    "注意点": pick(fragrance, ["cautions", "attention", "warnings"]),
    "香りプロフィール数値": profileValues || pick(fragrance, ["scentProfile", "profileScores", "scores"]),
    "Amazonリンク": links.Amazon.value,
    "楽天リンク": links.楽天.value,
    "公式リンク": links.公式.value,
    "関連商品": related,
    "SEOタイトル": seoTitle,
    "SEO説明": seoDescription,
    "情報出典": pick(fragrance, ["sources", "source", "citations"]),
    "__editorialDescription": fragrance.verdict || "",
    "__updated": updated,
  };
});

if (fragrances.length !== EXPECTED_TOTAL) integrityErrors.push(`商品総数が${EXPECTED_TOTAL}件ではありません: ${fragrances.length}`);
if (slugs.length !== fragrances.length) integrityErrors.push(`商品ID数と商品数が不一致: ${slugs.length}/${fragrances.length}`);

const auditFields = [
  "商品ID", "ブランド", "商品名", "香水濃度", "容量", "参考価格", "発売年", "トップノート", "ミドルノート", "ラストノート",
  "香調", "シーン", "季節", "おすすめする人", "おすすめしにくい人", "注意点", "香りプロフィール数値", "Amazonリンク",
  "楽天リンク", "公式リンク", "関連商品", "SEOタイトル", "SEO説明", "情報出典",
];

const missingCounts = Object.fromEntries(auditFields.map((field) => [field, 0]));
for (const row of rows) {
  row.__missing = auditFields.filter((field) => missing(row[field]));
  row.__missing.forEach((field) => missingCounts[field]++);
}

function duplicateGroups(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const normalized = normalizeText(entry.value);
    if (!normalized) continue;
    const list = groups.get(normalized) || [];
    list.push(entry);
    groups.set(normalized, list);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}

const duplicateEditorialDescriptions = duplicateGroups(rows.map((row) => ({ id: row["商品ID"], value: row.__editorialDescription })));
const duplicateSeoDescriptions = duplicateGroups(rows.map((row) => ({ id: row["商品ID"], value: row["SEO説明"] })));
const duplicateNotes = duplicateGroups(rows.map((row) => ({
  id: row["商品ID"],
  value: [row["トップノート"], row["ミドルノート"], row["ラストノート"]].map(normalizeText).join(" || "),
})));
const updateGroups = new Map();
for (const row of rows) {
  const value = row.__updated || "（更新日なし）";
  const ids = updateGroups.get(value) || [];
  ids.push(row["商品ID"]);
  updateGroups.set(value, ids);
}
const fixedUpdateDetected = updateGroups.size === 1 && [...updateGroups.values()][0].length === rows.length;

const byFewestMissing = [...rows].sort((a, b) => a.__missing.length - b.__missing.length || a["商品ID"].localeCompare(b["商品ID"], "en")).slice(0, 10);
const byMostMissing = [...rows].sort((a, b) => b.__missing.length - a.__missing.length || a["商品ID"].localeCompare(b["商品ID"], "en")).slice(0, 10);

mkdirSync("reports", { recursive: true });
const csvHeaders = [...auditFields, "欠損項目数", "欠損項目"];
const csvRows = rows.map((row) => csvHeaders.map((header) => {
  if (header === "欠損項目数") return row.__missing.length;
  if (header === "欠損項目") return row.__missing.join(" / ");
  return display(row[header]);
}).map(csvCell).join(","));
writeFileSync("reports/fragrance-data-audit.csv", `\uFEFF${csvHeaders.join(",")}\n${csvRows.join("\n")}\n`, "utf8");

function rankingTable(items) {
  return [
    "| 商品ID | ブランド | 商品名 | 欠損数 | 欠損項目 |",
    "|---|---|---|---:|---|",
    ...items.map((row) => `| ${escapeMarkdown(row["商品ID"])} | ${escapeMarkdown(row["ブランド"])} | ${escapeMarkdown(row["商品名"])} | ${row.__missing.length} | ${escapeMarkdown(row.__missing.join("、"))} |`),
  ].join("\n");
}

function duplicateSection(groups, valueLabel) {
  if (!groups.length) return "完全一致する重複は検出されませんでした。";
  return groups.map((group, index) => {
    const ids = group.map((entry) => entry.id).join("、");
    return `${index + 1}. ${valueLabel}: ${ids}\n   - 内容: ${group[0].value}`;
  }).join("\n");
}

const generatedAt = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
}).format(new Date());

const linkLines = Object.entries(linkAudit).flatMap(([platform, audit]) => {
  const duplicates = [...audit.values.entries()].filter(([, ids]) => ids.length > 1);
  return [
    `### ${platform}`,
    "",
    `- フィールド自体なし: ${audit.missing}件`,
    `- 空文字: ${audit.empty.length}件${audit.empty.length ? `（${audit.empty.join("、")}）` : ""}`,
    `- 不正形式: ${audit.invalid.length}件${audit.invalid.length ? `（${audit.invalid.map((entry) => `${entry.id}: ${entry.value}`).join("、")}）` : ""}`,
    `- 同一URLの重複グループ: ${duplicates.length}組`,
    ...duplicates.map(([url, ids]) => `  - ${ids.join("、")}：${url}`),
    "",
  ];
});

const updateLines = [...updateGroups.entries()].map(([value, ids]) => `- ${value}: ${ids.length}件`).join("\n");
const summary = `# Sillage 香水データ監査サマリー

- 監査日時（日本時間）: ${generatedAt}
- 監査対象: data/fragrances.json と public/items の生成済み商品ページ
- 商品総数: ${fragrances.length}件
- 推測補完: なし
- 商品データ・UIの変更: なし

## 判定方法

- 香水濃度・容量・おすすめ対象・注意点・プロフィール数値・外部リンク・情報出典は、専用フィールドが存在する場合だけ「あり」と判定しました。
- 商品名に「EDT」「EDP」が含まれていても、香水濃度として推測していません。
- 商品IDは data/fragrances.json 内の固定slug、関連商品・SEOタイトル・SEO説明・最終更新日は生成済み商品詳細HTMLを照合しました。
- 空文字、未定義、空配列、空オブジェクトを欠損として集計しました。
- 重複説明文とノート構成は、Unicode正規化・連続空白の統一後に完全一致で判定しました。
- 外部リンクは http/https URLとして解析でき、ホスト名が存在するかを検証しました。通信先へのアクセス確認は行っていません。

## 項目別の欠損数・欠損率

| 項目 | 欠損数 | 欠損率 |
|---|---:|---:|
${auditFields.map((field) => `| ${field} | ${missingCounts[field]} | ${percent(missingCounts[field])} |`).join("\n")}

## 欠損が少ない商品 10件

${rankingTable(byFewestMissing)}

## 欠損が多い商品 10件

${rankingTable(byMostMissing)}

## 外部リンク監査

${linkLines.join("\n")}
## 同一説明文の使い回し

### Sillageの見立て（商品説明）

${duplicateSection(duplicateEditorialDescriptions, "重複商品")}

### SEO説明

${duplicateSection(duplicateSeoDescriptions, "重複商品")}

## ノート構成が完全に同一の商品

${duplicateSection(duplicateNotes, "重複商品")}

## 最終更新日の一括固定値

- 一括固定値利用: ${fixedUpdateDetected ? "検出" : "未検出"}
${updateLines}

## 整合性エラー

${integrityErrors.length ? integrityErrors.map((error) => `- ${error}`).join("\n") : "- なし"}

## 出力ファイル

- reports/fragrance-data-audit.csv
- reports/fragrance-data-summary.md
- 監査再実行: node audit-fragrance-data.mjs
`;
writeFileSync("reports/fragrance-data-summary.md", summary, "utf8");

console.log(`Audited ${fragrances.length} fragrances`);
console.log("Generated reports/fragrance-data-audit.csv");
console.log("Generated reports/fragrance-data-summary.md");
if (integrityErrors.length) {
  integrityErrors.forEach((error) => console.error(error));
  process.exitCode = 1;
}
if (process.argv.includes("--links")) {
  const { runLinkAudit } = await import("./audit-fragrance-links.mjs");
  await runLinkAudit();
}
