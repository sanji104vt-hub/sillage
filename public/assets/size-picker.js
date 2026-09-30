(() => {
  document.querySelectorAll('[data-size-picker]').forEach(picker => {
    const select = picker.querySelector('[data-size-select]');
    const status = picker.querySelector('[data-size-status]');
    const en = document.documentElement.lang === 'en';
    picker.addEventListener('click', event => {
      const link=event.target.closest('a[data-purchase-shop], .size-affiliate a');
      if (!link || typeof window.gtag !== 'function') return;
      const offer=link.closest('.size-affiliate');
      const shop=offer?'rakuten':link.dataset.purchaseShop;
      const productId=offer?offer.dataset.productId:link.dataset.productId;
      const volume=Number(offer?offer.dataset.volumeMl:link.dataset.volumeMl);
      const body=document.body;
      const params={product_id:productId,item_slug:productId,purchase_shop:shop,button_position:'capacity',volume_ml:volume,requested_volume_ml:select.value?Number(select.value):undefined,destination_url:link.href,transport_type:'beacon',language:document.documentElement.lang||'ja',page_type:'item',item_name:body?.dataset.itemName||'',item_brand:body?.dataset.itemBrand||'',item_family:body?.dataset.itemFamily||'',price_tier:body?.dataset.priceTier||''};
      try {
        window.gtag('event','purchase_link_click',params);
        window.gtag('event',shop+'_click',params);
      } catch (_) { /* Analytics must not prevent navigation. */ }
    });
    select.addEventListener('change', () => {
      const size = select.value;
      picker.querySelectorAll('[data-size-panel]').forEach(panel => { panel.hidden = !!size && panel.dataset.sizePanel !== size; });
      status.textContent = size ? (en ? `Selected: ${size} mL. Confirm this size on the retailer’s page.` : `${size} mLを選択中。販売先でこの容量をご確認ください。`) : '';
      document.querySelectorAll('a[data-purchase-shop]').forEach(link => {
        if (size) link.dataset.requestedVolumeMl = size;
        else delete link.dataset.requestedVolumeMl;
      });
    });
  });
})();
