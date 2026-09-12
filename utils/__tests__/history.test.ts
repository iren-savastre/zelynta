import AsyncStorage from "@react-native-async-storage/async-storage";
import { getHistory, saveToHistory, type HistoryItem } from "../history";

const item = (over: Partial<HistoryItem> = {}): HistoryItem => ({
  barcode: "5449000000996",
  name: "Coca-Cola",
  brand: "Coca-Cola",
  imageUrl: "",
  score: 21,
  scannedAt: Date.now(),
  ...over,
});

beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
});

describe("istoricul pastreaza produsele scanate", () => {
  it("nu mai plafoneaza la 100 — raman toate", async () => {
    // Inainte se pastrau doar ultimele 100, iar cele mai vechi dispareau
    // fara ca utilizatorul sa fie anuntat.
    for (let i = 0; i < 250; i++) {
      await saveToHistory(item({ barcode: String(1000 + i), name: "Produs " + i }));
    }

    expect(await getHistory()).toHaveLength(250);
  });

  it("cel mai vechi produs e inca acolo dupa multe scanari", async () => {
    await saveToHistory(item({ barcode: "111", name: "Primul produs" }));
    for (let i = 0; i < 150; i++) {
      await saveToHistory(item({ barcode: String(2000 + i), name: "Altul " + i }));
    }

    const h = await getHistory();
    expect(h.some((x) => x.barcode === "111")).toBe(true);
  });
});

describe("rescanarea aceluiasi produs", () => {
  it("actualizeaza data in loc sa creeze o a doua intrare", async () => {
    const azi = new Date("2026-09-13T10:00:00Z").getTime();
    const pesteOLuna = new Date("2026-10-13T10:00:00Z").getTime();

    await saveToHistory(item({ scannedAt: azi }));
    await saveToHistory(item({ scannedAt: pesteOLuna }));

    const h = await getHistory();
    const coca = h.filter((x) => x.barcode === "5449000000996");
    expect(coca).toHaveLength(1);
    expect(coca[0].scannedAt).toBe(pesteOLuna);
  });

  it("produsul rescanat urca in capul listei", async () => {
    await saveToHistory(item({ barcode: "111", name: "Primul" }));
    await saveToHistory(item({ barcode: "222", name: "Al doilea" }));
    await saveToHistory(item({ barcode: "111", name: "Primul" })); // rescanat

    const h = await getHistory();
    expect(h[0].barcode).toBe("111");
    expect(h).toHaveLength(2);
  });

  it("scanarile din poza (cod sintetic) se recunosc dupa nume+marca", async () => {
    // Produsele citite din poza primesc coduri interne diferite de fiecare
    // data, deci fara comparatia pe nume+marca s-ar aduna dubluri.
    await saveToHistory(item({ barcode: "ocr-1", name: "Ciocolata", brand: "Milka" }));
    await saveToHistory(item({ barcode: "ocr-2", name: "Ciocolata", brand: "Milka" }));

    expect(await getHistory()).toHaveLength(1);
  });
});

describe("cand stocarea telefonului e plina", () => {
  it("scurteaza istoricul si tot salveaza scanarea noua", async () => {
    for (let i = 0; i < 20; i++) {
      await saveToHistory(item({ barcode: String(3000 + i), name: "Vechi " + i }));
    }

    // Prima scriere esueaza (cota depasita); urmatoarele merg normal.
    // `mockImplementationOnce` inlocuieste DOAR primul apel — restul cad pe
    // implementarea reala, fara sa o reapelam noi (ceea ce ar recursa).
    jest.spyOn(AsyncStorage, "setItem").mockImplementationOnce(async () => {
      throw new Error("quota exceeded");
    });

    await saveToHistory(item({ barcode: "999", name: "Produsul nou" }));

    const h = await getHistory();
    expect(h.some((x) => x.barcode === "999")).toBe(true);
    expect(h.length).toBeLessThan(21); // s-a taiat din cele vechi
  });
});
