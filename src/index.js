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
