import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { loadFragrances } from './lib/fragrance-data.mjs';
import { englishRoute } from './lib/i18n.mjs';
import { sizeOptions, renderSizePicker, validGeneratedHtml } from './lib/size-picker.mjs';

assert.deepEqual(sizeOptions({sizes:[{volumeMl:100},{volumeMl:30},{volumeMl:30},{volumeMl:-1},{volumeMl:'50'}]}),[30,100]);
assert(!renderSizePicker({slug:'none',sizes:[]}).includes('<select'));
const sample={slug:'test',sizes:[{volumeMl:30,sourceUrl:'https://example.com/size',purchaseLinks:{rakuten:{url:'https://af.moshimo.com/af/c/click?test=1',volumeMl:30,verifiedAt:'2026-09-25',sourceUrl:'https://example.com/size'}}},{volumeMl:75}]};
assert(renderSizePicker(sample).includes('data-volume-ml="30"'));
sample.sizes[0].purchaseLinks.rakuten.volumeMl=100;
assert(!renderSizePicker(sample).includes('https://af.moshimo.com/af/c/click?test=1'));
sample.sizes[0].sourceUrl='javascript:alert(1)';
assert(!renderSizePicker(sample).includes('javascript:'));

// Exercise the shipped browser code without network requests or analytics events.
for (const lang of ['ja','en']) {
  let change;
  const select={value:'',addEventListener:(event,fn)=>{assert.equal(event,'change');change=fn;}};
  const status={textContent:''};
  const panels=[30,75].map(n=>({dataset:{sizePanel:String(n)},hidden:false}));
  const link={href:'https://example.com/unchanged',dataset:{}};
  const picker={addEventListener:()=>{},querySelector:q=>q==='[data-size-select]'?select:status,querySelectorAll:()=>panels};
  const document={documentElement:{lang},querySelectorAll:q=>q==='[data-size-picker]'?[picker]:[link]};
  runInNewContext(readFileSync('public/assets/size-picker.js','utf8'),{document});
  select.value='75'; change();
  assert.deepEqual(panels.map(p=>p.hidden),[true,false]);
  assert(status.textContent.includes('75'));
  assert.equal(link.href,'https://example.com/unchanged');
  assert.equal(link.dataset.requestedVolumeMl,'75');
  select.value=''; change();
  assert(panels.every(p=>!p.hidden));
  assert.equal(link.dataset.requestedVolumeMl,undefined);
}
let english=0;
const products=loadFragrances();
for (const slug of ['loewe-6','carolina-herrera-1']) {
  assert(products.find(p=>p.slug===slug).sizes.every(s=>!s.purchaseLinks?.official));
}
assert(!products.find(p=>p.slug==='loewe-5').sizes.find(s=>s.volumeMl===100).purchaseLinks?.official);
assert.equal(products.find(p=>p.slug==='carolina-herrera-1').purchaseLinks.official,null);
const fleur=products.find(p=>p.slug==='aux-paradis-1');
assert.deepEqual(fleur.sizes.map(s=>s.volumeMl),[15,30,60]);
assert.equal(fleur.sizes.find(s=>s.volumeMl===60).format,'refill-dropper');
assert(renderSizePicker(fleur).includes('詰め替え・スポイト'));
assert(renderSizePicker(fleur,'en').includes('refill / dropper, not a spray'));
assert(renderSizePicker(products.find(p=>p.slug==='jo-malone-1')).includes('PR：'));
assert(renderSizePicker(products.find(p=>p.slug==='jo-malone-1')).includes('楽天の商品ページでも'));
assert(!renderSizePicker(products.find(p=>p.slug==='jo-malone-1')).includes('data-purchase-shop="official"'));
const rawHtml=renderSizePicker(products.find(p=>p.slug==='j-scent-1'),'en');
assert(rawHtml.includes('lang="ja"'));
assert(rawHtml.includes('Check the price on Rakuten Japan'));
for(const p of products){
  const ja=readFileSync(`public/items/${p.slug}.html`,'utf8');
  const options=sizeOptions(p);
  for (const size of p.sizes || []) {
    if(size.format) assert(['spray','refill-dropper'].includes(size.format));
    for (const [shop, link] of Object.entries(size.purchaseLinks || {})) {
      assert(['official','rakuten','amazon'].includes(shop));
      assert.equal(link.volumeMl,size.volumeMl,`${p.slug}: mismatched size`);
      for (const url of [link.url,link.sourceUrl]) assert(['https:','http:'].includes(new URL(url).protocol));
      assert(/^\d{4}-\d{2}-\d{2}$/.test(link.verifiedAt));
      // 日付だけの確認日は日本時間で比較する（UTCの午前0時として解釈しない）。
      const todayJst = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
      assert(!Number.isNaN(Date.parse(link.verifiedAt)) && link.verifiedAt <= todayJst);
      if(link.generatedHtml){
        assert.equal(shop,'rakuten');
        assert(validGeneratedHtml(link),`${p.slug}: affiliate HTML changed`);
        assert(ja.includes(link.generatedHtml),`${p.slug}: original HTML missing`);
      }
    }
  }
  assert(ja.includes(renderSizePicker(p)),`Japanese picker: ${p.slug}`);
  assert(ja.includes('G-60BQRQWB5M'),`GA4: ${p.slug}`);
  const route=englishRoute(p);
  if(route){
    const en=readFileSync(`public${route}index.html`,'utf8');
    assert(en.includes(renderSizePicker(p,'en')),`English picker: ${p.slug}`);
    english++;
  }
  for(const volume of options) assert(ja.includes(`<option value="${volume}">`));
}
// Keep researched capacity additions attached to the exact product, not a similar neighbour.
for (const [slug, volumes] of Object.entries({
  'gucci-5': [90],
  'bvlgari-4': [100, 150],
  'bvlgari-5': [60, 100, 150],
  'loewe-6': [50, 100],
  'hugo-boss-6': [75, 125],
  'versace-6': [100],
  'acqua-di-parma-3': [50, 100, 180],
  'prada-7': [100],
  'giorgio-armani-4': [10, 50, 100, 150],
  'acqua-di-parma-5': [50, 100, 180],
  'maison-margiela-5': [10, 30, 100],
  'maison-margiela-6': [10, 30, 100],
  'maison-margiela-7': [100],
})) {
  const product = products.find(p => p.slug === slug);
  assert.deepEqual(product.sizes.map(s => s.volumeMl), volumes, `Researched sizes: ${slug}`);
}
assert(!products.find(p => p.slug === 'gucci-4').sizes.some(s => s.sourceUrl?.includes('613748999990099')), 'Guilty EDP must not be attached to Elixir');
console.log(`Size picker OK: ${products.length} Japanese / ${english} English pages; selection/reset, missing data, unsafe URL, mismatched volume, unchanged URLs.`);
