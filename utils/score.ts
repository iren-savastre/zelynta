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

// ---- Adnotare ingrediente: adaugă codul E lângă denumirea aditivului ----
// Ex: "acidifiant: acid fosforic" -> "acidifiant: acid fosforic (E338)".
type AnnIndex = { re: RegExp; byName: Map<string, string> };
const annCache: Record<string, AnnIndex> = {};

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildAnnIndex(lang: string): AnnIndex {
  if (annCache[lang]) return annCache[lang];
  const byName = new Map<string, string>(); // nume(lowercase) -> cod E
  for (const code in additivesInfo) {
    const info: any = (additivesInfo as any)[code];
    const ecode = code.toUpperCase(); // ex. "E338"
    const names = new Set<string>();
    // Numele din TOATE limbile dictionarului: etichetele europene sunt deseori
    // multilingve (nl/fr/de...), iar aditivul trebuie recunoscut indiferent de
    // limba in care l-a scris producatorul.
    for (const l in info?.name ?? {}) {
      const nm = info.name[l];
      if (nm) names.add(String(nm).trim());
    }
    // Sinonime/variante de pe etichete (plural, alte grafii), daca exista.
    for (const nm of info?.alt ?? []) {
      if (nm) names.add(String(nm).trim());
    }
    for (const nm of names) {
      // doar nume specifice (evită cuvinte scurte comune); primul cod câștigă
      if (nm.length >= 6 && !byName.has(nm.toLowerCase())) byName.set(nm.toLowerCase(), ecode);
    }
  }
  // o singură trecere, cu alternativă; cele mai lungi denumiri primele (câștigă)
  const names = [...byName.keys()].sort((a, b) => b.length - a.length).map(escapeRe);
  const re = new RegExp(
    "(^|[\\s,;:.()\\-/])(" + names.join("|") + ")(?![A-Za-zÀ-ÿ0-9])",
    "gi"
  );
  const idx = { re, byName };
  annCache[lang] = idx;
  return idx;
}

// Cod E ca token de sine stătător: E1105, E 160b, E-160b.
const E_CODE_RE = /\bE[\s-]?\d{3,4}[a-z]?\b/gi;

// Elimină aditivii din textul de ingrediente (au secțiune separată în UI).
// Scoate codurile E și segmentele formate doar din aditivi (ex. "conservant: lizozim").
// Ingredientele compuse (cu paranteze) sunt păstrate — nu le tăiem din greșeală.
export function stripAdditives(text: string, lang: string): string {
  if (!text || text.length > 4000) return text;
  const { re } = buildAnnIndex(lang);
  // Împarte pe separatoare de nivel superior (virgulă/;), respectând parantezele.
  const segs: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of text) {
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
    if ((ch === "," || ch === ";") && depth === 0) {
      segs.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) segs.push(cur);

  const kept: string[] = [];
  for (const seg of segs) {
    const raw = seg.trim();
    if (!raw) continue;
    // Valoarea de testat: după ultimul ":" (eticheta de clasă: conservant/colorant/…).
    const colon = raw.lastIndexOf(":");
    const value = colon >= 0 ? raw.slice(colon + 1) : raw;
    // Scoate codurile E și numele de aditivi cunoscute; dacă nu mai rămâne text,
    // segmentul era format doar din aditivi și îl eliminăm.
    re.lastIndex = 0;
    const leftover = value
      .replace(E_CODE_RE, " ")
      .replace(re, " ")
      .replace(/[^A-Za-zÀ-ÿ]/g, "")
      .trim();
    if (leftover === "") continue;
    // Păstrăm ingredientul, dar curățăm eventualele coduri E rămase.
    kept.push(
      raw
        .replace(E_CODE_RE, "")
        .replace(/\(\s*\)/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([,;.])/g, "$1")
        .trim()
    );
  }
  return kept.join(", ");
}

// Adaugă codul E după denumirea aditivului, dacă acesta nu apare deja în text.
export function annotateIngredients(text: string, lang: string): string {
  if (!text || text.length > 4000) return text;
  const { re, byName } = buildAnnIndex(lang);
  const upper = text.toUpperCase();
  const used = new Set<string>();
  re.lastIndex = 0;
  return text.replace(re, (m, pre, nm) => {
    const code = byName.get(String(nm).toLowerCase());
    if (!code) return m;
    if (used.has(code) || upper.includes(code)) return m; // o dată / deja scris de producător
    used.add(code);
    return pre + nm + " (" + code + ")";
  });
}

