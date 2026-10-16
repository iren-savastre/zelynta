import { cacheGetEntry, cacheSet, cacheClearPrefix, CACHE_SCHEMA_VERSION } from "./cache";

const PREFIX = "zelynta_product_";

// Compozitia unui produs se schimba rar — reformularile sunt anuale, nu zilnice.
// 14 zile tine plafonul de cereri jos si pastreaza datele rezonabil de proaspete.
// A product's composition rarely changes — reformulations happen yearly, not daily.
// 14 days keeps the request volume low while keeping data reasonably fresh.
export const PRODUCT_TTL_MS = 14 * 24 * 60 * 60 * 1000;

// Nu punem in cache pret, stoc sau disponibilitate. Zelynta nu le foloseste
// deloc, iar daca s-ar adauga vreodata, sunt date volatile care nu au ce cauta
// intr-un cache de 14 zile.
// We don't cache price, stock or availability. Zelynta doesn't use them at
// all, and if they were ever added, they're volatile data that has no place
// in a 14-day cache.
export type CachedProduct = {
  barcode: string;
  product: any;
  source: string; // baza din care a venit (_db): food / beauty / products / petfood // the database it came from (_db): food / beauty / products / petfood
  storedAt: number;
  expiresAt: number;
  schemaVersion: number;
};

const keyFor = (barcode: string) => PREFIX + barcode;

/**
 * Citeste un produs din cache.
 * `allowStale: true` returneaza si intrari expirate — pentru cazul „fara
 * internet", unde un produs vechi bate un ecran de eroare.
 *
 * Reads a product from the cache.
 * `allowStale: true` also returns expired entries — for the "no internet"
 * case, where an old product beats an error screen.
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
/** Saves a found product. Products that weren't found are NOT cached. */
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
/** Empties the product cache (used by "delete all data"). */
export async function clearProductCache(): Promise<void> {
  await cacheClearPrefix(PREFIX);
}
