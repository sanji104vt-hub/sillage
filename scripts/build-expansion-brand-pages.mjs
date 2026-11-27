// Refresh affected brand inventories without replacing existing editorial sections.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { loadFragrances } from '../lib/fragrance-data.mjs';
import { dominantFamily, familyOgpUrl } from '../lib/ogp-image.mjs';
const products = loadFragrances();
const brands = JSON.parse(readFileSync('data/brands.json', 'utf8'));
const selection = JSON.parse(readFileSync('data/catalogue-expansion-selection-2026-11.json', 'utf8'));
const added = products.filter(p => selection.some(s => s.slug === p.slug));
const slug = name => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const family = { citrus: ['シトラス','#e2cf50'], aromatic: ['アロマティック','#7bb06d'], floral: ['フローラル','#ce82a8'], fruity: ['フルーティ','#d68066'], gourmand: ['グルマン','#c25b69'], amber: ['アンバー','#d09939'], woody: ['ウッディ','#9d704d'], chypre: ['シプレ','#7f964a'], musk: ['ムスク','#aa92bf'], aquatic: ['アクアティック','#5da6c0'] };
const card = p => `<article class="p-item"><span class="p-fam" style="background:${family[p.family][1]}">${family[p.family][0]}</span><h3><a href="/items/${p.slug}">${esc(p.name)}</a></h3><p class="p-notes">${p.keyNotes ? `<b>Notes</b> ${esc(p.keyNotes)}` : `<b>Top</b> ${esc(p.top)} ／ <b>Mid</b> ${esc(p.mid)} ／ <b>Last</b> ${esc(p.last)}`}</p><p class="p-verdict"><small>Sillageの見立て</small><br>${esc(p.verdict)}</p></article>`;
const template = readFileSync('public/brand-aesop.html', 'utf8');
const azzaroPath = 'public/brand-azzaro.html';
let azzaro = readFileSync(azzaroPath, 'utf8');
azzaro = azzaro.replace(/<article class="p-item">(?:(?!<\/article>)[\s\S])*?href="\/items\/azzaro-wanted(?:-by-night)?-edp"[\s\S]*?<\/article>/g, '');
azzaro = azzaro.replace(/掲載香水\d+本/g, '掲載香水2本').replace(/掲載\s*\d+本/g, '掲載2本').replace(/<script id="brand-inventory-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/, '');
writeFileSync(azzaroPath, azzaro);
for (const name of new Set(added.map(p => p.brand))) {
  const b = brands.find(b => b.name === name), items = products.filter(p => p.brand === name);
  const path = `public/brand-${slug(name)}.html`, url = `https://sillage.asutelu.com/brand-${slug(name)}.html`;
  let html;
  if (existsSync(path)) {
    html = readFileSync(path, 'utf8');
    const missing = added.filter(p => p.brand === name && !html.includes(`href="/items/${p.slug}"`));
    const last = html.lastIndexOf('</article>');
    if (last < 0) throw Error(`No existing product card boundary: ${path}`);
    html = html.slice(0, last + 10) + missing.map(card).join('') + html.slice(last + 10);
    html = html.replace(/掲載香水\d+本/g, `掲載香水${items.length}本`).replace(/掲載\s*\d+本/g, `掲載${items.length}本`);
  } else {
    const title = `${name}の香水｜香調とノートで選ぶ ${items.length}本｜Sillage`;
    const description = `${name}の掲載香水${items.length}本。${b.desc} 公式に公表されたノート、濃度、購入先を確認できます。`;
    let head = template.slice(0, template.indexOf('<body>'));
    head = head.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*/g, `$1${esc(description)}`)
      .replace(/(<meta property="og:title" content=")[^"]*/g, `$1${esc(title)}`)
      .replace(/(<meta name="twitter:title" content=")[^"]*/g, `$1${esc(title)}`)
      .replace(/https:\/\/sillage\.asutelu\.com\/brand-aesop\.html/g, url)
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
      .replace(/(<meta property="og:image" content=")[^"]*/g, `$1${familyOgpUrl(dominantFamily(items))}`);
    const schema = [
      { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url, about: { '@type': 'Brand', name, foundingDate: String(b.founded) } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Sillage', item: 'https://sillage.asutelu.com/' }, { '@type': 'ListItem', position: 2, name, item: url }] },
    ];
    head = head.replace('</head>', schema.map(x => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('') + '<style>a:focus-visible{outline:2px solid #c9b558;outline-offset:5px}.p-item,.p-notes,.p-verdict{overflow-wrap:anywhere}h2{font-size:20px;margin-top:40px}</style></head>');
    html = head + `<body><main class="wrap"><a class="back" href="/">← Sillage トップへ</a><h1>${esc(name)}の香水を、ノートで選ぶ。</h1><p class="meta">${b.country} ／ est. ${b.founded} ／ 掲載${items.length}本</p><p class="lead">${esc(b.desc)}</p><h2>掲載している香水</h2>${items.map(card).join('')}<footer>当サイトは楽天アフィリエイト・もしもアフィリエイトの広告を利用しています。<br><a href="/about.html#update-policy">編集方針・更新ポリシー</a> ・ <a href="/contact.html">お問い合わせ</a></footer></main></body></html>`;
  }
  const list = { '@context': 'https://schema.org', '@type': 'ItemList', numberOfItems: items.length, itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: `https://sillage.asutelu.com/items/${p.slug}` })) };
  html = html.replace(/<script id="brand-inventory-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/, '');
  html = html.replace('</head>', `<script id="brand-inventory-jsonld" type="application/ld+json">${JSON.stringify(list).replace(/</g, '\\u003c')}</script></head>`);
  writeFileSync(path, html.replace(/[ \t]+$/gm, ''));
}
console.log(`Updated ${new Set(added.map(p => p.brand)).size} affected brand pages`);
