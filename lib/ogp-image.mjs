export const SITE_URL = "https://sillage.asutelu.com";

export const OGP_FAMILY_KEYS = [
  "citrus",
  "aromatic",
  "floral",
  "fruity",
  "gourmand",
  "amber",
  "woody",
  "chypre",
  "musk",
  "aquatic",
];

const OGP_FAMILY_SET = new Set(OGP_FAMILY_KEYS);

export function familyOgpPath(family) {
  return OGP_FAMILY_SET.has(family) ? `/img/ogp/ogp-fam-${family}.png` : null;
}

export function familyOgpUrl(family) {
  const path = familyOgpPath(family);
  return path ? `${SITE_URL}${path}` : null;
}

export function dominantFamily(fragrances) {
  const counts = new Map();
  for (const fragrance of fragrances) {
    if (!OGP_FAMILY_SET.has(fragrance.family)) continue;
    counts.set(fragrance.family, (counts.get(fragrance.family) || 0) + 1);
  }

  let dominant = null;
  let highestCount = 0;
  for (const family of OGP_FAMILY_KEYS) {
    const count = counts.get(family) || 0;
    if (count > highestCount) {
      dominant = family;
      highestCount = count;
    }
  }
  return dominant;
}
