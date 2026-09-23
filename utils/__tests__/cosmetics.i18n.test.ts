import { cosmeticsInfo } from "../../i18n/cosmetics";

// Cele 11 limbi ale aplicatiei.
const LANGS = ["ro", "en", "fr", "it", "es", "de", "ru", "pl", "nl", "bg", "el", "sq"] as const;
const FIELDS = ["name", "use", "desc"] as const;

const entries = Object.entries(cosmeticsInfo as Record<string, any>);

describe("substantele cosmetice sunt traduse in toate limbile", () => {
  it("exista substante de verificat", () => {
    expect(entries.length).toBeGreaterThan(20);
  });

  // Bulgara si greaca lipseau complet pana pe 23 sept. 2026: un utilizator
  // bulgar care scana un sampon vedea substantele in engleza. Testul asta
  // opreste reaparitia golului, in oricare limba.
  for (const lang of LANGS) {
    it(`${lang}: fiecare substanta are nume, categorie si descriere`, () => {
      const lipsa: string[] = [];
      for (const [code, info] of entries) {
        for (const f of FIELDS) {
          const v = info?.[f]?.[lang];
          if (typeof v !== "string" || v.trim().length === 0) lipsa.push(`${code}.${f}`);
        }
      }
      expect(lipsa).toEqual([]);
    });
  }

  it("traducerile nu sunt copii ale englezei (bg si el folosesc alt alfabet)", () => {
    const chirilic = /[Ѐ-ӿ]/;
    const grecesc = /[Ͱ-Ͽ]/;
    for (const [code, info] of entries) {
      expect(`${code}: ${info.desc.bg}`).toMatch(chirilic);
      expect(`${code}: ${info.desc.el}`).toMatch(grecesc);
    }
  });
});
