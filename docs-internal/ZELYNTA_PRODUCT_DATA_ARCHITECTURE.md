# Zelynta — Arhitectura datelor de produs

> **Document intern de proiectare.** Complementar cu `ZELYNTA_PRODUCT_ECOSYSTEM_RESEARCH.md` și `ZELYNTA_COMMUNITY_ARCHITECTURE.md`.

**Data:** 4 septembrie 2026

---

## 0. Entitățile cerute vs. entitățile reale

Cererea (secțiunea 54) enumeră 18 entități: `Product`, `ProductVariant`, `ProductType`, `Category`, `Brand`, `Specification`, `AttributeDefinition`, `ProductIdentifier`, `ProductImage`, `ProductOffer`, `Merchant`, `Review`, `Contribution`, `ProductRevision`, `ProductSource`, `Collection`, `User`.

Iată unde se află fiecare, în realitate:

| Entitate cerută | Unde trăiește | Zelynta o definește? |
|---|---|---|
| `Product` | Open Food Facts | **Nu** — o citește |
| `ProductVariant` | — | **Nu există.** La alimente/cosmetice, fiecare variantă are propriul EAN și *este* un produs |
| `ProductType`, `Category` | Taxonomia OFF (`categories_tags`) | **Nu** — o consumă |
| `Brand` | Câmpul `brands` de la OFF | **Nu** — text liber, nu entitate |
| `Specification`, `AttributeDefinition` | `nutriments`, `additives_tags` la OFF | **Nu** |
| `ProductIdentifier` | Codul de bare (EAN/GTIN) — cheie primară globală | **Nu** — e chiar identificatorul |
| `ProductImage` | `image_url` la OFF | **Nu** |
| `ProductOffer`, `Merchant` | — | **Nu se construiesc** (conflict de interese) |
| `Review` | — | **Nu se construiește** (vezi arhitectura comunitară, secț. 5) |
| `ProductRevision` | Istoricul de versiuni OFF | **Nu** — există deja acolo |
| `Contribution` | **Zelynta, local** | **Da** |
| `ProductSource` | **Zelynta** — care din cele 4 baze | **Da** (parțial: există `_db`) |
| `Collection` | **Zelynta, local** | **Da** |
| `User` | — | **Nu.** Doar un `app_uuid` pseudonim |

**Trei entități din optsprezece.** Nu e o lipsă — e consecința faptului că Zelynta interpretează date, nu le deține.

---

## 1. Modelul actual, exact

```
┌─────────────────────────────────────────────────────────┐
│  OPEN *FACTS  (sursa adevărului, ODbL)                  │
│  4.727.095 alimente · 74.460 cosmetice                  │
│  45.152 generale  · 15.118 hrană animale                │
│  Cheie: codul de bare (EAN/GTIN)                        │
└───────────────────────┬─────────────────────────────────┘
                        │ citire live, per scanare
                        ▼
┌─────────────────────────────────────────────────────────┐
│  ZELYNTA — strat de interpretare (în memorie, efemer)   │
│                                                         │
│  analyzeProduct(product, lang) →                        │
│     score       0-100, determinist                      │
│     reasons[]   de ce, pe componente                    │
│     additives[] din dicționarul propriu, 11 limbi       │
│     cosmetics[] substanțe INCI de urmărit               │
│                                                         │
│  ACESTA e activul propriu. Nu produsul — judecata.      │
└───────────────────────┬─────────────────────────────────┘
                        │ se păstrează doar 6 câmpuri
                        ▼
┌─────────────────────────────────────────────────────────┐
│  DISPOZITIV (AsyncStorage)                              │
│  HistoryItem { barcode, name, brand, imageUrl,          │
│                score, scannedAt }                       │
│  history (max 100) · favorites · basket                 │
└─────────────────────────────────────────────────────────┘
```

Observația importantă: **produsul nu se persistă niciodată integral.** Se descarcă, se interpretează, se afișează, se aruncă — se păstrează doar rezumatul de 6 câmpuri. De aceea nu există un model de date de produs: n-a fost nevoie.

---

## 2. Modelul propus

O singură schimbare structurală: **un cache de produse pe dispozitiv**, între OFF și interpretare.

```
OPEN *FACTS
     │
     ▼
┌──────────────────────────────────────────────────────┐
│  CACHE DE PRODUSE (nou — AsyncStorage)               │
│  cheie: `p:<db>:<barcode>`                           │
│  valoare: { fields..., _db, _fetchedAt, _ttl }       │
│  plafon: ~300 intrări, evacuare LRU                  │
└───────────────────┬──────────────────────────────────┘
                    ▼
        strat de interpretare (neschimbat)
                    ▼
        istoric / favorite / coș (neschimbat)
```

De ce merită, cu cifre din auditul tehnic:
- Ridică plafonul de **3,3 scanări/minut/IP** — cauza 503-urilor reale observate.
- Face posibilă **funcționarea offline** pentru produse deja scanate: azi imposibilă.
- Economisește **141 KB per rescanare** (măsurat: 146,2 KB vs 5,3 KB cu `fields=`).

**TTL diferențiat, pentru că datele îmbătrânesc diferit:**

