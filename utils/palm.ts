// Detectare ulei de palmier + avertisment corect (nu exagerat).
// Uleiul de palmier in sine NU e clasificat cancerigen; problema o reprezinta
// contaminantii formati la rafinare (esteri glicidilici / 3-MCPD), pe care EFSA
// ii considera posibil cancerigeni, plus continutul mare de grasimi saturate.

const PALM_LABEL: Record<string, string> = {
  ro: "Ulei de palmier",
  en: "Palm oil",
  fr: "Huile de palme",
  it: "Olio di palma",
  es: "Aceite de palma",
  de: "Palmöl",
  ru: "Пальмовое масло",
  pl: "Olej palmowy",
  nl: "Palmolie",
};

const PALM_NOTE: Record<string, string> = {
  ro: "Conține ulei de palmier — bogat în grăsimi saturate. La rafinare poate forma contaminanți (esteri glicidilici), considerați de EFSA posibil cancerigeni. Consum cu moderație.",
  en: "Contains palm oil — high in saturated fat. During refining it can form contaminants (glycidyl esters) that EFSA considers possibly carcinogenic. Consume in moderation.",
  fr: "Contient de l'huile de palme — riche en graisses saturées. Lors du raffinage, elle peut former des contaminants (esters glycidiques) que l'EFSA juge possiblement cancérogènes. À consommer avec modération.",
  it: "Contiene olio di palma — ricco di grassi saturi. Durante la raffinazione può formare contaminanti (esteri glicidilici) che l'EFSA considera possibilmente cancerogeni. Consumare con moderazione.",
  es: "Contiene aceite de palma — rico en grasas saturadas. Durante el refinado puede formar contaminantes (ésteres glicidílicos) que la EFSA considera posiblemente cancerígenos. Consumir con moderación.",
  de: "Enthält Palmöl — reich an gesättigten Fettsäuren. Bei der Raffination können Schadstoffe (Glycidyl-Ester) entstehen, die die EFSA als möglicherweise krebserregend einstuft. In Maßen genießen.",
  ru: "Содержит пальмовое масло — много насыщенных жиров. При рафинировании могут образовываться загрязнители (глицидиловые эфиры), которые EFSA считает возможно канцерогенными. Употребляйте умеренно.",
  pl: "Zawiera olej palmowy — bogaty w tłuszcze nasycone. Podczas rafinacji może tworzyć zanieczyszczenia (estry glicydylowe), które EFSA uznaje za potencjalnie rakotwórcze. Spożywaj z umiarem.",
  nl: "Bevat palmolie — rijk aan verzadigde vetten. Bij raffinage kunnen verontreinigingen (glycidylesters) ontstaan die de EFSA als mogelijk kankerverwekkend beschouwt. Met mate consumeren.",
};

function pick(field: Record<string, string>, lang: string) {
  return field[lang] ?? field.en ?? field.ro ?? "";
}

// Detecteaza uleiul de palmier: intai din tag-ul oficial, apoi din lista de ingrediente.
export function hasPalmOil(product: any): boolean {
  const tags = product?.ingredients_analysis_tags;
  if (Array.isArray(tags)) {
    if (tags.includes("en:palm-oil-free")) return false;
    if (tags.includes("en:palm-oil")) return true;
  }
  const txt = (
    product?.ingredients_text_en ||
    product?.ingredients_text ||
    ""
  ).toLowerCase();
  return /palm|palme|palmier|palm(ö|o)l|palmowy|palmolie|пальмов/.test(txt);
}

export function getPalmNote(lang: string) {
  return { label: pick(PALM_LABEL, lang), text: pick(PALM_NOTE, lang) };
}
