import { ocrSimilarity } from "../ocr";

// Text real, citit gresit de OCR dintr-o poza facuta de departe (12 sept. 2026).
// Cuvintele stricate: mitlk/mitk = milk, lavours = flavours,
// eNifie evthine seja = emulsifier lecithin soya, ocoa = cocoa, 23h = 23%.
const CITIRE_STRICATA_1 =
  "NOgar coroa butte, pudra integrala de mitlk, bucati de caramel sarat NieY (mitk, smantana (mitk), lavours (aroma naturala de vanilie, lavouring natural), eNifie (evthine (seja), ocoa mass, May contaln urme de grau, oua si nuci";

// A doua fotografie a ACELEIASI etichete, la fel de slaba: OCR-ul greseste
// altfel de fiecare data, fiindca nu apuca litere adevarate.
const CITIRE_STRICATA_2 =
  "N0gar cocoa butle, pudra intagrala de milk, bucati de carannel sarat NleY (mllk, smantana (mitk), flavors (aronna naturala de vanille, flavouring naturai), eMifie (lecthine (soja), ocea rnass, Way contain urrne de grau, oua si nuci";

// Doua citiri ale unei etichete fotografiate de aproape: aproape identice.
const CITIRE_BUNA_1 =
  "Zahar, unt de cacao, lapte praf integral, pasta de cacao, emulsifiant: lecitina din soia, aroma naturala de vanilie. Poate contine urme de alune si grau.";
const CITIRE_BUNA_2 =
  "Zahar, unt de cacao, lapte praf integral, pasta de cacao, emulsifiant: lecitina din soia, aroma naturala de vanilie. Poate contine urme de alune si grau";

describe("ocrSimilarity", () => {
  it("doua citiri bune ale aceleiasi etichete sunt considerate concordante", () => {
    expect(ocrSimilarity(CITIRE_BUNA_1, CITIRE_BUNA_2)).toBeGreaterThanOrEqual(0.7);
  });

  it("doua citiri stricate ale aceleiasi etichete NU trec pragul", () => {
    // Asta e cazul din reclamatia reala: fara verificare, prima citire stricata
    // era acceptata pe loc si din ea se calcula un scor de sanatate.
    expect(ocrSimilarity(CITIRE_STRICATA_1, CITIRE_STRICATA_2)).toBeLessThan(0.7);
  });

  it("texte complet diferite au similaritate mica", () => {
    expect(ocrSimilarity(CITIRE_BUNA_1, "Apa minerala naturala carbogazoasa")).toBeLessThan(
      0.3
    );
  });

  it("text identic da 1", () => {
    expect(ocrSimilarity(CITIRE_BUNA_1, CITIRE_BUNA_1)).toBe(1);
  });

  it("text gol da 0, fara sa arunce", () => {
    expect(ocrSimilarity("", CITIRE_BUNA_1)).toBe(0);
    expect(ocrSimilarity("", "")).toBe(0);
  });

  it("ignora ordinea cuvintelor si punctuatia", () => {
    expect(ocrSimilarity("zahar, lapte, cacao", "cacao lapte zahar")).toBe(1);
  });
});
