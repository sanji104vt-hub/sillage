import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {loadFragrances} from '../lib/fragrance-data.mjs';
import {englishRoute} from '../lib/i18n.mjs';
const origin='https://sillage.asutelu.com';
const revision=process.argv[2];
if(!/^[a-f0-9]{7,40}$/.test(revision||''))throw new Error('Pass the deployed commit hash');
const paths=loadFragrances().flatMap(p=>[{url:`/items/${p.slug}`,file:`public/items/${p.slug}.html`},...(englishRoute(p)?[{url:englishRoute(p),file:`public${englishRoute(p)}index.html`}]:[])]);
paths.push(...['/assets/size-picker.css','/assets/size-picker.js','/data/fragrances.json','/data/home-data.js','/'].map(url=>({url,file:url==='/'?'public/index.html':`public${url}`})));
// Git checkout may use CRLF locally; compare content after newline-only normalization.
const sha=bytes=>createHash('sha256').update(new TextDecoder().decode(bytes).replace(/\r\n/g,'\n')).digest('hex');
const records=[];let next=0;
await Promise.all(Array.from({length:4},async()=>{while(next<paths.length){
  const entry=paths[next++];
  try{
    const r=await fetch(`${origin}${entry.url}?capacity-audit=${revision}`,{signal:AbortSignal.timeout(30000)});
    const bytes=new Uint8Array(await r.arrayBuffer());
    records.push({url:entry.url,status:r.status,exactMatch:sha(bytes)===sha(readFileSync(entry.file)),finalUrl:r.url});
  }catch(e){records.push({url:entry.url,error:e.message});}
}}));
const normal=[];
for(const url of ['/items/montblanc-1','/items/chanel-1','/items/aux-paradis-1']){
  const r=await fetch(origin+url,{signal:AbortSignal.timeout(30000)});const html=await r.text();
  normal.push({url,status:r.status,exactMatch:html===readFileSync(`public${url}.html`,'utf8')});
}
const worker=await fetch('https://sillage.sanji-104vt.workers.dev/items/montblanc-1',{signal:AbortSignal.timeout(30000)});
const workerHtml=await worker.text();
const workerResult={status:worker.status,finalUrl:worker.url,exactMatch:workerHtml===readFileSync('public/items/montblanc-1.html','utf8')};
const missing=await fetch(`${origin}/items/capacity-audit-missing-${revision}`,{signal:AbortSignal.timeout(30000)});
const failures=records.filter(r=>r.status!==200||!r.exactMatch);
const report={checkedAt:new Date().toISOString(),deployedCommit:revision,origin,comparison:'UTF-8 content; CRLF normalized to LF only',checked:records.length,exactMatches:records.filter(r=>r.exactMatch).length,failures,normal,worker:workerResult,missingProductStatus:missing.status};
writeFileSync('reports/moshimo-capacity-production-check.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(failures.length||normal.some(r=>r.status!==200||!r.exactMatch)||!workerResult.exactMatch||missing.status!==404)process.exitCode=1;