// Text de rezerva cand un cod E este valid dar nu-l avem inca in dictionar,
// ca sa nu apara un rand gol (ex. aditivi noi sau rar intalniti).
const UNKNOWN_ADDITIVE_DESC: Record<string, string> = {
  ro: "Aditiv alimentar autorizat în UE. Nu avem încă o descriere detaliată pentru el în aplicație.",
  en: "Food additive authorized in the EU. We do not yet have a detailed description for it in the app.",
  fr: "Additif alimentaire autorisé dans l'UE. Nous n'avons pas encore de description détaillée dans l'application.",
  it: "Additivo alimentare autorizzato nell'UE. Non abbiamo ancora una descrizione dettagliata nell'app.",
  es: "Aditivo alimentario autorizado en la UE. Todavía no tenemos una descripción detallada en la aplicación.",
  de: "In der EU zugelassener Lebensmittelzusatzstoff. Wir haben in der App noch keine ausführliche Beschreibung dafür.",
  ru: "Пищевая добавка, разрешённая в ЕС. У нас пока нет её подробного описания в приложении.",
  pl: "Dodatek do żywności dopuszczony w UE. Nie mamy jeszcze szczegółowego opisu w aplikacji.",
  nl: "In de EU toegelaten levensmiddelenadditief. We hebben er nog geen uitgebreide beschrijving voor in de app.",
};

