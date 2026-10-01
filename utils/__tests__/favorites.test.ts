import AsyncStorage from "@react-native-async-storage/async-storage";
import { addFavorite, getFavorites, removeFavorite } from "../favorites";
import type { HistoryItem } from "../history";

const item = (over: Partial<HistoryItem> = {}): HistoryItem => ({
  barcode: "3017620422003",
  name: "Nutella",
  brand: "Ferrero",
  imageUrl: "",
  score: 9,
  scannedAt: Date.now(),
  ...over,
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("favoritele", () => {
  it("adauga un produs o singura data", async () => {
    await addFavorite(item());
    await addFavorite(item());
    expect(await getFavorites()).toHaveLength(1);
  });

  it("scoate doar produsul cerut", async () => {
    await addFavorite(item({ barcode: "111", name: "Unu" }));
    await addFavorite(item({ barcode: "222", name: "Doi" }));
    await addFavorite(item({ barcode: "333", name: "Trei" }));

    await removeFavorite("222");

    const ramase = (await getFavorites()).map((f) => f.barcode);
    expect(ramase).toEqual(["333", "111"]);
  });

  it("nu se supara pe un cod care nu exista", async () => {
    await addFavorite(item({ barcode: "111" }));
    await removeFavorite("nuexista");
    expect(await getFavorites()).toHaveLength(1);
  });

  it("scoaterea ultimului favorit lasa lista goala, nu stricata", async () => {
    await addFavorite(item({ barcode: "111" }));
    await removeFavorite("111");
    expect(await getFavorites()).toEqual([]);
  });
});
