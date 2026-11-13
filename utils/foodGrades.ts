// Nutri-Score si NOVA, citite din Open Food Facts.
//
// Le afisam ca informatie separata, NU intra in scorul Zelynta: sunt
// calculate de OFF dupa reguli proprii, iar scorul nostru are metodologia lui.
// Daca OFF nu are valoarea (sau spune „unknown" / „not-applicable"), nu
// afisam nimic — mai bine lipsa decat o nota inventata.
//
// Nutri-Score and NOVA, read from Open Food Facts.
//
// We show them as separate information, they do NOT feed into the Zelynta
// score: OFF computes them with its own rules, and our score has its own
// methodology. If OFF lacks the value (or says "unknown" / "not-applicable"),
// we show nothing — better missing than an invented grade.

export type NutriGrade = "a" | "b" | "c" | "d" | "e";
export type NovaGroup = 1 | 2 | 3 | 4;

/** Culorile oficiale ale scalei Nutri-Score, A (verde) → E (rosu). */
/** The official Nutri-Score scale colors, A (green) → E (red). */
export const NUTRI_COLORS: Record<NutriGrade, string> = {
  a: "#038141",
  b: "#85BB2F",
  c: "#FECB02",
  d: "#EE8100",
  e: "#E63E11",
};

/** Culorile NOVA: 1 neprocesat (verde) → 4 ultra-procesat (rosu). */
/** NOVA colors: 1 unprocessed (green) → 4 ultra-processed (red). */
export const NOVA_COLORS: Record<NovaGroup, string> = {
  1: "#038141",
  2: "#85BB2F",
  3: "#EE8100",
  4: "#E63E11",
};

export function nutriScoreGrade(product: any): NutriGrade | null {
  const g = String(product?.nutriscore_grade ?? "").trim().toLowerCase();
  return g === "a" || g === "b" || g === "c" || g === "d" || g === "e" ? g : null;
}

export function novaGroup(product: any): NovaGroup | null {
  // OFF trimite uneori numar, alteori text („4") // OFF sometimes sends a number, sometimes text ("4")
  const n = Number(product?.nova_group);
  return n === 1 || n === 2 || n === 3 || n === 4 ? n : null;
}
