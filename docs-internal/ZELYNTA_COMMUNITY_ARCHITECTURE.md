# Zelynta — Arhitectura comunitară

> **Document intern de proiectare.** Complementar cu `ZELYNTA_PRODUCT_ECOSYSTEM_RESEARCH.md`.

**Data:** 4 septembrie 2026

---

## 0. Principiul de bază

Cererea descrie o platformă comunitară completă: conturi, roluri, reputație în 5 trepte, versionare cu rollback, voturi, badge-uri, provocări, Q&A, recenzii de produs, colecții publice, sistem de urmărire, notificări, API public de contribuție.

Construite de la zero, toate acestea ar însemna aproximativ un an de muncă pentru un dezvoltator singur — și ar aduce în Zelynta exact ce a evitat până acum: conturi, sesiuni, parole, moderare umană, anti-spam, obligații GDPR asupra conținutului generat de utilizatori.

**Vestea bună: aproape tot acest aparat există deja și e matur — la Open Food Facts.** Are moderatori, istoric complet de versiuni per produs, rollback, sistem de blocare, ani de experiență cu spam-ul.

Așa că arhitectura de mai jos separă strict:

| Zonă | Cine o deține |
|---|---|
| Contribuții de date de produs, moderare, versionare, reputație, anti-spam | **Open Food Facts** |
| Fluxul de contribuție din aplicație, interpretarea datelor, listele personale | **Zelynta** |
| Recenzii de produs, Q&A, badge-uri, provocări, portal comercianți | **Nimeni — nu se construiesc** |

---

## 1. Modelul de identitate

**Zelynta nu introduce conturi.** Aceasta e o decizie de arhitectură, nu o amânare.

Open Food Facts permite oficial un **cont global de aplicație**: utilizatorii contribuie fără să-și facă fiecare cont pe OFF. Fiecare cerere de scriere trimite:

```
app_name    = "Zelynta"
app_version = "<versiunea aplicației>"
app_uuid    = <UUID aleator, sărat, generat local la prima rulare>
user_id     = <contul global Zelynta>
password    = <parola contului global>
```

`app_uuid` e mecanismul-cheie. Documentația OFF îl descrie ca *un uuid aleator sărat pentru utilizator, astfel încât moderatorii să poată bloca selectiv un utilizator problematic fără a bloca tot contul aplicației.*

Consecințe pentru Zelynta:

- **Pseudonimitate reală.** UUID-ul se generează pe dispozitiv, nu conține nimic despre persoană, nu se leagă de e-mail sau telefon. Politica de confidențialitate rămâne adevărată.
- **Zero suprafață de autentificare.** Fără login, parole, resetare, sesiuni, MFA — deci fără clasele de vulnerabilități aferente. Auditul de securitate a arătat că absența autentificării elimină singură categoria OWASP A07.
- **Moderare fără moderatori proprii.** Dacă cineva abuzează, OFF blochează acel `app_uuid`. Tu nu construiești nimic.
- **Ștergere GDPR simplă.** UUID-ul e o valoare locală; ștergerea datelor aplicației îl elimină.

**Un singur secret de protejat:** parola contului global. **Nu poate sta în client** — `EXPO_PUBLIC_*` se inlineează în bundle (vezi auditul de securitate, A-3), iar oricine dezarhivează APK-ul o extrage și poate scrie în OFF în numele Zelynta. Aceasta e singura componentă care **cere** o funcție de server: un Supabase Edge Function care ține parola și proxy-ază scrierile, aplicând și limitare de rată per `app_uuid`.

Merită spus clar: **funcția de contribuție e singurul motiv real pentru care Zelynta ar activa un backend.** Nu recenziile, nu conturile — asta.

---

## 2. Fluxul de contribuție

```
UTILIZATOR scanează un cod
        ↓
Produsul NU e găsit în cele 4 baze
        ↓
  ⚠ VERIFICĂ ÎNTÂI CONEXIUNEA
  (azi, offline se raportează greșit ca „produs inexistent" — bug P0)
        ↓
„Nu găsim acest produs. Vrei să-l adaugi? Ajuți pe toată lumea."
        ↓
┌─ PASUL 1 — poza cu ambalajul (față) ────────────┐
│  camera există deja                             │
└─────────────────────────────────────────────────┘
        ↓
┌─ PASUL 2 — poza cu lista de ingrediente ────────┐
│  OCR pe dispozitiv (ML Kit) pre-completează     │
│  utilizatorul CONFIRMĂ sau corectează           │
└─────────────────────────────────────────────────┘
        ↓
┌─ PASUL 3 — nume + marcă (opțional categorie) ───┐
│  minimul necesar; restul îl completează OFF     │
└─────────────────────────────────────────────────┘
        ↓
TRIMITERE prin Edge Function → OFF
   product_jqm2.pl        (câmpuri text)
   product_image_upload.pl (poze: front, ingredients_<lang>)
        ↓
CONFIRMARE: „Trimis. Apare în câteva minute."
        ↓
Reîncercare automată a scanării după ~30s
        ↓
UTILIZATORUL ÎȘI VEDE PROPRIUL PRODUS, CU SCOR
```

