// Cloudflare Worker
// - "/" → serve /index.html from ASSETS
// - "/columns/{slug}" → rewrite to /columns/{slug}.html (URL preserved to user)
// - everything else → delegate to ASSETS
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

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

    return env.ASSETS.fetch(request);
  },
};
