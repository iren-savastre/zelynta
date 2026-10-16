import AsyncStorage from "@react-native-async-storage/async-storage";
import { lookupProductByBarcode, PRODUCT_FIELDS } from "../apiClient";

// Cele 4 baze OpenFoodFacts sunt interogate pe rand, deci fiecare test
// controleaza raspunsul per apel.
// The 4 OpenFoodFacts databases are queried in order, so each test
// controls the response per call.
const DB_COUNT = 4;

/** Raspuns HTTP simulat, cu forma minima folosita de apiClient. */
/** Simulated HTTP response, with the minimal shape used by apiClient. */
function res(status: number, body: any, { badJson = false } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: badJson
      ? () => Promise.reject(new SyntaxError("Unexpected token < in JSON"))
      : () => Promise.resolve(body),
  } as unknown as Response;
}

const found = (extra: any = {}) => ({
  status: 1,
  product: { code: "123", product_name: "Test", ingredients_text: "apa, zahar", ...extra },
});
const missing = { status: 0 };

/** Eroare de retea (offline, DNS cazut). */
/** Network error (offline, DNS down). */
const offline = () => Promise.reject(new TypeError("Network request failed"));
/** Timeout: fetchWithTimeout anuleaza cererea prin AbortController. */
/** Timeout: fetchWithTimeout cancels the request via AbortController. */
const timeout = () => {
  const e = new Error("Aborted");
  e.name = "AbortError";
  return Promise.reject(e);
};

/** Toate bazele raspund la fel. */
/** All databases respond the same way. */
function allRespond(make: () => any) {
  global.fetch = jest.fn(() => make()) as any;
}

beforeEach(async () => {
  jest.restoreAllMocks();
  // Fiecare test porneste cu cache-ul gol, altfel un produs salvat de testul
  // anterior ar fi servit din memorie si cererea de retea nu ar mai avea loc.
  // Each test starts with an empty cache, otherwise a product saved by the
  // previous test would be served from memory and the network request wouldn't happen.
  await AsyncStorage.clear();
});

