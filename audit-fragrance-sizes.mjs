import { writeFileSync } from 'node:fs';
import { loadFragrances } from './lib/fragrance-data.mjs';
import { sizeOptions } from './lib/size-picker.mjs';
const products=loadFragrances().map(p=>({slug:p.slug,brand:p.brand,name:p.name,concentration:p.concentration?.value||null,volumesMl:sizeOptions(p),sizes:(p.sizes||[]).map(s=>({volumeMl:s.volumeMl,sourceUrl:s.sourceUrl||null,hasSizeSpecificPurchaseLinks:!!Object.keys(s.purchaseLinks||{}).length})),generalPurchaseShops:Object.keys(p.purchaseLinks||{}).filter(shop=>p.purchaseLinks[shop]?.url),needsCapacityResearch:!sizeOptions(p).length,needsPurchaseMapping:!(p.sizes||[]).some(s=>Object.keys(s.purchaseLinks||{}).length)}));
const report={scope:'Existing repository data only; no current retailer availability or additional sizes verified.',total:products.length,multipleSizes:products.filter(p=>p.volumesMl.length>1).length,singleSize:products.filter(p=>p.volumesMl.length===1).length,noSizes:products.filter(p=>!p.volumesMl.length).length,needsPurchaseMapping:products.filter(p=>p.needsPurchaseMapping).length,products};
writeFileSync('reports/fragrance-size-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,products:undefined},null,2));
