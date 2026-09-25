// D. 店舗情報の鮮度。
//
// 都市記事（/columns/kyoto-fragrance-shops ほか）が載せている店舗の
// 公式URLと Google Maps のリンクは、店が閉まれば黙って死ぬ。
// 記事側は何も変わらないので、こちらから見に行かないと気づけない。
//
// 検知するだけで、データの自動削除はしない。閉店なのか一時的な障害なのか、
// URLが変わっただけなのかは、人が見ないと判断できないため。

const CONCURRENCY = 4;
// 一部の店舗サイトは Range 付きGETや HEAD を嫌うので通常のGETで見る。
// 403 は bot 避け（実ブラウザでは開ける）なので、落ちた扱いにはしない。
const OK_STATUS = new Set([200, 206, 403]);
const RETRY_WAITS = [1500, 4000];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOnce(url) {
  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; SillageStoreBot/1.0)" },
  });
  return { url, status: res.status, finalUrl: res.url };
}

async function probe(url) {
  let last;
  for (let attempt = 0; attempt <= RETRY_WAITS.length; attempt++) {
    if (attempt > 0) await wait(RETRY_WAITS[attempt - 1]);
    try { return await fetchOnce(url); }
    catch (error) { last = error; }
  }
  return { url, status: 0, error: String(last?.message || last) };
}

async function pool(items, worker) {
  const results = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await worker(items[i]);
    }
  }));
  return results;
}

// Google Maps の place_id が「実在するか」は、HTTPだけでは判定できない。
// /maps/place/?q=place_id:... は、存在しないIDでも 200 と同じHTMLを返し、
// 場所の解決はブラウザ上のJSが行うため、本文にも差が出ない（実測で確認済み）。
// 確実に判定するには Places API（APIキーが要る）を使うしかない。
//
// そこでここでは、HTTPで確かめられる範囲だけを検査する：
//   - URLが想定の形（https://www.google.com/maps/... に place_id を載せている）か
//   - place_id が Google の形式として復号できるか（base64url の protobuf）
// 「店が閉じて place_id ごと消えた」は拾えない。これは D1（公式URLの死活）と
// 記事の更新時の目視に頼る。拾えないことを報告にも書いて、取り違えないようにする。
function decodePlaceId(placeId) {
  if (!/^[A-Za-z0-9_-]{20,}$/.test(placeId)) return null;
  let buf;
  try { buf = Buffer.from(placeId.replace(/-/g, "+").replace(/_/g, "/"), "base64"); }
  catch { return null; }
  // 0x0a <len> 0x09 <cellId 8byte> 0x11 <featureId 8byte>
  if (buf.length < 20 || buf[0] !== 0x0a || buf[2] !== 0x09 || buf[11] !== 0x11) return null;
  return {
    cellId: "0x" + buf.readBigUInt64LE(3).toString(16),
    featureId: "0x" + buf.readBigUInt64LE(12).toString(16),
  };
}

function placeIdOf(url) {
  return String(url || "").match(/place_id:([A-Za-z0-9_-]+)/)?.[1] || null;
}

export async function checkStores({ stores, log = () => {} }) {
  const findings = [];
  const summary = [];
  const add = (level, code, title, detail) => findings.push({ level, code, title, detail });

  // D1 店舗の公式URL
  //
  // 百貨店のサイト（三越伊勢丹・高島屋など）は、ブラウザ以外のUAからの接続を
  // WAFが切る。実測では同じURLがブラウザからは200で開ける。これを「ページが
  // 壊れている」と報告すると毎週同じ誤報が出て、本当の404が埋もれる。
  // そこで「応答が返ってこなかった（判定できず）」と「サーバーがエラーを返した
  // （本当に壊れている）」を分けて扱う。
  const officialResults = await pool(stores, async (store) => ({ store, res: await probe(store.officialUrl) }));
  const broken = officialResults.filter(({ res }) => res.status !== 0 && !OK_STATUS.has(res.status));
  const unreachable = officialResults.filter(({ res }) => res.status === 0);
  const okCount = stores.length - broken.length - unreachable.length;
  log(`  D1 店舗公式URL   ${okCount}/${stores.length} OK`
    + (unreachable.length ? `（${unreachable.length}件は接続を拒否され判定できず）` : ""));
  summary.push({ code: "D1", label: "店舗公式URL", total: stores.length, ng: broken.length });
  for (const { store, res } of broken) {
    add("high", "D1", "店舗の公式URLがエラーを返しました", {
      店舗: `${store.nameJa}（${store.city}）`,
      url: store.officialUrl,
      status: res.status,
      判断: "閉店かURL変更の可能性があります。記事と data/stores.json の両方を確認してください（自動では消しません）。",
    });
  }
  for (const { store, res } of unreachable) {
    add("medium", "D1", "店舗の公式URLを判定できませんでした", {
      店舗: `${store.nameJa}（${store.city}）`,
      url: store.officialUrl,
      status: "接続拒否",
      error: res.error,
      判断: "ページが壊れているとは限りません。百貨店系サイトはブラウザ以外からの接続を遮断することがあり、その場合はブラウザで開けば正常です。手元で開いて確認してください。",
    });
  }

  // D2 Google Maps の place_id（形式のみ。ネットワークは使わない）
  const mapBad = stores.filter((store) => {
    const placeId = placeIdOf(store.googleMapsUrl);
    return !store.googleMapsUrl.startsWith("https://www.google.com/maps/")
      || !placeId || !decodePlaceId(placeId);
  });
  log(`  D2 place_idの形式 ${stores.length - mapBad.length}/${stores.length} OK（実在確認は Places API が必要なため未実施）`);
  summary.push({ code: "D2", label: "place_idの形式", total: stores.length, ng: mapBad.length });
  for (const store of mapBad) {
    add("high", "D2", "Google Maps のリンクが想定の形式ではありません", {
      店舗: `${store.nameJa}（${store.city}）`,
      url: store.googleMapsUrl,
      判断: "https://www.google.com/maps/place/?q=place_id:<ID> の形で、復号できる place_id を入れてください。",
    });
  }

  return { findings, summary };
}
