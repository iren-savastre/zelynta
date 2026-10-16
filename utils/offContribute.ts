import { fetchWithTimeout } from "./net";
import { getAppUuid } from "./appIdentity";
import { APP_NAME, APP_VERSION, OFF_USER_AGENT } from "./userAgent";

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
 *
 * Submitting a new product to Open Food Facts.
 *
 * WHY WE DON'T TALK TO OPEN FOOD FACTS DIRECTLY
 * ----------------------------------------------
 * Writing to OFF requires `user_id` + `password` — Zelynta's global account
 * credentials. Any value placed in the app ends up in the APK file:
 * `EXPO_PUBLIC_*` is literally substituted into the bundle at build time, so
 * anyone who unpacks the app can read it. With the password in hand, anyone
 * could write to Open Food Facts ON Zelynta's BEHALF — and the consequence
 * would be the account getting blocked, i.e. losing the ability to
 * contribute for all users.
 *
 * That's why the app sends to our own proxy (Supabase Edge Function), which
 * keeps the password server-side and adds `user_id`/`password` before
 * forwarding the request. The proxy also applies a rate limit per `app_uuid`.
 *
 * The proxy URL is NOT a secret (it's just an address), so it can live in
 * EXPO_PUBLIC_CONTRIB_URL. When it isn't set, the contribution feature is
 * disabled entirely — see `isContributionEnabled()`.
 */

const PROXY_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_CONTRIB_URL) || "";


/** Contributia e disponibila doar daca proxy-ul a fost configurat. */
/** Contribution is available only if the proxy has been configured. */
export function isContributionEnabled(): boolean {
  return PROXY_URL.length > 0;
}

export type ContributionDraft = {
  barcode: string;
  /** Numele produsului, asa cum apare pe ambalaj. */
  /** The product's name, as it appears on the package. */
  productName: string;
  /** Marca. Optional — multe produse locale nu au una clara. */
  /** Brand. Optional — many local products don't have a clear one. */
  brands?: string;
  /** Lista de ingrediente, de obicei venita din OCR si confirmata de utilizator. */
  /** Ingredients list, usually coming from OCR and confirmed by the user. */
  ingredientsText?: string;
  /** Categorii, text liber separat prin virgula. Optional. */
  /** Categories, free text separated by commas. Optional. */
  categories?: string;
  /** Limba in care sunt scrise textele de mai sus (cod din 2 litere). */
  /** The language the texts above are written in (2-letter code). */
  lang: string;
};

export type ContributeErrorKind =
  | "NOT_CONFIGURED" // proxy-ul nu e setat — functia e oprita // the proxy isn't set — the feature is disabled
  | "INVALID_INPUT" // cod de bare sau nume lipsa // missing barcode or name
  | "NETWORK_ERROR" // fara conexiune // no connection
  | "RATE_LIMITED" // prea multe trimiteri // too many submissions
  | "REJECTED" // OFF a refuzat (produs blocat, date invalide) // OFF rejected it (blocked product, invalid data)
  | "UPSTREAM_ERROR"; // eroare la proxy sau la OFF // error at the proxy or at OFF

export type ContributeResult = { ok: true } | { ok: false; kind: ContributeErrorKind };

/** Codurile EAN/UPC au 8, 12, 13 sau 14 cifre. Filtram gresellile evidente. */
/** EAN/UPC codes have 8, 12, 13 or 14 digits. We filter out obvious mistakes. */
export function isPlausibleBarcode(code: string): boolean {
  return /^[0-9]{8}$|^[0-9]{12,14}$/.test(String(code || "").trim());
}

/**
 * Trimite un produs nou. Nu arunca niciodata — intoarce motivul, la fel ca
 * `lookupProductByBarcode`, ca interfata sa poata reactiona diferit.
 *
 * Submits a new product. Never throws — returns the reason instead, just
 * like `lookupProductByBarcode`, so the UI can react differently.
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
  // Fields get a language suffix: OFF stores each language's text separately,
  // so `product_name_ro` doesn't overwrite someone else's French version.
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
          // The format OFF requires: AppName/Version (contact).
          "User-Agent": OFF_USER_AGENT,
        },
        body: JSON.stringify(payload),
      },
      20000 // trimiterea poate include si o poza; lasam mai mult timp // the submission may include a photo; we allow more time
    );
  } catch {
    return { ok: false, kind: "NETWORK_ERROR" };
  }

  if (res.status === 429) return { ok: false, kind: "RATE_LIMITED" };
  if (res.status === 400 || res.status === 422) return { ok: false, kind: "REJECTED" };
  if (!res.ok) return { ok: false, kind: "UPSTREAM_ERROR" };

  // OFF raspunde cu status 1 la succes. Proxy-ul transmite raspunsul asa cum e.
  // OFF responds with status 1 on success. The proxy forwards the response as-is.
  try {
    const data = await res.json();
    if (data?.status === 1 || data?.ok === true) return { ok: true };
    return { ok: false, kind: "REJECTED" };
  } catch {
    return { ok: false, kind: "UPSTREAM_ERROR" };
  }
}
