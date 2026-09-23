import { fetchWithTimeout } from "./net";
import { getCachedProduct, setCachedProduct } from "./productCache";

// Bazele OpenFoodFacts încercate pe rând: alimente, cosmetice, produse generale,
// hrană pentru animale. `db` marcheaza sursa, ca scorul sa stie ca un produs din
// OpenBeautyFacts e cosmetic.
const DATABASES = [
  { base: "https://world.openfoodfacts.org", db: "food" },
  { base: "https://world.openbeautyfacts.org", db: "beauty" },
  { base: "https://world.openproductsfacts.org", db: "products" },
  { base: "https://world.openpetfoodfacts.org", db: "petfood" },
];

// Limbile aplicatiei. Textul de ingrediente e functia centrala a Zelynta, deci
// cerem varianta din fiecare limba — altfel un utilizator polonez ar primi
// produsul fara compozitie doar pentru ca am cerut numai `ingredients_text_ro`.
export const APP_LANGS = ["ro", "en", "fr", "it", "es", "de", "ru", "pl", "nl", "bg", "el", "sq"];

// Campurile cerute de la API. Fara `fields`, OpenFoodFacts trimite produsul
// intreg (adesea peste 100 KB: istoric de modificari, toate limbile, toate
// pozele). Lista de mai jos e extrasa din cod, nu presupusa — fiecare intrare
// e citita undeva:
//   code, image_url, packaging, packaging_tags, lang  -> app/index.tsx
//   product_name, brands                              -> productDisplay()
//   nutriments                                        -> analyzeProduct()
//   additives_tags                                    -> getAdditives()
//   ingredients_text*                                 -> getAdditives/getCosmetics
//   ingredients                                       -> hasIngredients()
//   categories, categories_tags                       -> detectia de cosmetice
export const PRODUCT_FIELDS = [
  "code",
  "product_name",
  "product_name_en",
  "brands",
  "image_url",
  "nutriments",
  "additives_tags",
  "categories",
  "categories_tags",
  "packaging",
  "packaging_tags",
  "ingredients",
  "ingredients_text",
  "ingredients_text_en",
  "lang",
  ...APP_LANGS.map((l) => `product_name_${l}`),
  ...APP_LANGS.map((l) => `ingredients_text_${l}`),
].join(",");

// De ce a esuat o cautare. UI-ul trebuie sa se comporte diferit pentru fiecare:
// un utilizator fara internet NU trebuie sa vada „produsul nu exista" si NU
// trebuie trimis sa adauge produsul pe Open Food Facts.
export type LookupErrorKind =
  | "PRODUCT_NOT_FOUND" // toate bazele au raspuns si niciuna nu are produsul
  | "NETWORK_ERROR" // nicio baza nu a raspuns (offline, DNS, timeout)
  | "RATE_LIMITED" // 429 — prea multe cereri, se rezolva cu asteptare
  | "UPSTREAM_ERROR"; // 5xx sau raspuns nevalid — problema e la sursa

export type LookupResult =
  | { ok: true; product: any }
  | { ok: false; kind: LookupErrorKind };

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

// Caută un produs după cod în cele 4 baze. Preferă varianta CARE ARE ingrediente:
// dacă prima bază găsește produsul dar fără ingrediente, verificăm și celelalte
// (ex. o pastă de dinți poate fi în „alimente" fără compoziție, dar în „cosmetice" cu ea).
//
// Spre deosebire de versiunea anterioara, erorile nu mai sunt inghitite: fiecare
// baza raporteaza ce s-a intamplat, iar la final decidem un singur motiv.
export async function lookupProductByBarcode(code: string): Promise<LookupResult> {
  // Un produs deja scanat se serveste din memorie: zero cereri, raspuns instant
  // si o cerere in minus catre plafonul de rata al Open Food Facts.
  const fresh = await getCachedProduct(code);
  if (fresh) return { ok: true, product: fresh.product };

  let fallback: any = null;
  let notFound = 0; // baze care au raspuns clar „nu am produsul"
  let networkErrors = 0; // baze care nu au raspuns deloc
  let rateLimited = 0; // baze care au raspuns 429
  let upstreamErrors = 0; // baze care au raspuns 5xx / JSON invalid

  for (const { base, db } of DATABASES) {
    let res: Response;
    try {
      res = await fetchWithTimeout(
        `${base}/api/v2/product/${code}.json?fields=${encodeURIComponent(PRODUCT_FIELDS)}`,
        { headers: { "User-Agent": "Zelynta/1.0 (https://zelynta.com/)" } }
      );
    } catch {
      // Fara raspuns: offline, DNS cazut, sau timeout (AbortError). Pentru
      // utilizator rezultatul e acelasi — nu stim nimic despre produs.
      networkErrors++;
      continue;
    }

    if (res.status === 429) {
      rateLimited++;
      continue;
    }
    if (!res.ok) {
      upstreamErrors++;
      continue;
    }

    let data: any;
    try {
      data = await res.json();
    } catch {
      // A raspuns 200 dar cu ceva ce nu e JSON (pagina de eroare, HTML de proxy).
      upstreamErrors++;
      continue;
    }

    if (data?.status === 1 && data.product) {
      const p = { ...data.product, _db: db };
      if (hasIngredients(p)) {
        await setCachedProduct(code, p);
        return { ok: true, product: p }; // cel mai bun rezultat
      }
      if (!fallback) fallback = p; // fără ingrediente — îl ținem ca rezervă
    } else {
      notFound++;
    }
  }

  if (fallback) {
    await setCachedProduct(code, fallback);
    return { ok: true, product: fallback };
  }

  // Nimic proaspat. Daca avem produsul salvat de la o scanare anterioara si
  // problema e conexiunea, il aratam pe cel vechi: un produs expirat e mult
  // mai util decat un ecran de eroare. Cand produsul chiar nu exista in baze
  // (notFound), nu servim nimic — nu avem ce.
  if (notFound !== DATABASES.length) {
    const stale = await getCachedProduct(code, { allowStale: true });
    if (stale) return { ok: true, product: stale.product };
  }

  // Ordinea conteaza. „Produsul nu exista" e o afirmatie tare: o facem doar
  // daca TOATE bazele au raspuns si toate au spus ca nu il au. Daca macar una
  // nu a putut fi intrebata, raspunsul e incomplet si raportam cauza reala.
  if (notFound === DATABASES.length) return { ok: false, kind: "PRODUCT_NOT_FOUND" };
  if (rateLimited > 0) return { ok: false, kind: "RATE_LIMITED" };
  if (upstreamErrors > 0) return { ok: false, kind: "UPSTREAM_ERROR" };
  return { ok: false, kind: "NETWORK_ERROR" };
}

// Varianta compatibila cu apelurile vechi, pentru ecranele care nu au nevoie
// sa distinga motivul esecului (ex. comparatia, unde produsul lipsa e doar o
// coloana goala). Ecranul principal foloseste lookupProductByBarcode.
export async function fetchProductByBarcode(code: string): Promise<any | null> {
  const r = await lookupProductByBarcode(code);
  return r.ok ? r.product : null;
}
