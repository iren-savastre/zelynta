jest.mock("@react-native-ml-kit/text-recognition", () => ({ recognize: jest.fn() }));

import { extractIngredientsSegment } from "../ocr";

describe("extractIngredientsSegment", () => {
  it("izoleaza lista dupa 'Ingredients:' si o marcheaza ca sigura", () => {
    const r = extractIngredientsSegment(
      "LA BOMBA 50 ml INGREDIENTS: ALCOHOL DENAT., PARFUM, AQUA, BENZYL SALICYLATE. Made in Spain",
      "ro"
    );
    expect(r.found).toBe(true);
    expect(r.srcLang).toBe("en");
    expect(r.segment.startsWith("ALCOHOL DENAT.")).toBe(true);
  });

  it("fara cuvantul cheie nu marcheaza textul ca lista de ingrediente", () => {
    const r = extractIngredientsSegment("EAU DE PARFUM 50 ml refillable", "ro");
    expect(r.found).toBe(false);
  });
});
