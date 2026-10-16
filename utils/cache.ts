import AsyncStorage from "@react-native-async-storage/async-storage";

// Cache simplu cu expirare, peste AsyncStorage (deja folosit pentru istoric,
// favorite si cos). Nu adaugam o librarie noua doar pentru atat.
//
// Versiunea de schema: daca forma datelor salvate se schimba, cresterea ei
// invalideaza automat tot ce e vechi, fara migrare si fara date corupte.
// A simple cache with expiry, on top of AsyncStorage (already used for
// history, favorites and basket). We don't add a new library just for this.
//
// Schema version: if the shape of the stored data changes, bumping it
// automatically invalidates everything old, with no migration and no corrupt data.
export const CACHE_SCHEMA_VERSION = 1;

type Entry<T> = {
  schemaVersion: number;
  storedAt: number;
  expiresAt: number;
  data: T;
};

/** Citeste o intrare. Returneaza null daca lipseste, e expirata sau e de alta versiune. */
/** Reads an entry. Returns null if it's missing, expired, or a different version. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const e = await cacheGetEntry<T>(key);
  if (!e) return null;
  return Date.now() > e.expiresAt ? null : e.data;
}

/**
 * Citeste intrarea BRUTA, chiar daca a expirat.
 * Folosit cand nu avem internet: un produs vechi de o luna e mult mai util
 * decat un ecran de eroare.
 *
 * Reads the RAW entry, even if it has expired.
 * Used when we have no internet: a month-old product is much more useful
 * than an error screen.
 */
export async function cacheGetEntry<T>(key: string): Promise<Entry<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const e = JSON.parse(raw) as Entry<T>;
    if (!e || e.schemaVersion !== CACHE_SCHEMA_VERSION) return null;
    if (typeof e.expiresAt !== "number" || typeof e.storedAt !== "number") return null;
    return e;
  } catch {
    // Storage plin, JSON corupt sau AsyncStorage indisponibil: cache-ul e o
    // optimizare, nu o sursa de adevar — esecul lui nu are voie sa rupa nimic.
    // Storage full, corrupt JSON, or AsyncStorage unavailable: the cache is an
    // optimization, not a source of truth — its failure must never break anything.
    return null;
  }
}

/** Scrie o intrare cu durata de viata `ttlMs`. Esecul e ignorat intentionat. */
/** Writes an entry with lifetime `ttlMs`. Failure is intentionally ignored. */
export async function cacheSet<T>(key: string, data: T, ttlMs: number): Promise<void> {
  const now = Date.now();
  const entry: Entry<T> = {
    schemaVersion: CACHE_SCHEMA_VERSION,
    storedAt: now,
    expiresAt: now + ttlMs,
    data,
  };
  try {
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // ex. quota depasita — mergem mai departe fara cache
    // e.g. quota exceeded — we carry on without the cache
  }
}

/** Sterge toate intrarile care incep cu prefixul dat. */
/** Deletes all entries that start with the given prefix. */
export async function cacheClearPrefix(prefix: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mine = keys.filter((k) => k.startsWith(prefix));
    if (mine.length) await AsyncStorage.multiRemove(mine);
  } catch {
    // ignoram
    // ignored
  }
}
