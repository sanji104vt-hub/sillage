// A. 楽天リンクの健全性。
//
// 死活監視だけでは足りない。過去に起きた事故はいずれも「APIは正常に応答し、
// リンクも生きていた」状態で、リンク先が別商品・テスター品・別容量だった。
// だから商品名の一致まで見る。
//
// このスクリプトはデータを一切書き換えない。検知と報告だけを行う。

import { readFileSync } from "node:fs";
import { ENDPOINT, SLEEP_MS, parseRakutenTarget, parseSize, mlOf, lookup } from "../lib/rakuten.mjs";

const ALIASES = JSON.parse(readFileSync("data/brand-aliases.json", "utf8"));
const NAME_ALIASES = ALIASES._productNameAliases || {};

// 正規品でないことを示す語。掴んでいたら読者が意図しない品を買うことになる。
const EXCLUDE_WORDS = [
  "テスター", "TESTER", "訳あり", "箱なし", "外箱不良", "未使用品",
  "アウトレット", "中古", "詰め替え", "ミニ香水", "サンプル", "アトマイザー",
];

const PRICE_ALERT = 0.30;  // 前週比 ±30% 以上で警告

// 表記ゆれの吸収。「ヴェチバー」と「ベチバー」、「ジョーマローン」と
// 「ジョー マローン」を同じものとして扱う。
const norm = (s) => String(s || "")
  .normalize("NFKC")
  .replace(/ヴァ/g, "バ").replace(/ヴィ/g, "ビ").replace(/ヴェ/g, "ベ").replace(/ヴォ/g, "ボ").replace(/ヴ/g, "ブ")
  .toLowerCase()
  .replace(/[\s・･‐‑‒–—―ー－*＊]/g, "");

// 商品名は「ヴェルサーチェ 香水 メンズ エロス P・SP 100ml 送料無料 …」のように
// 装飾語が多く、厳密一致は使えない。2文字以上の語の半数以上が含まれるかで見る。
function nameOverlap(productName, itemName) {
  const hay = norm(itemName);
  const words = String(productName || "")
    .split(/[\s　・/／,、]+/)
    .map(norm)
    .filter((w) => w.length >= 2);
  if (!words.length) return { ratio: 1, matched: [], missing: [] };
  const matched = words.filter((w) => hay.includes(w));
  return {
    ratio: matched.length / words.length,
    matched,
    missing: words.filter((w) => !hay.includes(w)),
  };
}

function brandMatches(brand, itemName) {
  const hay = norm(itemName);
  const names = ALIASES[brand] || [brand];
  return names.some((alias) => hay.includes(norm(alias)));
}

