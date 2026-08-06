// Cloudflare Worker
// - "/" → serve /index.html from ASSETS
// - "/columns/{slug}" → rewrite to /columns/{slug}.html (URL preserved to user)
// - everything else → delegate to ASSETS
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // workers.dev への直アクセスはカスタムドメインへ 301
    if (url.hostname.endsWith("workers.dev")) {
      return Response.redirect(
        "https://sillage.asutelu.com" + url.pathname + url.search,
        301
      );
    }

    const path = url.pathname;

    // 掲載を取り下げたURL。恒久的な削除であることを検索エンジンに伝えるため 410 Gone を返す。
    // （404 だと「一時的に見つからない」と解釈され、インデックスからの削除が遅れる）
    const GONE = new Set([
      "/items/givenchy-1",
      "/items/givenchy-1.html",
      "/items/ysl-5",
      "/items/ysl-5.html",
      "/items/issey-miyake-1",
      "/items/issey-miyake-1.html",
      "/brand-givenchy.html",
      "/brand-issey-miyake.html",
      // 2026-07-30 追加：楽天・公式どちらの購入リンクも無い4商品と、それに伴い掲載0本になった3ブランド。
      "/items/atelier-cologne-1",
      "/items/atelier-cologne-1.html",
      "/items/muji-1",
      "/items/muji-1.html",
      "/items/brut-1",
      "/items/brut-1.html",
      "/items/paco-rabanne-2",
      "/items/paco-rabanne-2.html",
      "/brand-atelier-cologne.html",
      "/brand-muji.html",
      "/brand-brut.html",
      // 2026-08-05 追加：実写画像が無い10商品と、それに伴い掲載0本になった3ブランド。
      "/items/hermes-1",
      "/items/hermes-1.html",
      "/items/hermes-3",
      "/items/hermes-3.html",
      "/items/ysl-1",
      "/items/ysl-1.html",
      "/items/ysl-4",
      "/items/ysl-4.html",
      "/items/tom-ford-1",
      "/items/tom-ford-1.html",
      "/items/jean-paul-gaultier-1",
      "/items/jean-paul-gaultier-1.html",
      "/items/parfums-de-marly-1",
      "/items/parfums-de-marly-1.html",
      "/items/dolce-gabbana-2",
      "/items/dolce-gabbana-2.html",
      "/items/azzaro-3",
      "/items/azzaro-3.html",
      "/items/john-varvatos-1",
      "/items/john-varvatos-1.html",
      "/brand-jean-paul-gaultier.html",
      "/brand-parfums-de-marly.html",
      "/brand-john-varvatos.html",
      // 2026-08-05 追加：同一メゾンの重複ブランドを統合したため、旧ブランドページを取り下げ。
      // CK → Calvin Klein / Thierry Mugler → Mugler（商品の slug は変更していない）
      "/brand-ck.html",
      "/brand-thierry-mugler.html",
    ]);
    if (GONE.has(path.replace(/\/$/, "") || path)) {
      return new Response(
        "<!DOCTYPE html><html lang=\"ja\"><head><meta charset=\"UTF-8\"><meta name=\"robots\" content=\"noindex\"><title>掲載を終了しました｜Sillage</title></head>" +
        "<body style=\"background:#0d0e10;color:#e9e7e3;font-family:system-ui,sans-serif;text-align:center;padding:80px 20px\">" +
        "<h1 style=\"font-size:22px;margin-bottom:16px\">このページは掲載を終了しました</h1>" +
        "<p style=\"color:#8c8c92;font-size:14px;line-height:1.9\">掲載内容の見直しにより、この商品・ブランドの掲載を取り下げました。</p>" +
        "<p style=\"margin-top:28px\"><a href=\"/\" style=\"color:#c9b558\">Sillage トップへ戻る</a></p>" +
        "</body></html>",
        { status: 410, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" } },
      );
    }

    // Canonical URL redirects: prevent duplicate indexing of physical HTML files.
    if (path === "/index.html") {
      const u = new URL(request.url);
      u.pathname = "/";
      return Response.redirect(u.toString(), 301);
    }

    const columnHtml = path.match(/^\/columns\/([A-Za-z0-9][A-Za-z0-9-]*)\.html$/);
    if (columnHtml) {
      const u = new URL(request.url);
      u.pathname = `/columns/${columnHtml[1]}`;
      return Response.redirect(u.toString(), 301);
    }

    const itemHtml = path.match(/^\/items\/([A-Za-z0-9][A-Za-z0-9-]*)\.html$/);
    if (itemHtml) {
      const u = new URL(request.url);
      u.pathname = `/items/${itemHtml[1]}`;
      return Response.redirect(u.toString(), 301);
    }

    if (path === "/") {
      const u = new URL(request.url);
      u.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(u, request));
    }

    const m = path.match(/^\/columns\/([A-Za-z0-9][A-Za-z0-9-]*)\/?$/);
    if (m) {
      const u = new URL(request.url);
      u.pathname = `/columns/${m[1]}.html`;
      return env.ASSETS.fetch(new Request(u, request));
    }

    const mi = path.match(/^\/items\/([A-Za-z0-9][A-Za-z0-9-]*)\/?$/);
    if (mi) {
      const u = new URL(request.url);
      u.pathname = `/items/${mi[1]}.html`;
      return env.ASSETS.fetch(new Request(u, request));
    }

    return env.ASSETS.fetch(request);
  },
};
