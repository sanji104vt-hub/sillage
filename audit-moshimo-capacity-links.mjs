import {readFileSync,writeFileSync} from 'node:fs';
import {setTimeout as pause} from 'node:timers/promises';
const generatedOnly=process.argv.includes('--generated');
const base=JSON.parse(readFileSync('data/fragrances.json','utf8')).fragrances;
const products=generatedOnly ? JSON.parse(readFileSync('data/moshimo-capacity-generated.json','utf8')).items.map(offer=>{
  const p=base.find(p=>p.slug===offer.slug);
  const url=offer.html.match(/<a href="([^"]+)"/)?.[1]?.replace(/&amp;/g,'&').replace(/^\/\//,'https://');
  return {...p,sizes:offer.volumes.map(volumeMl=>({volumeMl})),purchaseLinks:{rakuten:{url}}};
}) : base;
const records=[];
let cursor=0;
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
await Promise.all(Array.from({length:2},async()=>{
  while(cursor<products.length){
    const p=products[cursor++];
    if(!p.purchaseLinks?.rakuten?.url)continue;
    const a=new URL(p.purchaseLinks.rakuten.url),url=a.searchParams.get('url');
    if(a.hostname!=='af.moshimo.com'||!url||new URL(url).hostname!=='item.rakuten.co.jp')continue;
    const rec={slug:p.slug,brand:p.brand,name:p.name,concentration:p.concentration?.value,knownSizes:(p.sizes||[]).map(s=>s.volumeMl),priceSize:p.priceSize,affiliateUrl:p.purchaseLinks.rakuten.url,url};
    try{
      const res=await fetch(url,{signal:AbortSignal.timeout(25000)});
      const bytes=new Uint8Array(await res.arrayBuffer());
      const head=new TextDecoder('ascii').decode(bytes.subarray(0,12000));
      const charset=(res.headers.get('content-type')+' '+head).match(/charset\s*=\s*["']?([\w-]+)/i)?.[1]||'utf-8';
      const html=new TextDecoder(charset).decode(bytes);
      rec.status=res.status;rec.finalUrl=res.url;
      rec.title=decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g,' ').trim()||'');
      rec.titleVolumes=[...new Set([...rec.title.normalize('NFKC').matchAll(/(\d+(?:\.\d+)?)\s*m[lL]/g)].map(m=>Number(m[1])))];
    }catch(e){rec.error=e.message;}
    records.push(rec);
    await pause(500);
  }
}));
records.sort((a,b)=>products.findIndex(p=>p.slug===a.slug)-products.findIndex(p=>p.slug===b.slug));
writeFileSync(generatedOnly?'reports/moshimo-capacity-generated-audit.json':'reports/moshimo-capacity-target-audit.json',JSON.stringify({checkedAt:new Date().toISOString(),method:'Direct retailer GET; no affiliate click. Titles are evidence for review, not automatic product matches.',records},null,2)+'\n');
console.log(JSON.stringify({checked:records.length,statuses:records.reduce((o,r)=>(o[r.status||r.error]=(o[r.status||r.error]||0)+1,o),{})}));
