// Harta "corp uman -> organe afectate" pentru aditivi.
// Fiecare organ are o pozitie pe silueta (coordonate intr-un viewBox 100x220)
// si un nume in cele 9 limbi. Maparea aditiv -> organe se bazeaza pe efectele
// documentate (EFSA / IARC), aceleasi surse ca descrierile.

export type OrganId =
  | "brain"
  | "thyroid"
  | "heart"
  | "lungs"
  | "liver"
  | "stomach"
  | "kidneys"
  | "intestines"
  | "bladder"
  | "bones"
  | "skin"
  | "teeth"
  | "blood";

type L9 = { ro: string; en: string; fr: string; it: string; es: string; de: string; ru: string; pl: string; nl: string; bg: string; el: string };

export type Organ = {
  id: OrganId;
  name: L9;
  cx: number; // centru X pe silueta (viewBox 100 x 220)
  cy: number; // centru Y
  r: number; // raza „aura" de highlight
};

export const ORGANS: Record<OrganId, Organ> = {
  brain:      { id: "brain",      cx: 50, cy: 15,  r: 11, name: { ro: "Creier", en: "Brain", fr: "Cerveau", it: "Cervello", es: "Cerebro", de: "Gehirn", ru: "Мозг", pl: "Mózg", nl: "Hersenen", bg: "Мозък", el: "Εγκέφαλος" } },
  thyroid:    { id: "thyroid",    cx: 50, cy: 33,  r: 7,  name: { ro: "Tiroidă", en: "Thyroid", fr: "Thyroïde", it: "Tiroide", es: "Tiroides", de: "Schilddrüse", ru: "Щитовидная железа", pl: "Tarczyca", nl: "Schildklier", bg: "Щитовидна жлеза", el: "Θυρεοειδής" } },
  lungs:      { id: "lungs",      cx: 50, cy: 55,  r: 15, name: { ro: "Plămâni", en: "Lungs", fr: "Poumons", it: "Polmoni", es: "Pulmones", de: "Lunge", ru: "Лёгкие", pl: "Płuca", nl: "Longen", bg: "Бял дроб", el: "Πνεύμονες" } },
  heart:      { id: "heart",      cx: 44, cy: 56,  r: 9,  name: { ro: "Inimă", en: "Heart", fr: "Cœur", it: "Cuore", es: "Corazón", de: "Herz", ru: "Сердце", pl: "Serce", nl: "Hart", bg: "Сърце", el: "Καρδιά" } },
  liver:      { id: "liver",      cx: 42, cy: 74,  r: 11, name: { ro: "Ficat", en: "Liver", fr: "Foie", it: "Fegato", es: "Hígado", de: "Leber", ru: "Печень", pl: "Wątroba", nl: "Lever", bg: "Черен дроб", el: "Ήπαρ" } },
  stomach:    { id: "stomach",    cx: 56, cy: 76,  r: 10, name: { ro: "Stomac", en: "Stomach", fr: "Estomac", it: "Stomaco", es: "Estómago", de: "Magen", ru: "Желудок", pl: "Żołądek", nl: "Maag", bg: "Стомах", el: "Στομάχι" } },
  kidneys:    { id: "kidneys",    cx: 50, cy: 88,  r: 13, name: { ro: "Rinichi", en: "Kidneys", fr: "Reins", it: "Reni", es: "Riñones", de: "Nieren", ru: "Почки", pl: "Nerki", nl: "Nieren", bg: "Бъбреци", el: "Νεφρά" } },
  intestines: { id: "intestines", cx: 50, cy: 100, r: 13, name: { ro: "Intestine", en: "Intestines", fr: "Intestins", it: "Intestino", es: "Intestinos", de: "Darm", ru: "Кишечник", pl: "Jelita", nl: "Darmen", bg: "Черва", el: "Έντερα" } },
  bladder:    { id: "bladder",    cx: 50, cy: 114, r: 7,  name: { ro: "Vezică urinară", en: "Bladder", fr: "Vessie", it: "Vescica", es: "Vejiga", de: "Blase", ru: "Мочевой пузырь", pl: "Pęcherz", nl: "Blaas", bg: "Пикочен мехур", el: "Ουροδόχος κύστη" } },
  bones:      { id: "bones",      cx: 24, cy: 150, r: 9,  name: { ro: "Oase", en: "Bones", fr: "Os", it: "Ossa", es: "Huesos", de: "Knochen", ru: "Кости", pl: "Kości", nl: "Botten", bg: "Кости", el: "Οστά" } },
  teeth:      { id: "teeth",      cx: 50, cy: 26,  r: 6,  name: { ro: "Dinți", en: "Teeth", fr: "Dents", it: "Denti", es: "Dientes", de: "Zähne", ru: "Зубы", pl: "Zęby", nl: "Tanden", bg: "Зъби", el: "Δόντια" } },
  skin:       { id: "skin",       cx: 76, cy: 95,  r: 8,  name: { ro: "Piele", en: "Skin", fr: "Peau", it: "Pelle", es: "Piel", de: "Haut", ru: "Кожа", pl: "Skóra", nl: "Huid", bg: "Кожа", el: "Δέρμα" } },
  blood:      { id: "blood",      cx: 30, cy: 66,  r: 7,  name: { ro: "Sânge", en: "Blood", fr: "Sang", it: "Sangue", es: "Sangre", de: "Blut", ru: "Кровь", pl: "Krew", nl: "Bloed", bg: "Кръв", el: "Αίμα" } },
};

