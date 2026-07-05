// Denumirile INCI (nomenclatorul latin/englez obligatoriu pe cosmetice:
// "Aqua", "Sodium Fluoride"...) nu sunt traduse de serviciul de traducere
// automata — sunt termeni tehnici. Le localizam noi pe cele frecvente, ca
// utilizatorul sa citeasca "apă", nu "aqua", indiferent de limba aleasa.

const INCI: Record<string, Record<string, string>> = {
  aqua: { ro: "apă", en: "water", fr: "eau", it: "acqua", es: "agua", de: "Wasser", ru: "вода", pl: "woda", nl: "water" },
  "sodium fluoride": { ro: "fluorură de sodiu", en: "sodium fluoride", fr: "fluorure de sodium", it: "fluoruro di sodio", es: "fluoruro de sodio", de: "Natriumfluorid", ru: "фторид натрия", pl: "fluorek sodu", nl: "natriumfluoride" },
  "sodium monofluorophosphate": { ro: "monofluorofosfat de sodiu", en: "sodium monofluorophosphate", fr: "monofluorophosphate de sodium", it: "monofluorofosfato di sodio", es: "monofluorofosfato de sodio", de: "Natriummonofluorphosphat", ru: "монофторфосфат натрия", pl: "monofluorofosforan sodu", nl: "natriummonofluorfosfaat" },
  glycerin: { ro: "glicerină", en: "glycerin", fr: "glycérine", it: "glicerina", es: "glicerina", de: "Glycerin", ru: "глицерин", pl: "gliceryna", nl: "glycerine" },
  glycerine: { ro: "glicerină", en: "glycerin", fr: "glycérine", it: "glicerina", es: "glicerina", de: "Glycerin", ru: "глицерин", pl: "gliceryna", nl: "glycerine" },
  "hydrated silica": { ro: "silice hidratată", en: "hydrated silica", fr: "silice hydratée", it: "silice idrata", es: "sílice hidratada", de: "hydratisiertes Siliciumdioxid", ru: "гидратированный диоксид кремния", pl: "uwodniona krzemionka", nl: "gehydrateerd silica" },
  "sodium lauryl sulfate": { ro: "laurilsulfat de sodiu", en: "sodium lauryl sulfate", fr: "laurylsulfate de sodium", it: "lauril solfato di sodio", es: "lauril sulfato de sodio", de: "Natriumlaurylsulfat", ru: "лаурилсульфат натрия", pl: "laurylosiarczan sodu", nl: "natriumlaurylsulfaat" },
  "cellulose gum": { ro: "gumă de celuloză", en: "cellulose gum", fr: "gomme de cellulose", it: "gomma di cellulosa", es: "goma de celulosa", de: "Cellulosegummi", ru: "целлюлозная камедь", pl: "guma celulozowa", nl: "cellulosegom" },
  "xanthan gum": { ro: "gumă xantan", en: "xanthan gum", fr: "gomme xanthane", it: "gomma di xantano", es: "goma xantana", de: "Xanthan", ru: "ксантановая камедь", pl: "guma ksantanowa", nl: "xanthaangom" },
  "titanium dioxide": { ro: "dioxid de titan", en: "titanium dioxide", fr: "dioxyde de titane", it: "biossido di titanio", es: "dióxido de titanio", de: "Titandioxid", ru: "диоксид титана", pl: "dwutlenek tytanu", nl: "titaandioxide" },
  "propylene glycol": { ro: "propilenglicol", en: "propylene glycol", fr: "propylène glycol", it: "glicole propilenico", es: "propilenglicol", de: "Propylenglykol", ru: "пропиленгликоль", pl: "glikol propylenowy", nl: "propyleenglycol" },
  limonene: { ro: "limonen", en: "limonene", fr: "limonène", it: "limonene", es: "limoneno", de: "Limonen", ru: "лимонен", pl: "limonen", nl: "limoneen" },
  "mentha piperita": { ro: "mentă piperită", en: "peppermint", fr: "menthe poivrée", it: "menta piperita", es: "menta piperita", de: "Pfefferminze", ru: "мята перечная", pl: "mięta pieprzowa", nl: "pepermunt" },
  "sodium saccharin": { ro: "zaharină sodică", en: "sodium saccharin", fr: "saccharine sodique", it: "saccarina sodica", es: "sacarina sódica", de: "Natriumsaccharin", ru: "сахаринат натрия", pl: "sacharyna sodowa", nl: "natriumsaccharine" },
  "zinc citrate": { ro: "citrat de zinc", en: "zinc citrate", fr: "citrate de zinc", it: "citrato di zinco", es: "citrato de zinc", de: "Zinkcitrat", ru: "цитрат цинка", pl: "cytrynian cynku", nl: "zinkcitraat" },
  parfum: { ro: "parfum", en: "fragrance", fr: "parfum", it: "profumo", es: "perfume", de: "Duftstoff", ru: "отдушка", pl: "substancja zapachowa", nl: "parfum" },
};

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Termenii mai lungi primii, ca "sodium lauryl sulfate" sa nu fie stricat de
// inlocuiri partiale.
const TERMS = Object.keys(INCI).sort((a, b) => b.length - a.length);

export function localizeInci(text: string, lang: string): string {
  if (!text) return text;
  let out = text;
  for (const term of TERMS) {
    const tr = INCI[term][lang];
    if (!tr || tr.toLowerCase() === term.toLowerCase()) continue;
    out = out.replace(new RegExp(`\\b${escapeRe(term)}\\b`, "gi"), tr);
  }
  return out;
}
