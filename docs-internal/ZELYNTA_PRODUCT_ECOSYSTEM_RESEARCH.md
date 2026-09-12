# Zelynta — Cercetare ecosistem de produse

> **Document intern de strategie.** Mutat din `docs/` în `docs-internal/` pe 12 sept. 2026 — `docs/` e rădăcina site-ului public, deci orice fișier de acolo se servește la `zelynta.com/<nume>`. Build-ul exclude acum `.md` explicit, ca plasă de siguranță.

**Data:** 4 septembrie 2026 · **Actualizat:** 12 septembrie 2026 (secțiunea 7 — servere MCP; verificarea CosIng și RASFF din secțiunea 6)
**Metodă:** inspecție de cod + măsurători live pe API-urile Open Food Facts + verificare a documentației oficiale + sondare directă a endpoint-urilor.

---

## 0. Premisa cererii, corectată

Șablonul acestui audit descrie un marketplace de bunuri de larg consum: SKU-uri, variante de culoare și capacitate, comercianți, oferte, prețuri, linkuri de afiliere, plasamente sponsorizate, portal pentru vânzători. Exemplul dat era „Samsung Galaxy S26, 256GB Black".

**Zelynta nu e asta și nu ar trebui să devină asta.** Două motive, primul factual, al doilea strategic.

**Factual:** nu există nicio entitate de produs în sistem. Am verificat schema Supabase — **0 potriviri** pentru `product|price|merchant|offer|sku|variant|brand|affiliate|seller|stock|currency`. Cele 11 tabele sunt: `profiles`, `reviews` (testimoniale despre aplicație, nu despre produse), `comments`, `support_tickets`, `problem_reports`, `privacy_requests`, `analytics_events`, `audit_logs`, `settings`, `landing_content`, `legal_pages`.

Întregul „model de produs" al Zelynta e acesta, în [utils/history.ts:6](../utils/history.ts):

```ts
export type HistoryItem = {
  barcode: string; name: string; brand: string;
  imageUrl: string; score: number; scannedAt: number;
};
```

Șase câmpuri, stocate local pe telefon. `FavoriteItem` și `BasketItem` sunt alias-uri ale aceluiași tip. Nu există taxonomie, nu există atribute, nu există variante — pentru că Zelynta nu deține date de produs. Le citește din Open Food Facts la fiecare scanare și le aruncă.

**Strategic — și asta contează mai mult:** valoarea Zelynta e că **nu are interes comercial** în ce cumperi. În momentul în care aplicația câștigă bani când cumperi un produs, scorul pe care îl dă acelui produs nu mai e credibil. Un scor de 32/100 lângă un buton de afiliere e o contradicție pe care utilizatorul o simte imediat. Secțiunile 13, 37 și 38 din cerere (oferte, afiliere, plasamente sponsorizate, portal pentru comercianți) ar distruge exact activul pe care se sprijină restul produsului.

Deci nu voi proiecta un marketplace. Voi răspunde la întrebarea reală din spatele cererii — *cum ajunge Zelynta să acopere mult mai multe produse, cu date mai bune, cu ajutorul comunității* — pe drumul care se potrivește produsului.

---

## 1. Ce e „produs" în Zelynta acum

| Aspect | Realitate |
|---|---|
| Sursă | 4 baze publice, interogate live la fiecare scanare |
| Stocare proprie | Niciuna. Doar 6 câmpuri, local, pentru istoric/favorite/coș |
| Taxonomie | Împrumutată din `categories_tags` de la OFF; Zelynta nu o definește |
| Identificator | Codul de bare (EAN/GTIN). Produsele scanate din poză primesc coduri interne sintetice |
| Atribute folosite | `additives_tags`, `nutriments`, `ingredients_text_*`, `categories_tags`, `image_url`, `brands`, `nutriscore_grade`, `nova_group` |
| Variante | Inexistente — nici nu sunt relevante pentru alimente/cosmetice |
| Preț, stoc, comerciant | Inexistente, deliberat |
| Recenzii de produs | Inexistente. Tabelul `reviews` conține testimoniale despre aplicație |

