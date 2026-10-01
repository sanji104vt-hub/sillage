import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadFragrances} from './lib/fragrance-data.mjs';
import {renderSizePicker} from './lib/size-picker.mjs';
const raw=JSON.parse(readFileSync('data/fragrances.json','utf8')).fragrances;
const mapped=loadFragrances();
const mapping=JSON.parse(readFileSync('data/moshimo-capacity-mapping.json','utf8'));
const audit=JSON.parse(readFileSync('reports/moshimo-capacity-target-audit.json','utf8'));
const generated=JSON.parse(readFileSync('data/moshimo-capacity-generated.json','utf8'));
const generatedAudit=JSON.parse(readFileSync('reports/moshimo-capacity-generated-audit.json','utf8'));
for(const offer of generated.items){
  const record=generatedAudit.records.find(r=>r.slug===offer.slug&&r.url===offer.url);
  assert.equal(record?.status,200,`Generated retailer page: ${offer.slug}`);
  for(const volume of offer.volumes) assert(record.titleVolumes.includes(volume),`${offer.slug}: generated capacity not in retailer title`);
}
for(const item of mapping.items){
  const record=audit.records.find(r=>r.slug===item.slug);
  assert.equal(record.status,200);
  assert.equal(record.url,item.url);
  assert.equal(record.affiliateUrl,item.affiliateUrl);
  for(const volume of item.volumes) assert(record.titleVolumes.includes(volume),`${item.slug}: capacity not in retailer title`);
}
for(let i=0;i<raw.length;i++){
  assert.equal(raw[i].slug,mapped[i].slug,'Product order preserved');
  const before=structuredClone(raw[i]), after=structuredClone(mapped[i]);
  for(const s of before.sizes||[]) delete s.purchaseLinks;
  for(const s of after.sizes||[]) delete s.purchaseLinks;
  assert.deepEqual(before,after,`Non-link facts changed: ${before.slug}`);
  for(const size of mapped[i].sizes||[]){
    const link=size.purchaseLinks?.rakuten;
    if(!link)continue;
    const u=new URL(link.url);
    assert.equal(u.hostname,'af.moshimo.com');
    assert.equal(u.searchParams.get('a_id'),'5718841');
    assert.equal(u.searchParams.get('p_id'),'54');
    assert.equal(u.searchParams.get('pc_id'),'54');
    assert.equal(u.searchParams.get('pl_id'),'616');
    assert.equal(u.searchParams.get('url'),link.sourceUrl);
    assert.equal(link.volumeMl,size.volumeMl);
    assert(!renderSizePicker(mapped[i]).includes('data-purchase-shop="official"'));
  }
}
console.log('Moshimo capacity mappings OK: affiliate attribution, retailer titles, unchanged fragrance facts/order, Rakuten-only capacity purchase UI.');
