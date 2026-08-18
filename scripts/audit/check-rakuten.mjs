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

// カナの掲載名と英語表記の楽天商品名を照合するための補助。
//
// 楽天には「Versace Eros Energy by Versace for Men」のように商品名が全て英語の
// 出品がある。カナの掲載名とは日本語の語では比較できないので、掲載名をローマ字に
// 直してから文字の並びの重なりを見る。「エロス」→ erosu は "Eros" と十分重なるが、
// 「エナジー」→ enajii は "energy" とは重ならない。転写は不可逆なので完全一致は
// 期待せず、語の半数が重なるかで判断する。
const KANA_ROMAJI = [
  ["キャ","kya"],["キュ","kyu"],["キョ","kyo"],["シャ","sha"],["シュ","shu"],["ショ","sho"],
  ["チャ","cha"],["チュ","chu"],["チョ","cho"],["ニャ","nya"],["ニュ","nyu"],["ニョ","nyo"],
  ["ヒャ","hya"],["ヒュ","hyu"],["ヒョ","hyo"],["ミャ","mya"],["ミュ","myu"],["ミョ","myo"],
  ["リャ","rya"],["リュ","ryu"],["リョ","ryo"],["ギャ","gya"],["ギュ","gyu"],["ギョ","gyo"],
  ["ジャ","ja"],["ジュ","ju"],["ジョ","jo"],["ビャ","bya"],["ビュ","byu"],["ビョ","byo"],
  ["ピャ","pya"],["ピュ","pyu"],["ピョ","pyo"],["ティ","ti"],["ディ","di"],["デュ","du"],
  ["ファ","fa"],["フィ","fi"],["フェ","fe"],["フォ","fo"],["ウィ","wi"],["ウェ","we"],["ウォ","wo"],
  ["ア","a"],["イ","i"],["ウ","u"],["エ","e"],["オ","o"],
  ["カ","ka"],["キ","ki"],["ク","ku"],["ケ","ke"],["コ","ko"],
  ["サ","sa"],["シ","shi"],["ス","su"],["セ","se"],["ソ","so"],
  ["タ","ta"],["チ","chi"],["ツ","tsu"],["テ","te"],["ト","to"],
  ["ナ","na"],["ニ","ni"],["ヌ","nu"],["ネ","ne"],["ノ","no"],
  ["ハ","ha"],["ヒ","hi"],["フ","fu"],["ヘ","he"],["ホ","ho"],
  ["マ","ma"],["ミ","mi"],["ム","mu"],["メ","me"],["モ","mo"],
  ["ヤ","ya"],["ユ","yu"],["ヨ","yo"],
  ["ラ","ra"],["リ","ri"],["ル","ru"],["レ","re"],["ロ","ro"],
  ["ワ","wa"],["ヲ","o"],["ン","n"],
  ["ガ","ga"],["ギ","gi"],["グ","gu"],["ゲ","ge"],["ゴ","go"],
  ["ザ","za"],["ジ","ji"],["ズ","zu"],["ゼ","ze"],["ゾ","zo"],
  ["ダ","da"],["ヂ","ji"],["ヅ","zu"],["デ","de"],["ド","do"],
  ["バ","ba"],["ビ","bi"],["ブ","bu"],["ベ","be"],["ボ","bo"],
  ["パ","pa"],["ピ","pi"],["プ","pu"],["ペ","pe"],["ポ","po"],
  ["ッ",""],["ー",""],
];

function toRomaji(text) {
  let out = "";
  let rest = String(text || "").normalize("NFKC");
  outer: while (rest.length) {
    for (const [kana, romaji] of KANA_ROMAJI) {
      if (rest.startsWith(kana)) { out += romaji; rest = rest.slice(kana.length); continue outer; }
    }
    out += rest[0];
    rest = rest.slice(1);
  }
  return out.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// 最長共通部分列の長さ。転写のぶれを許容して重なりを測る。
function lcsLength(a, b) {
  const prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    let diag = 0;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = a[i - 1] === b[j - 1] ? diag + 1 : Math.max(prev[j], prev[j - 1]);
      diag = tmp;
    }
  }
  return prev[b.length];
}

// 掲載名をローマ字化し、英語の商品名と語ごとに突き合わせる。
function romajiOverlap(productName, itemName) {
  const hay = String(itemName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!hay) return { ratio: 0, missing: [] };
  const words = String(productName || "").split(/[\s　・/／,、]+/).filter(Boolean).map(toRomaji).filter((w) => w.length >= 3);
  if (!words.length) return { ratio: 0, missing: [] };
  const matched = words.filter((w) => lcsLength(w, hay) / w.length >= 0.7);
  return { ratio: matched.length / words.length, missing: words.filter((w) => lcsLength(w, hay) / w.length < 0.7) };
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
      // A1: 引けない。深刻度は前週からの状態遷移で決める。
      // 大型店のショップ内検索は当たり外れがあり、同じリンクでも実行ごとに
      // 成功・失敗が入れ替わる（実測済み）。単発の失敗を毎回「高」にすると
      // 誤検知が続いて通知が形骸化する。一方で「先週まで取れていた商品が
      // 消えた」のは最も検出したい事象なので、そこだけを「高」にする。
      //   前週 rakuten      → 高（商品が消えた可能性）
      //   前週 manual-stale → 中（取得できない状態が継続）
      //   前週の記録なし    → 中（初回のため判断不能）
      const prevEntry = state ? state[product.slug] : undefined;
      const prevSource = prevEntry ? prevEntry.priceSource : (prevEntry === null ? "manual-stale" : undefined);

      let level = "medium";
      let title = "楽天APIで商品を特定できません";
      let note = "";
      if (prevSource === "rakuten") {
        level = "high";
        title = "先週まで取得できていた商品が取得できなくなりました";
        note = "出品が取り下げられた可能性があります。リンク先を確認してください。";
      } else if (prevSource === "manual-stale") {
        title = "取得できない状態が継続しています";
        note = "前週も取得できていません。すぐの対応は不要ですが、続くようならリンクの差し替えを検討してください。";
      } else {
        title = "取得できませんでした（前週の記録なし）";
        note = "前週の記録がないため、消失か一時的な揺れか判断できません。翌週の結果と合わせて見てください。";
      }

      add(level, "A1", title, {
        リンク: target.url,
        理由: result.error || "検索でヒットなし",
        前週の状態: prevSource === "rakuten" ? "取得できていた" : prevSource === "manual-stale" ? "取得できていない" : "記録なし",
        判断: note,
      });
      // 次回の遷移判定のため、失敗も状態として残す
      nextState[product.slug] = { price: null, size: null, itemName: null, priceSource: "manual-stale", checkedAt: new Date().toISOString().slice(0, 10) };
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
    let overlap = aliasHit ? { ratio: 1, missing: [] } : nameOverlap(product.name, itemName);
    // 日本語の語で一致しないときは、掲載名をローマ字にして英語の商品名と突き合わせる。
    // 「エロス エナジー」と "Eros Energy" のような組み合わせをここで拾う。
    let viaRomaji = false;
    if (overlap.ratio < 0.5) {
      const r = romajiOverlap(product.name, itemName);
      if (r.ratio >= 0.5) { overlap = r; viaRomaji = true; }
    }
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

    nextState[product.slug] = { price, size, itemName, priceSource: "rakuten", checkedAt: new Date().toISOString().slice(0, 10) };
  }

  return { findings, nextState, checked: targets.length };
}
