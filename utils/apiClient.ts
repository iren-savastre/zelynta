import { fetchWithTimeout } from "./net";
import { getCachedProduct, setCachedProduct } from "./productCache";
import { OFF_USER_AGENT } from "./userAgent";

// Bazele OpenFoodFacts încercate pe rând: alimente, cosmetice, produse generale,
// hrană pentru animale. `db` marcheaza sursa, ca scorul sa stie ca un produs din
// OpenBeautyFacts e cosmetic.
// The OpenFoodFacts databases tried in order: food, cosmetics, general
// products, pet food. `db` marks the source, so the score knows a product
// from OpenBeautyFacts is a cosmetic.
const DATABASES = [
  { base: "https://world.openfoodfacts.org", db: "food" },
  { base: "https://world.openbeautyfacts.org", db: "beauty" },
  { base: "https://world.openproductsfacts.org", db: "products" },
  { base: "https://world.openpetfoodfacts.org", db: "petfood" },
];

// Limbile aplicatiei. Textul de ingrediente e functia centrala a Zelynta, deci
// cerem varianta din fiecare limba — altfel un utilizator polonez ar primi
// produsul fara compozitie doar pentru ca am cerut numai `ingredients_text_ro`.
// The app's languages. The ingredients text is Zelynta's core feature, so we
// request the version in every language — otherwise a Polish user would get
// the product with no composition just because we only requested `ingredients_text_ro`.
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
// The fields requested from the API. Without `fields`, OpenFoodFacts sends
// the entire product (often over 100 KB: edit history, all languages, all
// photos). The list below is extracted from the code, not assumed — each
// entry is read somewhere:
//   code, image_url, packaging, packaging_tags, lang  -> app/index.tsx
//   product_name, brands                              -> productDisplay()
//   nutriments                                        -> analyzeProduct()
//   additives_tags                                    -> getAdditives()
//   ingredients_text*                                 -> getAdditives/getCosmetics
//   ingredients                                       -> hasIngredients()
//   categories, categories_tags                       -> cosmetics detection
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
// Why a lookup failed. The UI must behave differently for each case: a user
// with no internet must NOT see "the product doesn't exist" and must NOT be
// sent to add the product on Open Food Facts.
export type LookupErrorKind =
  | "PRODUCT_NOT_FOUND" // toate bazele au raspuns si niciuna nu are produsul // all databases responded and none has the product
  | "NETWORK_ERROR" // nicio baza nu a raspuns (offline, DNS, timeout) // no database responded (offline, DNS, timeout)
  | "RATE_LIMITED" // 429 — prea multe cereri, se rezolva cu asteptare // 429 — too many requests, resolved by waiting
  | "UPSTREAM_ERROR"; // 5xx sau raspuns nevalid — problema e la sursa // 5xx or invalid response — the problem is at the source

export type LookupResult =
  | { ok: true; product: any }
  | { ok: false; kind: LookupErrorKind };

// Produsul are lista de ingrediente citibilă (în orice limbă)?
// Does the product have a readable ingredients list (in any language)?
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
// Looks up a product by code across the 4 databases. Prefers the variant
// THAT HAS ingredients: if the first database finds the product but without
// ingredients, we also check the others (e.g. a toothpaste might be in "food"
// without a composition, but in "cosmetics" with one).
//
// Unlike the previous version, errors are no longer swallowed: each database
// reports what happened, and at the end we decide on a single reason.
export async function lookupProductByBarcode(code: string): Promise<LookupResult> {
  // Un produs deja scanat se serveste din memorie: zero cereri, raspuns instant
  // si o cerere in minus catre plafonul de rata al Open Food Facts.
  // A product already scanned is served from memory: zero requests, instant
  // response, and one less request against Open Food Facts' rate limit.
  const fresh = await getCachedProduct(code);
  if (fresh) return { ok: true, product: fresh.product };

  let fallback: any = null;
  let notFound = 0; // baze care au raspuns clar „nu am produsul" // databases that clearly answered "I don't have the product"
  let networkErrors = 0; // baze care nu au raspuns deloc // databases that didn't respond at all
  let rateLimited = 0; // baze care au raspuns 429 // databases that responded 429
  let upstreamErrors = 0; // baze care au raspuns 5xx / JSON invalid // databases that responded 5xx / invalid JSON

  for (const { base, db } of DATABASES) {
    let res: Response;
    try {
      res = await fetchWithTimeout(
        `${base}/api/v2/product/${code}.json?fields=${encodeURIComponent(PRODUCT_FIELDS)}`,
        { headers: { "User-Agent": OFF_USER_AGENT } }
      );
    } catch {
      // Fara raspuns: offline, DNS cazut, sau timeout (AbortError). Pentru
      // utilizator rezultatul e acelasi — nu stim nimic despre produs.
      // No response: offline, DNS down, or timeout (AbortError). For the
      // user the result is the same — we know nothing about the product.
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
      // Responded 200 but with something that isn't JSON (error page, proxy HTML).
      upstreamErrors++;
      continue;
    }

    if (data?.status === 1 && data.product) {
      const p = { ...data.product, _db: db };
      if (hasIngredients(p)) {
        await setCachedProduct(code, p);
        return { ok: true, product: p }; // cel mai bun rezultat // the best result
      }
      if (!fallback) fallback = p; // fără ingrediente — îl ținem ca rezervă // no ingredients — we keep it as a fallback
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
  // Nothing fresh. If we have the product saved from a previous scan and
  // the problem is the connection, we show the old one: an expired product
  // is much more useful than an error screen. When the product truly doesn't
  // exist in the databases (notFound), we serve nothing — there's nothing to serve.
  if (notFound !== DATABASES.length) {
    const stale = await getCachedProduct(code, { allowStale: true });
    if (stale) return { ok: true, product: stale.product };
  }

  // Ordinea conteaza. „Produsul nu exista" e o afirmatie tare: o facem doar
  // daca TOATE bazele au raspuns si toate au spus ca nu il au. Daca macar una
  // nu a putut fi intrebata, raspunsul e incomplet si raportam cauza reala.
  // Order matters. "The product doesn't exist" is a strong claim: we only
  // make it if ALL databases responded and all said they don't have it. If
  // even one couldn't be asked, the answer is incomplete and we report the real cause.
  if (notFound === DATABASES.length) return { ok: false, kind: "PRODUCT_NOT_FOUND" };
  if (rateLimited > 0) return { ok: false, kind: "RATE_LIMITED" };
  if (upstreamErrors > 0) return { ok: false, kind: "UPSTREAM_ERROR" };
  return { ok: false, kind: "NETWORK_ERROR" };
}

// Varianta compatibila cu apelurile vechi, pentru ecranele care nu au nevoie
// sa distinga motivul esecului (ex. comparatia, unde produsul lipsa e doar o
// coloana goala). Ecranul principal foloseste lookupProductByBarcode.
// A version compatible with the old calls, for screens that don't need to
// tell the failure reason apart (e.g. comparison, where a missing product is
// just an empty column). The main screen uses lookupProductByBarcode.
export async function fetchProductByBarcode(code: string): Promise<any | null> {
  const r = await lookupProductByBarcode(code);
  return r.ok ? r.product : null;
}
