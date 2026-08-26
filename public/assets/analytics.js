/* Sillage のGA4カスタムイベント。全ページで読み込む共通処理。
 *
 * 方針
 * - 計測がサイトの動作を止めないこと。gtag が無くても、パラメータが
 *   取れなくても、例外を外へ出さない。
 * - 150枚のカードに個別リスナーを付けない。document で1つだけ受け、
 *   closest() で対象を判定する。
 * - 購入ボタンは target="_blank" で外部へ飛ぶ。preventDefault はしない。
 *   GA4 は transport_type:"beacon" で送るため、遷移しても送信される。
 * - 個人を特定できる情報は送らない（商品・系統・ページ種別のみ）。
 *
 * 商品ページには既存の purchase_link_click（ボタン位置つき）があり、
 * そちらは継続のため残している。ここで足すのはより細かい属性を持つ
 * rakuten_click / official_click。
 */
(function () {
  "use strict";

  function track(name, params) {
    try {
      if (typeof window.gtag !== "function") return;
      params = params || {};
      if (!params.language) params.language = document.documentElement.lang || "ja";
      window.gtag("event", name, params);
    } catch (_) { /* 計測の失敗でページを壊さない */ }
  }
  window.SillageTrack = track;

  // ページ種別はURLから決める。ブランドページ41枚にも属性を足さずに済む。
  var path = location.pathname;
  var PAGE_TYPE =
    path.indexOf("/items/") === 0 || path.indexOf("/en/fragrances/") === 0 && path !== "/en/fragrances/" ? "item" :
    path.indexOf("/columns/") === 0 || path.indexOf("/en/guides/") === 0 ? "column" :
    path.indexOf("/brand-") === 0 || path.indexOf("/en/brands/") === 0 ? "brand" : "home";
  window.SillagePageType = PAGE_TYPE;

  function attr(el, name) {
    if (!el) return "";
    var v = el.getAttribute(name);
    return v == null ? "" : v;
  }

  // 商品の属性は、トップでは .card、商品ページでは <body> が持つ。
  function itemParamsFrom(el) {
    var host = el && el.closest ? el.closest("[data-item-slug]") : null;
    if (!host) host = document.querySelector("body[data-item-slug]");
    return {
      item_slug: attr(host, "data-item-slug"),
      item_name: attr(host, "data-item-name"),
      item_brand: attr(host, "data-item-brand"),
      item_family: attr(host, "data-item-family"),
      price_tier: attr(host, "data-price-tier"),
    };
  }

  // 購入ボタンのクリック。楽天/Amazonは a.buy、公式は a.buy.buy-official。
  document.addEventListener("click", function (event) {
    try {
      var target = event.target;
      if (!target || !target.closest) return;
      var buy = target.closest("a.buy");
      if (!buy) return;
      var isOfficial = buy.classList.contains("buy-official");
      var params = itemParamsFrom(buy);
      params.page_type = PAGE_TYPE;
      params.transport_type = "beacon";
      track(isOfficial ? "official_click" : "rakuten_click", params);
    } catch (_) { /* 同上 */ }
  });

  // 商品ページ・コラムページの閲覧。page_view とは別に属性を付けて送る。
  document.addEventListener("DOMContentLoaded", function () {
    try {
      var body = document.body;
      if (PAGE_TYPE === "item" && body.getAttribute("data-item-slug")) {
        track("item_view", itemParamsFrom(null));
      }
      if (PAGE_TYPE === "column" && body.getAttribute("data-column-slug")) {
        track("column_view", {
          column_slug: attr(body, "data-column-slug"),
          column_title: attr(body, "data-column-title"),
          column_category: attr(body, "data-column-category"),
        });
      }
    } catch (_) { /* 同上 */ }
  });
})();