**Deduplicarea există deja, unde contează.** [utils/history.ts:19](../utils/history.ts) tratează două intrări ca același produs dacă au același cod de bare **sau** același nume+marcă — exact pentru că scanările din poză primesc coduri sintetice. E o soluție simplă și corectă pentru problema reală.

---

## 2. Acoperirea reală a catalogului (măsurat, 3-4 sept. 2026)

| Bază | Produse total | Produse pentru România |
|---|---|---|
| Open Food Facts | **4.727.095** | nemăsurat (API blocat de rate-limit) |
| Open Beauty Facts | **74.460** | **674** |
| Open Products Facts | **45.152** | **396** |
| Open Pet Food Facts | **15.118** | **163** |

Zelynta interoghează deci un catalog de ~4,86 milioane de produse. Nu are o problemă de *volum global*.

**Are o problemă de acoperire locală, și e severă.** Pentru România: 674 de cosmetice, 396 de produse generale, 163 de hrană pentru animale. **1.233 de produse non-alimentare pentru toată țara.**

Asta răspunde direct la întrebarea cu care a început această colaborare — *„câteodată când scanez un produs îmi arată, altele nu, însă pe Yuka arată"*. Nu e un defect al aplicației. E golul din baza de date comună, pe piața pe care o servești. Yuka are mai multe produse pentru că are 10+ ani de contribuții și zeci de milioane de utilizatori care le adaugă din aplicația lor.

**Concluzia care schimbă strategia:** creșterea catalogului nu înseamnă găsirea unor baze de date noi. Înseamnă transformarea fiecărei scanări eșuate într-o contribuție.

---

## 3. Descoperirea centrală: OFF suportă oficial contribuția prin aplicație

Aceasta e cea mai importantă constatare din tot documentul, și nu e un artificiu — e o cale sancționată explicit de Open Food Facts.

**API-ul de scriere:**
```
POST https://world.openfoodfacts.org/cgi/product_jqm2.pl
  code=<cod de bare>          (obligatoriu)
  user_id=<utilizator>        (obligatoriu — NU adresa de e-mail)
  password=<parolă>           (obligatoriu)
  app_name=Zelynta
  app_version=<versiune>
  app_uuid=<uuid aleator, sărat, per utilizator>
  + orice câmp de produs (product_name, categories, ingredients_text_ro, ...)
```

**Încărcarea de poze:**
```
POST https://world.openfoodfacts.org/cgi/product_image_upload.pl
  code=<cod de bare>
  imagefield=front | ingredients | nutrition | packaging | other   (+ sufix de limbă: ingredients_ro)
  imgupload_<imagefield>=<binar>     ex. imgupload_ingredients_ro
  user_id, password
  Minim 640 × 160 px
```

**Server de test:** `world.openfoodfacts.net` (`.net`, nu `.org`). Bazele de conturi sunt separate — îți trebuie cont și acolo.

**Partea decisivă**, din documentația oficială OFF: poți crea **un cont global de aplicație** care permite utilizatorilor tăi să contribuie **fără să-și facă fiecare cont pe Open Food Facts**. Iar `app_uuid` e un *UUID aleator sărat per utilizator*, astfel încât moderatorii OFF să poată bloca selectiv un utilizator problematic **fără să blocheze tot contul aplicației**.

Ce înseamnă asta pentru Zelynta, concret:
- Nu trebuie să construiești conturi, login, sesiuni, resetare de parolă — adică exact lucrurile pe care le-ai evitat deliberat și care îți țin auditul de securitate curat.
- `app_uuid` sărat e **pseudonim**, deci compatibil cu poziția ta de confidențialitate: nu identifică persoana, dar permite moderarea.
- Moderarea, versionarea, istoricul modificărilor și rollback-ul (secțiunile 12, 31 din cerere) **există deja la OFF**. Nu le construiești; te conectezi la ele.

Aplicația are deja tot ce trebuie: cameră ([app/index.tsx](../app/index.tsx)), OCR pe dispozitiv ([utils/ocr.ts:24](../utils/ocr.ts)), cod de bare, și chiar butonul „Adaugă produsul pe Open Food Facts" la [app/index.tsx:1259](../app/index.tsx) — care momentan doar deschide un browser.

