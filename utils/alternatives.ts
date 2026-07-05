import { fetchWithTimeout } from "./net";
import { analyzeProduct, productDisplay } from "./score";

export type Alternative = {
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string;
  score: number;
};

// Caută produse mai sănătoase din aceeași categorie (OpenFoodFacts).
// Încearcă mai multe categorii, de la cea mai specifică spre cele mai largi,
// ca să găsească alternative chiar și pentru produse de nișă (ex. cașcaval).
export async function getBetterAlternatives(
  product: any,
  currentScore: number,
  lang: string
): Promise<Alternative[]> {
  const cats: string[] = product?.categories_tags ?? [];
  if (cats.length === 0) return [];

  // Categoriile candidate: de la cea mai specifică (ultima) spre cele mai largi.
  // Limităm la 3 ca să rămână rapid.
  const candidates = cats
    .slice()
    .reverse()
    .map((c) => c.replace(/^en:/, ""))
    .slice(0, 3);

  // Adună produse din categoriile candidate până strângem destule.
  const pool = new Map<string, any>();
  for (const category of candidates) {
    try {
      const url =
        `https://world.openfoodfacts.org/api/v2/search` +
        `?categories_tags_en=${encodeURIComponent(category)}` +
        `&fields=code,product_name,product_name_${lang},product_name_en,brands,image_url,additives_tags,nutriments,categories,ingredients_text,ingredients_text_${lang},ingredients_text_en` +
        `&page_size=100&sort_by=unique_scans_n`;

      const res = await fetchWithTimeout(url, {
        headers: { "User-Agent": "Zelynta/1.0 (https://iren-savastre.github.io/zelynta/)" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const p of (data?.products ?? []) as any[]) {
        if (p?.code && p.code !== product.code && p.product_name && !pool.has(p.code)) {
          pool.set(p.code, p);
        }
      }
    } catch {
      // ignoră categoria asta și încearcă următoarea
    }
    // destule candidate ca să avem din ce alege
    if (pool.size >= 60) break;
  }
  if (pool.size === 0) return [];

  // Scripturi pe care aplicația NU le folosește (arabă, ebraică, CJK, thai, coreeană…).
  // Produsele cu nume doar în aceste scripturi nu sunt utile utilizatorului -> le sărim.
  const FOREIGN_SCRIPT =
    /[֐-׿؀-ۿݐ-ݿ฀-๿぀-ヿ一-鿿가-힯]/;

  // Cheile nutriționale care arată că produsul chiar are date (altfel scorul e un fals 100).
  const NUTRI_KEYS = [
    "energy-kcal_100g",
    "sugars_100g",
    "saturated-fat_100g",
    "fat_100g",
    "salt_100g",
    "proteins_100g",
  ];

  const scored = [...pool.values()]
    .map((p): Alternative | null => {
      // Preferă numele în limba utilizatorului, apoi engleză, apoi cel implicit.
      const name = String(
        p[`product_name_${lang}`] || p.product_name_en || p.product_name || ""
      ).trim();
      if (!name || FOREIGN_SCRIPT.test(name)) return null; // nume gol sau în script străin
      // Dacă are ingrediente, trebuie să fie citibile (nu în arabă/CJK etc.).
      const ing = String(
        p[`ingredients_text_${lang}`] || p.ingredients_text_en || p.ingredients_text || ""
      ).trim();
      if (ing && FOREIGN_SCRIPT.test(ing)) return null;
      // Trebuie să aibă date nutriționale reale — altfel scorul ar fi un fals „100".
      const nut = p.nutriments || {};
      if (!NUTRI_KEYS.some((k) => typeof nut[k] === "number")) return null;

      const d = productDisplay({ ...p, product_name: name });
      return {
        barcode: p.code as string,
        name: d.title,
        brand: d.subtitle,
        imageUrl: p.image_url ?? "",
        score: analyzeProduct(p, lang).score,
      };
    })
    // Doar produse valide și strict mai sănătoase decât cel scanat
    .filter((p): p is Alternative => p !== null && p.score > currentScore)
    .sort((a, b) => b.score - a.score);

  // Preferăm alternative clar mai bune (+10); dacă nu sunt destule, completăm
  // cu orice e mai sănătos, ca să nu rămână gol.
  const clearlyBetter = scored.filter((p) => p.score >= currentScore + 10);
  const ranked = clearlyBetter.length >= 3 ? clearlyBetter : scored;

  // Deduplicare după nume + top 3
  const seen = new Set<string>();
  const unique: Alternative[] = [];
  for (const p of ranked) {
    const key = p.name.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
    if (unique.length >= 3) break;
  }
  return unique;
}
