import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { Platform } from "react-native";
import { initReactI18next } from "react-i18next";
import { translations } from "./translations";

// Cheia de limbă — aceeași ca pe web (landing + pagini legale), pentru consecvență.
const LANG_KEY = "zelynta_lang";
const supportedLanguages = ["ro", "en", "fr", "it", "es", "de", "ru", "pl", "nl", "bg", "el", "sq"];

// Limba se ia din preferintele telefonului, in ordinea lor. `getLocales()`
// intoarce lista completa, nu doar prima: cineva cu telefonul pe engleza, dar
// cu romana a doua, primeste romana daca engleza n-ar fi fost suportata.
function pickDeviceLanguage(): string {
  for (const loc of getLocales()) {
    const code = (loc?.languageCode ?? "").toLowerCase();
    if (supportedLanguages.includes(code)) return code;
  }
  return "en";
}
const deviceFallback = pickDeviceLanguage();

// Pe web, paginile sunt generate ÎNAINTE de a ști cine le va citi: `expo export`
// rulează pe calculatorul care face publicarea, iar `getLocales()` întoarce acolo
// limba ACELUI calculator. Așa am ajuns să publicăm HTML în franceză, fiindcă de
// pe un Windows pe franceză s-a construit.
//
// Două stricăciuni din asta:
//  - orice vizitator vedea o clipă limba greșită, până se încărca aplicația;
//  - textul din HTML nu se potrivea cu ce randa browserul, iar React arunca
//    eroarea de hidratare #418.
//
// Deci pe web pornim mereu de la aceeași limbă — româna, ca `<html lang="ro">` —
// și o schimbăm pe cea adevărată abia după montare, din `_layout.tsx`. Pe telefon
// nu există randare pe server, deci pornim direct cu limba lui, fără pâlpâire.
const WEB_FIRST_RENDER_LANG = "ro";
const initialLanguage = Platform.OS === "web" ? WEB_FIRST_RENDER_LANG : deviceFallback;

i18n.use(initReactI18next).init({
  resources: {
    ro: { translation: translations.ro },
    en: { translation: translations.en },
    fr: { translation: translations.fr },
    it: { translation: translations.it },
    es: { translation: translations.es },
    de: { translation: translations.de },
    ru: { translation: translations.ru },
    pl: { translation: translations.pl },
    nl: { translation: translations.nl },
    bg: { translation: translations.bg },
    el: { translation: translations.el },
    sq: { translation: translations.sq },
  },
  lng: initialLanguage, // vezi nota de mai sus; se rezolvă după montare
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Rezolvă limba: alegere salvată -> respectă; altfel limba telefonului; altfel engleză.
export async function resolveAppLanguage(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    if (stored && supportedLanguages.includes(stored)) {
      if (i18n.language !== stored) await i18n.changeLanguage(stored);
      return;
    }
  } catch {}
  // Prima rulare: limba telefonului.
  //
  // Inainte, aplicatia intreba geojs.io tara utilizatorului dupa IP. Am scos
  // asta din trei motive, aceleasi pentru care a disparut si de pe site:
  //  - adresa IP nu spune ce limba vorbeste cineva (un roman aflat in Italia
  //    primea italiana, peste setarea telefonului lui);
  //  - IP-ul pleca la un tert la prima pornire, inainte de orice consimtamant,
  //    desi aplicatia se lauda ca nu trimite nimic despre utilizator;
  //  - dispare o cerere de retea si o dependenta externa la fiecare instalare.
  const lang = deviceFallback;
  if (i18n.language !== lang) await i18n.changeLanguage(lang);
  try { await AsyncStorage.setItem(LANG_KEY, lang); } catch {}
}

// Persistă alegerea manuală a utilizatorului (din selectorul de limbă).
export async function persistAppLanguage(code: string): Promise<void> {
  try { await AsyncStorage.setItem(LANG_KEY, code); } catch {}
}

// `resolveAppLanguage()` NU se mai cheamă aici. Pe web ar schimba limba în
// timp ce React încă potrivește HTML-ul primit de la server cu ce randează el.
// Se cheamă din `_layout.tsx`, după montare — un singur loc, ambele platforme.

export default i18n;