export function getAdditives(product: any, lang: string): AnalyzedAdditive[] {
  const seen = new Set<string>();
  const out: AnalyzedAdditive[] = [];

  // Adaugă un aditiv după cod (ex. "e1105", "en:e160b", "E 471a"), fără duplicate.
  const addByCode = (codeRaw: string) => {
    const cleaned = String(codeRaw)
      .replace(/^[a-z]{2}:/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    // Accepta doar coduri E valide (E100..E1599, cu eventuala litera: e471a, e160b).
    const m = cleaned.match(/^e(\d{3,4})([a-z])?$/);
    if (!m) return; // ignora gunoiul de tip "e'(é"
    const code = "e" + m[1] + (m[2] ?? "");
    // Daca sub-varianta (ex. e322i, e471a) nu exista, cade pe codul de baza (e322, e471).
    const base = code.replace(/[a-z]+$/, "");
    const info = (additivesInfo as any)[code] ?? (additivesInfo as any)[base];
    // Evita duplicatele aceleiasi substante (ex. E322 + E322i = lecitine).
    // Dar NU uni sub-variante distincte care exista separat in dictionar
    // (ex. E160a beta-caroten vs E160b annatto au aceeasi baza "e160", dar sunt substante diferite).
    const dedupeKey = (additivesInfo as any)[code] ? code : info ? base : code;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    out.push({
      code: ((additivesInfo as any)[code] ? code : base || code).toUpperCase(),
      name: pickField(info?.name, lang),
      use: pickField(info?.use, lang),
      level: info?.level ?? null,
      desc:
        pickField(info?.desc, lang) ||
        (info ? "" : UNKNOWN_ADDITIVE_DESC[lang] || UNKNOWN_ADDITIVE_DESC.en),
    });
  };

  // 1) Din additives_tags (etichetele oferite de baza de date, la scanarea codului de bare).
  for (const rawTag of (product?.additives_tags ?? []) as string[]) addByCode(rawTag);

  // 2) Din textul de ingrediente: coduri E scrise explicit + denumiri cunoscute din dicționar.
  //    Așa intră la ADITIVI și cei pe care baza de date nu i-a etichetat (ex. lizozim, annatto).
  const text =
    product?.[`ingredients_text_${lang}`] ||
    product?.ingredients_text_en ||
    product?.ingredients_text ||
    "";
  if (text) {
    // Coduri E explicite (E1105, E 160b, E-160b).
    const codeRe = /\bE[\s-]?(\d{3,4})([a-z])?\b/gi;
    let cm: RegExpExecArray | null;
    while ((cm = codeRe.exec(text)) !== null) addByCode("e" + cm[1] + (cm[2] || ""));
    // Denumiri de aditivi cunoscute (ex. „lizozim", „annatto") -> codul E corespunzător.
    const { re, byName } = buildAnnIndex(lang);
    re.lastIndex = 0;
    let nm: RegExpExecArray | null;
    while ((nm = re.exec(text)) !== null) {
      const mapped = byName.get(String(nm[2]).toLowerCase());
      if (mapped) addByCode(mapped);
      if (re.lastIndex === nm.index) re.lastIndex++;
    }
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
  // Produs declarat „fara parfum" — nu semnala parfum ca substanta de urmarit.
  const fragranceFree =
    /sans\s+parfum|parfum[-\s]*free|fragrance[-\s]*free|without\s+(?:parfum|fragrance)|f[aă]r[aă]\s+parfum|no\s+(?:parfum|fragrance)/i.test(
      text
    );
  return Object.keys(cosmeticsInfo)
    .filter((key) => {
      // potrivire pe cuvant intreg (nu substring — evita „parfum” din „sans parfum”, etc.)
      const re = new RegExp("\\b" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
      if (!re.test(text)) return false;
      if (key === "parfum" && fragranceFree) return false;
      return true;
    })
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

  // Produsele NEALIMENTARE (pasta de dinti, sampon, cosmetice) nu au tabel
  // nutritional prin natura lor — la ele scorul se bazeaza DOAR pe ingrediente
  // si aditivi, identic indiferent de metoda de scanare (cod de bare sau poza).
  const isCosmetic =
    cosmetics.length > 0 ||
    // provine din baza de cosmetice OpenBeautyFacts (marcata de apiClient la scanarea codului)
    product?._db === "beauty" ||
    /beaut|cosmet|personal.?care|skin.?care|face.?care|hair.?care/i.test(
      ((product?.categories_tags ?? []) as string[]).join(",")
    ) ||
    // tipuri de produs cosmetic/ingrijire, in mai multe limbi
    /toothpaste|dentifrice|pasta de dinti|zahnpasta|cosmetic|hygiene|igien|shampoo|shampoing|sampon|soap|savon|sapun|deodorant|antiperspirant|cream|creme|crema|crème|lotion|lotiune|gel de dus|shower|cleanser|cleansing|face wash|demachiant|serum|\bser\b|toner|tonic|micellar|micelar|moistur|hydrating|hidratant|exfoliat|scrub|peeling|\bmask\b|masca|mască|masque|balm|balsam|conditioner|balsam de par|after.?shave|sunscreen|\bspf\b|make.?up|makeup|machiaj|mascara|foundation|fond de ten|concealer|nail|oja|skincare|skin care|face care|hair(?!\w)/i.test(
      (product?.categories ?? "") +
        ((product?.categories_tags ?? []) as string[]).join(",") +
        (product?.product_name ?? "") +
        (product?.brands ?? "")
    );

  // Fara NICIO valoare nutritionala la un ALIMENT (ex. produs citit din poza —
  // OCR-ul da doar ingredientele), nutritia e o necunoscuta: nu putem pretinde
  // ca produsul e sanatos. Scadem 50 (60% din scor ar fi venit din nutritie)
  // si aratam motivul; aditivii penalizeaza in continuare separat.
  const noNutritionData =
    calories == null && sugars == null && satFat == null && salt == null;
  if (noNutritionData && !isCosmetic) {
    score -= 50;
    reasons.push({ kind: "nutrient", key: "noData", delta: -50 });
  }

  // La COSMETICE, scorul se bazeaza pe lista de ingrediente. Daca produsul e citit
  // dupa codul de bare fara ingrediente (ex. Nivea negasita cu compozitie), NU putem
  // sti ce contine — deci nu are voie sa apara „100% sanatos". Aplicam un scor neutru
  // si aratam motivul: utilizatorul e invitat sa scaneze eticheta pentru un scor real.
  const cosmeticText = String(
    product?.[`ingredients_text_${lang}`] ||
      product?.ingredients_text_en ||
      product?.ingredients_text ||
      ""
  ).trim();
  const noCosmeticData = isCosmetic && cosmeticText === "";
  if (noCosmeticData) {
    score -= 45;
    reasons.push({ kind: "nutrient", key: "noCosmeticData", delta: -45 });
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

  // La COSMETICE nu aplicam penalizarile aditivilor ALIMENTARI: clasificarile lor
  // (ex. „benzoatul formeaza benzen cu vitamina C cand e inghitit") sunt pentru mancare,
  // nu pentru un produs care se aplica/clateste pe piele. Scorul cosmetic se bazeaza pe
  // hazardele cosmetice (parabeni, sulfati, alergeni de parfum) din getCosmetics.
  const scoredAdditives = isCosmetic ? [] : additives;
  scoredAdditives.forEach((a) => judge(a.name ? `${a.code} · ${a.name}` : a.code, a.level));
  cosmetics.forEach((c) => judge(c.code, c.level));

  let finalScore = Math.max(0, Math.round(score));
  if (hasRisk && finalScore > 50) finalScore = 50;
  if (hasCaution && finalScore > 65) finalScore = 65;

  reasons.sort((a, b) => a.delta - b.delta);
  return { score: finalScore, reasons, additives: scoredAdditives, cosmetics };
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
