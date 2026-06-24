import AsyncStorage from "@react-native-async-storage/async-storage";
import type { HistoryItem } from "./history";

const KEY = "zelynta_favorites";
const MAX_ITEMS = 200;

export type FavoriteItem = HistoryItem;

export async function getFavorites(): Promise<FavoriteItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function isFavorite(barcode: string): Promise<boolean> {
  const favs = await getFavorites();
  return favs.some((f) => f.barcode === barcode);
}

// Adaugă fără să scoată dacă există deja (spre deosebire de toggle)
export async function addFavorite(item: FavoriteItem): Promise<void> {
  try {
    const favs = await getFavorites();
    if (favs.some((f) => f.barcode === item.barcode)) return;
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify([item, ...favs].slice(0, MAX_ITEMS))
    );
  } catch {}
}

export async function toggleFavorite(item: FavoriteItem): Promise<boolean> {
  try {
    const favs = await getFavorites();
    const exists = favs.some((f) => f.barcode === item.barcode);
    let updated: FavoriteItem[];
    if (exists) {
      updated = favs.filter((f) => f.barcode !== item.barcode);
    } else {
      updated = [item, ...favs].slice(0, MAX_ITEMS);
    }
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    return !exists; // noua stare (true = acum favorit)
  } catch {
    return false;
  }
}
