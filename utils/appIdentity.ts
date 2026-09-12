import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "zelynta_app_uuid";

/**
 * `app_uuid` — identificatorul trimis catre Open Food Facts la fiecare contributie.
 *
 * Ce ESTE: un numar aleator, generat pe telefon la prima contributie, salvat local.
 * Ce NU ESTE: un cont. Nu contine si nu deriva din nimic despre persoana — fara
 * e-mail, fara telefon, fara IP, fara nume. Doua instalari ale aplicatiei pe
 * acelasi telefon primesc valori diferite.
 *
 * La ce foloseste: Open Food Facts primeste toate contributiile Zelynta printr-un
 * singur cont de aplicatie. Fara acest identificator, un singur abuzator ar duce
 * la blocarea intregului cont — adica a tuturor utilizatorilor. Cu el,
 * moderatorii blocheaza doar instalarea problematica.
 *
 * GDPR: fiind o valoare pur locala, stergerea datelor aplicatiei o elimina
 * definitiv. Nu exista nicio evidenta la noi care sa o lege de o persoana.
 */
export async function getAppUuid(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    if (existing && existing.length >= 32) return existing;
  } catch {
    // Storage indisponibil: generam unul de unica folosinta mai jos.
  }

  const fresh = randomUuid();
  try {
    await AsyncStorage.setItem(KEY, fresh);
  } catch {
    // Nu putem salva — contributia merge oricum, doar ca data viitoare
    // instalarea va aparea ca alta. Acceptabil; nu blocam utilizatorul.
  }
  return fresh;
}

/** Sterge identificatorul. Folosit de „sterge toate datele". */
export async function resetAppUuid(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignoram
  }
}

/**
 * UUID v4.
 *
 * Foloseste generatorul criptografic al platformei cand exista (web, si
 * React Native cu expo-crypto instalat). Altfel cade pe Math.random.
 *
 * De ce e acceptabila rezerva: valoarea e un pseudonim de moderare, nu un
 * secret si nu o dovada de identitate — nu deblocheaza nimic. Riscul real al
 * unei valori ghicibile ar fi ca cineva sa foloseasca uuid-ul altcuiva ca sa
 * il puna sub blocaj, iar asta presupune oricum sa treaca de proxy-ul nostru.
 * Daca vrem sa eliminam si acest risc, `npx expo install expo-crypto` e tot ce
 * trebuie: functia de mai jos il va prelua automat.
 */
export function randomUuid(): string {
  const g: any = globalThis as any;

  if (typeof g?.crypto?.randomUUID === "function") {
    return g.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof g?.crypto?.getRandomValues === "function") {
    g.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  // Marcajele obligatorii pentru versiunea 4 si varianta RFC 4122.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex: string[] = [];
  for (let i = 0; i < 16; i++) hex.push(bytes[i].toString(16).padStart(2, "0"));
  return (
    hex.slice(0, 4).join("") +
    "-" +
    hex.slice(4, 6).join("") +
    "-" +
    hex.slice(6, 8).join("") +
    "-" +
    hex.slice(8, 10).join("") +
    "-" +
    hex.slice(10, 16).join("")
  );
}
