import Constants from "expo-constants";

// Open Food Facts cere ca fiecare aplicație să se prezinte cu un User-Agent
// de forma `NumeApp/Versiune (emailDeContact)`. Fără el, cererile pot fi
// blocate la nivel de IP. Documentat la:
// https://openfoodfacts.github.io/openfoodfacts-server/api/
//
// Ținem un singur loc pentru șir, ca versiunea să nu rămână în urmă în trei
// fișiere diferite.
// Open Food Facts requires every app to identify itself with a User-Agent
// of the form `AppName/Version (contactEmail)`. Without it, requests can be
// blocked at the IP level. Documented at:
// https://openfoodfacts.github.io/openfoodfacts-server/api/
//
// We keep a single place for the string, so the version doesn't drift out
// of sync across three different files.
export const APP_NAME = "Zelynta";

export const APP_VERSION =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_APP_VERSION) ||
  Constants.expoConfig?.version ||
  "1.0.0";

export const OFF_CONTACT = "suport@zelynta.com";

export const OFF_USER_AGENT = `${APP_NAME}/${APP_VERSION} (${OFF_CONTACT})`;
