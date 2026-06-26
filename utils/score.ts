import { additivesInfo } from "../i18n/additives";
import { cosmeticsInfo } from "../i18n/cosmetics";

export type ScoreReason =
  | { kind: "nutrient"; key: string; delta: number }
  | { kind: "ingredient"; name: string; level: string | null; delta: number };

export type AnalyzedAdditive = {
  code: string;
  name: string;
  use: string;
  level: string | null;
  desc: string;
};

export type Analysis = {
  score: number;
  reasons: ScoreReason[];
  additives: AnalyzedAdditive[];
  cosmetics: AnalyzedAdditive[];
};

function pickField(field: any, lang: string) {
  return field ? field[lang] ?? field.en ?? field.ro ?? "" : "";
}

export function getAdditives(product: any, lang: string): AnalyzedAdditive[] {
  const tags: string[] = product?.additives_tags ?? [];
  const seen = new Set<string>();
  const out: AnalyzedAdditive[] = [];
  for (const tag of tags) {
    const code = tag.replace("en:", "").toLowerCase();
    // Daca sub-varianta (ex. e322i, e471a) nu exista, cade pe codul de baza (e322, e471).
    const base = code.replace(/[a-z]+$/, "");
    const info = (additivesInfo as any)[code] ?? (additivesInfo as any)[base];
    // Evita duplicatele aceleiasi substante (ex. E322 + E322i = lecitine).
    const dedupeKey = info ? base : code;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push({
      code: ((additivesInfo as any)[code] ? code : base || code).toUpperCase(),
      name: pickField(info?.name, lang),
      use: pickField(info?.use, lang),
      level: info?.level ?? null,
      desc: pickField(info?.desc, lang),
    });
  }
  return out;
}

export function getCosmetics(product: any, lang: string): AnalyzedAdditive[] {
  if (!product) return [];
  const text = (
    product?.[`ingredients_text_${lang}`] ||
    product?.ingredients_text_en ||
    product?.ingredients_text ||
    ""
  ).toLowerCase();
  return Object.keys(cosmeticsInfo)
    .filter((key) => text.includes(key))
    .map((key) => {
      const info = (cosmeticsInfo as any)[key];
      return {
        code: pickField(info.name, lang),
        name: "",
        use: pickField(info.use, lang),
        level: info.level ?? null,
        desc: pickField(info.desc, lang),
      };
    });
}

export function analyzeProduct(product: any, lang: string): Analysis {
  const n = product?.nutriments ?? {};
  const calories = n["energy-kcal_100g"] ?? null;
  const sugars = n["sugars_100g"] ?? null;
  const satFat = n["saturated-fat_100g"] ?? null;
  const salt = n["salt_100g"] ?? null;

  const additives = getAdditives(product, lang);
  const cosmetics = getCosmetics(product, lang);

  let score = 100;
  const reasons: ScoreReason[] = [];
  const cutNutrient = (key: string, amount: number) => {
    if (amount > 0.5) {
      score -= amount;
      reasons.push({ kind: "nutrient", key, delta: -Math.round(amount) });
    }
  };

  const isBeverage = /water|eau|apa|drink|beverage|boisson|soda|juice|jus|cola|limonad/i.test(
    (product?.categories ?? "") + (product?.product_name ?? "") + (product?.brands ?? "")
  );

  if (isBeverage) {
    if (sugars != null) cutNutrient("sugars", Math.min(80, (sugars / 5) * 80));
    if (calories != null) cutNutrient("energy", Math.min(15, (calories / 40) * 15));
  } else {
    if (sugars != null) cutNutrient("sugars", Math.min(45, (sugars / 22) * 45));
    if (calories != null) cutNutrient("energy", Math.min(20, (calories / 450) * 20));
    if (satFat != null) cutNutrient("saturatedFat", Math.min(25, (satFat / 8) * 25));
    if (salt != null) cutNutrient("salt", Math.min(15, (salt / 1.5) * 15));
  }

  let hasRisk = false;
  let hasCaution = false;
  const judge = (name: string, level: string | null) => {
    let amount = 0;
    if (level === "risk") {
      amount = 35;
      hasRisk = true;
    } else if (level === "caution") {
      amount = 18;
      hasCaution = true;
    } else if (level === "moderate") {
      amount = 6;
    }
    if (amount > 0) {
      score -= amount;
      reasons.push({ kind: "ingredient", name, level, delta: -amount });
    }
  };

  additives.forEach((a) => judge(a.name ? `${a.code} · ${a.name}` : a.code, a.level));
  cosmetics.forEach((c) => judge(c.code, c.level));

  let finalScore = Math.max(0, Math.round(score));
  if (hasRisk && finalScore > 50) finalScore = 50;
  if (hasCaution && finalScore > 65) finalScore = 65;

  reasons.sort((a, b) => a.delta - b.delta);
  return { score: finalScore, reasons, additives, cosmetics };
}

export function scoreColor(score: number) {
  if (score >= 66) return "#038141";
  if (score >= 33) return "#EE8100";
  return "#E63E11";
}

// Alege numele „de afișat" al produsului.
// Datele OpenFoodFacts sunt inconsecvente: uneori numele recognoscibil e în
// product_name (Nutella), alteori în brands (Coca-Cola, când product_name e
// doar un descriptor gen „Original Taste"). Regula:
//  - dacă product_name e chiar o marcă din listă → îl folosim ca titlu (Nutella)
//  - altfel folosim prima marcă (Coca-Cola), iar product_name devine subtitlu
export function productDisplay(product: any): { title: string; subtitle: string } {
  const brandList = String(product?.brands || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const pname = String(product?.product_name || "").trim();
  const brand0 = brandList[0] || "";
  const pnameIsBrand =
    !!pname && brandList.some((b) => b.toLowerCase() === pname.toLowerCase());

  if (pname && pnameIsBrand) {
    return {
      title: pname,
      subtitle:
        brand0 && brand0.toLowerCase() !== pname.toLowerCase() ? brand0 : "",
    };
  }
  if (brand0) {
    return {
      title: brand0,
      subtitle:
        pname && pname.toLowerCase() !== brand0.toLowerCase() ? pname : "",
    };
  }
  return { title: pname, subtitle: "" };
}
