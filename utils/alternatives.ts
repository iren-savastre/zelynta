import { fetchWithTimeout } from "./net";
import { analyzeProduct, productDisplay } from "./score";
import { cacheGet, cacheSet } from "./cache";

export type Alternative = {
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string;
  score: number;
};

// Cate produse cerem intr-o cautare. Masurat pe API-ul real (12 sept. 2026):
// page_size=50 intoarce ~47 produse utilizabile, 163 KB; page_size=100 intoarce
// ~91 utilizabile, 258 KB. Afisam cel mult 8 alternative dintr-un bazin de 20,
// deci 50 e suficient si taie ~37% din trafic.
const PAGE_SIZE = 50;

// Listele de categorie se schimba lent (produsele noi apar in zile, nu in
// minute), iar raspunsul e mare. O zi de cache scade masiv presiunea pe
// plafonul de rata cand utilizatorul scaneaza mai multe produse similare.
const CATEGORY_TTL_MS = 24 * 60 * 60 * 1000;

// `categories_tags` amesteca doua feluri de etichete:
//   en:confectionary-based-spreads   <- cheie canonica de taxonomie
//   en:Pâtes à tartiner              <- acelasi lucru, ca nume afisabil francez
// Parametrul `categories_tags_en` intelege doar prima forma. Versiunea veche
// lua ultimele 3 etichete, care sunt tocmai cele afisabile — masurat pe Nutella:
// eticheta franceza returna 7 produse utilizabile, cea canonica 30.
const isCanonicalTag = (t: string) => /^en:[a-z0-9][a-z0-9-]*$/.test(t);

async function searchCategory(category: string, lang: string): Promise<any[]> {
  const cacheKey = `zelynta_cat_${lang}_${category}`;
  const hit = await cacheGet<any[]>(cacheKey);
  if (hit) return hit;

  const url =
    `https://world.openfoodfacts.org/api/v2/search` +
    `?categories_tags_en=${encodeURIComponent(category)}` +
    `&fields=code,product_name,product_name_${lang},product_name_en,brands,image_url,additives_tags,nutriments,categories,ingredients_text,ingredients_text_${lang},ingredients_text_en` +
    `&page_size=${PAGE_SIZE}&sort_by=unique_scans_n`;

  const res = await fetchWithTimeout(url, {
    headers: { "User-Agent": "Zelynta/1.0 (https://zelynta.com/)" },
  });
  if (!res.ok) return []; // 429/503 — endpoint-ul de cautare OFF cade des
  const data = await res.json();
  const products = (data?.products ?? []) as any[];
  if (products.length) await cacheSet(cacheKey, products, CATEGORY_TTL_MS);
  return products;
}

// Caută produse mai sănătoase din aceeași categorie (OpenFoodFacts).
// Tinta e O SINGURA cautare, pe cea mai specifica categorie canonica. Trecem la
// una mai larga doar daca prima nu a dat nimic (categorie invalida sau 503).
export async function getBetterAlternatives(
  product: any,
  currentScore: number,
  lang: string
): Promise<Alternative[]> {
  const cats: string[] = product?.categories_tags ?? [];
  if (cats.length === 0) return [];

  // Doar etichetele canonice, de la cea mai specifica spre cele mai largi.
  const candidates = cats.filter(isCanonicalTag).reverse().map((c) => c.replace(/^en:/, ""));
  if (candidates.length === 0) return [];

  const pool = new Map<string, any>();
  // Cel mult 2 cereri: in practica prima ajunge aproape mereu.
  for (const category of candidates.slice(0, 2)) {
    try {
      for (const p of await searchCategory(category, lang)) {
        if (p?.code && p.code !== product.code && p.product_name && !pool.has(p.code)) {
          pool.set(p.code, p);
        }
      }
    } catch {
      // ignoră categoria asta și încearcă următoarea
    }
    if (pool.size > 0) break; // avem din ce alege — nu mai cerem nimic
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
    // Doar produse VERZI (scor ≥ 66, sănătoase) și mai bune decât cel scanat.
    // Recomandăm exclusiv opțiuni clar sănătoase, nu doar „mai puțin rele".
    .filter((p): p is Alternative => p !== null && p.score >= 66 && p.score > currentScore)
    .sort((a, b) => b.score - a.score);

  const ranked = scored;

  // Deduplicare după nume — construim un bazin mai larg (până la 20 de opțiuni bune).
  const seen = new Set<string>();
  const pool2: Alternative[] = [];
  for (const p of ranked) {
    const key = p.name.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    pool2.push(p);
    if (pool2.length >= 20) break;
  }

  // Amestecăm bazinul (Fisher-Yates) și afișăm până la 8 — utilizatorul vede că
  // există MAI MULTE soluții, în ordine aleatorie, nu doar cea mai bună.
  for (let i = pool2.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool2[i], pool2[j]] = [pool2[j], pool2[i]];
  }
  return pool2.slice(0, 8);
}
