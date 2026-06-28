import AsyncStorage from "@react-native-async-storage/async-storage";

// Consimțământ cookie/stocare. App-ul folosește doar stocare strict necesară;
// păstrăm totuși alegerea utilizatorului (GDPR-friendly) și o putem extinde ulterior.
export type Consent = { necessary: true; optional: boolean; at: number };

const KEY = "zelynta_cookie_consent";

export async function getConsent(): Promise<Consent | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

export async function setConsent(optional: boolean): Promise<void> {
  try {
    const c: Consent = { necessary: true, optional, at: Date.now() };
    await AsyncStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // ignoră erorile de stocare
  }
}
