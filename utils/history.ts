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

export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveToHistory(item: HistoryItem): Promise<void> {
  try {
    const history = await getHistory();
    // Scoate intrarea veche cu același barcode (deduplicare)
    const filtered = history.filter((h) => h.barcode !== item.barcode);
    // Adaugă noua intrare în față
    const updated = [item, ...filtered].slice(0, MAX_ITEMS);
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