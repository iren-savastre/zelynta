import { cacheGetEntry, cacheSet, cacheClearPrefix, CACHE_SCHEMA_VERSION } from "./cache";

const PREFIX = "zelynta_product_";

// Compozitia unui produs se schimba rar — reformularile sunt anuale, nu zilnice.
// 14 zile tine plafonul de cereri jos si pastreaza datele rezonabil de proaspete.
export const PRODUCT_TTL_MS = 14 * 24 * 60 * 60 * 1000;

// Nu punem in cache pret, stoc sau disponibilitate. Zelynta nu le foloseste
// deloc, iar daca s-ar adauga vreodata, sunt date volatile care nu au ce cauta
// intr-un cache de 14 zile.
export type CachedProduct = {
  barcode: string;
  product: any;
  source: string; // baza din care a venit (_db): food / beauty / products / petfood
  storedAt: number;
  expiresAt: number;
  schemaVersion: number;
};

const keyFor = (barcode: string) => PREFIX + barcode;

/**
 * Citeste un produs din cache.
 * `allowStale: true` returneaza si intrari expirate — pentru cazul „fara
 * internet", unde un produs vechi bate un ecran de eroare.
 */
export async function getCachedProduct(
  barcode: string,
  { allowStale = false } = {}
): Promise<{ product: any; storedAt: number; stale: boolean } | null> {
  const e = await cacheGetEntry<CachedProduct>(keyFor(barcode));
  if (!e?.data?.product) return null;
  const stale = Date.now() > e.expiresAt;
  if (stale && !allowStale) return null;
  return { product: e.data.product, storedAt: e.data.storedAt, stale };
}

/** Salveaza un produs gasit. Produsele negasite NU se pun in cache. */
export async function setCachedProduct(barcode: string, product: any): Promise<void> {
  const now = Date.now();
  const entry: CachedProduct = {
    barcode,
    product,
    source: product?._db ?? "unknown",
    storedAt: now,
    expiresAt: now + PRODUCT_TTL_MS,
    schemaVersion: CACHE_SCHEMA_VERSION,
  };
  await cacheSet(keyFor(barcode), entry, PRODUCT_TTL_MS);
}

/** Goleste cache-ul de produse (folosit de „sterge toate datele"). */
export async function clearProductCache(): Promise<void> {
  await cacheClearPrefix(PREFIX);
}
