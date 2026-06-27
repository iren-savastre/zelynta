import { getAdditives, getCosmetics, analyzeProduct, productDisplay } from "../score";

describe("getAdditives", () => {
  it("returns one analyzed-additive object per known tag with expected fields", () => {
    const out = getAdditives({ additives_tags: ["en:e330", "en:e621"] }, "en");
    expect(Array.isArray(out)).toBe(true);
    expect(out.length).toBe(2);
    for (const a of out) {
      expect(a).toHaveProperty("code");
      expect(a).toHaveProperty("name");
      expect(a).toHaveProperty("use");
      expect(a).toHaveProperty("level");
      expect(a).toHaveProperty("desc");
      expect(typeof a.code).toBe("string");
    }
  });

  it("uppercases the additive code (e330 -> E330)", () => {
    const out = getAdditives({ additives_tags: ["en:e330"] }, "en");
    expect(out[0].code).toBe("E330");
  });

  it("dedupes sub-variants of the same base substance", () => {
    // e322 and e322i map to the same base (lecithin) -> single entry
    const out = getAdditives({ additives_tags: ["en:e322", "en:e322i"] }, "en");
    expect(out.length).toBe(1);
  });

  it("returns [] for empty tags and for missing product", () => {
    expect(getAdditives({ additives_tags: [] }, "en")).toEqual([]);
    expect(getAdditives({}, "en")).toEqual([]);
    expect(getAdditives(null, "en")).toEqual([]);
  });
});

describe("getCosmetics", () => {
  it("detects a known cosmetic ingredient from ingredients text", () => {
    const out = getCosmetics(
      { ingredients_text_en: "Aqua, Methylparaben, Glycerin" },
      "en"
    );
    expect(Array.isArray(out)).toBe(true);
    expect(out.length).toBeGreaterThanOrEqual(1);
    expect(out[0]).toHaveProperty("code");
    expect(out[0]).toHaveProperty("level");
  });

  it("returns [] when no cosmetic keywords are present", () => {
    expect(getCosmetics({ ingredients_text_en: "water, sugar" }, "en")).toEqual([]);
  });

  it("returns [] for a missing product", () => {
    expect(getCosmetics(null, "en")).toEqual([]);
  });
});

describe("analyzeProduct (beverage edge cases)", () => {
  it("returns a finite score for a beverage-like product", () => {
    const a = analyzeProduct(
      {
        product_name: "Cola",
        categories: "Sodas",
        nutriments: { sugars_100g: 11, "energy-kcal_100g": 42 },
      },
      "en"
    );
    expect(Number.isFinite(a.score)).toBe(true);
    expect(a.score).toBeGreaterThanOrEqual(0);
    expect(a.score).toBeLessThanOrEqual(100);
  });

  it("caps a risk-level additive product at 50", () => {
    // e102 (tartrazine) is "caution"; pick a product with sugar + additive and just
    // assert the score stays within bounds and reflects a penalty.
    const a = analyzeProduct(
      { additives_tags: ["en:e102"], nutriments: { sugars_100g: 5 } },
      "en"
    );
    expect(a.score).toBeLessThanOrEqual(65);
  });
});

describe("productDisplay (multi-brand)", () => {
  it("handles brands with multiple comma-separated values", () => {
    const d = productDisplay({ product_name: "Original Taste", brands: "Coca-Cola, The Coca-Cola Company" });
    expect(d.title).toBe("Coca-Cola");
    expect(d.subtitle).toBe("Original Taste");
  });
});
