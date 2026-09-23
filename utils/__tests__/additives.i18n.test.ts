import { additivesInfo } from "../../i18n/additives";

// Cele 11 limbi active + albaneza, in pregatire.
const LANGS = ["ro", "en", "fr", "it", "es", "de", "ru", "pl", "nl", "bg", "el", "sq"] as const;
const FIELDS = ["name", "use", "desc"] as const;

const entries = Object.entries(additivesInfo as Record<string, any>);

describe("aditivii sunt tradusi in toate limbile", () => {
  it("exista aditivi de verificat", () => {
    expect(entries.length).toBeGreaterThan(80);
  });

  // Descrierea vine din doua locuri: fisierul limbii (pentru aditivii fara
  // poveste) si additives.stories (pentru cei cu risc/atentie). Testul nu
  // tine cont de unde vine — doar ca exista.
  for (const lang of LANGS) {
    it(`${lang}: fiecare aditiv are nume, categorie si descriere`, () => {
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

  it("descrierile nu sunt copiate din engleza", () => {
    let identice = 0;
    for (const [, info] of entries) {
      if (info.desc.sq && info.desc.sq === info.desc.en) identice++;
    }
    expect(identice).toBe(0);
  });
});
