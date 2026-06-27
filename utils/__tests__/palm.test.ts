import { getPalmNote, hasPalmOil } from "../palm";

describe("hasPalmOil", () => {
  it("detects palm oil in ingredients text", () => {
    expect(hasPalmOil({ ingredients_text: "sugar, palm oil, cocoa" })).toBe(true);
  });

  it("detects palm via localized words", () => {
    expect(hasPalmOil({ ingredients_text_en: "contains palme" })).toBe(true);
  });

  it("returns false when the palm-oil-free tag is present", () => {
    expect(hasPalmOil({ ingredients_analysis_tags: ["en:palm-oil-free"] })).toBe(false);
  });

  it("returns true when the palm-oil tag is present", () => {
    expect(hasPalmOil({ ingredients_analysis_tags: ["en:palm-oil"] })).toBe(true);
  });

  it("returns false for products without palm oil", () => {
    expect(hasPalmOil({ ingredients_text: "water, sugar, salt" })).toBe(false);
  });

  it("returns false for empty/undefined product", () => {
    expect(hasPalmOil({})).toBe(false);
    expect(hasPalmOil(undefined)).toBe(false);
  });
});

describe("getPalmNote", () => {
  it("returns a {label, text} object with non-empty strings", () => {
    const note = getPalmNote("ro");
    expect(note).toHaveProperty("label");
    expect(note).toHaveProperty("text");
    expect(typeof note.label).toBe("string");
    expect(note.label.length).toBeGreaterThan(0);
  });

  it("falls back gracefully for an unknown language", () => {
    const note = getPalmNote("xx");
    expect(typeof note.label).toBe("string");
    expect(note.label.length).toBeGreaterThan(0);
  });
});