**Distanța dintre ce ai și ce ți-ar trebui e mică. Asta e oportunitatea numărul unu din tot documentul.**

---

## 4. Care e, de fapt, activul diferențiat al Zelynta

Merită spus clar, pentru că determină unde ar trebui să investești.

**Nu catalogul de produse.** Acela e un bun comun (OFF, ODbL), pe care îl folosesc și Yuka, și alte zeci de aplicații. Nu poți construi un avantaj acolo, și nici nu ar trebui să încerci.

**Baza de cunoștințe despre ingrediente, în 11 limbi.** Asta ai construit tu:
- 89 de aditivi × nume + categorie + descriere × **11 limbi** = 267 de câmpuri, complete (verificat prin măsurare)
- 30 de substanțe cosmetice (INCI) — complete pe 9 limbi, lipsă pe bg/el
- 53 de „povești" explicative pentru aditivi, în 11 limbi
- Maparea aditiv → organ afectat ([utils/bodyMap.ts](../utils/bodyMap.ts))
- Metodologia de scor, deterministă și explicabilă, cu surse EFSA/IARC citate

Nimeni nu are asta în română, bulgară și greacă. Un utilizator grec care scanează un produs și citește *de ce* E102 e problematic, în greacă, cu sursă — asta e ceva ce Yuka nu îi oferă.

**Recomandarea de investiție:** extinde baza de aditivi și cosmetice, nu catalogul de produse. Sunt ~350 de aditivi E autorizați în UE; ai 89. Sunt mii de ingrediente INCI; ai 30. Acolo e adâncimea care te diferențiază, și e conținut pe care îl deții.

---

## 5. Taxonomie

Nu construi una. Serios.

OFF are deja o taxonomie de categorii multilingvă, întreținută de comunitate, cu mii de intrări și traduceri în zeci de limbi. Zelynta o consumă prin `categories_tags` (formatul `en:chocolate-spreads`). O taxonomie proprie ar însemna:
- o hartă de menținut între taxonomia ta și a lor, care se strică la fiecare actualizare de partea lor;
- traduceri de întreținut în 11 limbi;
- zero beneficiu pentru utilizator.

**Ce merită, în schimb:** un strat subțire de *grupare pentru afișare* — 8-12 grupe mari (Lactate, Băuturi, Snacks, Îngrijire personală, Curățenie, Hrană animale…) mapate peste `categories_tags`, folosit doar pentru filtrarea istoricului și pentru pagini SEO. E o constantă în cod, nu o entitate în bază de date.

Ierarhia din cerere (`CATEGORY → SUBCATEGORY → PRODUCT TYPE → PRODUCT → VARIANT`) nu se aplică: la alimente și cosmetice nu există variante în sensul din electronice. „Iaurt 3,5% 400g" și „Iaurt 3,5% 800g" au coduri de bare diferite și *sunt* produse diferite, cu profiluri nutriționale identice. Codul de bare e cheia primară naturală, globală și deja existentă.

---

## 6. Surse externe de date — evaluate pentru domeniul real

| Sursă | Acoperire | API | Licență | Valoare pentru Zelynta | Verdict |
|---|---|---|---|---|---|
| **Open Food Facts** | 4,73 M produse | REST v2, gratuit | ODbL | Deja integrată. **Aici e creșterea** | **A — extinde prin contribuție** |
| **Open Beauty Facts** | 74.460 | idem | ODbL | Integrată; RO f. slab acoperit (674) | **A — țintă de contribuție** |
| **Open Products Facts** | 45.152 | idem | ODbL | Integrată | **A** |
| **Open Pet Food Facts** | 15.118 | idem | ODbL | Integrată 30 aug 2026 | **A** |
| **Exporturile OFF** (JSONL/Parquet/CSV) | tot catalogul, ~0,9 GB comprimat | descărcare nocturnă | ODbL | **Soluția la limita de rată** — vezi auditul tehnic | **A — la scară ×100** |
| **Open Prices** (proiect OFF) | prețuri contribuite | REST | ODbL | Transparență de preț fără afiliere. De evaluat separat | **B — de investigat** |
| **CosIng** (Comisia Europeană) | ~24.000 ingrediente cosmetice | **niciun API public** (verificat 12 sept. 2026) | „valoare informativă, fără valoare juridică" | Ar extinde baza INCI (ai 30), dar doar prin extragere manuală | **C — retrogradat din B** |
| **EFSA — evaluări aditivi** | evaluări oficiale | open data | Date publice UE | Sursă citabilă pentru descrieri | **B** |
| **USDA FoodData Central** | ~1,9 M alimente (SUA) | REST, cheie gratuită | Domeniu public | Suprapunere mică cu piața ta europeană | **C** |
| **RASFF** (alerte siguranță UE) | ~31.000 notificări publice | **API JSON public + export CSV** (confirmat 12 sept. 2026) | **CC-BY 4.0** | **Funcție nouă reală:** alertă de rechemare la scanare | **A− — promovat din B** |
| Amazon / eBay / feed-uri comercianți | — | — | comercial | **Contrazice modelul de independență** | **D — respinge** |