| Tip | TTL | Motiv |
|---|---|---|
| Produs găsit, cu ingrediente | 30 zile | Compoziția se schimbă rar |
| Produs găsit, fără ingrediente | 3 zile | Comunitatea le completează des |
| Produs negăsit | **1 oră** | Cineva tocmai l-ar putea adăuga — poate chiar utilizatorul |

Ultimul rând contează: dacă tocmai ai contribuit cu un produs, un TTL lung ți-ar ascunde propria contribuție.

---

## 3. Entitățile pe care Zelynta le deține

### 3.1 `ProductSource` — proveniență (secțiunea 28 din cerere)

Există parțial: `apiClient.ts` marchează deja `_db` cu `food`/`beauty`/`products`/`petfood`, iar `score.ts:287` îl folosește ca să știe că un produs din Open Beauty Facts e cosmetic.

De extins la o proveniență completă, afișabilă:

```ts
type ProductSource = {
  db: "food" | "beauty" | "products" | "petfood";
  fetchedAt: number;
  lastModifiedOff?: number;   // last_modified_t de la OFF
  completeness?: number;      // completeness, 0..1, oferit de OFF
  contributedByThisUser?: boolean;
};
```

Cererea vrea proveniență per câmp (*„Screen size: 6.7\" — SOURCE: manufacturer.com"*). Nerecomandat: OFF nu expune sursa per câmp în API, deci ar fi o invenție. Proveniența la nivel de produs e onestă și verificabilă:

> *„Date din Open Beauty Facts, actualizate ultima dată acum 4 luni. Completitudine 62%."*

Asta e mai valoros decât pare: îi spune utilizatorului **cât de mult să se încreadă** în scor. Un produs cu 30% completitudine merită un scor prezentat cu rezervă.

### 3.2 `Contribution` — local

```ts
type Contribution = {
  barcode: string;
  sentAt: number;
  status: "queued" | "sent" | "confirmed" | "failed";
  fields: ("front_photo" | "ingredients_photo" | "name" | "brand" | "category")[];
  attempts: number;
};
```

Stocat local, plafonat, șters de `clearAllData()` împreună cu restul.

### 3.3 `Collection` — local

```ts
type Collection = { id: string; name: string; items: string[]; createdAt: number };
```

`items` sunt coduri de bare, nu obiecte — datele rămân în cache. Fără publicare, fără urmăritori.

---

## 4. Product graph (secțiunea 14)

Relațiile cerute (`HAS_VARIANT`, `COMPATIBLE_WITH`, `ACCESSORY_FOR`, `REPLACED_BY`, `SOLD_BY`) vin din electronice. În domeniul alimente/cosmetice:

| Relație | Aplicabilă? |
|---|---|
| `MADE_BY → BRAND` | Da, dar e un câmp text la OFF, nu o relație |
| `BELONGS_TO → CATEGORY` | Da — `categories_tags`, deja folosit |
| `SIMILAR_TO` / `ALTERNATIVE_TO` | **Da — singura reală.** Calculată dinamic în `alternatives.ts` |
| `HAS_VARIANT` | Nu — fiecare variantă are EAN propriu |
| `COMPATIBLE_WITH`, `ACCESSORY_FOR` | Nu — fără sens la iaurt |
| `REPLACED_BY` | Marginal (produs reformulat) — OFF nu îl expune |
| `SOLD_BY → MERCHANT` | Nu — fără comercianți în model |

Rămâne **o** relație reală, calculată la cerere din categorie + scor. Nu e un graf; e o interogare.

**Neo4j sau orice bază de date graf: nu.** Cererea însăși avertizează să nu se introducă fără justificare — iar aici justificarea lipsește complet. Nu există relații persistate de traversat.

---

## 5. Prospețimea datelor (secțiunea 29)

Stările cerute (`ACTIVE` / `DISCONTINUED` / `LEGACY` / `UNKNOWN`) presupun că urmărești ciclul de viață al produsului. Zelynta nu poate ști dacă un produs a fost retras — OFF nu expune asta fiabil.

Ce **poate** fi spus onest, din date reale:

```
Date verificate recent      last_modified_t < 6 luni
Date vechi                  last_modified_t > 24 luni  → afișează avertisment
Date incomplete             completeness < 0,5         → scor prezentat cu rezervă
Necunoscut                  câmpul lipsește
```

Toate derivă din câmpuri pe care OFF le oferă deja. Nu inventa un ciclu de viață pe care nu îl poți observa.

---

## 6. Arhitectura de conectori (secțiunea 35)

Cererea vrea `connectors/amazon/`, `connectors/ebay/` etc., cu o interfață comună. Direcția e sănătoasă, ținta e greșită — nu vor exista conectori Amazon.

Dar există deja o formă embrionară corectă: `DATABASES` din [utils/apiClient.ts:5](../utils/apiClient.ts) e un tablou de surse parcurse uniform. Adăugarea Open Pet Food Facts a fost **o linie** — asta e dovada că abstractizarea funcționează.

Extinderea rezonabilă, dacă apar surse cu formă diferită (CosIng, RASFF):

