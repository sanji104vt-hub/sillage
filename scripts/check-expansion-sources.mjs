import { readFileSync, writeFileSync } from "node:fs";
const file = "reports/catalogue-expansion-candidates-2026-11-28.json";
const data = JSON.parse(readFileSync(file, "utf8"));
if (process.argv.includes("--alternative-offers")) {
  for (const [id, url, sizeMl] of [
    ["bulk-0ee36f05556f", "https://item.rakuten.co.jp/kousuiandco/byr002-050/", 50],
    ["lanvin-jeanne", "https://item.rakuten.co.jp/besba/lvn-007/", 100],
  ]) {
    const p = data.candidates.find(row => row.id === id);
    if (p.retailerURL === url) continue;
    p.previousRetailerCheck = { url: p.retailerURL, ...p.retailerCheck };
    p.retailerURL = url;
    p.sizeMl = sizeMl;
    delete p.retailerCheck;
  }
}
if (process.argv.includes("--append-extras")) {
  for (const p of JSON.parse(readFileSync("data/catalogue-expansion-extra-2026-11.json", "utf8"))) {
    if (!data.candidates.some(row => row.id === p.id)) data.candidates.push({ ...p, status: "pending_current_checks" });
  }
}
const decode = text => text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const bytes = new Uint8Array(await response.arrayBuffer());
  const probe = new TextDecoder("ascii").decode(bytes.subarray(0, 12000));
  const charset = `${response.headers.get("content-type")} ${probe}`.match(/charset\s*=\s*["']?([\w-]+)/i)?.[1] || "utf-8";
  const html = new TextDecoder(charset).decode(bytes);
  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(match => { try { return JSON.parse(match[1]); } catch { return []; } });
  const flat = blocks.flatMap(b => b["@graph"] || b);
  const product = flat.find(b => b["@type"] === "Product");
  const offer = Array.isArray(product?.offers) ? product.offers[0] : product?.offers;
  return { status: response.status, finalUrl: response.url, title: decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || ""),
    image: product?.image || decode(html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)?.[1] || html.match(/<meta[^>]*itemprop="image"[^>]*content="([^"]+)"/i)?.[1] || ""),
    productName: product?.name || null,
    price: offer?.price || offer?.lowPrice || html.match(/<meta[^>]*itemprop="price"[^>]*content="([^"]+)"/i)?.[1] || null,
    availability: offer?.availability || html.match(/<meta[^>]*itemprop="availability"[^>]*content="([^"]+)"/i)?.[1] || null,
    textSample: decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).slice(0, 35000), checkedAt: new Date().toISOString() };
}
for (const p of data.candidates) {
  if (process.argv.includes("--new-only") && p.retailerCheck) continue;
  for (const [key, url] of [["retailerCheck", p.retailerURL], ["officialCheck", p.officialURL]]) {
    if (key === "officialCheck" && process.argv.includes("--retailers-only")) continue;
    try { p[key] = await get(url); } catch (error) { p[key] = { error: error.name, checkedAt: new Date().toISOString() }; }
    await new Promise(resolve => setTimeout(resolve, 180));
  }
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  console.log(JSON.stringify({ id: p.id, retailerStatus: p.retailerCheck.status || p.retailerCheck.error, title: p.retailerCheck.title, price: p.retailerCheck.price, stock: p.retailerCheck.availability, officialStatus: p.officialCheck.status || p.officialCheck.error }));
}
