import { adviceInfo, adviceLabels } from "../i18n/advice";

// Reguli de incadrare: prima potrivire castiga, deci ordinea conteaza
// (cele mai specifice sus: mezeluri inainte de carne, suc carbogazos inainte de suc).
const RULES: [string, RegExp][] = [
  ["salt", /\bsalt\b|sare|nigari|fleur de sel|sea-salt|sel\b/],
  ["water", /\bwater\b|waters|mineral-water|eaux?\b|\bapa\b|apă|spring-water/],
  ["soda", /soda|carbonated|soft-drink|coca-cola|\bcolas?\b|energy-drink|limonad|sweetened-beverage/],
  ["juice", /juice|jus\b|nectar|smoothie|suc\b/],
  ["yogurt", /yogh?urt|yaourt|iaurt|iaurturi/],
  ["cheese", /cheese|fromage|brânz|branz|queso|formagg/],
  ["milk", /\bmilk\b|milks|\blait\b|lapte|dairy-drink|plant-milk|plant-based-milk/],
  ["processed-meat", /processed-meat|prepared-meat|cured-meat|sausage|salami|\bham\b|bacon|mezel|charcuter|cârnaț|carnat|hot-dog|wurst/],
  ["meat", /\bmeat\b|meats|viande|\bcarne\b|poultry|beef|\bpork\b|chicken|pui\b|curcan/],
  ["fish", /\bfish\b|fishes|seafood|poisson|pește|peste\b|\btuna\b|salmon|sardine|ton\b/],
  ["chocolate", /chocolate|chocolat|ciocolat|cocoa|cacao/],
  ["sweets", /\bcandy\b|candies|\bsweets\b|bonbon|dulciuri|confectionery|gummies|jelly|caramel|lollipop|acadea/],
  ["snacks", /chips\b|crisps|\bsnack|crackers|pretzel|sticksuri|pufuleti|popcorn/],
  ["bread", /\bbread\b|breads|\bpain\b|pâine|paine|bakery|baguette|toast|chifl/],
  ["cereals", /cereal|cereale|muesli|granola|\boat|porridge|fulgi|corn-flakes/],
  ["oil", /\boil\b|oils|huile|\bulei|olive-oil|aceite/],
  ["coffee", /\bcoffee\b|café\b|cafea|espresso|cafe\b/],
  ["tea", /\btea\b|teas|\bthé\b|\bceai|infusion|matcha/],
  ["nuts", /\bnuts\b|\bnut\b|noix|nuci|almond|migdale|peanut|arahid|seeds|seminte|semințe|cashew|pistach|alune/],
  ["honey", /honey|\bmiel\b|miere/],
  ["egg", /\beggs?\b|oeuf|œuf|\boua\b|ouă|huevo/],
  ["beans", /\bbeans\b|lentil|chickpea|legumes\b|leguminoase|fasole|linte|năut|naut|mazăre|mazare/],
  ["fruit", /\bfruits?\b|fructe|berries|apple|banana|mar\b|mere\b/],
  ["vegetable", /vegetable|\blegume\b|legumă|legume-|veggies|tomato|carrot|broccoli/],
];

function buildHaystack(product: any): string {
  const tags: string[] = Array.isArray(product?.categories_tags)
    ? product.categories_tags
    : [];
  return [
    tags.join(" "),
    product?.categories ?? "",
    product?.product_name ?? "",
    product?.generic_name ?? "",
    product?.brands ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

// Detecteaza categoria produsului; intoarce "generic" daca nu se potriveste nimic.
export function detectAdviceCategory(product: any): string {
  const hay = buildHaystack(product);
  for (const [key, re] of RULES) {
    if (re.test(hay)) return key;
  }
  return "generic";
}

function pick(field: any, lang: string) {
  return field ? field[lang] ?? field.en ?? field.ro ?? "" : "";
}

export type ProductAdvice = {
  category: string;
  icon: string;
  benefits: string;
  when: string;
  how: string;
  who: string;
  children: string;
  labels: {
    title: string;
    benefits: string;
    when: string;
    how: string;
    who: string;
    children: string;
  };
};

// Intoarce recomandarea pentru o categorie deja stiuta (folosit de pagina de recomandari).
export function getAdviceByCategory(category: string, lang: string): ProductAdvice {
  const key = adviceInfo[category] ? category : "generic";
  const a = adviceInfo[key] ?? adviceInfo.generic;
  return {
    category: key,
    icon: a.icon,
    benefits: pick(a.benefits, lang),
    when: pick(a.when, lang),
    how: pick(a.how, lang),
    who: pick(a.who, lang),
    children: pick(a.children, lang),
    labels: {
      title: pick(adviceLabels.title, lang),
      benefits: pick(adviceLabels.benefits, lang),
      when: pick(adviceLabels.when, lang),
      how: pick(adviceLabels.how, lang),
      who: pick(adviceLabels.who, lang),
      children: pick(adviceLabels.children, lang),
    },
  };
}

// Intoarce recomandarea completa, deja tradusa in limba ceruta.
export function getProductAdvice(product: any, lang: string): ProductAdvice {
  const category = detectAdviceCategory(product);
  const a = adviceInfo[category] ?? adviceInfo.generic;
  return {
    category,
    icon: a.icon,
    benefits: pick(a.benefits, lang),
    when: pick(a.when, lang),
    how: pick(a.how, lang),
    who: pick(a.who, lang),
    children: pick(a.children, lang),
    labels: {
      title: pick(adviceLabels.title, lang),
      benefits: pick(adviceLabels.benefits, lang),
      when: pick(adviceLabels.when, lang),
      how: pick(adviceLabels.how, lang),
      who: pick(adviceLabels.who, lang),
      children: pick(adviceLabels.children, lang),
    },
  };
}
