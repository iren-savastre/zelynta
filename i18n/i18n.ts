import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { translations } from "./translations";

// Detectează limba telefonului (ex: "fr", "ro", "de"...)
const deviceLanguage = getLocales()[0]?.languageCode ?? "en";

// Lista limbilor pe care le suportăm
const supportedLanguages = ["ro", "en", "fr", "it", "es", "de", "ru", "pl", "nl"];

// Dacă limba telefonului e suportată, o folosim; altfel engleză
const initialLanguage = supportedLanguages.includes(deviceLanguage)
  ? deviceLanguage
  : "en";

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
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;