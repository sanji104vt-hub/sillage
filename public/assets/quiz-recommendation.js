(function (global) {
  "use strict";

  const QUIET_FAMILIES = new Set(["citrus", "musk", "aquatic", "aromatic"]);
  const DISTINCTIVE_FAMILIES = new Set(["chypre", "amber", "gourmand", "fruity", "floral"]);

  function sumMatches(values, weights) {
    return (values || []).reduce((total, value) => total + (weights[value] || 0), 0);
  }

  function baseScore(product, weights) {
    return (
      (weights.fam[product.family] || 0) * 3 +
      sumMatches(product.scenes, weights.scene) * 2.5 +
      sumMatches(product.seasons, weights.season) * 2 +
      (weights.price[product.priceTier] || 0) * 2
    );
  }

  function choose(scored, excluded, preferred, bonus) {
    const candidates = scored.filter(({ product }) => !excluded.has(product.slug));
    const preferredCandidates = candidates.filter(({ product }) => preferred(product));
    return (preferredCandidates.length ? preferredCandidates : candidates)
      .map((entry) => ({ ...entry, roleScore: entry.score + bonus(entry.product) }))
      .sort((a, b) => b.roleScore - a.roleScore || b.score - a.score || a.index - b.index)[0];
  }

  function recommend(products, weights) {
    if (!Array.isArray(products) || products.length < 3) {
      throw new Error("診断には3件以上の商品データが必要です");
    }
    const scored = products
      .map((product, index) => ({ product, index, score: baseScore(product, weights) }))
      .sort((a, b) => b.score - a.score || a.index - b.index);

    const primary = scored[0];
    const excluded = new Set([primary.product.slug]);
    const calm = choose(scored, excluded, (product) => QUIET_FAMILIES.has(product.family), (product) =>
      (QUIET_FAMILIES.has(product.family) ? 4 : 0) +
      ((product.scenes || []).includes("daily") ? 2 : 0) +
      ((product.scenes || []).includes("business") ? 1 : 0)
    );
    excluded.add(calm.product.slug);
    const distinctive = choose(scored, excluded, (product) => DISTINCTIVE_FAMILIES.has(product.family), (product) =>
      (DISTINCTIVE_FAMILIES.has(product.family) ? 4 : 0) +
      ((product.scenes || []).includes("date") ? 2 : 0) +
      ((product.scenes || []).includes("formal") ? 1 : 0)
    );

    return {
      primary: primary.product,
      calm: calm.product,
      distinctive: distinctive.product,
    };
  }

  global.SillageQuizRecommendation = { recommend };
})(typeof window !== "undefined" ? window : globalThis);
