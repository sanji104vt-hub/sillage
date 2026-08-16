// B. 画像とページの死活。
//
// 自サイトへのアクセスなので並列で構わないが、同時接続は10までに抑える。
// 過去に削除した商品・ブランドは 410 を返す。これは意図した状態なので正常扱い。

const CONCURRENCY = 5;
// Range 付きGETは 206 Partial Content を返す。これは成功。
// 410 は過去に意図的に取り下げたURLなので正常扱い。
const OK_STATUS = new Set([200, 206, 410]);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOnce(url) {
  // 一部CDNは HEAD を返さないので GET で Range を絞る
  const res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" } });
  return { url, status: res.status, type: res.headers.get("content-type") || "" };
}

// 同時接続が重なると接続自体が弾かれることがある（初回実行で21件が該当し、
// 個別に叩くと全て200だった）。1度だけ間を置いて再試行し、誤検知を防ぐ。
async function head(url) {
  try {
    return await fetchOnce(url);
  } catch (first) {
    await wait(1500);
    try {
      return await fetchOnce(url);
    } catch (error) {
      return { url, status: 0, type: "", error: String(error?.message || error) };
    }
  }
}

async function pool(urls, worker) {
  const results = [];
  let cursor = 0;
  const runners = Array.from({ length: Math.min(CONCURRENCY, urls.length) }, async () => {
    while (cursor < urls.length) {
      const i = cursor++;
      results[i] = await worker(urls[i]);
    }
  });
  await Promise.all(runners);
  return results;
}

export async function checkAssets({ site, products, brandSlugs, columnSlugs, familyKeys, log = () => {} }) {
  const findings = [];
  const groups = [];

  const add = (level, code, title, detail) => findings.push({ level, code, title, detail });

  // B1 商品画像（楽天CDN・自ドメイン意匠画像の両方）
  groups.push(["B1", "商品画像", products.map((p) => (String(p.img || "").startsWith("http") ? p.img : `${site}${p.img}`))]);
  // B2 意匠画像
  // 意匠画像は designImage が指定されていればそちら（Lacoste の4商品は .svg）
  groups.push(["B2", "意匠画像", products.map((p) => `${site}${p.designImage || `/img/products/${p.slug}.png`}`)]);
  // B3 商品ページ
  groups.push(["B3", "商品ページ", products.map((p) => `${site}/items/${p.slug}`)]);
  // B4 ブランドページ
  groups.push(["B4", "ブランドページ", brandSlugs.map((s) => `${site}/brand-${s}.html`)]);
  // B5 コラム
  groups.push(["B5", "コラム", columnSlugs.map((s) => `${site}/columns/${s}`)]);
  // B6 OGP画像
  groups.push(["B6", "OGP画像", familyKeys.map((k) => `${site}/img/ogp/ogp-fam-${k}.png`)]);
  // B7 favicon一式
  groups.push(["B7", "favicon", [
    `${site}/favicon.svg`, `${site}/favicon.ico`, `${site}/apple-touch-icon.png`,
    `${site}/site.webmanifest`, `${site}/robots.txt`,
  ]]);

  const summary = [];
  for (const [code, label, urls] of groups) {
    await wait(300);   // グループ間に間を置き、まとめて弾かれるのを避ける
    const results = await pool(urls, head);
    const bad = results.filter((r) => !OK_STATUS.has(r.status));
    log(`  ${code} ${label.padEnd(12)} ${urls.length - bad.length}/${urls.length} OK`);
    summary.push({ code, label, total: urls.length, ng: bad.length });
    for (const r of bad) {
      // 画像は落ちても意匠画像へフォールバックするので中、ページは高。
      const level = code === "B1" ? "medium" : "high";
      add(level, code, `${label}が取得できません`, { url: r.url, status: r.status || "接続失敗", error: r.error });
    }
  }
  return { findings, summary };
}
