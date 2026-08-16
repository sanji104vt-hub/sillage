// レポート生成と GitHub Issue の起票。
//
// 正常な項目は件数だけにする。異常だけを詳しく書く。読む人の時間を守るため。
// Issue は深刻度「高」があるときだけ起票する。毎週必ず鳴らすと形骸化する。

import { execFileSync } from "node:child_process";

export function weekLabel(date = new Date()) {
  // JST基準。月内の第何週かは「その月の1日を含む週を第1週」とする。
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = jst.getUTCMonth() + 1;
  const d = jst.getUTCDate();
  const firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const week = Math.floor((d + firstDow - 1) / 7) + 1;
  return `${y}-${String(m).padStart(2, "0")}-W${week}`;
}

export function jstStamp(date = new Date()) {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const p = (n) => String(n).padStart(2, "0");
  return `${jst.getUTCFullYear()}-${p(jst.getUTCMonth() + 1)}-${p(jst.getUTCDate())} ${p(jst.getUTCHours())}:${p(jst.getUTCMinutes())} JST`;
}

const detailLines = (detail) =>
  Object.entries(detail || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

function section(title, list) {
  if (!list.length) return "";
  const body = list.map((f) => {
    const head = `### ${f.slug ? f.slug + " " : ""}${f.title}${f.known ? "（既知）" : ""}`;
    return [head, detailLines(f.detail)].filter(Boolean).join("\n");
  }).join("\n\n");
  return `\n## ${title}\n\n${body}\n`;
}

export function buildReport({ label, counts, findings, assetSummary, checkedRakuten, elapsedSec }) {
  const high = findings.filter((f) => f.level === "high");
  const medium = findings.filter((f) => f.level === "medium");
  const normal = checkedRakuten - new Set(high.concat(medium).map((f) => f.slug).filter(Boolean)).size;

  const assets = assetSummary.map((s) => `| ${s.code} ${s.label} | ${s.total - s.ng}/${s.total} |`).join("\n");

  return `# Sillage 週次監査 ${label}

実行日時: ${jstStamp()}
対象: 商品${counts.products} / ブランド${counts.brands} / コラム${counts.columns}
楽天API照合: ${checkedRakuten}件（所要 ${Math.round(elapsedSec)}秒）

## 概要

| 項目 | 結果 |
|---|---|
| 深刻度「高」 | ${high.length}件 |
| 深刻度「中」 | ${medium.length}件 |
| 異常なしの商品 | ${Math.max(normal, 0)}件 |

### 死活確認

| 対象 | 結果 |
|---|---|
${assets}
${section("深刻度「高」", high)}${section("深刻度「中」", medium)}
${high.length || medium.length ? "" : "\n異常は検出されませんでした。\n"}`;
}

// 同じ週に既にIssueがあればコメントを追加する。新規に立て続けない。
export function fileIssue({ label, high, repo }) {
  const title = `[監査] ${label} 要確認 ${high.length}件`;
  const body = [
    `週次監査で深刻度「高」を${high.length}件検出しました。`,
    "",
    ...high.map((f) => {
      const head = `### ${f.slug ? f.slug + " " : ""}${f.title}`;
      return [head, detailLines(f.detail)].filter(Boolean).join("\n");
    }),
    "",
    `レポート全文: \`reports/${label}.md\``,
  ].join("\n");

  const run = (args) => execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  let existing = "";
  try {
    existing = run(["issue", "list", "--repo", repo, "--label", "audit", "--state", "open",
      "--search", label, "--json", "number", "--jq", ".[0].number"]).trim();
  } catch { existing = ""; }

  if (existing) {
    run(["issue", "comment", existing, "--repo", repo, "--body", body]);
    return { action: "comment", number: existing };
  }
  const out = run(["issue", "create", "--repo", repo, "--title", title, "--body", body, "--label", "audit"]);
  return { action: "create", url: out.trim().split(/\s+/).pop() };
}
