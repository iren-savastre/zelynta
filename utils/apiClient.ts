import { fetchWithTimeout } from "./net";

// Bazele OpenFoodFacts încercate pe rând: alimente, cosmetice, produse generale.
// `db` marcheaza sursa, ca scorul sa stie ca un produs din OpenBeautyFacts e cosmetic.
const DATABASES = [
  { base: "https://world.openfoodfacts.org", db: "food" },
  { base: "https://world.openbeautyfacts.org", db: "beauty" },
  { base: "https://world.openproductsfacts.org", db: "products" },
];

// Produsul are lista de ingrediente citibilă (în orice limbă)?
function hasIngredients(p: any): boolean {
  if (!p) return false;
  if (Array.isArray(p.ingredients) && p.ingredients.length > 0) return true;
  for (const k in p) {
    if (k === "ingredients_text" || k.indexOf("ingredients_text_") === 0) {
      if (typeof p[k] === "string" && p[k].trim().length > 2) return true;
    }
  }
  return false;
}

// Caută un produs după cod în cele 3 baze. Preferă varianta CARE ARE ingrediente:
// dacă prima bază găsește produsul dar fără ingrediente, verificăm și celelalte
// (ex. o pastă de dinți poate fi în „alimente" fără compoziție, dar în „cosmetice" cu ea).
export async function fetchProductByBarcode(code: string): Promise<any | null> {
  let fallback: any = null;
  for (const { base, db } of DATABASES) {
    try {
      const res = await fetchWithTimeout(`${base}/api/v2/product/${code}.json`, {
        headers: { "User-Agent": "Zelynta/1.0 (https://zelynta.com/)" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = { ...data.product, _db: db };
        if (hasIngredients(p)) return p; // cel mai bun rezultat — îl returnăm imediat
        if (!fallback) fallback = p; // fără ingrediente — îl ținem ca rezervă
      }
    } catch {}
  }
  return fallback;
}