Ultimul pas contează cel mai mult. Recompensa vine în aceeași sesiune, nu peste o săptămână. Asta e ce încearcă gamificarea din cererea inițială (secțiunea 26) să obțină artificial — aici apare natural.

**Reguli de proiectare:**

1. **Progresiv, cu ieșire în orice moment.** Trei pași, fiecare util singur. O poză cu ambalajul e deja o contribuție validă la OFF; nu forța formularul complet.
2. **OCR-ul propune, utilizatorul dispune.** Textul extras se afișează editabil, niciodată trimis direct. Un OCR care greșește și scrie singur în baza comună e mai rău decât lipsa contribuției.
3. **Fără câmpuri de care OFF nu are nevoie.** Nu cere preț, magazin, țară, cantitate — OFF le deduce sau le completează comunitatea.
4. **Cerere de dimensiune minimă a pozei:** OFF cere minim 640 × 160 px. Verifică local înainte de trimitere; o respingere după upload e o experiență proastă.
5. **Coadă cu reîncercare.** Contribuția se face adesea în magazin, pe semnal slab. Salvează local și retrimite când revine conexiunea. Fără asta, funcția eșuează exact acolo unde e folosită.

---

## 3. Detectarea duplicatelor

Problema din cerere (Samsung Galaxy S26 sub trei denumiri) **nu există aici**, pentru că EAN/GTIN e un identificator global unic atribuit de producător. Dacă ai codul, ai produsul.

Rămân două cazuri reale:

**a) Produs scanat din poză (fără cod de bare).** Primește un cod sintetic. Rezolvat deja în [utils/history.ts:19](../utils/history.ts): două intrări sunt același produs dacă au același cod **sau** același nume+marcă normalizate. Suficient pentru un istoric plafonat la 100 de intrări. Nu adăuga fuzzy matching aici.

**b) Cod tastat greșit manual.** Rezolvarea corectă nu e potrivire aproximativă, ci **validarea cifrei de control** EAN-13/EAN-8/UPC-A. Un cod invalid e prins înainte de a ajunge la rețea. Sunt ~15 linii de cod; nu e nevoie de librărie externă.

**Nu construi:** scoruri de încredere pentru duplicate, similaritate de imagine, embeddings. Rezolvă o problemă pe care sistemul de coduri de bare a rezolvat-o în 1974.

---

## 4. Ce construiește Zelynta pe partea comunitară

Doar trei lucruri, toate locale și fără cont:

### 4.1 Liste și colecții (local)
Utilizatorul grupează produse salvate: „Fără gluten", „Cumpărături pentru copil", „De evitat". Extinde `favorites`/`basket`, care există deja și folosesc același `HistoryItem`.
**Fără publicare, fără urmăritori, fără profiluri.** Colecțiile publice ar aduce moderare de conținut, spam SEO și obligații GDPR — pentru un beneficiu neclar la scara actuală.

### 4.2 Contribuțiile mele (local)
Un ecran simplu: ce produse ai adăugat, când, statusul lor. Plus un contor onest: *„Ai adăugat 12 produse. Sunt acum disponibile pentru oricine le scanează."*

Aceasta e singura formă de „reputație" recomandată — **vizibilă doar ție, nefolosită pentru clasamente**. Momentul în care reputația devine publică și comparativă, apare karma farming, împotriva căruia cererea însăși avertizează (secțiunea 11).

### 4.3 Semnalarea unei erori
Când datele unui produs sunt greșite, un buton care deschide pagina de editare OFF pentru acel cod. Un tap, zero infrastructură. Corectarea intră în fluxul de moderare OFF.

---

## 5. Ce NU se construiește, și de ce

