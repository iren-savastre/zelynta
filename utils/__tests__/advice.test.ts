import { getAdviceByCategory, detectAdviceCategory, getProductAdvice } from "../advice";

const ADVICE_FIELDS = ["category", "icon", "benefits", "when", "how", "who", "children", "labels"] as const;
const LABEL_FIELDS = ["title", "benefits", "when", "how", "who", "children"] as const;

function assertWellFormed(a: any) {
  for (const f of ADVICE_FIELDS) expect(a).toHaveProperty(f);
  for (const f of LABEL_FIELDS) {
    expect(a.labels).toHaveProperty(f);
    expect(typeof a.labels[f]).toBe("string");
  }
  expect(typeof a.icon).toBe("string");
  expect(typeof a.benefits).toBe("string");
}

describe("getAdviceByCategory", () => {
  it("returns a well-formed object for a known category", () => {
    const a = getAdviceByCategory("salt", "en");
    assertWellFormed(a);
    expect(a.category).toBe("salt");
    expect(a.benefits.length).toBeGreaterThan(0);
  });

  it("falls back to 'generic' for an unknown category", () => {
    const a = getAdviceByCategory("not-a-real-category", "en");
    assertWellFormed(a);
    expect(a.category).toBe("generic");
  });

  it("falls back to English text for an unknown language", () => {
    const en = getAdviceByCategory("salt", "en");
    const xx = getAdviceByCategory("salt", "zz");
    assertWellFormed(xx);
    // pick() falls back to .en for an unknown language
    expect(xx.benefits).toBe(en.benefits);
    expect(xx.labels.title).toBe(en.labels.title);
  });
});

describe("detectAdviceCategory", () => {
  it("classifies a soda product", () => {
    expect(detectAdviceCategory({ product_name: "Cola", categories: "Carbonated drinks" })).toBe("soda");
  });

  it("returns 'generic' when nothing matches", () => {
    expect(detectAdviceCategory({ product_name: "qwxyz" })).toBe("generic");
  });

  it("does not crash on an empty product", () => {
    expect(typeof detectAdviceCategory({})).toBe("string");
  });
});

describe("getProductAdvice", () => {
  it("returns a well-formed object derived from product category", () => {
    const a = getProductAdvice({ product_name: "Honey", categories: "Honey" }, "en");
    assertWellFormed(a);
    expect(a.category).toBe("honey");
  });
});
