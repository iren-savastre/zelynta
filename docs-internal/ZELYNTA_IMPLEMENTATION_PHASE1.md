# Zelynta — Implementare, Faza 1 (fundație)

> **Document intern.** Stă în `docs-internal/`, nu în `docs/` — acela e rădăcina site-ului public.

**Data:** 12 septembrie 2026
**Domeniu acoperit:** P0.1–P0.3, Fazele 2–7 din planul de implementare.
**Ce NU e acoperit:** Fazele 8–36 (Supabase, comunitate, moderare, catalog propriu) — vezi „Ce am lăsat deoparte, și de ce".

---

## 1. Ce s-a implementat

### P0.2 — Offline ≠ „produsul nu există" *(bug-ul central)*

Asta era problema reală. [utils/apiClient.ts](../utils/apiClient.ts) avea 44 de linii și un singur `catch {}` gol. Orice eroare de rețea era înghițită, funcția returna `null`, iar ecranul afișa „Produsul nu a fost găsit" — **plus** un buton care trimitea utilizatorul să adauge produsul pe Open Food Facts.

Un om fără internet era deci informat că produsul nu există și invitat să-l adauge într-o bază pe care oricum nu o putea accesa.

Acum lookup-ul returnează un rezultat explicit:

```ts
type LookupResult =
  | { ok: true; product: any }
  | { ok: false; kind: "PRODUCT_NOT_FOUND" | "NETWORK_ERROR" | "RATE_LIMITED" | "UPSTREAM_ERROR" };
```

Regula care contează, și care e testată:

> „Produsul nu există" e o afirmație tare. O facem **doar** dacă toate cele 4 baze au răspuns și toate au spus că nu îl au. Dacă măcar una nu a putut fi întrebată, răspunsul e incomplet și raportăm cauza reală.

Ordinea de decizie: toate au răspuns „nu" → `PRODUCT_NOT_FOUND`; altfel 429 undeva → `RATE_LIMITED`; altfel 5xx/JSON invalid → `UPSTREAM_ERROR`; altfel → `NETWORK_ERROR`.

**În interfață** ([app/index.tsx](../app/index.tsx)) comportamentul diferă acum pe tip, nu pe textul erorii (comparația era `error === t("errorNotFound")` — fragilă, se rupea la orice schimbare de traducere):

| Situație | Pictogramă | Explicație | „Citește ingredientele" | „Adaugă pe Open Food Facts" |
|---|---|---|---|---|
| `PRODUCT_NOT_FOUND` | 😕 | „nu e încă în baza de date" | da | **da** |
| `NETWORK_ERROR` | 📡 | „produsul poate exista — nu am putut verifica" | da (OCR merge offline) | **nu** |
| `RATE_LIMITED` | ⏳ | „prea multe căutări, așteaptă puțin" | nu | nu |
| `UPSTREAM_ERROR` | 😕 | „baza de date nu răspunde acum" | nu | nu |

Trei chei noi de traducere (`errorRateLimited`, `errorUpstream`, `offlineHint`) — **în toate cele 11 limbi**.

### P0.1 — Build-ul de producție

`.github/workflows/deploy-pages.yml` se declanșa doar la `docs/**`. O îmbunătățire în `scripts/optimize-assets.js` nu regenera niciodată site-ul publicat. Am adăugat `scripts/**`, `package.json` și `package-lock.json` la declanșatori.

Verificat: `build/CNAME` conține `zelynta.com` după build — domeniul nu se rupe.

### P0.3 — Eliminarea geo-IP

Constatare care nuanțează auditul: în `docs/index.html` apelul **nu** bloca afișarea (se aplica întâi `navigator.language`). Dar în [docs/assets/legal.js](../docs/assets/legal.js) **bloca**: `var LANG = await pickLang();` aștepta până la 1500 ms un răspuns de la `geojs.io` înainte de a randa paginile legale.

Ambele înlocuite cu detecție sincronă pe `navigator.languages` (lista completă, în ordinea preferinței), nu doar `navigator.language`.

Trei câștiguri, nu unul: paginile legale nu mai așteaptă; adresa IP nu mai pleacă la un terț înaintea oricărui consimțământ; și limba respectă preferința declarată a utilizatorului (înainte, un român aflat în Italia primea italiană, peste setarea lui explicită).

### Faza 2 — `PRODUCT_FIELDS`

Lookup-ul cerea produsul întreg. Lista de câmpuri a fost **extrasă din cod**, nu presupusă — inclusiv două care se pierdeau ușor: `product.lang` (folosit la traducerea ingredientelor, [app/index.tsx](../app/index.tsx)) și `packaging_tags` (detecția de ambalaj).

Textul de ingrediente e cerut în **toate cele 11 limbi**: cu `fields=ingredients_text_ro` singur, un utilizator polonez ar fi primit produsul fără compoziție.

