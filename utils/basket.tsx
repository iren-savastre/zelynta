import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { HistoryItem } from "./history";

export type BasketItem = HistoryItem;

const KEY = "zelynta_basket";
const MAX_ITEMS = 20;

type BasketContextValue = {
  items: BasketItem[];
  has: (barcode: string) => boolean;
  add: (item: BasketItem) => void;
  remove: (barcode: string) => void;
  toggle: (item: BasketItem) => void;
  clear: () => void;
};

const BasketContext = createContext<BasketContextValue>({
  items: [],
  has: () => false,
  add: () => {},
  remove: () => {},
  toggle: () => {},
  clear: () => {},
});

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          try {
            setItems(JSON.parse(raw));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  function persist(next: BasketItem[]) {
    setItems(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }

  const has = (barcode: string) => items.some((i) => i.barcode === barcode);

  function add(item: BasketItem) {
    if (has(item.barcode)) return;
    persist([item, ...items].slice(0, MAX_ITEMS));
  }

  function remove(barcode: string) {
    persist(items.filter((i) => i.barcode !== barcode));
  }

  function toggle(item: BasketItem) {
    has(item.barcode) ? remove(item.barcode) : add(item);
  }

  function clear() {
    persist([]);
  }

  return (
    <BasketContext.Provider value={{ items, has, add, remove, toggle, clear }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  return useContext(BasketContext);
}
