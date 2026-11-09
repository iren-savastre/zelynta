import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";
import { fetchWithTimeout } from "./net";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./publicConfig";

// Trimite in baza publica (Open Food Facts / Open Beauty Facts) ingredientele
// citite din poza, ca urmatorul utilizator care scaneaza acelasi cod sa gaseasca
// produsul gata analizat.
//
// Aplicatia NU cunoaste parola contului OFF. Trimite datele la functia noastra
// de pe server (Supabase Edge Function "off-contribute"), care pastreaza parola
// ca secret, limiteaza abuzul si le transmite mai departe catre OFF/OBF.
// Vezi backend/supabase/functions/off-contribute/index.ts.

export type ContribDb = "food" | "beauty";

export const CONTRIB_DBS: Record<ContribDb, { base: string; name: string }> = {
  food: { base: "https://world.openfoodfacts.org", name: "Open Food Facts" },
  beauty: { base: "https://world.openbeautyfacts.org", name: "Open Beauty Facts" },
};

// Ce s-a citit din poza si poate fi trimis (atasat produsului ca `_contrib`).
export type ContribDraft = {
  code: string; // codul de bare scanat
  db: ContribDb | null; // null = nu stim daca e aliment sau cosmetic, alege utilizatorul
  text: string; // lista de ingrediente extrasa
  textLang: string | null; // limba listei, sau null daca n-am gasit "Ingrediente:" pe eticheta
  photoUri: string; // poza etichetei
  fallbackLang: string; // limba aplicatiei, pentru poza cand nu stim limba textului
};

// Serverul e configurat? Fara el, aplicatia deschide pagina produsului pe site
// (utilizatorul il adauga manual), in loc sa trimita direct.
export const canSubmitDirectly = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function contribEditUrl(draft: ContribDraft, db: ContribDb): string {
  return `${CONTRIB_DBS[db].base}/product/${encodeURIComponent(draft.code)}`;
}

// Id aleator per instalare (nu contine nimic personal), pastrat intre sesiuni.
// Serverul il transforma in hash inainte sa-l foloseasca.
const DEVICE_KEY = "zelynta.contribUuid";
async function getDeviceId(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(DEVICE_KEY);
    if (saved) return saved;
  } catch {}
  let id = "";
  for (let i = 0; i < 32; i++) id += Math.floor(Math.random() * 16).toString(16);
  try {
    await AsyncStorage.setItem(DEVICE_KEY, id);
  } catch {}
  return id;
}

// Pune fisierul pozei intr-un FormData (pe telefon: {uri,name,type}; pe web: Blob).
async function appendPhoto(form: FormData, uri: string) {
  // Poza originala poate avea cativa MB — o micsoram, dar destul de mare ca
  // moderatorii OFF/OBF sa poata citi eticheta.
  let src = uri;
  try {
    const r = await manipulateAsync(uri, [{ resize: { width: 2000 } }], {
      compress: 0.85,
      format: SaveFormat.JPEG,
    });
    src = r.uri;
  } catch {}
  if (Platform.OS === "web") {
    const blob = await (await fetch(src)).blob();
    form.append("photo", blob, "ingredients.jpg");
  } else {
    form.append("photo", { uri: src, name: "ingredients.jpg", type: "image/jpeg" } as any);
  }
}

// Lista de ingrediente intra doar daca am gasit-o sigur pe eticheta (cuvantul
// "Ingrediente:"); altfel trimitem doar poza, iar OFF/OBF o citesc singure —
// ca sa nu stricam baza publica cu text gresit.
export async function submitContribution(draft: ContribDraft, db: ContribDb): Promise<void> {
  if (!canSubmitDirectly) throw new Error("server not configured");
  const form = new FormData();
  form.append("db", db);
  form.append("code", draft.code);
  form.append("deviceId", await getDeviceId());
  form.append("appVersion", String(Constants.expoConfig?.version ?? "1.0.0"));
  form.append("imageLang", (draft.textLang ?? draft.fallbackLang).slice(0, 2));
  if (draft.textLang) {
    form.append("textLang", draft.textLang);
    form.append("text", draft.text.trim());
  }
  if (draft.photoUri) await appendPhoto(form, draft.photoUri);

  const res = await fetchWithTimeout(
    `${SUPABASE_URL}/functions/v1/off-contribute`,
    {
      method: "POST",
      body: form,
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
    },
    60000
  );
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`);
}
