import { fetchWithTimeout } from "./net";
import { getAppUuid } from "./appIdentity";

/**
 * Trimiterea unui produs nou catre Open Food Facts.
 *
 * DE CE NU VORBIM DIRECT CU OPEN FOOD FACTS
 * -----------------------------------------
 * Scrierea in OFF cere `user_id` + `password` — datele contului global Zelynta.
 * Orice valoare pusa in aplicatie ajunge in fisierul APK: `EXPO_PUBLIC_*` e
 * inlocuita literal in bundle la build, deci oricine dezarhiveaza aplicatia o
 * citeste. Cu parola in mana, oricine ar putea scrie in Open Food Facts IN
 * NUMELE Zelynta — iar consecinta ar fi blocarea contului, adica pierderea
 * posibilitatii de a contribui pentru toti utilizatorii.
 *
 * De aceea aplicatia trimite catre un proxy al nostru (Supabase Edge Function),
 * care tine parola pe server si adauga `user_id`/`password` inainte de a trimite
 * mai departe. Proxy-ul mai aplica si o limita de rata per `app_uuid`.
 *
 * URL-ul proxy-ului NU e un secret (e doar o adresa), deci poate sta in
 * EXPO_PUBLIC_CONTRIB_URL. Cand nu e setat, functia de contributie e oprita
 * complet — vezi `isContributionEnabled()`.
 */

const PROXY_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_CONTRIB_URL) || "";

const APP_NAME = "Zelynta";
const APP_VERSION =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_APP_VERSION) || "1.0.0";

/** Contributia e disponibila doar daca proxy-ul a fost configurat. */
export function isContributionEnabled(): boolean {
  return PROXY_URL.length > 0;
}

export type ContributionDraft = {
  barcode: string;
  /** Numele produsului, asa cum apare pe ambalaj. */
  productName: string;
  /** Marca. Optional — multe produse locale nu au una clara. */
  brands?: string;
  /** Lista de ingrediente, de obicei venita din OCR si confirmata de utilizator. */
  ingredientsText?: string;
  /** Categorii, text liber separat prin virgula. Optional. */
  categories?: string;
  /** Limba in care sunt scrise textele de mai sus (cod din 2 litere). */
  lang: string;
};

export type ContributeErrorKind =
  | "NOT_CONFIGURED" // proxy-ul nu e setat — functia e oprita
  | "INVALID_INPUT" // cod de bare sau nume lipsa
  | "NETWORK_ERROR" // fara conexiune
  | "RATE_LIMITED" // prea multe trimiteri
  | "REJECTED" // OFF a refuzat (produs blocat, date invalide)
  | "UPSTREAM_ERROR"; // eroare la proxy sau la OFF

export type ContributeResult = { ok: true } | { ok: false; kind: ContributeErrorKind };

/** Codurile EAN/UPC au 8, 12, 13 sau 14 cifre. Filtram gresellile evidente. */
export function isPlausibleBarcode(code: string): boolean {
  return /^[0-9]{8}$|^[0-9]{12,14}$/.test(String(code || "").trim());
}

/**
 * Trimite un produs nou. Nu arunca niciodata — intoarce motivul, la fel ca
 * `lookupProductByBarcode`, ca interfata sa poata reactiona diferit.
 */
export async function contributeProduct(
  draft: ContributionDraft
): Promise<ContributeResult> {
  if (!isContributionEnabled()) return { ok: false, kind: "NOT_CONFIGURED" };

  const barcode = String(draft.barcode || "").trim();
  const name = String(draft.productName || "").trim();
  if (!isPlausibleBarcode(barcode) || name.length < 2) {
    return { ok: false, kind: "INVALID_INPUT" };
  }

  const appUuid = await getAppUuid();
  const lang = String(draft.lang || "en").slice(0, 2).toLowerCase();

  // Campurile merg cu sufix de limba: OFF stocheaza separat textul fiecarei
  // limbi, deci `product_name_ro` nu suprascrie versiunea franceza a altcuiva.
  const payload: Record<string, string> = {
    code: barcode,
    app_name: APP_NAME,
    app_version: APP_VERSION,
    app_uuid: appUuid,
    lang,
    [`product_name_${lang}`]: name,
  };
  if (draft.brands?.trim()) payload.brands = draft.brands.trim();
  if (draft.categories?.trim()) payload.categories = draft.categories.trim();
  if (draft.ingredientsText?.trim()) {
    payload[`ingredients_text_${lang}`] = draft.ingredientsText.trim();
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(
      PROXY_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Formatul cerut de OFF: NumeAplicatie/Versiune (contact).
          "User-Agent": `${APP_NAME}/${APP_VERSION} (https://zelynta.com/)`,
        },
        body: JSON.stringify(payload),
      },
      20000 // trimiterea poate include si o poza; lasam mai mult timp
    );
  } catch {
    return { ok: false, kind: "NETWORK_ERROR" };
  }

  if (res.status === 429) return { ok: false, kind: "RATE_LIMITED" };
  if (res.status === 400 || res.status === 422) return { ok: false, kind: "REJECTED" };
  if (!res.ok) return { ok: false, kind: "UPSTREAM_ERROR" };

  // OFF raspunde cu status 1 la succes. Proxy-ul transmite raspunsul asa cum e.
  try {
    const data = await res.json();
    if (data?.status === 1 || data?.ok === true) return { ok: true };
    return { ok: false, kind: "REJECTED" };
  } catch {
    return { ok: false, kind: "UPSTREAM_ERROR" };
  }
}
