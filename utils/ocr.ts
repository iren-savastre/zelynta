import TextRecognition from "@react-native-ml-kit/text-recognition";
import { additivesInfo } from "../i18n/additives";
import { fetchWithTimeout } from "./net";

// Cheie API OCR.space — citită din mediu (EXPO_PUBLIC_OCR_KEY); "helloworld" e
// cheia demo gratuită (limitată) folosită doar ca fallback în dezvoltare.
// Pentru producție, setează o cheie proprie de pe https://ocr.space/ocrapi
const OCR_API_KEY =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_OCR_KEY) || "helloworld";

if (OCR_API_KEY === "helloworld" && typeof __DEV__ !== "undefined" && __DEV__) {
  // Avertisment doar în dezvoltare: cheia demo e puternic limitată în producție.
  console.warn(
    "[Zelynta] OCR folosește cheia demo 'helloworld' (rate-limited). Setează EXPO_PUBLIC_OCR_KEY în .env pentru producție."
  );
}

// Trimite imaginea (base64) la OCR.space și întoarce textul recunoscut
export async function ocrImage(uri?: string, base64?: string): Promise<string> {
  const source = uri ?? (base64 ? `data:image/jpeg;base64,${base64}` : undefined);
  if (!source) throw new Error("No image provided for OCR");

  try {
    const result = await TextRecognition.recognize(source);
    return (result?.text ?? "").replace(/\r/g, " ").replace(/\s+/g, " ").trim();
  } catch (error: any) {
    // ML Kit nativ e indisponibil in Expo Go/web — trecem pe OCR.space.
    if (!base64) throw error;
    // Motorul 2 e mai bun pe etichete moderne, dar uneori intoarce gol acolo
    // unde motorul 1 reuseste — incercam pe rand.
    const text2 = await ocrSpaceRequest(base64, "2");
    if (text2) return text2;
    return await ocrSpaceRequest(base64, "1");
  }
}

async function ocrSpaceRequest(base64: string, engine: "1" | "2"): Promise<string> {
  const form = new FormData();
  form.append("base64Image", `data:image/jpeg;base64,${base64}`);
  form.append("language", "eng");
  form.append("OCREngine", engine);
  form.append("scale", "true");
  // Pozele de pe Android pot veni rotite — serverul detecteaza orientarea.
  form.append("detectOrientation", "true");
  form.append("apikey", OCR_API_KEY);

  const res = await fetchWithTimeout(
    "https://api.ocr.space/parse/image",
    { method: "POST", body: form },
    20000
  );
  if (!res.ok) throw new Error(`OCR HTTP ${res.status}`);
  const data = await res.json();
  if (data?.IsErroredOnProcessing) {
    throw new Error(
      Array.isArray(data.ErrorMessage) ? data.ErrorMessage[0] : data.ErrorMessage
    );
  }
  const text: string = data?.ParsedResults?.[0]?.ParsedText ?? "";
  return text.replace(/\r/g, " ").replace(/\s+/g, " ").trim();
}

// Etichetele europene sunt deseori multilingve si contin si texte de pastrare,
// gramaj, marketing. Extragem DOAR lista de ingrediente, o singura data,
// preferand limba utilizatorului — restul textului nu il intereseaza.
const ING_KEYWORDS: { lang: string; re: RegExp }[] = [
  { lang: "ro", re: /ingrediente\s*[:;]/gi },
  { lang: "en", re: /ingredients\s*[:;]/gi },
  { lang: "fr", re: /ingr[ée]dients\s*[:;]/gi },
  { lang: "de", re: /zutaten\s*[:;]/gi },
  { lang: "nl", re: /ingredi[ëe]nten\s*[:;]/gi },
  { lang: "it", re: /ingredienti\s*[:;]/gi },
  { lang: "es", re: /ingredientes\s*[:;]/gi },
  { lang: "pl", re: /sk[łl]adniki\s*[:;]/gi },
  { lang: "ru", re: /состав\s*[:;]/gi },
];

// Fraze care marcheaza sfarsitul listei (alergeni "poate contine", pastrare,
// gramaj, producator) — in limbile uzuale de pe etichete.
const ING_END_RE =
  /(poate con[tț]ine|urme de|may contain|kan sporen|peut contenir|può contenere|puede contener|kann spuren|może zawierać|может содержать|a conserver|à conserver|conserver|bewaren|store in|p[aă]stra|netto|net weight|poids net|nettogewicht|mindestens haltbar|best before|[aà] consommer|da consumarsi|consumir antes|tegen warmte|ungeöffnet|hergestellt|fabricat|produced by|suggestion de)/i;

export function extractIngredientsSegment(
  text: string,
  preferredLang: string
): { segment: string; srcLang: string } {
  const hits: { lang: string; start: number; contentStart: number }[] = [];
  for (const k of ING_KEYWORDS) {
    k.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = k.re.exec(text)) !== null) {
      hits.push({ lang: k.lang, start: m.index, contentStart: m.index + m[0].length });
    }
  }
  if (!hits.length) return { segment: text, srcLang: "en" };
  hits.sort((a, b) => a.start - b.start);
  const pick =
    hits.find((h) => h.lang === preferredLang) ??
    hits.find((h) => h.lang === "en") ??
    hits[0];
  // Lista se termina la urmatoarea repetare in alta limba sau la markerii de final.
  const next = hits.find((h) => h.start > pick.start);
  let seg = text.slice(pick.contentStart, next ? next.start : undefined);
  const em = ING_END_RE.exec(seg);
  if (em && em.index > 10) seg = seg.slice(0, em.index);
  seg = seg.trim().replace(/[.,;\s]+$/, "");
  if (seg.length < 12) return { segment: text, srcLang: pick.lang };
  return { segment: seg, srcLang: pick.lang };
}

// Extrage codurile E (E150d, E 621, E-330...) din text și le mapează la tag-uri
// de aditivi, doar pe cele cunoscute în dicționarul nostru.
export function extractAdditiveTags(text: string): string[] {
  const found = new Set<string>();
  const regex = /e[\s-]?(\d{3,4})([a-z])?/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const code = `e${m[1]}${m[2] ? m[2].toLowerCase() : ""}`;
    if ((additivesInfo as any)[code]) {
      found.add(`en:${code}`);
    }
  }
  return [...found];
}
