import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./translations";

// Cheia de limbă — aceeași ca pe web (landing + pagini legale), pentru consecvență.
const LANG_KEY = "zelynta_lang";
const supportedLanguages = ["ro", "en", "fr", "it", "es", "de", "ru", "pl", "nl"];

// Limba telefonului (ex: "fr", "ro"...) — semnal secundar.
const deviceLanguage = getLocales()[0]?.languageCode ?? "en";
const deviceFallback = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : "en";

// țară (ISO-3166-1 alpha-2) -> limbă disponibilă; restul -> engleză
const CC2LANG: Record<string, string> = {
  RO: "ro", MD: "ro",
  GB: "en", US: "en", IE: "en", AU: "en", NZ: "en", ZA: "en", IN: "en", CA: "en", SG: "en", MT: "en", PH: "en", NG: "en",
  FR: "fr", BE: "fr", LU: "fr", MC: "fr",
  IT: "it", CH: "it", SM: "it", VA: "it",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es", UY: "es", PR: "es",
  DE: "de", AT: "de", LI: "de",
  RU: "ru", BY: "ru", KZ: "ru", KG: "ru", AM: "ru",
  PL: "pl",
  NL: "nl", SR: "nl", AW: "nl",
};

// Detectează limba după IP-ul dispozitivului (geojs.io, fără cheie). Fallback: null.
async function detectByIp(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1800);
    const res = await fetch("https://get.geojs.io/v1/ip/country.json", {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const cc = String(data?.country ?? "").toUpperCase();
    return cc ? CC2LANG[cc] ?? "en" : "en";
  } catch {
    return null;
  }
}

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
  },
  lng: deviceFallback, // provizoriu — se rezolvă mai jos (instant, fără ecran gol)
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Rezolvă limba: alegere salvată -> respectă; altfel IP; altfel device; altfel engleză.
export async function resolveAppLanguage(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    if (stored && supportedLanguages.includes(stored)) {
      if (i18n.language !== stored) await i18n.changeLanguage(stored);
      return;
    }
  } catch {}
  // prima rulare -> detectare automată după IP
  const byIp = await detectByIp();
  const lang = byIp && supportedLanguages.includes(byIp) ? byIp : deviceFallback;
  if (i18n.language !== lang) await i18n.changeLanguage(lang);
  try { await AsyncStorage.setItem(LANG_KEY, lang); } catch {}
}

// Persistă alegerea manuală a utilizatorului (din selectorul de limbă).
export async function persistAppLanguage(code: string): Promise<void> {
  try { await AsyncStorage.setItem(LANG_KEY, code); } catch {}
}

// pornește rezolvarea limbii (fără a bloca randarea)
resolveAppLanguage();

export default i18n;
