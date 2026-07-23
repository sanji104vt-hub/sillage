import { readFileSync } from "node:fs";

const SITE_COPY_PATH = new URL("../data/site-copy.json", import.meta.url);
const REQUIRED_FIELDS = [
  "siteName",
  "shortName",
  "siteUrl",
  "title",
  "description",
  "tagline",
  "heroProductLine",
  "heroDescription",
];

export function loadSiteCopy() {
  const copy = JSON.parse(readFileSync(SITE_COPY_PATH, "utf8"));
  for (const field of REQUIRED_FIELDS) {
    if (typeof copy[field] !== "string" || !copy[field].trim()) {
      throw new Error(`data/site-copy.json: ${field} is required.`);
    }
  }
  return Object.freeze({
    ...copy,
    footerLabel: `${copy.siteName} — ${copy.tagline}`,
    footerCopyright: `© 2026 ${copy.shortName} — ${copy.tagline}`,
  });
}
