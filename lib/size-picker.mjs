// Only recorded sizes are offered. Product-level links never imply a size match.
import { createHash } from 'node:crypto';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function sizeOptions(product) {
  return [...new Set((product.sizes || []).map(s => s.volumeMl).filter(n => typeof n === 'number' && Number.isFinite(n) && n > 0))].sort((a,b) => a-b);
}
export function sizeLabel(size, language = 'ja') {
  const labels = language === 'en' ? {spray:'spray', 'refill-dropper':'refill / dropper, not a spray'} : {spray:'スプレー', 'refill-dropper':'詰め替え・スポイト（スプレーではありません）'};
  return `${size.volumeMl} mL${labels[size.format] ? ' — ' + labels[size.format] : ''}`;
}
export function renderSizePicker(product, language = 'ja') {
  const en = language === 'en';
  const sizes = sizeOptions(product);
  if (!sizes.length) return `<p class="size-guidance">${en ? 'Check the available bottle sizes on the retailer’s page.' : '容量の掲載情報を確認中です。販売先で取扱容量をご確認ください。'}</p>`;
  const id = `bottle-size-${product.slug}`;
  const hasAds = (product.sizes || []).some(s => ['rakuten','amazon'].some(shop => safeUrl(s.purchaseLinks?.[shop]?.url)));
  const panels = sizes.map(volume => {
    const size = product.sizes.find(s => s.volumeMl === volume);
    const links = Object.entries(size.purchaseLinks || {}).map(([shop, link]) => {
      if (shop !== 'rakuten' || !safeUrl(link?.url) || new URL(link.url).hostname !== 'af.moshimo.com' || link.volumeMl !== volume || !link.verifiedAt || !link.sourceUrl || !safeUrl(link.sourceUrl)) return '';
      const note = link.selectionRequired ? (en ? 'Select the matching fragrance and bottle size again on Rakuten Japan before buying.' : '楽天の商品ページでも、同じ香り・濃度・容量を選択してからご購入ください。') : '';
      if (link.generatedHtml) {
        if (!validGeneratedHtml(link)) throw new Error(`Invalid static affiliate HTML: ${product.slug} ${volume}`);
        return `${en ? '<p class="size-guidance">Check the price on Rakuten Japan using the Japanese link below.</p>' : ''}<div class="size-affiliate" lang="ja" data-product-id="${esc(product.slug)}" data-volume-ml="${volume}">${link.generatedHtml}</div>${note ? `<p class="size-guidance">${esc(note)}</p>` : ''}`;
      }
      return `<a class="buy button" href="${esc(link.url)}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-purchase-shop="rakuten" data-product-id="${esc(product.slug)}" data-volume-ml="${volume}">${en ? 'Check price on Rakuten Japan' : '楽天で価格を見る'} — ${esc(sizeLabel(size, language))} ↗</a>${note ? `<p class="size-guidance">${esc(note)}</p>` : ''}`;
    }).filter(Boolean).join('');
    return `<div data-size-panel="${volume}"><p>${esc(sizeLabel(size, language))}</p>${size.format === 'refill-dropper' ? `<p class="size-guidance">${en ? 'Refill in a dropper bottle; atomizer sold separately. A spray nozzle cannot be fitted to this bottle.' : '詰め替え用のスポイトボトルです。アトマイザーは別売りで、このボトルにスプレーは取り付けられません。'}</p>` : ''}${size.referencePriceYen > 0 ? `<p>${en ? 'Recorded official reference price' : '公式確認時の参考価格'}：${Number(size.referencePriceYen).toLocaleString('ja-JP')} ${en ? 'JPY; subject to change.' : '円（税込・変更される場合があります）'}</p>` : ''}${links ? links : `<p class="size-guidance">${en ? 'A purchase link verified for this size has not been registered yet.' : 'この容量に対応する購入リンクはまだ登録されていません。'}</p>`}${safeUrl(size.sourceUrl) ? `<a class="size-source" href="${esc(size.sourceUrl)}" target="_blank" rel="noopener noreferrer">${en ? 'Source for this listed size' : 'この容量の掲載元を確認'} ↗</a>` : ''}</div>`;
  }).join('');
  return `<div class="size-picker" data-size-picker><label for="${esc(id)}">${en ? 'Choose a bottle size' : '容量を選ぶ'}</label><select id="${esc(id)}" data-size-select aria-describedby="${esc(id)}-note"><option value="">${en ? 'View all sizes' : 'すべての容量を見る'}</option>${sizes.map(n => `<option value="${n}">${esc(sizeLabel(product.sizes.find(s => s.volumeMl === n), language))}</option>`).join('')}</select><p id="${esc(id)}-note" class="size-guidance">${en ? 'Listed sizes vary by market and retailer. General product purchase links are not matched to this selection. Confirm the concentration and bottle size before buying.' : '掲載容量は販売地域・店舗によって取扱いが異なります。商品共通の購入リンクは容量選択と連動しません。購入前に容量と濃度をご確認ください。'}</p>${hasAds ? `<p class="size-guidance">${en ? 'PR: Retailer links include affiliate advertising. Confirm the latest price and availability on the retailer’s page.' : 'PR：販売店リンクにはアフィリエイト広告を含みます。最新価格・在庫は販売先でご確認ください。'}</p>` : ''}<p data-size-status role="status" aria-live="polite"></p>${panels}<noscript><p>${en ? 'All recorded sizes are shown below without JavaScript.' : 'JavaScriptが無効の場合も、登録済みの容量情報をすべて表示します。'}</p></noscript></div>`;
}
function safeUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}
export function validGeneratedHtml(link) {
  const html=link.generatedHtml;
  if(typeof html!=='string'||createHash('sha256').update(html).digest('hex')!==link.generatedHtmlSha256) return false;
  if(/<\s*(script|iframe|object|embed|style)|\bon\w+\s*=/i.test(html)) return false;
  const href=html.match(/<a href="([^"]+)"/)?.[1]?.replace(/&amp;/g,'&').replace(/^\/\//,'https://');
  return href===link.url && new URL(href).hostname==='af.moshimo.com' && html.includes('//i.moshimo.com/af/i/impression?') && html.includes('width="1" height="1"');
}
export const sizePickerAssets = '<link rel="stylesheet" href="/assets/size-picker.css"><script defer src="/assets/size-picker.js"></script>';
