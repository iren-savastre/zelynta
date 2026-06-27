import { analyzeProduct, productDisplay, scoreColor } from "../score";

describe("scoreColor", () => {
  it("returns green for high scores (>=66)", () => {
    expect(scoreColor(90)).toBe("#038141");
    expect(scoreColor(66)).toBe("#038141");
  });
  it("returns orange for medium scores (33..65)", () => {
    expect(scoreColor(50)).toBe("#EE8100");
    expect(scoreColor(33)).toBe("#EE8100");
  });
  it("returns red for low scores (<33)", () => {
    expect(scoreColor(10)).toBe("#E63E11");
    expect(scoreColor(0)).toBe("#E63E11");
  });
});

describe("analyzeProduct", () => {
  it("returns a score within 0..100 and a reasons array", () => {
    const a = analyzeProduct(
      { product_name: "Test", nutriments: { sugars_100g: 5, salt_100g: 0.2 } },
      "en"
    );
    expect(typeof a.score).toBe("number");
    expect(a.score).toBeGreaterThanOrEqual(0);
    expect(a.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(a.reasons)).toBe(true);
  });

  it("penalizes a very sugary/salty product below a clean one", () => {
    const clean = analyzeProduct({ nutriments: { sugars_100g: 1, salt_100g: 0.1 } }, "en").score;
    const junk = analyzeProduct(
      { nutriments: { sugars_100g: 60, salt_100g: 5, "saturated-fat_100g": 20 } },
      "en"
    ).score;
    expect(junk).toBeLessThanOrEqual(clean);
  });

  it("never returns NaN even with missing nutriments", () => {
    const a = analyzeProduct({}, "en");
    expect(Number.isNaN(a.score)).toBe(false);
  });
});

describe("productDisplay", () => {
  it("uses product_name as title when it matches a brand in the list", () => {
    const d = productDisplay({ product_name: "Nutella", brands: "Nutella, Ferrero" });
    expect(d.title).toBe("Nutella");
    expect(typeof d.subtitle).toBe("string");
  });

  it("uses the brand as title when product_name is a generic descriptor", () => {
    const d = productDisplay({ product_name: "Original Taste", brands: "Coca-Cola" });
    expect(d.title).toBe("Coca-Cola");
    expect(d.subtitle).toBe("Original Taste");
  });

  it("falls back to brand when product_name is empty", () => {
    const d = productDisplay({ product_name: "", brands: "Coca-Cola" });
    expect(d.title.length).toBeGreaterThan(0);
  });

  it("does not crash on empty product", () => {
    const d = productDisplay({});
    expect(d).toHaveProperty("title");
    expect(d).toHaveProperty("subtitle");
  });
});