### Faza 3 — Motorul de alternative

Aici am găsit un **bug de logică**, nu doar o ineficiență.

`categories_tags` amestecă două feluri de etichete:

```
en:confectionary-based-spreads   <- cheie canonică de taxonomie
en:Pâtes à tartiner              <- același lucru, ca nume afișabil francez
```

Parametrul `categories_tags_en` înțelege doar prima formă. Codul lua ultimele 3 etichete — adică tocmai pe cele afișabile. Măsurat pe Nutella: eticheta franțuzească întorcea **7 produse utilizabile**, cea canonică **30**.

Acum: filtrare la etichete canonice, o singură căutare pe cea mai specifică (a doua doar dacă prima nu dă nimic), `page_size=50` în loc de 100, plus cache de categorii cu TTL de 24 h, separat pe limbă.

### Faza 4 — Cache de produse

[utils/cache.ts](../utils/cache.ts) (TTL generic peste AsyncStorage, cu `schemaVersion` care invalidează automat datele vechi la schimbarea formei) și [utils/productCache.ts](../utils/productCache.ts) cu modelul cerut: `barcode, product, source, storedAt, expiresAt, schemaVersion`. TTL 14 zile.

Nu s-a adăugat MMKV — AsyncStorage era deja în proiect.

Un efect secundar util: dacă nu ai internet, dar produsul e salvat de la o scanare anterioară, **îl primești pe cel vechi** în loc de un ecran de eroare. Un produs expirat bate o eroare. Produsele *negăsite* nu se salvează niciodată, iar cache-ul expirat nu se servește când bazele chiar au răspuns „nu îl am".

### Faza 5 — Race condition la alternative

Produsul avea deja gardă (`fetchSeqRef`). **Alternativele nu aveau.** Efectul rula `getBetterAlternatives(...).then(setAlternatives)` fără curățare: scanezi produsul A, apoi imediat B, iar răspunsul lent al lui A ajungea după ce pe ecran era deja B — și îi afișa alternativele lui A.

Rezolvat prin funcția de curățare a efectului (`cancelled`), care rulează garantat înainte de următoarea execuție.

### Faza 6 — Teste

25 de teste noi (41 → 66 în total), scrise pe comportament, nu pe procent de acoperire.

### Faza 7 — CI/CD

`permissions: contents: read` în `ci.yml`; `dependabot.yml` (npm săptămânal + acțiuni GitHub lunar, cu Expo/React Native excluse fiindcă se actualizează prin `expo install`); `codeql.yml` (analiză la push, PR și săptămânal).

Renovate nu a fost introdus — Dependabot acoperă nevoia.

---

## 2. Fișiere modificate

| Fișier | Ce |
|---|---|
| `utils/apiClient.ts` | Rescris: taxonomie de erori, `PRODUCT_FIELDS`, cache |
| `utils/cache.ts` | **nou** — cache cu TTL peste AsyncStorage |
| `utils/productCache.ts` | **nou** — cache de produse, 14 zile |
| `utils/alternatives.ts` | Etichetă canonică, 1 căutare, `page_size=50`, cache 24 h |
| `app/index.tsx` | `errorKind`, UI diferențiat, race condition la alternative |
| `i18n/translations.ts` | 3 chei noi × 11 limbi |
| `docs/index.html` | geo-IP → `navigator.languages` |
| `docs/assets/legal.js` | idem + eliminarea blocării la randare |
| `scripts/optimize-assets.js` | Exclude `.md` din artifactul public |
| `.github/workflows/deploy-pages.yml` | Declanșatori `scripts/**` |
| `.github/workflows/ci.yml` | `permissions: contents: read` |
| `.github/workflows/codeql.yml` | **nou** |
| `.github/dependabot.yml` | **nou** |
| `.gitignore` | Exclude auditul tehnic și `coverage/` |
| `utils/__tests__/apiClient.test.ts` | **nou** — 17 teste |
| `utils/__tests__/alternatives.test.ts` | **nou** — 11 teste |

---

## 3. Migrări de bază de date

**Niciuna.** Supabase nu a fost atins. Fazele 9–12 (RLS, securitatea inserărilor, ștergere GDPR, întărirea admin) sunt marcate BLOCANTE în plan și rămân nefăcute.

---

## 4. Teste

```
Suite:  7 trecute, 7 total
Teste: 66 trecute, 66 total   (înainte: 41)
Eșuate: 0        Sărite: 0
```

Typecheck: curat. Lint: 0 erori, 3 avertismente — toate preexistente.

---

## 5. Măsurători înainte/după

Lookup de produs, măsurat pe API-ul real Open Food Facts, 12 sept. 2026:

