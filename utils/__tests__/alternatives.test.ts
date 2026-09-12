import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBetterAlternatives } from "../alternatives";

/** Produs din categoria X, cu date nutritionale reale si nume citibil. */
function alt(code: string, name: string, sugars: number) {
  return {
    code,
    product_name: name,
    brands: "Marca",
    image_url: "",
    nutriments: { "sugars_100g": sugars, "energy-kcal_100g": 100, "salt_100g": 0.1 },
    ingredients_text: "apa, fructe",
    categories: "spreads",
  };
}

function searchRes(products: any[]) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ products }),
  } as unknown as Response;
}

// Nutella reala: amesteca etichete canonice cu nume afisabile in franceza.
const NUTELLA_TAGS = [
  "en:breakfasts",
  "en:spreads",
  "en:sweet-spreads",
  "en:confectionary-based-spreads",
  "en:Petit-déjeuners",
  "en:Produits à tartiner",
  "en:Pâtes à tartiner",
];

beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
});

describe("getBetterAlternatives — alegerea categoriei", () => {
  it("interogheaza eticheta CANONICA, nu numele afisabil francez", async () => {
    global.fetch = jest.fn(() => Promise.resolve(searchRes([]))) as any;

    await getBetterAlternatives({ code: "1", categories_tags: NUTELLA_TAGS }, 30, "ro");

    const url = decodeURIComponent(String((global.fetch as jest.Mock).mock.calls[0][0]));
    expect(url).toContain("confectionary-based-spreads");
    expect(url).not.toContain("Pâtes à tartiner");
  });

  it("face O SINGURA cerere cand prima categorie da rezultate", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(searchRes([alt("2", "Crema de fructe", 5)]))
    ) as any;

    await getBetterAlternatives({ code: "1", categories_tags: NUTELLA_TAGS }, 30, "ro");

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("cere page_size=50, nu 100", async () => {
    global.fetch = jest.fn(() => Promise.resolve(searchRes([]))) as any;

    await getBetterAlternatives({ code: "1", categories_tags: NUTELLA_TAGS }, 30, "ro");

    expect(String((global.fetch as jest.Mock).mock.calls[0][0])).toContain("page_size=50");
  });

  it("fara etichete canonice nu face nicio cerere", async () => {
    global.fetch = jest.fn(() => Promise.resolve(searchRes([]))) as any;

    const out = await getBetterAlternatives(
      { code: "1", categories_tags: ["en:Pâtes à tartiner"] },
      30,
      "ro"
    );

    expect(out).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("fara categorii deloc returneaza lista goala", async () => {
    global.fetch = jest.fn() as any;

    expect(await getBetterAlternatives({ code: "1" }, 30, "ro")).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("getBetterAlternatives — cache de categorii", () => {
  it("cache miss apoi cache hit: a doua cautare nu mai atinge reteaua", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(searchRes([alt("2", "Crema de fructe", 5)]))
    ) as any;
    const p = { code: "1", categories_tags: NUTELLA_TAGS };

    await getBetterAlternatives(p, 30, "ro");
    expect(global.fetch).toHaveBeenCalledTimes(1);

    (global.fetch as jest.Mock).mockClear();
    await getBetterAlternatives({ ...p, code: "9" }, 30, "ro");

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("cache-ul e separat pe limba", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(searchRes([alt("2", "Crema de fructe", 5)]))
    ) as any;
    const p = { code: "1", categories_tags: NUTELLA_TAGS };

    await getBetterAlternatives(p, 30, "ro");
    await getBetterAlternatives(p, 30, "fr");

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

describe("getBetterAlternatives — degradare eleganta", () => {
  it("429 -> lista goala, fara exceptie", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 429, json: () => Promise.resolve({}) } as any)
    ) as any;

    await expect(
      getBetterAlternatives({ code: "1", categories_tags: NUTELLA_TAGS }, 30, "ro")
    ).resolves.toEqual([]);
  });

  it("503 -> lista goala, fara exceptie", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) } as any)
    ) as any;

    await expect(
      getBetterAlternatives({ code: "1", categories_tags: NUTELLA_TAGS }, 30, "ro")
    ).resolves.toEqual([]);
  });

  it("offline -> lista goala, fara exceptie", async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError("Network request failed"))) as any;

    await expect(
      getBetterAlternatives({ code: "1", categories_tags: NUTELLA_TAGS }, 30, "ro")
    ).resolves.toEqual([]);
  });

  it("nu se recomanda produsul scanat pe sine insusi", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(searchRes([alt("1", "Acelasi produs", 1), alt("2", "Altul", 1)]))
    ) as any;

    const out = await getBetterAlternatives(
      { code: "1", categories_tags: NUTELLA_TAGS },
      10,
      "ro"
    );

    expect(out.every((a) => a.barcode !== "1")).toBe(true);
  });
});
