import AsyncStorage from "@react-native-async-storage/async-storage";
import { isPlausibleBarcode } from "../offContribute";
import { randomUuid } from "../appIdentity";

// Modulul citeste EXPO_PUBLIC_CONTRIB_URL la incarcare, deci fiecare grup de
// teste il seteaza INAINTE de a-l importa (jest.isolateModules).
function loadModule(proxyUrl?: string) {
  let mod: typeof import("../offContribute");
  jest.isolateModules(() => {
    if (proxyUrl === undefined) delete process.env.EXPO_PUBLIC_CONTRIB_URL;
    else process.env.EXPO_PUBLIC_CONTRIB_URL = proxyUrl;
    mod = require("../offContribute");
  });
  return mod!;
}

const draft = {
  barcode: "3017620422003",
  productName: "Ciocolata de casa",
  lang: "ro",
};

function res(status: number, body: any) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
});

afterAll(() => {
  delete process.env.EXPO_PUBLIC_CONTRIB_URL;
});

describe("contributia e oprita cat timp proxy-ul nu exista", () => {
  it("isContributionEnabled() e false fara EXPO_PUBLIC_CONTRIB_URL", () => {
    expect(loadModule(undefined).isContributionEnabled()).toBe(false);
  });

  it("nu face nicio cerere de retea daca nu e configurat", async () => {
    const mod = loadModule(undefined);
    global.fetch = jest.fn() as any;

    const r = await mod.contributeProduct(draft);

    expect(r).toEqual({ ok: false, kind: "NOT_CONFIGURED" });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("validarea datelor inainte de trimitere", () => {
  it("respinge un cod de bare implauzibil, fara cerere de retea", async () => {
    const mod = loadModule("https://exemplu.test/contrib");
    global.fetch = jest.fn() as any;

    const r = await mod.contributeProduct({ ...draft, barcode: "abc" });

    expect(r).toEqual({ ok: false, kind: "INVALID_INPUT" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("respinge un nume gol", async () => {
    const mod = loadModule("https://exemplu.test/contrib");
    global.fetch = jest.fn() as any;

    const r = await mod.contributeProduct({ ...draft, productName: " " });

    expect(r).toEqual({ ok: false, kind: "INVALID_INPUT" });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("continutul cererii", () => {
  it("trimite app_name, app_version si app_uuid", async () => {
    const mod = loadModule("https://exemplu.test/contrib");
    global.fetch = jest.fn(() => Promise.resolve(res(200, { status: 1 }))) as any;

    await mod.contributeProduct(draft);

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.app_name).toBe("Zelynta");
    expect(body.app_version).toBeTruthy();
    expect(String(body.app_uuid).length).toBeGreaterThanOrEqual(32);
  });

  it("NU trimite niciodata parola sau user_id din aplicatie", async () => {
    const mod = loadModule("https://exemplu.test/contrib");
    global.fetch = jest.fn(() => Promise.resolve(res(200, { status: 1 }))) as any;

    await mod.contributeProduct({ ...draft, ingredientsText: "zahar, cacao" });

    const raw = (global.fetch as jest.Mock).mock.calls[0][1].body;
    expect(raw).not.toContain("password");
    expect(raw).not.toContain("user_id");
  });

  it("pune numele si ingredientele pe sufixul de limba corect", async () => {
    const mod = loadModule("https://exemplu.test/contrib");
    global.fetch = jest.fn(() => Promise.resolve(res(200, { status: 1 }))) as any;

    await mod.contributeProduct({ ...draft, lang: "pl", ingredientsText: "cukier" });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.product_name_pl).toBe("Ciocolata de casa");
    expect(body.ingredients_text_pl).toBe("cukier");
    expect(body.lang).toBe("pl");
  });

  it("acelasi telefon pastreaza acelasi app_uuid intre trimiteri", async () => {
    const mod = loadModule("https://exemplu.test/contrib");
    global.fetch = jest.fn(() => Promise.resolve(res(200, { status: 1 }))) as any;

    await mod.contributeProduct(draft);
    await mod.contributeProduct({ ...draft, barcode: "5449000000996" });

    const calls = (global.fetch as jest.Mock).mock.calls;
    const a = JSON.parse(calls[0][1].body).app_uuid;
    const b = JSON.parse(calls[1][1].body).app_uuid;
    expect(a).toBe(b);
  });
});

describe("tratarea esecurilor", () => {
  const cases: [number, any, string][] = [
    [429, {}, "RATE_LIMITED"],
    [400, {}, "REJECTED"],
    [422, {}, "REJECTED"],
    [500, {}, "UPSTREAM_ERROR"],
    [503, {}, "UPSTREAM_ERROR"],
  ];

  for (const [status, body, kind] of cases) {
    it(`${status} -> ${kind}`, async () => {
      const mod = loadModule("https://exemplu.test/contrib");
      global.fetch = jest.fn(() => Promise.resolve(res(status, body))) as any;

      expect(await mod.contributeProduct(draft)).toEqual({ ok: false, kind });
    });
  }

  it("offline -> NETWORK_ERROR, fara exceptie", async () => {
    const mod = loadModule("https://exemplu.test/contrib");
    global.fetch = jest.fn(() => Promise.reject(new TypeError("failed"))) as any;

    expect(await mod.contributeProduct(draft)).toEqual({
      ok: false,
      kind: "NETWORK_ERROR",
    });
  });

  it("200 dar OFF raspunde status 0 -> REJECTED", async () => {
    const mod = loadModule("https://exemplu.test/contrib");
    global.fetch = jest.fn(() => Promise.resolve(res(200, { status: 0 }))) as any;

    expect(await mod.contributeProduct(draft)).toEqual({ ok: false, kind: "REJECTED" });
  });

  it("succes -> ok", async () => {
    const mod = loadModule("https://exemplu.test/contrib");
    global.fetch = jest.fn(() => Promise.resolve(res(200, { status: 1 }))) as any;

    expect(await mod.contributeProduct(draft)).toEqual({ ok: true });
  });
});

describe("isPlausibleBarcode", () => {
  it("accepta lungimile reale EAN/UPC", () => {
    for (const c of ["12345678", "123456789012", "3017620422003", "12345678901234"]) {
      expect(isPlausibleBarcode(c)).toBe(true);
    }
  });

  it("respinge coduri scurte, cu litere sau goale", () => {
    for (const c of ["", "123", "1234567", "abcdefgh", "123456789012345"]) {
      expect(isPlausibleBarcode(c)).toBe(false);
    }
  });
});

describe("app_uuid", () => {
  it("are forma unui UUID si difera intre generari", () => {
    const a = randomUuid();
    const b = randomUuid();
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(a).not.toBe(b);
  });
});