export async function checkRakuten({ products, state, appId, accessKey, origin, log = () => {} }) {
  async function callApi(query) {
    const url = `${ENDPOINT}?format=json&applicationId=${appId}&accessKey=${accessKey}&${query}`;
    const response = await fetch(url, {
      headers: { Origin: origin, "User-Agent": "Mozilla/5.0 (compatible; SillageAuditBot/1.0)" },
    });
    const text = await response.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* 非JSONは扱えない */ }
    return { status: response.status, json, text };
  }

  const findings = [];
  const nextState = {};
  const targets = products.filter((p) => p.purchaseLinks?.rakuten?.url);
  let index = 0;

  for (const product of targets) {
    index++;
    // 既知の問題（needsCorrectLink）は警告レベルを下げる。毎週同じものを
    // 「高」で鳴らすと通知が形骸化するため。
    const known = Boolean(product.needsCorrectLink);
    const drop = (level) => (known && level === "high" ? "medium" : level);
    const add = (level, code, title, detail) =>
      findings.push({ slug: product.slug, level: drop(level), code, title, detail, known });

    const target = parseRakutenTarget(product.purchaseLinks.rakuten.url);
    if (!target) {
      add("high", "A1", "楽天リンクを解析できません", { link: product.purchaseLinks.rakuten.url });
      continue;
    }

    let result;
    try {
      result = await lookup({ callApi, product, target });
    } catch (error) {
      result = { hit: null, error: String(error?.message || error) };
    }
    log(`  ${String(index).padStart(3)}/${targets.length} ${result.hit ? "✓" : "✗"} ${product.slug}`);

    if (!result.hit) {
      // A1: 引けない。ただし大型店のショップ内検索は当たり外れがあり、
      // 同じリンクでも実行ごとに成功・失敗が入れ替わる（実測済み）。
      // 1回の失敗で「高」にすると毎週誤検知が出るので、継続性で判断する。
      //   前週も失敗 → 高（リンク先が消えた可能性）
      //   前週は成功 → 中（一時的な揺れの可能性）
      //   記録なし   → 価格取得の状態から推定。rakuten で取れている商品なら中。
      const prevEntry = state ? state[product.slug] : undefined;
      const everWorked = product.priceSource === "rakuten";
      let level = "medium";
      let note = "";
      if (prevEntry === null) { level = "high"; note = "前週も取得できていません（継続的な異常）"; }
      else if (prevEntry) { note = "前週は取得できていました（一時的な揺れの可能性）"; }
      else if (!everWorked) { note = "価格取得でも取得できていない既知の商品です（priceSource: manual-stale）"; }
      else { note = "前週の記録がありません。価格は取得できている商品なので一時的な可能性があります"; }

      add(level, "A1", "楽天APIで商品を特定できません", {
        リンク: target.url,
        理由: result.error || "検索でヒットなし",
        判断: note,
      });
      nextState[product.slug] = null;   // 次回、継続的な失敗として判定できるようにする
      continue;
    }

    const itemName = String(result.hit.itemName || "");
    const price = Number(result.hit.itemPrice) || null;
    const { size } = parseSize(itemName);
    const prev = state?.[product.slug] || null;

    // A2: ブランドと商品名の一致
    const brandOk = brandMatches(product.brand, itemName);
    // 掲載名がカナで楽天名が英語のことがある（例: エロス エナジー / Eros Energy）。
    // 別表記と分かっている組み合わせは辞書で救う。
    const aliasHit = (NAME_ALIASES[product.slug] || []).some((alias) => norm(itemName).includes(norm(alias)));
    const overlap = aliasHit ? { ratio: 1, missing: [] } : nameOverlap(product.name, itemName);
    if (!brandOk || overlap.ratio < 0.5) {
      // 楽天の商品名が英語表記だと、カナの掲載名とは機械的に比較できない。
      // ただし【正規品】【送料無料】のような装飾語に日本語が混ざるため、
      // 括弧内と定型語を落とした「本体」で日本語量を測る。
      // ブランドが一致していて本体が英語なら、別商品と断定せず「中」で人の目に回す。
      // 本体が日本語なのに語が一致しない場合は、同ブランドの別ラインを掴んでいる
      // 疑いが強いので「高」のままにする（過去の主要な事故がこれ）。
      const core = itemName
        .replace(/[【\[（(][^】\]）)]*[】\]）)]/g, " ")
        .replace(/送料無料|正規品|即納|あす楽|香水|メンズ|レディース|ユニセックス|ギフト|プレゼント|贈り物|海外通販|海外直送|当日出荷|宅配便/g, " ");
      const jp = (core.match(/[ぁ-んァ-ヶ一-龥]/g) || []).length;
      const undecidable = brandOk && jp < 4;
      add(undecidable ? "medium" : "high", "A2",
        undecidable ? "商品名を自動照合できません（楽天側が英語表記）" : "商品名が掲載内容と一致しません", {
          掲載: `${product.brand} / ${product.name}`,
          楽天: itemName,
          リンク: target.url,
          判定: `ブランド一致=${brandOk ? "あり" : "なし"} / 商品名の語の一致率=${Math.round(overlap.ratio * 100)}%`,
          未一致の語: overlap.missing.join("、") || "なし",
        });
    }

    // A3: 除外語（テスター・箱なしなど）
    const hits = EXCLUDE_WORDS.filter((w) => itemName.includes(w));
    if (hits.length) {
      add("high", "A3", "正規品でない可能性のある語が含まれます", {
        検出語: hits.join("、"),
        楽天: itemName,
        リンク: target.url,
      });
    }

    // A4: 価格の急変（前週比）
    if (prev && Number.isFinite(prev.price) && price && prev.price > 0) {
      const rate = (price - prev.price) / prev.price;
      if (Math.abs(rate) >= PRICE_ALERT) {
        add("medium", "A4", "価格が前週から急変しました", {
          前週: `¥${prev.price.toLocaleString("ja-JP")}`,
          今週: `¥${price.toLocaleString("ja-JP")}`,
          変動率: `${rate > 0 ? "+" : ""}${Math.round(rate * 100)}%`,
        });
      }
    }

    // A5: 容量の変化（同じリンクが別容量を返し始めた＝出品差し替えの疑い）
    if (prev && prev.size && size && mlOf(prev.size) !== mlOf(size)) {
      add("medium", "A5", "楽天が返す容量が前週から変わりました", {
        前週: prev.size, 今週: size, 楽天: itemName,
      });
    }

    nextState[product.slug] = { price, size, itemName, checkedAt: new Date().toISOString().slice(0, 10) };
  }

  return { findings, nextState, checked: targets.length };
}
