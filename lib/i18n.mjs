import { readFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export const translations = readJson("data/i18n/translations.json");
const phase1Products = readJson("data/i18n/products.en.json").products;
const phase2Products = readJson("data/i18n/products.phase2.en.json").products;
export const englishProducts = {};
for (const slug of new Set([...Object.keys(phase1Products), ...Object.keys(phase2Products)])) {
  englishProducts[slug] = {
    ...(phase1Products[slug] || {}),
    ...(phase2Products[slug] || {}),
  };
}
export const englishBrands = readJson("data/i18n/brands.en.json").brands;
export const englishSite = readJson("data/i18n/site.en.json");

export function label(group, key, locale = "en") {
  return translations.labels[group]?.[key]?.[locale] || key || "";
}

export function englishRoute(product) {
  const localized = englishProducts[product.slug];
  const brand = englishBrands[product.brand];
  if (!localized || !brand) return null;
  return `/en/fragrances/${brand.slug}/${localized.englishSlug}/`;
}

export function japanAvailability(product) {
  const officialPrices = (product.sizes || [])
    .filter((size) => Number.isInteger(size.referencePriceYen) && size.referencePriceYen > 0)
    .map((size) => ({
      volumeMl: size.volumeMl,
      priceJpy: size.referencePriceYen,
      checkedAt: size.priceVerifiedAt || null,
      sourceUrl: size.sourceUrl || null,
    }));

  const safeRakuten = product.needsCorrectLink ? null : product.purchaseLinks?.rakuten || null;
  const rakutenPrice = product.priceSource === "rakuten" && Number.isFinite(Number(product.priceValue))
    ? {
        priceJpy: Number(product.priceValue),
        volume: product.priceSize || null,
        checkedAt: product.priceFetchedAt || null,
        isFrom: Boolean(product.priceIsFrom),
      }
    : null;

  return {
    market: "JP",
    currency: "JPY",
    whereToTry: [],
    availabilityByCity: {
      tokyo: null,
      osaka: null,
      kyoto: null,
    },
    officialPrices,
    retailPrice: rakutenPrice,
    purchaseLinks: {
      official: product.purchaseLinks?.official || null,
      rakuten: safeRakuten,
    },
  };
}

export function localizeProduct(product) {
  const localized = englishProducts[product.slug];
  const brand = englishBrands[product.brand];
  if (!localized || !brand) return null;
  return {
    ...product,
    ...localized,
    nameJa: product.name,
    brandEn: brand.nameEn,
    brandJa: brand.nameJa,
    brandSlugEn: brand.slug,
    familyEn: label("family", product.family),
    seasonsEn: (product.seasons || []).map((key) => label("season", key)),
    scenesEn: (product.scenes || []).map((key) => label("scene", key)),
    genderEn: label("gender", product.gender),
    concentrationEn: product.concentration?.value
      ? label("concentration", product.concentration.value)
      : null,
    japanAvailability: japanAvailability(product),
    routeEn: englishRoute(product),
    routeJa: `/items/${product.slug}`,
  };
}