describe("lookupProductByBarcode — produsul exista", () => {
  it("returneaza produsul din prima baza si nu le mai interogheaza pe celelalte", async () => {
    global.fetch = jest.fn(() => Promise.resolve(res(200, found()))) as any;
    const r = await lookupProductByBarcode("123");

    expect(r).toEqual({ ok: true, product: expect.objectContaining({ code: "123", _db: "food" }) });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("cere explicit campurile necesare, nu produsul intreg", async () => {
    global.fetch = jest.fn(() => Promise.resolve(res(200, found()))) as any;
    await lookupProductByBarcode("123");

    const url = String((global.fetch as jest.Mock).mock.calls[0][0]);
    expect(url).toContain("fields=");
    // Campurile fara de care functia centrala (ingrediente + aditivi) s-ar rupe.
    // The fields without which the core feature (ingredients + additives) would break.
    for (const f of ["code", "additives_tags", "nutriments", "ingredients_text_ro"]) {
      expect(PRODUCT_FIELDS).toContain(f);
    }
  });
});

describe("lookupProductByBarcode — produsul lipseste", () => {
  it("raporteaza PRODUCT_NOT_FOUND doar cand TOATE bazele au raspuns", async () => {
    allRespond(() => Promise.resolve(res(200, missing)));
    const r = await lookupProductByBarcode("000");

    expect(r).toEqual({ ok: false, kind: "PRODUCT_NOT_FOUND" });
    expect(global.fetch).toHaveBeenCalledTimes(DB_COUNT);
  });
});

describe("lookupProductByBarcode — esecuri de transport", () => {
  it("offline -> NETWORK_ERROR, niciodata PRODUCT_NOT_FOUND", async () => {
    allRespond(offline);
    const r = await lookupProductByBarcode("123");

    expect(r).toEqual({ ok: false, kind: "NETWORK_ERROR" });
  });

  it("timeout -> NETWORK_ERROR", async () => {
    allRespond(timeout);
    const r = await lookupProductByBarcode("123");

    expect(r).toEqual({ ok: false, kind: "NETWORK_ERROR" });
  });

  it("429 -> RATE_LIMITED", async () => {
    allRespond(() => Promise.resolve(res(429, {})));
    const r = await lookupProductByBarcode("123");

    expect(r).toEqual({ ok: false, kind: "RATE_LIMITED" });
  });

  it("503 -> UPSTREAM_ERROR", async () => {
    allRespond(() => Promise.resolve(res(503, {})));
    const r = await lookupProductByBarcode("123");

    expect(r).toEqual({ ok: false, kind: "UPSTREAM_ERROR" });
  });

  it("200 cu JSON invalid -> UPSTREAM_ERROR, nu aruncă", async () => {
    allRespond(() => Promise.resolve(res(200, null, { badJson: true })));
    const r = await lookupProductByBarcode("123");

    expect(r).toEqual({ ok: false, kind: "UPSTREAM_ERROR" });
  });
});

describe("lookupProductByBarcode — raspunsuri partiale", () => {
  it("prefera baza CU ingrediente, chiar daca alta a gasit produsul prima", async () => {
    // food: produsul exista, dar fara compozitie. beauty: cu compozitie.
    // food: the product exists, but with no composition. beauty: with one.
    const seq = [
      res(200, { status: 1, product: { code: "1", product_name: "Pasta de dinti" } }),
      res(200, { status: 1, product: { code: "1", ingredients_text: "aqua, sorbitol" } }),
    ];
    let i = 0;
    global.fetch = jest.fn(() => Promise.resolve(seq[i++])) as any;

    const r = await lookupProductByBarcode("1");

    expect(r.ok).toBe(true);
    expect((r as any).product._db).toBe("beauty");
  });

  it("daca produsul exista doar fara ingrediente, il returneaza ca rezerva", async () => {
    const seq = [
      res(200, { status: 1, product: { code: "1", product_name: "Sare" } }),
      res(200, missing),
      res(200, missing),
      res(200, missing),
    ];
    let i = 0;
    global.fetch = jest.fn(() => Promise.resolve(seq[i++])) as any;

    const r = await lookupProductByBarcode("1");

    expect(r.ok).toBe(true);
    expect((r as any).product.product_name).toBe("Sare");
  });

  it("3 baze spun ca nu au produsul, a 4-a cade -> NU PRODUCT_NOT_FOUND", async () => {
    // Cazul periculos: raspunsul e incomplet, deci nu putem afirma ca produsul
    // nu exista. Utilizatorul ar fi trimis degeaba sa il adauge pe Open Food Facts.
    // The dangerous case: the response is incomplete, so we can't claim the
    // product doesn't exist. The user would be sent to add it to Open Food Facts for nothing.
    const seq: any[] = [res(200, missing), res(200, missing), res(200, missing)];
    let i = 0;
    global.fetch = jest.fn(() => (i < 3 ? Promise.resolve(seq[i++]) : offline())) as any;

    const r = await lookupProductByBarcode("123");

    expect(r).toEqual({ ok: false, kind: "NETWORK_ERROR" });
  });

  it("o baza raspunde 429 -> RATE_LIMITED are prioritate fata de not found", async () => {
    const seq: any[] = [res(200, missing), res(200, missing), res(200, missing), res(429, {})];
    let i = 0;
    global.fetch = jest.fn(() => Promise.resolve(seq[i++])) as any;

    const r = await lookupProductByBarcode("123");

    expect(r).toEqual({ ok: false, kind: "RATE_LIMITED" });
  });
});

describe("lookupProductByBarcode — cache", () => {
  it("cache miss: prima cautare interogheaza reteaua", async () => {
    global.fetch = jest.fn(() => Promise.resolve(res(200, found()))) as any;
    await lookupProductByBarcode("555");

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("cache hit: a doua cautare a aceluiasi cod nu mai atinge reteaua", async () => {
    global.fetch = jest.fn(() => Promise.resolve(res(200, found()))) as any;
    await lookupProductByBarcode("555");
    (global.fetch as jest.Mock).mockClear();

    const r = await lookupProductByBarcode("555");

    expect(r.ok).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("offline, dar produsul e in cache -> il servim pe cel salvat", async () => {
    global.fetch = jest.fn(() => Promise.resolve(res(200, found()))) as any;
    await lookupProductByBarcode("777"); // il aducem si il salvam // we fetch it and save it

    // Golim doar partea „proaspata": simulam expirarea rescriind intrarea.
    // We only clear the "fresh" part: we simulate expiry by rewriting the entry.
    const key = "zelynta_product_777";
    const raw = JSON.parse((await AsyncStorage.getItem(key)) as string);
    raw.expiresAt = Date.now() - 1000;
    raw.data.expiresAt = Date.now() - 1000;
    await AsyncStorage.setItem(key, JSON.stringify(raw));

    allRespond(offline);
    const r = await lookupProductByBarcode("777");

    expect(r.ok).toBe(true);
    expect((r as any).product.code).toBe("123");
  });

  it("produsul chiar nu exista -> NU servim cache expirat", async () => {
    global.fetch = jest.fn(() => Promise.resolve(res(200, found()))) as any;
    await lookupProductByBarcode("888");

    const key = "zelynta_product_888";
    const raw = JSON.parse((await AsyncStorage.getItem(key)) as string);
    raw.expiresAt = Date.now() - 1000;
    raw.data.expiresAt = Date.now() - 1000;
    await AsyncStorage.setItem(key, JSON.stringify(raw));

    allRespond(() => Promise.resolve(res(200, missing)));
    const r = await lookupProductByBarcode("888");

    expect(r).toEqual({ ok: false, kind: "PRODUCT_NOT_FOUND" });
  });

  it("un produs negasit NU ajunge in cache", async () => {
    allRespond(() => Promise.resolve(res(200, missing)));
    await lookupProductByBarcode("999");

    expect(await AsyncStorage.getItem("zelynta_product_999")).toBeNull();
  });
});
