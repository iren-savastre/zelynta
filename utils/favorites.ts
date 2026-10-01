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

// Scoate un singur produs de la favorite, fără să le atingă pe celelalte.
export async function removeFavorite(barcode: string): Promise<void> {
  try {
    const favs = await getFavorites();
    await AsyncStorage.setItem(
      KEY,
      JSON.stringify(favs.filter((f) => f.barcode !== barcode))
    );
  } catch {}
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

