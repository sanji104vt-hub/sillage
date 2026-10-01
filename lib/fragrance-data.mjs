import { readFileSync } from "node:fs";
import { createHash } from 'node:crypto';

const capacityMapping = JSON.parse(readFileSync('data/moshimo-capacity-mapping.json', 'utf8'));
const capacityGenerated = JSON.parse(readFileSync('data/moshimo-capacity-generated.json', 'utf8'));

// Verified retailer mappings are separate from fragrance facts. Reuse approved URLs verbatim.
function applyCapacityLinks(products) {
  for (const mapping of capacityMapping.items) {
    const product = products.find(p => p.slug === mapping.slug);
    if (!product) throw new Error(`Unknown capacity mapping: ${mapping.slug}`);
    if (mapping.affiliateUrl !== product.purchaseLinks?.rakuten?.url) throw new Error(`Affiliate URL changed: ${mapping.slug}`);
    for (const volume of mapping.volumes) {
      const size = product.sizes.find(s => s.volumeMl === volume);
      if (!size) throw new Error(`Unrecorded capacity: ${mapping.slug} ${volume}`);
      if (size.purchaseLinks?.rakuten) continue;
      size.purchaseLinks = {...size.purchaseLinks, rakuten: {
        url: mapping.affiliateUrl, volumeMl: volume,
        verifiedAt: capacityMapping.checkedAt, sourceUrl: mapping.url,
        selectionRequired: mapping.selectionRequired
      }};
    }
  }
  for (const offer of capacityGenerated.items) {
    const product = products.find(p => p.slug === offer.slug);
    const url = offer.html.match(/<a href="([^"]+)"/)?.[1]?.replace(/&amp;/g,'&').replace(/^\/\//,'https://');
    if (!url || new URL(url).hostname !== 'af.moshimo.com' || new URL(url).searchParams.get('url') !== offer.url) throw new Error(`Invalid generated offer: ${offer.slug}`);
    for (const volume of offer.volumes) {
      const size = product?.sizes.find(s=>s.volumeMl===volume);
      if (!size) throw new Error(`Unrecorded generated capacity: ${offer.slug} ${volume}`);
      size.purchaseLinks = {...size.purchaseLinks, rakuten: {
        url, volumeMl:volume, verifiedAt:capacityGenerated.generatedAt,
        sourceUrl:offer.url, selectionRequired:offer.volumes.length>1,
        generatedHtml:offer.html,
        generatedHtmlSha256:createHash('sha256').update(offer.html).digest('hex')
      }};
    }
  }
}

export const FRAGRANCE_DATA_PATH = "data/fragrances.json";
export const EXPECTED_SCHEMA_VERSION = 2;
// 掲載数は増減しうるため固定値では縛らず、下限だけを安全弁として持つ。
// （データが空・壊れた状態でビルドが通ってしまう事故だけを防ぐ）
export const MIN_FRAGRANCE_COUNT = 50;

export function loadFragranceData(path = FRAGRANCE_DATA_PATH) {
  const document = JSON.parse(readFileSync(path, "utf8"));
  if (document.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
    throw new Error(`Unsupported fragrance schemaVersion: ${document.schemaVersion}`);
  }
  if (!Array.isArray(document.fragrances) || document.fragrances.length < MIN_FRAGRANCE_COUNT) {
    throw new Error(`Expected at least ${MIN_FRAGRANCE_COUNT} fragrances; got ${document.fragrances?.length ?? "invalid"}`);
  }
  if (path === FRAGRANCE_DATA_PATH) applyCapacityLinks(document.fragrances);
  return document;
}

export function loadFragrances(path = FRAGRANCE_DATA_PATH) {
  return loadFragranceData(path).fragrances;
}
