import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { validGeneratedHtml } from '../lib/size-picker.mjs';
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const baseline = JSON.parse(execFileSync('git', ['show', '54764ae:data/fragrances.json'], { encoding: 'utf8', maxBuffer: 1e7 })).fragrances;
const all = read('data/fragrances.json').fragrances;
const selection = read('data/catalogue-expansion-selection-2026-11.json');
assert.deepEqual(all.slice(0, baseline.length), baseline, 'Existing 209 products/order must stay identical');
assert.equal(all.length, baseline.length + selection.length);
assert.equal(new Set(all.map(p => p.slug)).size, all.length);
const report = [];
for (const s of selection) {
  const p = all.find(p => p.slug === s.slug);
  const html = readFileSync(`public/items/${p.slug}.html`, 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert(html.includes(`rel="canonical" href="https://sillage.asutelu.com/items/${p.slug}"`));
  assert(html.includes(p.sizes[0].purchaseLinks.rakuten.generatedHtml), `Original code missing: ${p.slug}`);
  assert(validGeneratedHtml(p.sizes[0].purchaseLinks.rakuten));
  assert(!decodeURIComponent(p.purchaseLinks.rakuten.url).includes('rafcid'));
  assert(Object.entries(p.profile).every(([k, v]) => k === 'method' || v === null));
  assert(!html.includes('aggregateRating'));
  const sourceArea = html.split('class="section sources"')[1]?.split('</section>')[0];
  assert(sourceArea && !sourceArea.includes('sponsored'));
  const response = await fetch(p.img, { signal: AbortSignal.timeout(20000) });
  const bytes = await response.arrayBuffer();
  assert(response.ok && response.headers.get('content-type')?.startsWith('image/') && bytes.byteLength > 1000, `Photo failed: ${p.slug} ${response.status}`);
  report.push({ slug: p.slug, brand: p.brand, gender: p.gender, volumeMl: p.sizes[0].volumeMl, price: p.priceValue, photoStatus: response.status, photoBytes: bytes.byteLength, html: 'ok', originalMoshimoHtml: 'exact', notesCheckedAt: p.verifiedAt });
}
// Preserve pre-build pages when their sole change was insignificant inter-tag whitespace.
if (process.argv.includes('--restore-whitespace-only')) {
  for (const p of baseline) {
    const path = `public/items/${p.slug}.html`;
    const before = execFileSync('git', ['show', `54764ae:${path}`], { encoding: 'utf8' });
    const after = readFileSync(path, 'utf8');
    const norm = s => s.replace(/\r\n/g, '\n').replace(/>\s+</g, '><').trim();
    if (before !== after && norm(before) === norm(after)) writeFileSync(path, before);
  }
}
const candidatePath = 'reports/catalogue-expansion-candidates-2026-11-28.json';
const candidates = read(candidatePath);
for (const p of candidates.candidates) for (const key of ['retailerCheck', 'officialCheck', 'previousRetailerCheck']) if (p[key]) delete p[key].textSample;
writeFileSync(candidatePath, JSON.stringify(candidates, null, 2) + '\n');
writeFileSync('reports/catalogue-expansion-validation-2026-11-28.json', JSON.stringify({ baselineUnchanged: true, added: report.length, total: all.length, results: report }, null, 2) + '\n');
console.log(`Expansion OK: ${report.length} additions, exact original codes and photos; existing 209 unchanged`);