| Produs | Înainte | După | Reducere | Latență |
|---|---|---|---|---|
| Nutella | 148 KB | 6,7 KB | −95% | 278 ms → 48 ms |
| Coca-Cola | 180 KB | 5,0 KB | −97% | 88 ms → 47 ms |
| Kinder Bueno | 94 KB | 10,3 KB | −89% | 72 ms → 45 ms |
| **Medie** | **141 KB** | **7,3 KB** | **−95%** | 146 ms → 47 ms |

Alternative, per produs scanat:

| | Înainte | După |
|---|---|---|
| Cereri | până la 3 | **1** (2 doar dacă prima e goală) |
| `page_size` | 100 | 50 |
| Trafic (Kinder Bueno) | 258 KB | 163 KB |
| Produse utilizabile (Nutella) | 7 | **30** |
| A doua scanare din aceeași categorie | cerere nouă | **0 cereri** (cache 24 h) |

A doua scanare a aceluiași produs: **0 cereri** (cache 14 zile).

Build site: 832,7 KB → 747,5 KB HTML (−10%), neschimbat față de înainte — nu a fost atins.

---

## 6. Limitări cunoscute

Fără cosmetizare:

1. **Tabelul de cookie-uri încă declară `geojs.io` ca terț.** Apelul nu mai există, dar `docs/legal/cookies.html` și `docs/assets/legal-i18n.js` îl listează. Nu le-am modificat: sunt text legal în 11 limbi, iar `legal-i18n.js` avea modificări în lucru necomise. **De corectat înainte de următorul deploy** — politica descrie un transfer de date care nu mai are loc.
2. **Nu s-a testat pe dispozitiv fizic.** Verificat prin teste unitare, typecheck, lint și build. Fazele 33–35 (scanare reală, Android mic/mare, rețea lentă) **nu au fost executate**.
3. **Nicio măsurătoare Lighthouse.** Faza 7 cere Lighthouse CI; nu a fost configurat.
4. **Sentry / observabilitate (Faza 8): nefăcut.** Nu există taxonomie de erori raportată extern. Cea internă (`LookupErrorKind`) e baza pe care se poate construi.
5. **`page_size=50` e o alegere bazată pe 2 produse.** Datele arată 47 utilizabile la 50, dar filtrul de scor (≥66 și mai bun decât cel scanat) nu a fost măsurat separat. Dacă apar categorii cu prea puține alternative, asta e prima valoare de ajustat.
6. **Endpoint-ul de căutare OFF e instabil.** În timpul măsurătorilor a returnat 503 foarte des. Codul degradează elegant (listă goală), dar înseamnă că alternativele lipsesc uneori din motive care nu țin de Zelynta.
7. **Cache-ul nu are limită de dimensiune.** 14 zile × produse scanate. Pentru un utilizator obișnuit e neglijabil, dar nu există curățare automată în afara expirării.

---

## 7. Ce am lăsat deoparte, și de ce

**Fazele 9–12 (Supabase)** sunt marcate BLOCANTE în planul propriu: „NU activa community features înainte de finalizare". Activarea atinge producția și nu e reversibilă printr-un simplu `git revert`. **Decizie pentru proprietar, nu pentru mine în absența lui.**

**Fazele 13–29 (catalog propriu, contribuții, moderare, tipuri de produs, atribute dinamice, căutare)** — aici e o **contradicție reală între cele două documente**, care merită semnalată, nu ascunsă:

Planul de implementare cere construirea unui catalog propriu (`products`, `product_variants`, `product_identifiers`, `brands`, `product_revisions`…). Cercetarea de ecosistem, finalizată înainte, **recomandă explicit contrariul**: Zelynta nu ar trebui să dețină date de produs, ci să devină cel mai bun client de contribuție pentru Open Food Facts — unde moderarea, versionarea, rollback-ul și anti-spam-ul există deja de ani buni.

A construi entitățile din Fazele 13–29 ar însemna a implementa exact ce cercetarea a respins cu argumente măsurate. Am oprit înainte, fiindcă e o decizie de direcție, nu una de execuție.

---

## 8. Următorii pași recomandați

1. Corectează tabelul de cookie-uri (limitarea #1) — mic, dar e o inexactitate într-o politică de confidențialitate.
2. Testează pe telefon: scanare, offline (mod avion), produs inexistent, cosmetice, hrană animale.
3. Decide direcția: catalog propriu **sau** contribuție către Open Food Facts. Restul depinde de asta.
4. Dacă alegi contribuția: cont global de aplicație OFF + `app_uuid`, cu parola într-un Edge Function — nu în client (`EXPO_PUBLIC_*` ajunge în bundle).
5. Sentry (Faza 8), peste taxonomia de erori care există acum.
6. Lighthouse CI.
7. Supabase: audit RLS înainte de orice activare.
8. Alertă de rechemare RASFF — API și licență confirmate (CC-BY 4.0), funcție pe care Yuka nu o are.
