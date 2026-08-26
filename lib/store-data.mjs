import { readFileSync } from "node:fs";

const storeData = JSON.parse(readFileSync("data/stores.json", "utf8"));

export const cities = storeData.cities;
export const stores = storeData.stores;
export const storesVerifiedAt = storeData.verifiedAt;

export function storesForCity(city) {
  return stores.filter((store) => store.city === city);
}

export function storesForBrand(brandSlug) {
  return stores.filter((store) => store.brands.includes(brandSlug));
}

export function storesByArea(city) {
  const groups = new Map();
  for (const store of storesForCity(city)) {
    const list = groups.get(store.area) || [];
    list.push(store);
    groups.set(store.area, list);
  }
  return groups;
}
