import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "zelynta_history";
const MAX_ITEMS = 100;

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
const norm = (s: string) => (s ?? "").trim().toLowerCase();
function sameProduct(a: HistoryItem, b: HistoryItem): boolean {
  if (a.barcode === b.barcode) return true;
  return norm(a.name) !== "" && norm(a.name) === norm(b.name) && norm(a.brand) === norm(b.brand);
}

// Pastreaza doar prima aparitie (lista e ordonata: cele mai noi primele).
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
    return raw ? dedupe(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export async function saveToHistory(item: HistoryItem): Promise<void> {
  try {
    const history = await getHistory();
    // Scoate orice intrare veche a aceluiasi produs (dupa cod SAU nume+marca)
    const filtered = history.filter((h) => !sameProduct(h, item));
    // Adaugă noua intrare în față
    const updated = dedupe([item, ...filtered]).slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // ignoră erorile de stocare
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
// (istoric, favorite, coș, cache traduceri). Preferințele UI (temă, limbă, paletă)
// rămân, pentru a nu reseta experiența.
export async function clearAllData(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter(
      (k) =>
        k === "zelynta_history" ||
        k === "zelynta_favorites" ||
        k === "zelynta_basket" ||
        k === "zelynta_cookie_consent" ||
        k.startsWith("xlate:")
    );
    if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
  } catch {}
}