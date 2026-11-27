// Explicitly curated additions. Existing records and order must remain unchanged.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const day = '2026-11-28';
const selected = read('data/catalogue-expansion-selection-2026-11.json');
const candidates = read('reports/catalogue-expansion-candidates-2026-11-28.json').candidates;
const codes = new Map([...read('data/moshimo-expansion-2026-11.json').items, ...read('data/moshimo-expansion-extra-2026-11.json'), ...read('data/moshimo-expansion-replacements-2026-11.json')].map(p => [p.id, p]));
const path = 'data/fragrances.json';
let beforeText = readFileSync(path, 'utf8');
const document = JSON.parse(beforeText);
// These two unpublished drafts failed the final concentration/source check.
const withdrawnDrafts = ['azzaro-wanted-edp', 'azzaro-wanted-by-night-edp'];
if (document.fragrances.some(p => withdrawnDrafts.includes(p.slug))) {
  document.fragrances = document.fragrances.filter(p => !withdrawnDrafts.includes(p.slug));
  beforeText = JSON.stringify(document, null, 2) + '\n';
  writeFileSync(path, beforeText);
}
const additions = [];
for (const s of selected) {
  if (document.fragrances.some(p => p.slug === s.slug)) continue;
  const p = candidates.find(p => p.id === s.id), code = codes.get(s.id), check = p?.retailerCheck;
  if (!p || !code || code.url !== p.retailerURL) throw Error(`Missing exact generated code: ${s.id}`);
  if (check.status !== 200 || !/\/InStock$/.test(check.availability || '')) throw Error(`Retailer unavailable: ${s.id}`);
  if (!new RegExp(`\\b${p.sizeMl}\\s*ml\\b`, 'i').test(check.title)) throw Error(`Capacity mismatch: ${s.id}`);
  if (/テスター|訳あり|箱なし|ミニ香水|量り売り|小分け/.test(check.title)) throw Error(`Nonstandard bottle: ${s.id}`);
  if (!(Number(check.price) > 0) || !check.image?.startsWith('https://')) throw Error(`Missing price/image: ${s.id}`);
  if (p.referencePriceCapYen && Number(check.price) > p.referencePriceCapYen) throw Error(`Over reference price: ${s.id}`);
  const href = code.html.match(/<a href="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&').replace(/^\/\//, 'https://');
  const url = new URL(href);
  if (url.hostname !== 'af.moshimo.com' || url.searchParams.get('url') !== code.url || /rafcid/i.test(decodeURIComponent(href)) || !code.html.includes('width="1" height="1"')) throw Error(`Invalid generated code: ${s.id}`);
  const concentration = { EDT: 'Eau de Toilette', EDP: 'Eau de Parfum' }[p.concentration];
  if (!concentration) throw Error(`Unreviewed concentration: ${s.id}`);
  const notes = {};
  if (typeof p.officialNotes === 'string') {
    const pyramid = p.officialNotes.match(/^トップ：(.+) \/ ミドル：(.+) \/ ラスト：(.+)$/);
    if (pyramid) [notes.top, notes.mid, notes.last] = pyramid.slice(1).map(t => t.replace(/、/g, '・'));
    else notes.keyNotes = p.officialNotes.replace(/（素材・香調の説明のみ）/g, '').replace(/、/g, '・');
  } else if (p.officialNotes.top && p.officialNotes.middle && (p.officialNotes.base || p.officialNotes.last)) {
    notes.top = p.officialNotes.top.join('・'); notes.mid = p.officialNotes.middle.join('・'); notes.last = (p.officialNotes.base || p.officialNotes.last).join('・');
  } else if (p.officialNotes.elements?.length) notes.keyNotes = p.officialNotes.elements.join('・');
  else throw Error(`No official notes: ${s.id}`);
  const q = { ...p, ...s };
  if (!q.family || !q.verdict || !q.scenes?.length || !q.seasons?.length) throw Error(`Missing curation: ${s.id}`);
  const product = {
    slug: s.slug, brand: p.brand, name: p.name, gender: p.gender, family: q.family, ...notes, seasons: q.seasons, scenes: q.scenes,
    priceTier: Number(check.price) < 5000 ? 'petit' : Number(check.price) < 10000 ? 'mid' : 'high',
    price: `¥${Number(check.price).toLocaleString('ja-JP')}`, priceSource: 'rakuten', priceValue: Number(check.price), priceSize: `${p.sizeMl}mL`, priceFetchedAt: day, priceIsFrom: false,
    verdict: q.verdict, img: check.image, designImage: '/img/products/catalogue-fallback.svg',
    concentration: { value: concentration, label: { EDT: 'オードトワレ', EDP: 'オードパルファム' }[p.concentration] },
    sizes: [{ volumeMl: p.sizeMl, sourceUrl: p.retailerURL, purchaseLinks: { rakuten: { url: href, volumeMl: p.sizeMl, verifiedAt: day, sourceUrl: p.retailerURL, selectionRequired: false, generatedHtml: code.html, generatedHtmlSha256: createHash('sha256').update(code.html).digest('hex') } } }],
    recommendedFor: [], notRecommendedFor: [], cautions: [],
    profile: { method: 'editorial-v1', lightToRich: null, freshToSweet: null, subtleToBold: null, dailyToDistinctive: null, youthfulToMature: null },
    sources: [
      { url: p.officialURL, publisher: p.brand, title: `${p.brand} ${p.name} — 公式商品情報`, accessedAt: p.notesCheckedAt, sourceType: 'official', market: /\/jp\/|\.jp\//.test(p.officialURL) ? 'JP' : 'GLOBAL', supports: ['notes', 'concentration'] },
      { url: p.retailerURL, publisher: '楽天市場 掲載販売店', title: check.title.replace(/^【楽天市場】/, ''), accessedAt: day, sourceType: 'major-retailer', market: 'JP', supports: ['sizes', 'price'] },
    ],
    verifiedAt: p.notesCheckedAt, updatedAt: day,
    purchaseLinks: { official: { url: p.officialURL, verifiedAt: p.notesCheckedAt, type: 'product' }, amazon: null, rakuten: { url: href, verifiedAt: day, type: 'product' } },
  };
  if (document.fragrances.some(old => old.brand === product.brand && old.name === product.name && old.concentration?.value === concentration)) throw Error(`Duplicate: ${s.id}`);
  additions.push(product);
}
if (additions.length) {
  const end = beforeText.lastIndexOf('\n  ]');
  if (end < 0) throw Error('Unexpected document format');
  const text = beforeText.slice(0, end).trimEnd() + ',\n' + additions.map(p => JSON.stringify(p, null, 2).split('\n').map(l => '    ' + l).join('\n')).join(',\n') + beforeText.slice(end);
  const after = JSON.parse(text);
  if (JSON.stringify(after.fragrances.slice(0, document.fragrances.length)) !== JSON.stringify(document.fragrances)) throw Error('Existing products changed');
  writeFileSync(path, text);
}
const brands = read('data/brands.json');
for (const brand of [
  { name: 'Elizabeth Arden', country: 'US', founded: 1910, tier: 'midrange', desc: 'ニューヨークで始まったビューティーブランド。ホワイトティーなど、お茶を題材にしたフレグランスも展開する。' },
  { name: 'Lanvin', country: 'FR', founded: 1889, tier: 'luxury', desc: 'パリ発のメゾン。エクラ ドゥ アルページュとジャンヌ ランバンでは、花と果実の組み合わせの違いを比べられる。' },
  { name: 'Chloé', country: 'FR', founded: 1952, tier: 'luxury', desc: 'パリ発のファッションメゾン。ローズを軸にするクロエと、ミラベルやオークモスを組み合わせるノマドを展開する。' },
  { name: "Penhaligon's", country: 'UK', founded: 1870, tier: 'niche', desc: '英国で始まったフレグランスハウス。ルナは柑橘、花、ウッディノートを組み合わせるオードトワレ。' },
]) if (!brands.some(b => b.name === brand.name)) brands.push(brand);
writeFileSync('data/brands.json', JSON.stringify(brands, null, 2) + '\n');
const all = read(path).fragrances;
writeFileSync('reports/catalogue-expansion-publication-2026-11-28.json', JSON.stringify({
  checkedAt: day, baselineCount: 209, count: all.length, brands: brands.length,
  editorialBasis: '香調分類・シーン・季節・見立ては公表ノートを基にした編集上の案内。実使用レビュー・性能評価ではない。',
  datePolicy: '公式ノートは記録済み確認日を保持。再取得403を最新確認として扱わない。楽天の価格・在庫は2026-11-28に再確認。',
  added: selected.map(s => ({ id: s.id, slug: s.slug, brand: all.find(p => p.slug === s.slug).brand })),
  held: candidates.filter(p => !selected.some(s => s.id === p.id)).map(p => ({ id: p.id, name: p.name, reason: ['bulk-27e524102dce','bulk-93200555d977'].includes(p.id) ? '現在の公式URLで該当濃度のノートを再現できない／一般ページへ移動' : p.referencePriceCapYen && Number(p.retailerCheck?.price) > p.referencePriceCapYen ? '確認済み公式参考価格を超える出品' : p.retailerCheck?.status === 404 ? '販売ページ404' : '選定出品が在庫切れ' })),
}, null, 2) + '\n');
console.log(`Added ${additions.length}; total ${all.length}; brands ${brands.length}`);