```ts
interface ProductSourceAdapter {
  id: string;
  fetchByBarcode(code: string): Promise<RawProduct | null>;
  normalize(raw: RawProduct): NormalizedProduct;
  canWrite: boolean;
  submit?(contribution: Contribution): Promise<SubmitResult>;
}
```

**Dar nu o construi acum.** Cele 4 surse au forme identice; o abstractizare pentru un singur format e complexitate pură. Introdu-o când apare a doua formă reală de date — nu înainte.

---

## 7. Prioritatea surselor (secțiunea 36)

Cererea propune 6 niveluri, cu `AI inference` ultimul. Pentru Zelynta se simplifică drastic, pentru că nu combini surse concurente pe același câmp:

```
1. Datele din Open *Facts, așa cum vin        (singura sursă de date de produs)
2. Interpretarea Zelynta                       (scor, aditivi, organe — deterministă)
3. OCR de pe dispozitiv                        (doar când produsul lipsește)
4. AI                                          (doar propunere, doar cu confirmarea utilizatorului)
```

**Regula fermă:** AI-ul nu suprascrie niciodată date oficiale și nu scrie niciodată direct în OFF. Poate doar *propune* un text pe care utilizatorul îl confirmă. Un OCR sau un model care contribuie autonom la baza comună e un mod de eșec pe care nu-l poți repara după.

---

## 8. Sistemul de evenimente (secțiunea 49)

Evenimentele cerute (`product.created`, `product.price_changed`, `product.flagged`…) presupun că deții produsele. Nu le deții.

Ce e util local, ca declanșatoare simple în cod — nu un event bus:

```
scan.success        → istoric, cache
scan.not_found      → propune contribuția
contribution.sent   → coadă, ecranul „Contribuțiile mele"
contribution.failed → reîncercare
cache.stale         → reîmprospătare în fundal
```

Cinci evenimente locale, tratate cu funcții obișnuite. Un sistem de evenimente propriu-zis (cozi, abonați, livrare garantată) ar fi infrastructură pentru cinci apeluri directe.

---

## 9. Catalog global (secțiunea 30)

Deja rezolvat, în mare parte de OFF: produsul e o entitate globală identificată prin EAN, cu `product_name_<lang>` și `ingredients_text_<lang>` per limbă. Zelynta le folosește deja, cu fallback pe engleză.

**Golul real, măsurat:**

| Dicționar | Stare |
|---|---|
| `additivesInfo` (89 aditivi) | **267/267 câmpuri complete în 11 limbi** ✓ |
| `cosmeticsInfo` (30 substanțe) | **90/90 câmpuri lipsă pe bg și el** |
| `UNKNOWN_ADDITIVE_DESC` | 9 limbi |
| `autoLabels` | 9 limbi |
| `ING_KEYWORDS` (OCR) | **9 limbi — consecință funcțională** |

Ultimul nu e cosmetic: OCR-ul nu recunoaște „съставки:" (bulgară) sau „συστατικά:" (greacă), deci extragerea listei de ingrediente **eșuează** pe etichete din acele limbi. Două limbi din unsprezece sunt, în această privință, de fațadă.

**Unități:** nutrienții vin de la OFF normalizați pe 100 g/ml — deja consecvent. Nu e nevoie de conversie metric/imperial pentru piețele europene țintite.
**Monedă:** nu se aplică. Nu există prețuri, și nici nu ar trebui.

---

## 10. Migrare

Zero migrări de bază de date, pentru că nu există date de produs de migrat. Totul e aditiv:

| Pas | Ce se schimbă | Risc |
|---|---|---|
| 1 | `&fields=` în `apiClient.ts` | Mic — verifică să incluzi tot ce folosește `score.ts` |
| 2 | Cache de produse cu TTL | Mic — pur aditiv, cu evacuare LRU |
| 3 | `ProductSource` extins + afișare proveniență | Foarte mic |
| 4 | `app_uuid` generat local | Foarte mic |
| 5 | Edge Function pentru contribuție | Mediu — **cere remedierile B-3 din auditul de securitate întâi** |
| 6 | Coadă de contribuții + ecranul „Contribuțiile mele" | Mic |

Pasul 5 e singurul care activează backendul, și doar pentru a proteja o parolă. Nu pentru date.

---

## 11. Ce se păstrează neschimbat

Merită afirmat explicit, pentru că e cea mai bună parte a arhitecturii actuale:

- **Produsul nu se persistă la niciun server al Zelynta.** Nici după contribuție — aceea merge direct la OFF.
- **Fără conturi.** `app_uuid` e pseudonim, generat local, șters cu datele aplicației.
- **Scorul rămâne determinist.** Aceeași intrare, același rezultat, cu motive explicabile. Un model probabilistic ar fi mai „inteligent" și mai puțin credibil — iar credibilitatea e produsul.
- **Datele utilizatorului rămân pe dispozitiv.** Istoric, favorite, coș, colecții, contribuții — toate locale.

Aceste patru proprietăți fac politica de confidențialitate adevărată prin construcție, nu prin promisiune. Orice propunere viitoare care le încalcă ar trebui să suporte o justificare pe măsură.