| Din cerere | Verdict | Motiv |
|---|---|---|
| Conturi, roluri, 5 trepte de reputație | **Nu** | OFF le are; ar reintroduce autentificarea eliminată deliberat |
| Versionare + rollback (secț. 12) | **Nu** | OFF are istoric complet per produs |
| Recenzii de produs (secț. 21) | **Nu** | Ai un scor **obiectiv**, din surse citate. Recenziile subiective îl diluează, atrag manipulare comercială și cer moderare de conținut în 11 limbi |
| Q&A comunitar (secț. 22) | **Nu** | Conținut medical/nutrițional negestionat — risc real, nu doar efort |
| Badge-uri, provocări, gamificare (secț. 26-27) | **Nu** | Optimizează pentru volum, nu acuratețe. Bucla „îmi văd produsul imediat" e o recompensă mai bună |
| Colecții publice, urmăriri, notificări (secț. 23-24) | **Nu acum** | Moderare + GDPR + push, pentru beneficiu speculativ |
| Recenzii de comerciant/vânzător (secț. 21) | **Nu** | Nu există comercianți în model |
| API public de contribuție (secț. 40) | **Nu** | Cine vrea bulk contribuie direct la OFF, care are deja API |
| Portal comercianți (secț. 38) | **Nu** | Un comerciant care își editează propriile date într-o aplicație care le evaluează = conflict de interese |

---

## 6. Prevenirea abuzului

Fiindcă scrierea trece prin Edge Function-ul tău, ai trei niveluri, în ordinea costului:

**Nivelul 1 — validare locală, gratuită.** Cifră de control EAN validă; poză ≥ 640×160; nume între 2 și 200 de caractere; fără URL-uri în câmpurile text (semnal clasic de spam). Prinde greșelile oneste și spam-ul leneș, fără o cerere de rețea.

**Nivelul 2 — limitare de rată în Edge Function.** Per `app_uuid`: un plafon rezonabil pe zi (ex. 20 de contribuții) și pe oră. Un utilizator real adaugă câteva produse; unul care trimite 500 e un bot. Aceasta e apărarea principală și e ieftină.

**Nivelul 3 — moderarea OFF.** Ce trece de primele două intră în fluxul lor. Dacă un `app_uuid` produce gunoi, OFF îl blochează selectiv, fără sancționarea aplicației.

**Notă critică din auditul de securitate:** dacă activezi Supabase pentru Edge Function, aplică **întâi** remedierile B-3 (revocarea inserării pe coloane, constrângeri de lungime, limitare de rată). Politicile `with check (true)` fără limitare fac ca umplerea bazei să fie banală.

---

## 7. Model de date (partea Zelynta)

Minimal, deliberat. Nu se stochează date de produs — acelea trăiesc la OFF.

**Local, pe dispozitiv (AsyncStorage):**
```
zelynta_app_uuid          uuid aleator, generat o dată
zelynta_contributions     [{ barcode, sentAt, status, fields[] }]   plafonat
zelynta_contrib_queue     contribuții în așteptare (offline)
zelynta_collections       [{ id, name, items[] }]
zelynta_history / _favorites / _basket        existente
```

**Server (doar dacă se activează Edge Function-ul):**
```
Secret: parola contului global OFF   — în variabilele de mediu ale funcției, NICIODATĂ în client
Tabel:  contribution_rate_limit (app_uuid, window_start, count)
```

Un singur tabel. Fără produse, fără recenzii, fără profiluri.

---

## 8. Etape

**Etapa 1 — Reparațiile care blochează totul.** P0-urile din auditul tehnic, în special „offline = produs inexistent". Fără asta, funcția de contribuție s-ar declanșa pentru utilizatori care au doar semnal slab și ar polua OFF cu duplicate. *Aceasta e o dependență strictă, nu o preferință de ordine.*

**Etapa 2 — Contribuția, doar poze.** Cont global OFF, Edge Function, un singur pas: poza cu ambalajul și poza cu ingredientele. Fără formular. Cea mai mică variantă utilă, și cea mai valoroasă pentru OFF (pozele sunt greu de obținut, textul îl completează comunitatea).

**Etapa 3 — Pre-completare din OCR.** Nume și ingrediente propuse din ML Kit, confirmate de utilizator. Coada offline cu reîncercare.

**Etapa 4 — Contribuțiile mele + semnalarea erorilor.** Ecranul local și butonul de corectare.

**Etapa 5 — Colecții.** Doar dacă utilizatorii le cer. Nu anticipa.

---

## 9. Ce validează sau invalidează direcția

Merită stabilit dinainte ce ar însemna că strategia funcționează, ca decizia să nu se ia pe impresii:

- **Rata de conversie a eșecului:** din scanările fără rezultat, ce procent devin contribuții? Sub ~5% înseamnă că fluxul e prea greoi.
- **Rata de acceptare la OFF:** dacă un procent important din contribuții e respins sau corectat de moderatori, validarea locală e prea permisivă.
- **Rata de eșec a scanărilor pe România:** ar trebui să scadă în timp. Dacă nu scade, contribuțiile nu ating produsele pe care oamenii chiar le scanează.

Toate trei cer telemetrie — care azi nu există deloc (vezi auditul tehnic, secțiunea 12). **Măsurarea trebuie să existe înainte de funcție**, altfel nu vei ști niciodată dacă a meritat.
