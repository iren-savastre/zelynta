import { extractIngredientsSegment } from "../ocr";

// Pana pe 23 sept. 2026, lista de cuvinte-cheie avea doar 9 limbi. Pe o
// eticheta bulgareasca sau greceasca, aplicatia nu gasea unde incepe lista de
// ingrediente — desi interfata era tradusa in ambele limbi.
describe("extragerea listei de ingrediente din textul citit", () => {
  it("bulgara: gaseste lista dupa „съставки:”", () => {
    const eticheta =
      "ШОКОЛАД МЛЕЧЕН 100 г. Съставки: захар, какаово масло, пълномаслено мляко на прах, какаова маса, емулгатор: соев лецитин. Може да съдържа следи от ядки.";
    const r = extractIngredientsSegment(eticheta, "bg");

    expect(r.srcLang).toBe("bg");
    expect(r.segment).toContain("захар");
    expect(r.segment).not.toContain("Може да съдържа"); // fraza de final e taiata
  });

  it("greaca: gaseste lista dupa „συστατικά:”", () => {
    const eticheta =
      "ΣΟΚΟΛΑΤΑ ΓΑΛΑΚΤΟΣ 100 γρ. Συστατικά: ζάχαρη, βούτυρο κακάο, γάλα σε σκόνη, πάστα κακάο, γαλακτωματοποιητής: λεκιθίνη σόγιας. Μπορεί να περιέχει ίχνη από ξηρούς καρπούς.";
    const r = extractIngredientsSegment(eticheta, "el");

    expect(r.srcLang).toBe("el");
    expect(r.segment).toContain("ζάχαρη");
    expect(r.segment).not.toContain("Μπορεί να περιέχει");
  });

  it("romana: nu s-a stricat nimic la limbile care mergeau deja", () => {
    const eticheta =
      "CIOCOLATĂ CU LAPTE 100 g. Ingrediente: zahăr, unt de cacao, lapte praf, pastă de cacao, emulsifiant: lecitină din soia. Poate conține urme de alune.";
    const r = extractIngredientsSegment(eticheta, "ro");

    expect(r.srcLang).toBe("ro");
    expect(r.segment).toContain("zahăr");
    expect(r.segment).not.toContain("Poate conține");
  });
});