**Verificare completată 12 septembrie 2026.** Cele două surse marcate anterior „B — de verificat" au fost testate direct. Rezultatele diverg:

**RASFF — confirmat, mai bun decât se estima.** Portalul EU Open Data listează notificările sub **CC-BY 4.0**, cu API JSON public și export CSV (plus XLSX pentru arhiva de dinainte de 2021), ~31.000 de notificări publice. Licența permite explicit uz comercial cu atribuire. Asta face fezabilă o funcție pe care nicio aplicație concurentă din zonă nu o are: **la scanarea unui produs, avertizare dacă există o rechemare activă.** Promovat la **A−**; nu A, fiindcă rămâne de măsurat câte notificări conțin efectiv un cod de bare exploatabil — multe identifică lotul, nu EAN-ul.

**CosIng — infirmat.** Nu există API public. Pagina oficială a Comisiei nu oferă niciun export (CSV/XML/JSON) și precizează că baza are „valoare informativă, fără valoare juridică". Am sondat direct aplicația (`/api/ingredients`, `/api/ingredients/export`, `/rest/ingredients`, `/api/download/ingredients`): **toate returnează HTML**, adică ruta-șablon a unei aplicații SPA — semnătura clară a absenței unui API. Singura cale ar fi un proiect terț (`biobricks-ai/cosing-kg`, ~24.000 de ingrediente) care nu își documentează sursa. Retrogradat la **C**: valoarea rămâne reală, dar costul e extragere manuală unică, nu integrare.

---
## 7. Servere MCP (secțiunea 6 din cerere)

**Cercetare completată 12 septembrie 2026.** Secțiunea rămăsese deschisă în versiunea din 4 septembrie, când agenții de cercetare au căzut din cauza limitei de sesiune.

**Distincția care decide totul:** un server MCP e o unealtă pentru *agentul de dezvoltare*, nu o dependență a aplicației. Zelynta apelează deja direct API-ul REST Open Food Facts din [utils/apiClient.ts](../utils/apiClient.ts). Un MCP peste exact același API public nu adaugă nimic în producție — ar introduce un intermediar în plus, cu o dependență în plus de întreținut.

**Nu există un server MCP oficial Open Food Facts.** Organizația `openfoodfacts` de pe GitHub nu publică niciunul (verificat: `openfoodfacts/openfoodfacts-mcp` → 404).

Opțiunile comunitare, măsurate pe 12 septembrie 2026:

