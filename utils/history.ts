import AsyncStorage from "@react-native-async-storage/async-storage";
import { resetAppUuid } from "./appIdentity";

const KEY = "zelynta_history";

export type HistoryItem = {
  barcode: string;
  name: string;
  brand: string;
  imageUrl: string;
  score: number;
  scannedAt: number; // timestamp
};

// Doua intrari sunt "acelasi produs" daca au acelasi barcode SAU acelasi
// nume+marca (scanarile din poza primesc coduri interne unice, deci fara
// compararea numelui s-ar aduna dubluri ale aceluiasi produs).
// Two entries are "the same product" if they have the same barcode OR the
// same name+brand (photo scans get unique internal codes, so without
// comparing the name we'd end up with duplicates of the same product).
const norm = (s: string) => (s ?? "").trim().toLowerCase();
function sameProduct(a: HistoryItem, b: HistoryItem): boolean {
  if (a.barcode === b.barcode) return true;
  return norm(a.name) !== "" && norm(a.name) === norm(b.name) && norm(a.brand) === norm(b.brand);
}

// Pastreaza doar prima aparitie (lista e ordonata: cele mai noi primele).
// Keeps only the first occurrence (the list is ordered: newest first).
function dedupe(list: HistoryItem[]): HistoryItem[] {
  const out: HistoryItem[] = [];
  for (const item of list) {
    if (!out.some((kept) => sameProduct(kept, item))) out.push(item);
  }
  return out;
}

export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    // Deduplicam si la citire — curata automat dublurile salvate in trecut.
    // We also dedupe on read — automatically cleans up duplicates saved in the past.
    return raw ? dedupe(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

/**
 * Salveaza o scanare.
 *
 * Istoricul NU se plafoneaza: produsele scanate raman pana cand utilizatorul
 * le sterge sau dezinstaleaza aplicatia. (Inainte se pastrau doar ultimele
 * 100, iar cele mai vechi dispareau fara ca nimeni sa fie anuntat.)
 *
 * Rescanarea aceluiasi produs nu creeaza o a doua intrare: cea veche e
 * inlocuita, deci data se actualizeaza si produsul urca in capul listei.
 *
 * Saves a scan.
 *
 * History is NOT capped: scanned products stay until the user deletes
 * them or uninstalls the app. (Before, only the last 100 were kept, and
 * the oldest ones silently disappeared.)
 *
 * Rescanning the same product doesn't create a second entry: the old one
 * is replaced, so the date updates and the product moves to the top of the list.
 */
export async function saveToHistory(item: HistoryItem): Promise<void> {
  let updated: HistoryItem[];
  try {
    const history = await getHistory();
    // Scoate orice intrare veche a aceluiasi produs (dupa cod SAU nume+marca)
    // Removes any old entry of the same product (by code OR name+brand)
    const filtered = history.filter((h) => !sameProduct(h, item));
    // Adaugă noua intrare în față
    // Adds the new entry at the front
    updated = dedupe([item, ...filtered]);
  } catch {
    updated = [item];
  }

  // Fara plafon, stocarea telefonului se poate umple candva. Daca scrierea
  // esueaza, nu pierdem noua scanare in tacere: renuntam la jumatate din cele
  // mai vechi intrari si reincercam. Mai bine un istoric scurtat decat un
  // produs scanat care nu se salveaza deloc.
  // Without a cap, the phone's storage can eventually fill up. If the write
  // fails, we don't silently lose the new scan: we drop half of the oldest
  // entries and retry. A shortened history beats a scanned product that
  // doesn't get saved at all.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
      return;
    } catch {
      if (updated.length <= 1) return;
      updated = updated.slice(0, Math.max(1, Math.floor(updated.length / 2)));
    }
  }
}

export async function removeFromHistory(barcode: string): Promise<void> {
  try {
    const history = await getHistory();
    const updated = history.filter((h) => h.barcode !== barcode);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}

// GDPR / control utilizator: șterge toate datele de conținut de pe dispozitiv
// (istoric, favorite, coș, cache traduceri, cache produse și categorii).
// Preferințele UI (temă, limbă, paletă) rămân, pentru a nu reseta experiența.
//
// Cache-ul de produse (`zelynta_product_`) ține 14 zile numele, ingredientele,
// imaginea și valorile nutriționale ale fiecărui produs scanat. Dacă nu l-am
// șterge aici, „Șterge toate datele" ar lăsa pe dispozitiv exact lucrurile pe
// care utilizatorul tocmai a cerut să le uităm.
// GDPR / user control: deletes all content data from the device
// (history, favorites, basket, translation cache, product and category cache).
// UI preferences (theme, language, palette) are kept, so the experience isn't reset.
//
// The product cache (`zelynta_product_`) holds the name, ingredients,
// image and nutrition values of each scanned product for 14 days. If we
// didn't clear it here, "Delete all data" would leave on the device exactly
// the things the user just asked us to forget.
export async function clearAllData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter(
      (k) =>
        k === "zelynta_history" ||
        k === "zelynta_favorites" ||
        k === "zelynta_basket" ||
        k === "zelynta_cookie_consent" ||
        k.startsWith("xlate:") ||
        k.startsWith("zelynta_product_") ||
        k.startsWith("zelynta_cat_")
    );
    if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
  } catch {}
  // Pseudonimul de contribuție trăiește în modulul care îl cunoaște.
  // The contribution pseudonym lives in the module that knows about it.
  await resetAppUuid();
}