// Aditiv (cod E) -> organele afectate, dupa efectele documentate.
// Acopera aditivii cu „poveste" (risk/caution). Cheia e codul minuscul.
export const ADDITIVE_ORGANS: Record<string, OrganId[]> = {
  // Fosfati — echilibrul fosfor/calciu: rinichi, oase, inima/vase
  e338: ["kidneys", "bones", "heart", "teeth"],
  e339: ["kidneys", "bones", "heart"],
  e340: ["kidneys", "bones", "heart"],
  e341: ["kidneys", "bones", "heart"],
  e450: ["kidneys", "bones", "heart"],
  e451: ["kidneys", "bones", "heart"],
  e452: ["kidneys", "bones", "heart"],
  // Nitriti/nitrati — stomac/colon (nitrozamine), sange (methemoglobina)
  e250: ["stomach", "intestines", "blood"],
  e251: ["stomach", "intestines", "blood"],
  e252: ["stomach", "intestines", "blood"],
  // Caramel amoniacal — ficat/sistem imunitar
  e150d: ["liver", "blood"],
  // Dioxid de titan — intestine (interzis in UE la alimente din 2022)
  e171: ["intestines"],
  // Indulcitori — aspartam: creier/sistem nervos; ciclamat/zaharina: vezica
  e951: ["brain"],
  e952: ["bladder"],
  e954: ["bladder"],
  // Coloranti azoici — hiperactivitate (creier), alergii (piele)
  e102: ["brain", "skin"],
  e104: ["brain", "skin"],
  e110: ["brain", "skin"],
  e122: ["brain", "skin"],
  e124: ["brain", "skin"],
  e129: ["brain", "skin"],
  // Annatto — reactii alergice cutanate
  e160b: ["skin"],
  // Lizozim (din ou) — alergen: piele/sistem imunitar
  e1105: ["skin"],
  // Sorbati — reactii cutanate la sensibili
  e200: ["skin"],
  e202: ["skin"],
  // Benzoati — piele; cu vitamina C pot forma benzen (sange)
  e210: ["skin", "blood"],
  e211: ["skin", "blood"],
  // Sulfiti — astm (plamani), iritatie gastrica
  e220: ["lungs", "stomach"],
  e223: ["lungs", "stomach"],
  // MSG (glutamat) — sistem nervos la persoanele sensibile
  e621: ["brain"],
  // Xantan / amidon modificat — tract digestiv
  e415: ["intestines", "stomach"],
  e1442: ["intestines", "stomach"],
};

export function organsForAdditive(code: string): OrganId[] {
  return ADDITIVE_ORGANS[String(code || "").toLowerCase()] ?? [];
}

export function organName(id: OrganId, lang: string): string {
  const o = ORGANS[id];
  return o ? o.name[lang as keyof L9] ?? o.name.en : id;
}
