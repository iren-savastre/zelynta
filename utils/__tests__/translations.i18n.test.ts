import { translations } from "../../i18n/translations";

// Romana e limba de referinta: ea are mereu setul complet de chei.
const REF = "ro";
const langs = Object.keys(translations as Record<string, any>);
const refKeys = Object.keys((translations as any)[REF]);

describe("textele de interfata sunt complete in toate limbile", () => {
  it("exista chei de verificat", () => {
    expect(refKeys.length).toBeGreaterThan(100);
  });

  // Bulgara si greaca aveau 6 chei lipsa (fibre, proteine, mesaje OCR) si
  // cadeau pe engleza fara ca nimeni sa observe. Testul opreste reaparitia.
  for (const lang of langs) {
    it(`${lang}: are toate cheile si niciuna goala`, () => {
      const dict = (translations as any)[lang];
      const lipsa = refKeys.filter((k) => {
        const v = dict?.[k];
        if (Array.isArray(v)) return v.length === 0 || v.some((x) => !String(x).trim());
        return typeof v !== "string" || v.trim().length === 0;
      });
      expect(lipsa).toEqual([]);
    });
  }

  it("listele au acelasi numar de elemente in toate limbile", () => {
    for (const k of refKeys) {
      const ref = (translations as any)[REF][k];
      if (!Array.isArray(ref)) continue;
      for (const lang of langs) {
        expect(`${lang}.${k}: ${(translations as any)[lang][k].length}`).toBe(
          `${lang}.${k}: ${ref.length}`
        );
      }
    }
  });
});
