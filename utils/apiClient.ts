import { fetchWithTimeout } from "./net";

// Bazele OpenFoodFacts încercate pe rând: alimente, cosmetice, produse generale.
// `db` marcheaza sursa, ca scorul sa stie ca un produs din OpenBeautyFacts e cosmetic.
const DATABASES = [
  { base: "https://world.openfoodfacts.org", db: "food" },
  { base: "https://world.openbeautyfacts.org", db: "beauty" },
  { base: "https://world.openproductsfacts.org", db: "products" },
];

// Caută un produs după cod în cele 3 baze, în ordine. Întoarce produsul sau null.
export async function fetchProductByBarcode(code: string): Promise<any | null> {
  for (const { base, db } of DATABASES) {
    try {
      const res = await fetchWithTimeout(`${base}/api/v2/product/${code}.json`, {
        headers: { "User-Agent": "Zelynta/1.0 (https://iren-savastre.github.io/zelynta/)" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.status === 1) return { ...data.product, _db: db };
    } catch {}
  }
  return null;
}
