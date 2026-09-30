import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Run the actual listeners together without sending analytics or opening ads.
const ja = readFileSync('public/items/jo-malone-1.html', 'utf8');
const legacy = [...ja.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('button_position:position'));
assert(legacy);
for (const lang of ['ja', 'en']) {
  for (const shop of ['official', 'rakuten']) {
    const documentListeners = [], events = [];
    let click, change;
    const select = {value:'', addEventListener:(_, fn) => {change = fn;}};
    const status = {textContent:''};
    const panel = {hidden:false, dataset:{sizePanel:'100'}};
    const body = {dataset:{itemName:'Test',itemBrand:'Test brand'}, getAttribute:() => ''};
    const picker = {addEventListener:(_, fn) => {click = fn;}, querySelector:q => q === '[data-size-select]' ? select : status, querySelectorAll:() => [panel]};
    const raw = shop === 'rakuten';
    const offer = {dataset:{productId:'test-1',volumeMl:'100'}};
    const link = {href:'https://example.com/product',dataset:raw ? {} : {productId:'test-1',volumeMl:'100',purchaseShop:shop},classList:{contains:() => shop==='official'},closest:q => q==='[data-size-picker]' ? picker : q==='.size-affiliate' && raw ? offer : null};
    const target = {closest:q => q==='a[data-store-link]' ? null : q==='a.buy' && raw ? null : link};
    const document = {body,documentElement:{lang},querySelector:() => body,querySelectorAll:q => q==='[data-size-picker]' ? [picker] : raw ? [] : [link],addEventListener:(name,fn) => {if(name==='click')documentListeners.push(fn);}};
    const window = {gtag:(...args) => events.push(args)};
    const context = {document,window,location:{pathname:lang==='ja'?'/items/test-1':'/en/fragrances/test/test/'}};
    runInNewContext(readFileSync('public/assets/size-picker.js','utf8'),context);
    runInNewContext(readFileSync('public/assets/analytics.js','utf8'),context);
    if(lang==='ja')runInNewContext(legacy,context);
    for(const requested of ['', '100', '']) {
      select.value=requested; change(); events.length=0;
      click({target}); documentListeners.forEach(fn => fn({target}));
      assert.equal(events.length,2,lang+' '+shop+': duplicate or missing event');
      assert.deepEqual(events.map(e=>e[1]),['purchase_link_click',shop+'_click']);
      for(const [, , params] of events) {
        assert.equal(params.volume_ml,100);
        assert.equal(params.requested_volume_ml,requested?100:undefined);
        assert.equal(params.button_position,'capacity');
        assert.equal(params.language,lang);
      }
    }
    window.gtag=() => {throw new Error('analytics unavailable');};
    assert.doesNotThrow(() => click({target}));
  }
}
console.log('Capacity tracking OK: Japanese/English, official/raw affiliate, unselected/selected/reset, no duplicates, analytics failure isolated.');
