import TextRecognition from "@react-native-ml-kit/text-recognition";
import { additivesInfo } from "../i18n/additives";

// Cheie API OCR.space — "helloworld" e cheia demo gratuită (limitată).
// Pentru producție, ia o cheie gratuită de pe https://ocr.space/ocrapi
const OCR_API_KEY = "helloworld";

// Trimite imaginea (base64) la OCR.space și întoarce textul recunoscut
export async function ocrImage(uri?: string, base64?: string): Promise<string> {
  const source = uri ?? (base64 ? `data:image/jpeg;base64,${base64}` : undefined);
  if (!source) throw new Error("No image provided for OCR");

  try {
    const result = await TextRecognition.recognize(source);
    return result.text.replace(/\r/g, " ").replace(/\s+/g, " ").trim();
  } catch (error) {
    const form = new FormData();
    if (base64) {
      form.append("base64Image", `data:image/jpeg;base64,${base64}`);
    } else {
      throw error;
    }
    form.append("language", "eng");
    form.append("OCREngine", "2");
    form.append("scale", "true");
    form.append("apikey", OCR_API_KEY);

    const res = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (data?.IsErroredOnProcessing) {
      throw new Error(
        Array.isArray(data.ErrorMessage) ? data.ErrorMessage[0] : data.ErrorMessage
      );
    }
    const text: string = data?.ParsedResults?.[0]?.ParsedText ?? "";
    return text.replace(/\r/g, " ").replace(/\s+/g, " ").trim();
  }
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
