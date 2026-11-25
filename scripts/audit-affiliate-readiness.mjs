import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";

const SITE = "https://sillage.asutelu.com";
const live = process.argv.includes("--live");
const home = readFileSync("public/index.html", "utf8");
const guides = readFileSync("public/guides.html", "utf8");
const about = readFileSync("public/about.html", "utf8");
const privacy = readFileSync("public/privacy.html", "utf8");
const contact = readFileSync("public/contact.html", "utf8");
const failures = [];
const requireCheck = (ok, message) => { if (!ok) failures.push(message); };
const extract = (html, pattern) => html.match(pattern)?.[1] || null;
const reviewDate = "2026-11-26";
const cutoff = new Date(`${reviewDate}T00:00:00+09:00`).getTime() - 60 * 86400000;
const rows = readdirSync("public/columns").filter(file => file.endsWith(".html")).sort().map(file => {
  const html = readFileSync(`public/columns/${file}`, "utf8");
  const slug = file.replace(/\.html$/, "");
  const url = `${SITE}/columns/${slug}`;
  const title = extract(html, /<title>([^<]+)<\/title>/);
  const description = extract(html, /<meta name="description" content="([^"]*)"/);
  const canonical = extract(html, /<link rel="canonical" href="([^"]+)"/);
  const data = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  const article = data.find(entry => entry["@type"] === "Article");
  const visibleDates = [...html.matchAll(/<time\b[^>]*datetime="([^"]+)"/g)].map(m => m[1]);
  const visibleModified = visibleDates.at(-1) || null;
  const modified = article?.dateModified || null;
  const listed = guides.includes(`href="/columns/${slug}"`);
  const noindex = /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html);
  const h1 = (html.match(/<h1\b/g) || []).length;
  requireCheck(title && description && canonical === url && h1 === 1 && !noindex && listed, `Article structure/listing: ${slug}`);
  return { slug, url, title, description, listed, h1, noindex, canonical, structuredModified: modified, visibleModified,
    datesAgree: modified === visibleModified,
    recentlyModifiedInMarkup: Boolean(modified && Date.parse(modified) >= cutoff && Date.parse(modified) <= Date.parse(`${reviewDate}T23:59:59+09:00`)),
    sourceSectionPresent: html.includes("情報源と編集区分"),
    editorBylinePresent: html.includes("著者：Sillage編集部"),
    note: "Markup checks do not establish originality, source accuracy, image rights or actual editorial work." };
});
requireCheck(rows.length >= 10, "Fewer than 10 article pages");
requireCheck(new Set(rows.map(r => r.title)).size === rows.length, "Duplicate article titles");
requireCheck(new Set(rows.map(r => r.description)).size === rows.length, "Duplicate article descriptions");
requireCheck(home.includes('href="/guides.html"'), "No static homepage link to article index");
requireCheck(about.includes("もしもアフィリエイト") && privacy.includes("もしもアフィリエイト"), "Advertising disclosures omit Moshimo");
requireCheck(about.includes('id="affiliate-disclosure"'), "Advertising disclosure anchor missing");
requireCheck(contact.includes('action="https://formspree.io/f/xwloynve"') && !contact.includes("YOUR_FORMSPREE_ID"), "Contact form endpoint missing");
for (const html of [about, privacy, contact]) {
  requireCheck(html.includes("G-60BQRQWB5M") && html.includes("UucVcbwbG6YhXKLVS3GGS8nVk_egyJCLywDHkw6J-5Q"), "Protected tracking/verification tag missing");
}
const liveRows = [...rows, ...["/", "/guides.html", "/about.html", "/privacy.html", "/contact.html"].map(path => ({ url: SITE + path }))];
if (live) {
  for (const row of liveRows) {
    try {
      const response = await fetch(row.url, { redirect: "manual", signal: AbortSignal.timeout(20000) });
      const html = await response.text();
      row.live = { status: response.status, canonical: extract(html, /<link rel="canonical" href="([^"]+)"/), checkedAt: new Date().toISOString() };
      requireCheck(response.status === 200 && row.live.canonical === row.url, `Public response/canonical: ${row.url}`);
    } catch (error) { row.live = { error: error.name }; failures.push(`Public fetch: ${row.url}`); }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
const report = {
  reviewDate, checkedAt: new Date().toISOString(), scope: live ? "Local HTML plus ordinary public GET" : "Local HTML only",
  summary: { articles: rows.length, uniqueTitles: new Set(rows.map(r => r.title)).size, uniqueDescriptions: new Set(rows.map(r => r.description)).size,
    linkedFromIndex: rows.filter(r => r.listed).length, recentStructuredDates: rows.filter(r => r.recentlyModifiedInMarkup).length,
    dateMismatches: rows.filter(r => !r.datesAgree).map(r => r.slug), liveChecked: live ? liveRows.length : 0, failures },
  contactReceipt: "User confirmed receipt of the production test email in this chat; no new test sent by this audit.",
  amazonDisclosure: { status: "unresolved_before_approval", note: "No claim of approved Amazon partnership or Amazon earnings has been added. Confirm the required pre-approval disclosure wording with Moshimo before treating this condition as satisfied." },
  unverified: ["Exact site URL registered with Moshimo", "Denial reason", "Applicant account/ownership details", "Amazon approval", "Image licensing for every asset", "Originality judged by Amazon/Moshimo"],
  cautions: ["209 product pages are not counted as 209 independent articles.", "Recent markup is not proof of actual recent editorial work; dates were not changed to meet a threshold.", "Passing these checks does not guarantee approval.", "Date mismatches are recorded for a separate source-level review; this audit does not rewrite article dates."],
  pages: liveRows,
};
mkdirSync("reports", { recursive: true });
const path = `reports/affiliate-readiness-${reviewDate}.json`;
writeFileSync(path, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ path, ...report.summary }, null, 2));
if (failures.length) process.exitCode = 1;
