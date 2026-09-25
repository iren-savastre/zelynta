import Constants from "expo-constants";

// Open Food Facts cere ca fiecare aplicație să se prezinte cu un User-Agent
// de forma `NumeApp/Versiune (emailDeContact)`. Fără el, cererile pot fi
// blocate la nivel de IP. Documentat la:
// https://openfoodfacts.github.io/openfoodfacts-server/api/
//
// Ținem un singur loc pentru șir, ca versiunea să nu rămână în urmă în trei
// fișiere diferite.
export const APP_NAME = "Zelynta";

export const APP_VERSION =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_APP_VERSION) ||
  Constants.expoConfig?.version ||
  "1.0.0";

export const OFF_CONTACT = "suport@zelynta.com";

export const OFF_USER_AGENT = `${APP_NAME}/${APP_VERSION} (${OFF_CONTACT})`;