| Server | Stele | Ultima activitate | Licență | Verdict |
|---|---|---|---|---|
| `cyanheads/openfoodfacts-mcp-server` — singurul din registrul oficial MCP | 1 | 25 aug. 2026 | Apache-2.0 | **C** — singurul licențiat corect *și* activ |
| `JagjeevanAK/OpenFoodFacts-MCP` | 18 | 3 feb. 2026 | **niciuna** | **D** — fără licență = toate drepturile rezervate |
| `nagarjun226/food-tracker-mcp` | 6 | 30 mar. 2025 | niciuna | **D** — abandonat |
| `caleb-conner/open-food-facts-mcp` | 1 | 7 aug. 2025 | MIT | **D** — abandonat |
| `saiprasadthalluri/openfoods_mcp` | 0 | 10 dec. 2025 | niciuna | **D** |
| Cele 3 variante Apify („scraper" OFF) | — | serviciu comercial | abonament plătit | **D** — scraping cu plată peste un API public gratuit |

Merită observată ironia: cel mai popular (18 stele) e singurul complet inutilizabil legal — fără fișier de licență, codul rămâne „toate drepturile rezervate", indiferent că e public pe GitHub.

**Recomandare: niciunul.** MCP-urile utile pentru Zelynta rămân cele de *dezvoltare*, deja confirmate în auditul tehnic — Expo, GitHub, Supabase (strict read-only), Playwright / Chrome DevTools. Nu există un MCP de catalog care să merite adăugat, iar dacă ar exista, nu ar avea ce căuta în aplicație: codul de bare interogat direct e deja calea cea mai scurtă.

---


## 8. PIM (Pimcore / Akeneo / Directus / Strapi / Medusa / Saleor)

**Niciunul.** Un PIM gestionează un catalog pe care îl *deții*. Zelynta nu deține niciun produs — și, dacă urmează recomandarea din secțiunea 3, nu va deține. Ar fi infrastructură de întreținut pentru zero date proprii.

Singurul conținut care ar beneficia de o interfață de editare e baza de aditivi/cosmetice — dar aceea are 89 + 30 de intrări, trăiește în TypeScript, e versionată în git și se editează perfect într-un editor de cod. Un PIM pentru 119 intrări e overengineering clar.

---

## 9. Căutare semantică și recomandări

Cererea (secțiunea 18) dă exemplul *„telefon bun pentru poze sub 600€"*. Zelynta nu are prețuri, nu are telefoane și nu are un catalog local de căutat. Întrebarea nu se pune în forma asta.

Ce **există** e funcția de alternative ([utils/alternatives.ts](../utils/alternatives.ts)), care e deja o formă de recomandare: caută produse din aceeași categorie, calculează scorul fiecăruia, păstrează doar pe cele verzi (≥66) și mai bune decât cel scanat. E deterministă și explicabilă — ceea ce e **corect** pentru un produs de sănătate.

Din auditul tehnic anterior: e și cel mai mare cost de rețea din aplicație (3 căutări × 1.734 ms × 243,5 KB) și cauza principală a limitei de 3,3 scanări/minut. **Prioritatea aici e reparația, nu îmbogățirea.**

**Praguri concrete, pentru când s-ar justifica altceva:**
- **Sub ~50.000 de produse cacheate local:** nimic. Filtrarea în memorie e suficientă.
- **50.000–500.000, cu backend activ:** PostgreSQL FTS + `pg_trgm` pe Supabase. Acoperă fuzzy matching pe nume de produse și e inclus în free tier.
- **Peste ~1 milion, sau căutare în limbaj natural reală:** abia atunci `pgvector` sau Meilisearch/Typesense.
- **Elasticsearch/OpenSearch/Qdrant/Weaviate:** niciodată la scara previzibilă a Zelynta. Sunt sisteme care cer un operator dedicat.

**Embeddings pe dispozitiv / CLIP pentru căutare vizuală (secțiunea 17):** nerecomandat. Un model CLIP util are zeci–sute de MB, ar dubla mărimea APK-ului și ar consuma baterie, pentru a rezolva o problemă pe care codul de bare o rezolvă deja perfect. Camera citește deja EAN-ul — care e un identificator global exact. Căutarea vizuală ar fi mai puțin precisă decât ce ai.

---

## 10. Modelul potrivit (secțiunea 44)

| Model | Potrivire | Comentariu |
|---|---|---|
| A. Product Discovery Platform | Parțial | E ce faci deja, dar „discovery" e prea slab — utilizatorul vine cu produsul în mână |
| B. Comparison Platform | Parțial | Compararea există; nu e nucleul |
| **C. Community Product Database** | **Da, dar indirect** | **Prin OFF, nu în locul lui** |
| D. Marketplace | **Nu** | Distruge independența |
| E. Hybrid | — | vezi mai jos |

**Modelul real al Zelynta, formulat exact:**

> **Un instrument de transparență care își aduce singur datele de care are nevoie** — citește dintr-un bun comun, iar când acesta e incomplet, își ajută utilizatorii să-l completeze, cu un strat propriu de interpretare (scor, aditivi, organe, alternative) care rămâne al Zelynta.

Analogia din secțiunea 45 (Wikipedia/IMDb/Discogs) e aproape corectă, cu o precizare importantă: **Wikipedia produselor alimentare există deja și se numește Open Food Facts.** Zelynta nu ar trebui să o rescrie. Ar trebui să devină cel mai bun *editor* al ei pentru Europa de Est — și cel mai bun *interpret* al datelor din ea.

---

## 11. Efecte de rețea — flywheel-ul real

Cel din cerere presupune un catalog propriu. Cel real e:

```
SCANARE EȘUATĂ (produs lipsă din OFF)
      ↓
CONTRIBUȚIE DINTR-UN SINGUR GEST
(cod de bare + poză la ingrediente — ambele deja în aplicație)
      ↓
OPEN FOOD FACTS SE ÎMBOGĂȚEȘTE PE PIAȚA TA
      ↓
MAI PUȚINE EȘECURI PENTRU TOȚI UTILIZATORII
      ↓
MAI MULTĂ ÎNCREDERE → MAI MULȚI UTILIZATORI → MAI MULTE CONTRIBUȚII
```

**O tensiune de recunoscut onest:** contribuțiile ajung într-un bun comun, deci îți ajută și concurenții care folosesc OFF. Asta e real și nu poate fi evitat.

Dar e o problemă mult mai mică decât pare. Avantajul tău nu e *deținerea* datelor, ci **interpretarea** lor în 11 limbi și încrederea pe piețele pe care nimeni nu le servește bine. Un produs românesc adăugat de un utilizator Zelynta apare și la Yuka — dar Yuka nu îi explică utilizatorului român, în română, de ce E250 e problematic, cu trimitere la EFSA. Tu da.

Și există un al doilea efect, mai puțin evident: **fiecare contribuție îmbunătățește produsul pentru contribuitor imediat**. Adaugi iaurtul tău preferat, îl scanezi data viitoare, îți apare. Bucla de recompensă e strânsă, ceea ce e exact ce cere gamificarea din secțiunea 26 — fără să construiești gamificare.

---

## 12. SEO (secțiunea 33)

Din auditul tehnic: `hreflang` trimite la `?lang=xx`, parametru **care nu e citit nicăieri în cod** — 12 URL-uri servesc HTML românesc identic, iar 15 din 16 pagini n-au deloc `hreflang`. Iar `FAQPage` structured data descrie o secțiune ștearsă din pagină.

**Ordinea corectă:** repară ce e stricat înainte de a adăuga pagini noi. Pagini de produs generate din date OFF ar fi, în starea actuală, thin content duplicat — exact ce penalizează Google.

**Când SEO devine oportunitate reală:** pagini per **aditiv**, nu per produs. „E250 — nitrit de sodiu: ce este, unde se găsește, ce spune EFSA", în 11 limbi, din conținut pe care **îl deții deja**. 89 de aditivi × 11 limbi = 979 de pagini cu conținut real, unic, util — nu duplicat de la OFF. Asta e o strategie SEO defensabilă, spre deosebire de pagini de produs.

---

## 13. Top oportunități

| # | Oportunitate | Valoare utilizator | Complexitate | Risc | Prioritate |
|---|---|---|---|---|---|
| 1 | **Contribuție într-un gest către OFF** (cod + poză) | Rezolvă „produsul nu există" permanent | M | Mic — API oficial | **P0** |
| 2 | Repară „offline = produs inexistent" | Nu mai minte utilizatorul | S | Foarte mic | **P0** |
| 3 | Pagini SEO per aditiv, 11 limbi | Trafic organic din conținut propriu | M | Mic | **P1** |
| 4 | Extinde aditivii de la 89 spre ~350 | Adâncimea care te diferențiază | L | Niciunul | **P1** |
| 5 | Completează cosmeticele pe bg/el | 2 limbi din 11 sunt de fațadă | M | Niciunul | **P1** |
| 6 | Cache de produse pe dispozitiv | Ridică plafonul de rată; funcționare offline | M | Mic | **P1** |
| 7 | Alerte de rechemare (RASFF) | Funcție pe care Yuka nu o are | M | Mic — **API + licență confirmate** | **P2** |
| 8 | Ingrediente INCI din CosIng | De la 30 la mii de substanțe cosmetice | L | **Fără API** — extragere manuală unică | **P3** |
| 9 | Liste/colecții locale (fără cont) | „Cumpărături pentru copil", „fără gluten" | M | Niciunul | **P2** |
| 10 | Statistici proprii de contribuție | „Ai adăugat 12 produse care ajută 400 de oameni" | S | Mic | **P3** |

Restul cererii — oferte, comercianți, afiliere, portal pentru vânzători, product graph, Neo4j, embeddings vizuale, recenzii de produs, Q&A, badge-uri, provocări comunitare — **nu intră în listă**, cu motivele din secțiunile 0, 5, 8, 9 și din documentul de arhitectură comunitară.

---

## 14. Răspunsuri la întrebările finale

**1. Cum creștem numărul de produse de 10×?** Nu prin baze noi. Ai deja 4,86 M. Prin transformarea eșecurilor în contribuții: contribuție într-un gest către OFF (cont global de aplicație + `app_uuid` pseudonim), plus repararea bug-ului care raportează greșit „produs inexistent" când utilizatorul e offline.

**2. Cum ajungem la 100× fără degradarea calității?** Nu prin volum propriu, ci prin trecerea de la interogare live la **exportul OFF** (JSONL/Parquet, ~0,9 GB comprimat, nocturn) în spatele unui proxy cu cache. Calitatea rămâne responsabilitatea moderării OFF — care are deja ani de infrastructură pentru asta. Aici e și singura schimbare arhitecturală justificată.

**3. Ce baze externe integrăm?** Pe termen scurt: niciuna nouă — adâncește-le pe cele 4. Pe termen mediu, după verificarea API-urilor: CosIng (ingrediente cosmetice) și RASFF (rechemări).

**4. Ce API-uri merită?** **API-ul de scriere OFF** (`product_jqm2.pl` + `product_image_upload.pl`) — de departe cel mai valoros. Restul sunt secundare.

**5. Ce MCP servers?** Doar cele de dezvoltare din auditul tehnic (Expo, GitHub, Supabase read-only, Playwright). Cercetarea s-a finalizat pe 12 sept. 2026 — vezi **secțiunea 7**: nu există MCP oficial Open Food Facts, iar dintre cele 6 variante comunitare niciuna nu merită adoptată. Motivul de fond nu e calitatea lor, ci faptul că un MCP de catalog ar fi un intermediar peste un API pe care aplicația îl apelează deja direct.

**6. Ce librării?** Doar una e clar justificată: validare GTIN/EAN (verificare cifră de control) pentru codurile introduse manual. Restul — fuzzy matching, vector search, dedup — rezolvă probleme pe care nu le ai: codul de bare e deja cheie unică globală, iar deduplicarea din `history.ts` acoperă cazul OCR.

**7. Ce categorii noi de produse?** Nu categorii noi de *produse* — cele 4 baze acoperă alimente, cosmetice, produse generale și hrană pentru animale. Extinderea reală e în **adâncime**: mai mulți aditivi, mai multe ingrediente INCI.

**8. Cum contribuie comunitatea fără haos?** Nu construind moderare, ci **conectându-te la a OFF**, care există de ani buni. `app_uuid` permite blocarea selectivă a unui utilizator abuziv fără sancționarea aplicației. Detalii în `ZELYNTA_COMMUNITY_ARCHITECTURE.md`.

**9. Cum detectăm duplicatele?** Codul de bare e cheia primară globală — duplicatele aproape nu există. Singurul caz real e produsul scanat din poză (cod sintetic), rezolvat deja prin `sameProduct()` din [utils/history.ts:19](../utils/history.ts). Nu e nevoie de embeddings sau scoruri de similaritate.

**10. Cum verificăm informațiile?** Nu tu — OFF are moderare, istoric de versiuni și rollback. Ce ține de tine e **proveniența la afișare**: arată din ce bază vine produsul și când a fost verificat ultima dată.

**11. Reputation și moderation?** Le moștenești de la OFF. Un sistem propriu ar însemna conturi, sesiuni, RBAC — adică exact complexitatea și suprafața de risc pe care le-ai evitat.

**12. Cum devine Zelynta un catalog comunitar?** Devine **cel mai bun client de contribuție** pentru catalogul comunitar care există deja, plus un strat propriu de interpretare pe care nimeni nu-l are în 11 limbi.

**13. Ce produce efecte de rețea?** Bucla din secțiunea 11. Cea mai puternică formă: contribuția care îmbunătățește produsul pentru contribuitor **imediat**.

**14. Ce generează trafic SEO?** Pagini per aditiv în 11 limbi (~979 pagini de conținut propriu, unic). **Nu** pagini de produs — acelea ar fi duplicat.

**15. Ce diferențiază Zelynta de marketplace-uri?** Faptul că **nu e** unul. Nu câștigi nimic dacă cumperi. Asta e poziția, și trebuie apărată, nu diluată.

**16. Ce automatizăm cu AI?** Foarte puțin, deliberat. Pre-completarea unei contribuții din OCR (nume, ingrediente) cu prag de încredere și **confirmare obligatorie a utilizatorului** înainte de trimitere. AI-ul nu trebuie să scrie niciodată direct în OFF. Scorul rămâne determinist — transparența e argumentul tău de vânzare.

**17. Ce NU merită construit?** Marketplace, oferte, prețuri comerciale, afiliere, portal pentru comercianți, PIM, taxonomie proprie, product graph, Neo4j, căutare vizuală CLIP, embeddings pe dispozitiv, Elasticsearch, recenzii de produs, Q&A, badge-uri, provocări comunitare, API public de contribuție. Fiecare adaugă întreținere pentru un dezvoltator singur și, în cazul celor comerciale, erodează motivul pentru care produsul e credibil.

**18. Primele 10 implementări?** Vezi tabelul din secțiunea 13 — dar reține că **P0-urile din auditul tehnic au prioritate absolută** față de orice de aici. Nu construi contribuția peste un pipeline care nu se desfășoară.

---

## Verdict final

```
ZELYNTA_CAN_EVOLVE_INTO_COMMUNITY_PRODUCT_PLATFORM
```

**Cu o precizare care schimbă tot ce urmează:** poate evolua astfel **doar prin participare la un bun comun existent, nu prin construirea unui catalog propriu.**

**Dovezile pentru „poate":**
- Are deja fiecare piesă tehnică necesară: cameră, cod de bare, OCR pe dispozitiv, 11 limbi, chiar butonul „adaugă pe OFF" (care momentan doar deschide un browser).
- OFF suportă **oficial** contribuția prin cont global de aplicație, cu `app_uuid` pseudonim per utilizator pentru moderare selectivă — compatibil cu poziția „fără cont" a Zelynta.
- Golul e demonstrat și cuantificat: 674 de cosmetice pentru toată România. Utilizatorii lovesc zilnic acest gol — de acolo a pornit această colaborare.
- Are un activ propriu, real și rar: baza de aditivi și cosmetice în 11 limbi, cu surse citate.

**Dovezile pentru „nu prin catalog propriu":**
- Zero entități de produs în schemă, după ani de dezvoltare — nu din neglijență, ci pentru că nu au fost necesare.
- Un catalog propriu ar necesita moderare, reputație, versionare, rollback, anti-spam — toate existente deja la OFF, toate costisitor de întreținut pentru un dezvoltator singur.
- Modelul de marketplace din cerere ar contrazice direct singurul lucru care face scorul credibil: absența interesului comercial.

**De ce nu `ZELYNTA_REQUIRES_PRODUCT_ARCHITECTURE_REDESIGN`:** nu e nimic de reproiectat. Arhitectura actuală — a nu deține date de produs — nu e o lipsă, e alegerea corectă, iar direcția recomandată o extinde, nu o contrazice.

**De ce nu `ZELYNTA_PRODUCT_MODEL_LIMITED`:** descriptiv ar fi adevărat (6 câmpuri), dar induce în eroare. Modelul e minimal pentru că întreaga bogăție e împrumutată la cerere dintr-un catalog de 4,7 milioane de produse. Nu e limitat; e delegat — deliberat și corect.
