import { analyzeProduct } from "./score";

export type Alternative = {
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string;
  score: number;
};

// Caută produse mai sănătoase din aceeași categorie (OpenFoodFacts)
export async function getBetterAlternatives(
  product: any,
  currentScore: number,
  lang: string
): Promise<Alternative[]> {
  const cats: string[] = product?.categories_tags ?? [];
  if (cats.length === 0) return [];
  // Categoria cea mai specifică e ultima
  const category = cats[cats.length - 1].replace(/^en:/, "");

  try {
    const url =
      `https://world.openfoodfacts.org/api/v2/search` +
      `?categories_tags_en=${encodeURIComponent(category)}` +
      `&fields=code,product_name,brands,image_url,additives_tags,nutriments,categories,ingredients_text,ingredients_text_${lang},ingredients_text_en` +
      `&page_size=40&sort_by=unique_scans_n`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Zelynta/1.0 (iren.savastre@example.com)" },
    });
    const data = await res.json();
    const products: any[] = data?.products ?? [];

    const scored = products
      .filter((p) => p.code && p.code !== product.code && p.product_name)
      .map((p) => ({
        barcode: p.code,
        name: p.product_name,
        brand: p.brands ? p.brands.split(",")[0] : "",
        imageUrl: p.image_url ?? "",
        score: analyzeProduct(p, lang).score,
      }))
      // Doar produse clar mai bune
      .filter((p) => p.score >= currentScore + 10)
      .sort((a, b) => b.score - a.score);

    // Deduplicare după nume + top 3
    const seen = new Set<string>();
    const unique: Alternative[] = [];
    for (const p of scored) {
      const key = p.name.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(p);
      if (unique.length >= 3) break;
    }
    return unique;
  } catch {
    return [];
  }
}
