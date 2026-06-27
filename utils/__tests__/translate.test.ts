import { translateText } from "../translate";

describe("translateText (no network paths)", () => {
  it("returns the same text when from === to (no API call)", async () => {
    const out = await translateText("Sugar, water, salt", "en", "en");
    expect(out).toBe("Sugar, water, salt");
  });

  it("returns empty string for empty input", async () => {
    const out = await translateText("", "en", "fr");
    expect(out).toBe("");
  });

  it("trims input and short-circuits same-language", async () => {
    const out = await translateText("  hello  ", "ro", "ro");
    expect(out).toBe("hello");
  });
});
