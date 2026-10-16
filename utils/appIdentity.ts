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
 *
 * `app_uuid` — the identifier sent to Open Food Facts with every contribution.
 *
 * What it IS: a random number, generated on the phone on the first contribution,
 * saved locally. What it is NOT: an account. It doesn't contain and isn't
 * derived from anything about the person — no email, no phone, no IP, no name.
 * Two installs of the app on the same phone get different values.
 *
 * What it's for: Open Food Facts receives all of Zelynta's contributions through
 * a single app account. Without this identifier, a single abuser would get the
 * entire account blocked — meaning all users. With it, moderators only block
 * the problematic install.
 *
 * GDPR: being a purely local value, deleting the app's data removes it
 * permanently. We keep no record anywhere linking it to a person.
 */
export async function getAppUuid(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    if (existing && existing.length >= 32) return existing;
  } catch {
    // Storage indisponibil: generam unul de unica folosinta mai jos.
    // Storage unavailable: we generate a one-off one below.
  }

  const fresh = randomUuid();
  try {
    await AsyncStorage.setItem(KEY, fresh);
  } catch {
    // Nu putem salva — contributia merge oricum, doar ca data viitoare
    // instalarea va aparea ca alta. Acceptabil; nu blocam utilizatorul.
    // Can't save — the contribution still goes through, it's just that next
    // time the install will look like a different one. Acceptable; we don't block the user.
  }
  return fresh;
}

/** Sterge identificatorul. Folosit de „sterge toate datele". */
/** Deletes the identifier. Used by "delete all data". */
export async function resetAppUuid(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignoram
    // ignored
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
 *
 * UUID v4.
 *
 * Uses the platform's cryptographic generator when available (web, and
 * React Native with expo-crypto installed). Otherwise falls back to Math.random.
 *
 * Why the fallback is acceptable: the value is a moderation pseudonym, not a
 * secret and not proof of identity — it doesn't unlock anything. The real
 * risk of a guessable value would be someone using another person's uuid to
 * get it blocked, which requires getting past our proxy anyway. If we want
 * to remove even this risk, `npx expo install expo-crypto` is all it takes:
 * the function below will pick it up automatically.
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
  // The mandatory markers for version 4 and the RFC 4122 variant.
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
