import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWithTimeout } from "./net";

// Traducere automata gratuita prin MyMemory (fara cont, fara cheie).
// Folosita pentru ingrediente cand limba aleasa nu exista in baza de date.
// MyMemory limiteaza fiecare cerere la ~500 caractere, deci taiem textul in bucati.

const memoryCache = new Map<string, string>();
const CACHE_MAX = 500;
function cacheSet(key: string, val: string) {
  if (memoryCache.size >= CACHE_MAX) {
    const oldest = memoryCache.keys().next().value;
    if (oldest !== undefined) memoryCache.delete(oldest);
  }
  memoryCache.set(key, val);
}

function cacheKey(from: string, to: string, text: string) {
  return `xlate:${from}:${to}:${text}`;
}

// Taie textul in bucati <= 480 caractere, preferabil la virgule (lista de ingrediente).
function splitChunks(text: string, max = 480): string[] {
  if (text.length <= max) return [text];
  const parts = text.split(/(,\s*)/); // pastreaza separatorii
  const chunks: string[] = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + p).length > max && cur) {
      chunks.push(cur);
      cur = "";
    }
    // daca o singura bucata e mai mare decat max, o taiem brutal
    if (p.length > max) {
      for (let i = 0; i < p.length; i += max) chunks.push(p.slice(i, i + max));
    } else {
      cur += p;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

async function translateChunk(chunk: string, from: string, to: string): Promise<string> {
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(chunk) +
    `&langpair=${from}|${to}`;
  const res = await fetchWithTimeout(url, {}, 10000);
  if (!res.ok) throw new Error(`translate HTTP ${res.status}`);
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  if (typeof out === "string" && out.trim() && data?.responseStatus === 200) {
    return out;
  }
  throw new Error("translation failed");
}

// Traduce un text dintr-o limba in alta. Intoarce textul original daca ceva eseaza.
export async function translateText(
  text: string,
  from: string,
  to: string
): Promise<string> {
  const clean = (text ?? "").trim();
  if (!clean || from === to) return clean;

  const key = cacheKey(from, to, clean);
  if (memoryCache.has(key)) return memoryCache.get(key)!;

  // cache persistent (ca sa nu reapeleze dupa repornire)
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      cacheSet(key, stored);
      return stored;
    }
  } catch {}

  try {
    const chunks = splitChunks(clean);
    const translated = await Promise.all(
      chunks.map((c) => translateChunk(c, from, to))
    );
    const result = translated.join("");
    cacheSet(key, result);
    AsyncStorage.setItem(key, result).catch(() => {});
    return result;
  } catch {
    return clean; // la eroare, aratam originalul
  }
}
