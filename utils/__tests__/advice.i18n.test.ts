import { adviceInfo, adviceLabels } from "../../i18n/advice";
import { methodology } from "../../i18n/methodology";

// Cele 11 limbi active + albaneza, in pregatire.
const LANGS = ["ro", "en", "fr", "it", "es", "de", "ru", "pl", "nl", "bg", "el", "sq"] as const;
const FIELDS = ["benefits", "when", "how", "who", "children"] as const;

const cats = Object.entries(adviceInfo as Record<string, any>);

describe("sfaturile pe categorii sunt traduse in toate limbile", () => {
  it("exista categorii de verificat", () => {
    expect(cats.length).toBeGreaterThan(20);
  });

  // Bulgara si greaca lipseau complet: utilizatorii lor vedeau sectiunea de
  // recomandari in engleza, desi restul aplicatiei era tradus.
  for (const lang of LANGS) {
    it(`${lang}: fiecare categorie are toate cele 5 texte`, () => {
      const lipsa: string[] = [];
      for (const [cat, info] of cats) {
        for (const f of FIELDS) {
          const v = info?.[f]?.[lang];
          if (typeof v !== "string" || v.trim().length === 0) lipsa.push(`${cat}.${f}`);
        }
      }
      expect(lipsa).toEqual([]);
    });
  }

  it("etichetele sectiunii exista in toate limbile", () => {
    const lipsa: string[] = [];
    for (const [key, map] of Object.entries(adviceLabels as Record<string, any>)) {
      for (const lang of LANGS) {
        const v = map?.[lang];
        if (typeof v !== "string" || v.trim().length === 0) lipsa.push(`${key}.${lang}`);
      }
    }
    expect(lipsa).toEqual([]);
  });
});

describe("pagina de metodologie e tradusa in toate limbile", () => {
  it("fiecare cheie exista in fiecare limba", () => {
    const lipsa: string[] = [];
    for (const [key, map] of Object.entries(methodology as Record<string, any>)) {
      for (const lang of LANGS) {
        const v = map?.[lang];
        if (typeof v !== "string" || v.trim().length === 0) lipsa.push(`${key}.${lang}`);
      }
    }
    expect(lipsa).toEqual([]);
  });
});
