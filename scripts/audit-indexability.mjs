import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const SITE = 'https://sillage.asutelu.com';
const live = process.argv.includes('--live');
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir,e.name)) : e.name.endsWith('.html') ? [join(dir,e.name)] : []);
const urls = [...readFileSync('public/sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&'));
const pages = files('public').filter(p=>!p.replaceAll('\\','/').includes('/partials/')).map(file=>{
  const html=readFileSync(file,'utf8');
  return {file:file.replaceAll('\\','/'), html, canonical:html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1]};
});
const byUrl=new Map(pages.filter(p=>p.canonical).map(p=>[p.canonical,p]));
const physical=new Map(pages.filter(p=>p.canonical).map(p=>['/'+p.file.slice('public/'.length),p.canonical]));
const localFailures=[],edges=new Map();
for(const page of pages){
  const links=[];
  for(const match of page.html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){
    try {const u=new URL(match[1].replaceAll('&amp;','&'),page.canonical||SITE);if(u.origin!==SITE)continue;
      const target=physical.get(u.pathname)||SITE+u.pathname;
      if(byUrl.has(target))links.push(target);
    }catch{}
  }
  edges.set(page.canonical,new Set(links));
}
const depth=new Map([[SITE+'/',0]]),queue=[SITE+'/'];
while(queue.length){const current=queue.shift();for(const target of edges.get(current)||[]){if(!depth.has(target)){depth.set(target,depth.get(current)+1);queue.push(target);}}}
const rows=urls.map(url=>{
  const p=byUrl.get(url);if(!p){localFailures.push({url,issue:'No local canonical page'});return {url,localExists:false};}
  const robots=p.html.match(/<meta\b[^>]*name="robots"[^>]*content="([^"]*)"/)?.[1]||'';
  const h1=(p.html.match(/<h1\b/g)||[]).length;
  if(/noindex/i.test(robots)||h1!==1)localFailures.push({url,robots,h1});
  return {url,localExists:true,file:p.file,h1,robots,linkDepth:depth.get(url)??null,staticInternalLinks:(edges.get(url)||new Set()).size};
});
let next=0,finished=0;
async function run(){while(next<rows.length){const row=rows[next++];try{
  const r=await fetch(row.url,{redirect:'manual',signal:AbortSignal.timeout(15000)}),html=await r.text();
  row.live={status:r.status,location:r.headers.get('location'),xRobots:r.headers.get('x-robots-tag'),canonical:html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],noindex:/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html),h1:(html.match(/<h1\b/g)||[]).length,bytes:Buffer.byteLength(html),sha256:createHash('sha256').update(html).digest('hex'),checkedAt:new Date().toISOString()};
 }catch(e){row.live={error:e.name,checkedAt:new Date().toISOString()};}
 finished++;if(finished%100===0)console.log(`Checked ${finished}/${rows.length}`);
 await new Promise(resolve=>setTimeout(resolve,80));
}}
if(live)await Promise.all([run(),run()]);
const failures=rows.filter(r=>r.live&&(r.live.error||r.live.status!==200||r.live.canonical!==r.url||r.live.noindex||/noindex/i.test(r.live.xRobots||'')||r.live.h1!==1));
const summary={checkedAt:new Date().toISOString(),scope:live?'Local static graph and live ordinary GET; not verified Googlebot access or Google indexing':'Local static graph only',sitemapUrls:urls.length,duplicateSitemapUrls:urls.length-new Set(urls).size,localFailures,unreachableFromHome:rows.filter(r=>r.linkDepth===null).map(r=>r.url),maxLinkDepth:Math.max(...rows.map(r=>r.linkDepth||0)),liveChecked:live?finished:0,liveFailures:live?failures:null};
mkdirSync('reports',{recursive:true});
writeFileSync(`reports/indexability-${live?'live':'local'}-audit.json`,JSON.stringify({summary,pages:rows},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if(localFailures.length||failures.length||summary.duplicateSitemapUrls)process.exitCode=1;
