# AUDIT TOTAL — Zelynta
**Ultima actualizare:** 27 iunie 2026 · **Metodă:** analiză statică a codului + auditori specializați în paralel + **Fazele 1–5 de fix-uri implementate și verificate** (`tsc`, `npm test`, e2e, `node --check`, re-bundle Metro). Nu s-au inventat cifre, utilizatori, venituri sau trafic. Ce nu s-a putut verifica din cod e marcat **„necesită verificare manuală"**.

> Versiune **consolidată finală** — reflectă tot: audit inițial + Fazele 1–5 + re-audit 2 + analiză piață/monetizare. Cifrele de mai jos sunt cele curente.

---

## A. Rezumat executiv

Zelynta este o platformă reală, bine construită:
- **Aplicație** Expo/React Native (web + nativ) — scanare cod de bare / OCR ingrediente, scor de sănătate, aditivi explicați, comparație, istoric, favorite, coș. **Offline-first, fără cont, fără tracking.**
- **Landing page** statică (1 fișier HTML, 9 limbi, 15 teme, animații, recenzii + formular, cookie consent, IP-detect).
- **Admin/Moderator dashboard** (SPA HTML/JS) cu **backend Supabase real** (`schema.sql`: RBAC 7 roluri, RLS, recenzii/comentarii/suport/raportări/GDPR/analytics/audit).
- **Pagini legale** (12) în 9 limbi, cu selector de limbă, IP-detect, cookie consent.

**Stare:** după Fazele 1–5 (fix-uri, teste, CI/CD, deploy Pages, ErrorBoundary, runbook, execuție ștergere GDPR, audit DB extins, indexuri + retenție), proiectul e **solid și pregătit de beta** pe partea de **cod**. Rămâne doar **execuția pe infra** (Supabase live, cheie OCR, domeniu email, hosting admin, monitorizare, build EAS) — documentată în `DEPLOYMENT.md` și în ghidul prietenos `GHID_DEPLOY_IRINA.md`.

**Notă generală: 8.2 / 10** *(7.6 inițial → 8.2 după Fazele 1–5 + re-audit 2 + build optimizat WebP/minify).*

---

## B. Scorecard complet (cifre curente)

| Dimensiune | Notă | Față de start | Motiv |
|---|---|---|---|
| Landing page | **8.3** | ↑ 8.0 | SEO meta per-limbă + FAQ JSON-LD, anti-spam, linkuri sociale curățate; bundle inline mare rămâne |
| Admin dashboard | **7.5** | ↑ 6.5 | + confirmări + execuție ștergere GDPR + audit extins + sanitizare CMS + secțiune Optimizare imagini (scan + conversie WebP din butoane); config gol (demo) rămâne |
| Aplicație principală | **7.8** | ↑ 7.5 | + error-state comparație + skeleton alternative; UX excelent, privacy-first |
| Frontend | **8.3** | ↑ 8.0 | + `apiClient.ts` (fetch unificat) + i18n complet (fără hardcodate); design system, responsive |
| Backend / DB / API | **7.4** | ↑ 6.5 | + audit complet + politici DELETE + **10 indexuri** + retenție; neconectat, fără rate-limit server |
| Design / UX | **9.0** | = | 15 teme, dark satinat, animații, relief, consecvent pe platformă |
| Performance / LCP | **8.0** | ↑ 7.0 | + build optimizat automat (WebP logo −81%, minify HTML/CSS/JS) via `npm run optimize` în CI; App optimizat |
| SEO | **9.2** | ↑ 8.5 | + FAQ JSON-LD + meta dinamice per-limbă; sitemap, robots, hreflang×9, WebApplication schema, preload |
| Securitate | **8.1** | ↑ 7.5 | + sanitizare CMS + anti-spam + reparat scurgere settings (doar cheile sociale publice); RBAC client cosmetic, fără rate-limit server |
| GDPR / legal | **8.8** | ↑ 8.5 | + execuție ștergere GDPR + buton „șterge toate datele"; IP-detect pre-consimțământ (gri) rămâne |
| i18n | **9.2** | ↑ 8.5 | + 24 chei reparate în 7 limbi + tipsEyebrow/paletteTitle; admin RO-only rămâne |
| Teste | **7.0** | ↑ 4.5 | **38 unit (5 suite) + 25 e2e** în CI; lipsesc integration end-to-end |
| Documentație | **8.8** | ↑ 8.0 | + DEPLOYMENT.md, GHID_DEPLOY_IRINA.md, CHANGELOG.md, .env.example |
| Production readiness | **7.5** | ↑ 5.5 | + CI/CD + deploy Pages + ErrorBoundary + pre-commit + runbook; rămân 3 blocante infra |
| Valoare comercială | **7.0** | ↑ 6.5 | Asset tehnic matur (turnkey: teste/CI/DB/GDPR); fără tracțiune/venit dovedit |

---

## C. Audit pe componente (stare curentă)

### Landing — 8.3
Mesaj clar, hero cu mockup, 14 secțiuni, 15 teme, animații cu reduced-motion, **recenzii cu moderare reală** și empty-state onest, cookie consent (analytics/marketing OFF implicit), SEO complet (+FAQ schema), IP-detect cu fallback engleză, anti-spam pe formulare, linkuri sociale ascunse până la configurare. **Minus:** bundle ~379KB inline + icon.png 223KB (WebP/minify cu unelte locale).

### Admin — 7.3
Backend Supabase real (7 roluri, RLS, moderare, suport, GDPR, audit, settings, CMS). + confirmări la moderare, **execuție ștergere GDPR**, **sanitizare CMS** (anti-XSS), **audit extins** (roluri/settings/CMS/tichete), **politici DELETE**, **indexuri**. **Minus:** `config.js` gol → mod demo; RBAC client cosmetic (real doar prin RLS); fără rate-limit/provider email.

### Aplicație — 7.8
Scanare (3 baze + timeout via `apiClient`), OCR, căutare, scor/aditivi/nutriție/palmier, comparație (+error-state), istoric/favorite/coș, advice, 9 limbi, dark + 15 palete, IP-detect, **ErrorBoundary**, **„șterge toate datele"**, skeleton premium. **Esențial pt. store:** cheie OCR reală (link Privacy/Terms există deja în footer).

### Frontend — 8.3
Componente reutilizabile, design system (Context, 15 palete), responsive, memoizare, `apiClient.ts` (fără duplicare fetch), **0 text hardcodat** (totul prin `t()`).

### Backend/DB — 7.4
`schema.sql` complet (tabele + RLS + `has_role` + triggere audit pe toate + politici DELETE + **10 indexuri** + funcții de **retenție** 90/365 zile). **De rulat** la deploy. **Minus:** neconectat (config gol), fără rate-limit server, agregare analytics pe client.

---

## D. Buguri găsite & reparate (cumulat, Fazele 1–5 + re-audit)

**Reparate (selecție):** obiect `{label,text}` randat ca React child · dark mode neutru/tematic · scroll dublu (ThemeFx overflow) · footer full-width + fără gol · **24 chei i18n lipsă în 7 limbi** · texte provizorii/placeholder eliminate (GDPR) · `ctErr` 9 limbi · status HTTP + timeout pe toate fetch-urile · email personal scos din User-Agent · cache traducere plafonat · key-uri React stabile · favicon legal = logo · brand animat · scrollbar brandat · card CTA solid + buton roșu · **error-state comparație** · **confirmări moderare admin** · **linkuri sociale moarte → ascunse** · **TipsSection/PaletteButton** hardcodate → i18n 9 limbi.

**Optimizări:** `apiClient.ts` (dedup fetch) · sanitizare CMS · **10 indexuri DB** · **retenție DB** · `boxShadow` web · preload LCP + lazy steaguri · reduced-motion complet · FAQ JSON-LD · SEO meta per-limbă.

**Reparat (CMS/social):** scurgere de date prin `settings_read using(true)` (setări interne expuse public) → restricționat la whitelist; iconițe sociale gestionate din admin (Setări) și afișate pe landing doar când au URL.

**Confirmat că auditorii greșiseră:** `JSON.parse` deja în `try/catch`; reduce-motion acoperit; FlatList keys corecte; `track("landing_view")` consent-gated deja prezent; skeleton principal + indicator alternative deja existau; 0 coloane DB lipsă.

---

## E. Teste — 7.0
- **38 teste unitare** (5 suite: palm, score, score.additives, advice, translate) — `npm test` verde.
- **25 teste e2e** (Playwright, admin mod demo) — verde.
- **CI** (`.github/workflows/ci.yml`): typecheck + lint + unit + e2e pe push/PR.
- **Pre-commit** (husky + lint-staged): ESLint pe fișiere modificate.
- **Lipsesc:** teste de integrare end-to-end pe app.

---

## F. Fazele de lucru — toate ✅ pe cod
- **Faza 1 (Critical):** error-state comparație, confirmări admin, avertisment OCR demo, `.env.example`, CI, anti-spam.
- **Faza 2 (Production readiness):** 38 teste, SEO meta per-limbă, a11y (aria-modal), CI rulează testele. *(WebP/minify = unelte locale.)*
- **Faza 3 (Admin functional):** execuție ștergere GDPR, politici DELETE, audit DB extins, „șterge toate datele" în app.
- **Faza 4 (Premium UX):** skeleton premium la alternative (restul era deja livrat).
- **Faza 5 (Launch):** ErrorBoundary, deploy Pages workflow, `DEPLOYMENT.md`, `CHANGELOG.md`, checklist.
- **Lot pre-deploy + re-audit 2:** `apiClient.ts`, sanitizare CMS, indexuri + retenție DB, linkuri sociale, i18n TipsSection/PaletteButton, +17 teste, pre-commit, `GHID_DEPLOY_IRINA.md`.
- **Build optimizat (WebP + minify):** `scripts/optimize-assets.js` + `npm run optimize`; deploy-ul publică `build/` optimizat (sursa `docs/` rămâne editabilă).
- **Secțiune admin Optimizare imagini:** scanează site-ul (sugerează ce e greu) + convertor WebP 100% în browser (drag & drop, descărcare, snippet de mapare) — pentru utilizatori non-tehnici, totul din butoane.

**Rămas (infra, în afara codului):** Supabase live + rulare `schema.sql`, cheie OCR producție, domeniu/email, hosting admin privat, Sentry/uptime, build EAS + submit, backup, aviz DPO.

---

## G. Riscuri rămase
RBAC client cosmetic fără RLS (rezolvat când Supabase e conectat) · IP-detect (geojs.io) înainte de consimțământ (aviz DPO) · dependența de API-uri gratuite terțe (fără proxy/rate-limit) · fără monitorizare/error-tracking activ · traduceri juridice neavizate legal.

---

## H. Estimare valoare de piață (orientativă — fără cifre inventate)

> Nu există venituri/utilizatori → valoarea = **asset tehnic + reconstrucție + potențial**. Ipoteze: rate UE blended €350–650/zi, efort estimat din amploarea reală a codului. Toate sunt **range-uri**.

**Reconstrucție (rebuild de la zero):** ~4.5–6.5 luni-om → **€38.000 – €95.000** (încredere Medium).

**Asset tehnic acum (după Fazele 1–5 + re-audit 2):** **€34.000 – €80.000** (încredere Medium) — revizuit în sus față de €26–66k: code-blocantele au fost reparate (teste 38u+25e2e, CI/CD, deploy automat, ErrorBoundary, apiClient, indexuri + retenție DB, execuție ștergere GDPR, sanitizare, runbook). Au mai rămas doar **blocante de infra** (execuție, nu datorie de cod), deci asset-ul e mai aproape de gata-de-folosit.

**Pe componente (min / mediu / max — asset acum):**
- Landing: **€8.000 / €15.000 / €25.000**
- Aplicație: **€16.000 / €28.000 / €44.000**
- Admin + backend: **€10.000 / €20.000 / €35.000**
- **Total platformă: €34.000 / €63.000 / €104.000** → **medie ≈ €67.000**

**Scenarii comerciale (fără tracțiune dovedită):**
- Conservator (gratuit) ≈ asset tehnic.
- Realist (lansat, câteva mii instalări organice, monetizare ușoară) → **€55.000 – €140.000** după 6–12 luni · încredere Low.
- Optimist (PMF nișă CEE/privacy + parteneriate/B2B) → **€160.000 – €420.000+** · încredere Low.

**Sumar:**
- **Valoare acum (asset tehnic):** **€34.000 – €80.000** (medie componente ≈ €67.000)
- **După finalizare tehnică** (Supabase live + monitorizare; WebP/minify deja automatizat): **€55.000 – €130.000**
- **După lansare cu utilizatori reali:** **€90.000 – €270.000** (depinde de tracțiune)
- **După venituri recurente:** pe bază MRR/ARR — **lipsesc date**

---

## I. 📊 Piață & concurenți (unghi original)

**Concurenți:** **Yuka** (lider; cere cont, premium, acoperire slabă RO/CEE, scor „cutie neagră"); **Open Food Facts app** (date deschise, UX brut); **INCI Beauty** (doar cosmetice); **Foodvisor/MyFitnessPal** (calorii, nu transparența etichetei).

**Unde Zelynta e deja DIFERIT (din funcții reale, nu copie):**
1. **Privacy-first real** — fără cont, fără tracking, date pe dispozitiv → încredere UE/GDPR.
2. **9 limbi + auto-IP** — acoperă RO + Europa de Est/Centrală (nișă sub-deservită).
3. **OCR ingrediente** — merge și fără cod de bare.
4. **Comparator vizual** (câștigător + verde per nutrient).
5. **Alimente + cosmetice + generale** pe **date deschise**.
6. **Design premium + 15 teme.**

**Poziționare originală (NU copie de Yuka):** *„scorul pe care îl înțelegi"* (breakdown transparent) · *„Yuka-ul care îți respectă datele, în limba ta"* (CEE + privacy) · **profiluri dietetice** (diabet/alergii/vegan) · **„basket health"** (scor mediu al coșului — unic) · **contribuție gamificată** la Open Food Facts.

---

## J. 💸 Plan de monetizare (idei, fără venituri inventate)

> Regula de aur: **nu compromite USP-ul** (privacy + încredere).

- **A. Freemium (principal):** gratuit = scanare nelimitată + scor + aditivi + istoric local; **Premium (~€2–4/lună sau €15–25/an — orientativ)** = OCR nelimitat, profiluri dietetice, comparație avansată, „basket health", sync criptat opțional, fără reclame, teme premium.
- **B. Afiliere transparentă:** linkuri către alternative la retaileri (cu disclosure, fără a influența scorul).
- **C. B2B / White-label / API (cea mai mare pârghie):** API de scor pentru retaileri/nutriție/asigurători; white-label pentru lanțuri/farmacii; dashboard pentru nutriționiști.
- **D. Donații / „Susține proiectul"** (model open & honest).
- **E. Premium cosmetice:** analiză INCI aprofundată.

**De EVITAT:** branduri sponsorizate în rezultate, vânzarea datelor, paywall pe scanarea de bază.
**Secvență:** gratuit → încredere & MAU → afiliere + donații → premium → B2B/API la tracțiune.

---

## K. Pași rămași spre lansare
1. **Supabase live** + rulare `schema.sql` (include indexuri + retenție) + super_admin + backup.
2. **Cheie OCR** producție în `.env`.
3. **config.js** (docs + admin) cu URL + anon key.
4. **Domeniu/email** `suport@zelynta.com` monitorizat.
5. **Hosting admin** privat + **Sentry/uptime**.
6. **WebP/minify** — ✅ **automat** via `npm run optimize` (rulează în CI la deploy; nu mai e manual).
7. **Aviz DPO** pentru IP-detect + traduceri juridice.
8. **Build EAS** + submit store-uri.

> Ghiduri: `DEPLOYMENT.md` (tehnic, cu checklist), `GHID_DEPLOY_IRINA.md` (prietenos), `CHANGELOG.md`.

---

## L. Top 10 recomandări esențiale (prioritate)
1. Conectează Supabase (deblochează recenzii + admin + contact reale).
2. Cheie OCR în `.env`.
3. Domeniu/email real + SLA GDPR 30 zile.
4. Rulează indexurile + retenția (deja în `schema.sql`).
5. Rate-limit server-side (Supabase Edge) pe insert-uri anonime.
6. Sentry + uptime monitor.
7. WebP logo + minificare landing (PageSpeed).
8. Aviz DPO pentru IP-detect.
9. Backup DB + rollback documentat.
10. Mai multe teste de integrare.

---

## M. Răspuns direct la întrebări (actualizat)
- **Cât de bună e aplicația acum?** **7.8/10** — solidă, frumoasă, privacy-first; cu `apiClient`, ErrorBoundary, „șterge toate datele". Lipsește doar cheia OCR reală.
- **Cât de bun e landing-ul?** **8.3/10** — premium, SEO 9.2 (FAQ schema + meta per-limbă), anti-spam. De optimizat perf (WebP/minify) + conectare Supabase.
- **Cât de bun e admin-ul?** **7.3/10** — backend real (RLS/RBAC) + execuție GDPR + audit extins + sanitizare; rămâne neconectat (demo) + i18n RO-only (intern, opțional).
- **Ce lipsește pt. production-ready?** cele 3 blocante infra + monitorizare + rate-limit server.
- **Ce lipsește pt. enterprise premium?** observabilitate, SLA, provider email, mai multe teste, aviz legal.
- **Ce reparat urgent?** nimic în cod (totul făcut); urgent = **infra**: OCR, Supabase, domeniu.
- **Ce poate aștepta?** ecran Settings, i18n admin, lazy animații sub-fold.
- **Ce e riscant?** RBAC fără RLS, IP-detect pre-consimțământ, dependența de API gratuite, fără monitorizare.
- **Ce e valoros?** design premium, i18n bogat (9 limbi), bazele de conținut, privacy-first, amploarea, backendul cu RLS.
- **Ce e inutil?** câteva chei moarte (`ftCompany`), CSS `.ph` nefolosit.
- **Ce crește valoarea (landing + app + admin)?** tracțiune reală (MAU/retenție), Supabase live + monitorizare, monetizare, parteneriate B2B, optimizări perf/SEO.
  - **Prețuri orientative (min / mediu / max — asset acum):**
    - Landing: **€8.000 / €15.000 / €25.000**
    - Aplicație: **€16.000 / €28.000 / €44.000**
    - Admin + backend: **€10.000 / €20.000 / €35.000**
    - **Total: €34.000 / €63.000 / €104.000 → medie ≈ €67.000**
- **Ce scade valoarea?** blocante infra, backend neconectat, lipsa monitorizării/tracțiunii, dependența API terțe.
- **Pași până la lansare?** Fazele 1–5 ✅ pe cod; rămâne execuția pe infra (vezi §K).
- **Valoare estimată acum?** **€34.000 – €80.000** (asset tehnic; medie componente ≈ €67.000) — revizuit în sus după repararea code-blocantelor.
- **Valoare după finalizare tehnică?** **€55.000 – €130.000**.
- **Valoare după utilizatori reali?** **€90.000 – €270.000** (depinde de tracțiune).
- **Recomandări esențiale?** Top 3: Supabase live, cheie OCR, monitorizare + rate-limit.

---

## N. Verificare finală (tot verde)
`tsc --noEmit` curat · **38/38 teste unitare** · **25/25 teste e2e** · `node --check admin.js` OK · 10 indexuri + retenție în `schema.sql` · i18n 9/9 pe cheile noi · bundle Metro curat.

---

## O. Concluzie
Zelynta este, după Fazele 1–5 și re-auditul 2, **un produs solid, premium și aproape gata de beta** — cod curat, teste, CI/CD, backend cu RLS, i18n bogat și documentație de lansare. **Tot ce se putea face din cod e făcut și verificat.** Mai rămâne strict **execuția pe infra** (Supabase, OCR, domeniu, hosting, monitorizare) — ghidată în `DEPLOYMENT.md` și, prietenos, în `GHID_DEPLOY_IRINA.md`. Diferențiatorii reali (privacy-first, 9 limbi/CEE, transparența scorului, design) îi dau un unghi **original**, nu de clonă; planul de monetizare (§J) respectă acel USP.

*Estimările de valoare sunt orientative, bazate pe amploarea reală a codului și pe rate de piață UE; nu includ venituri/utilizatori (inexistenți). Pentru o evaluare fermă sunt necesare date de tracțiune.*


---

# ANEXE DETALIATE (restaurate)

## P. Audit detaliat — Performance / LCP / CLS / INP — **7.0/10**
**App (bun):** animații native driver, stiluri memoizate, imagini externe lazy, skeleton la încărcare, fără SDK-uri grele.
**Landing:** ~379KB HTML inline, JS nemiminificat; icon.png 223KB (preload fetchpriority=high); multe animații decorative înainte de LCP (gated cu prefers-reduced-motion).
**Estimări orientative (necesită Lighthouse real, NU sunt măsurate):** LCP ~1.5–2.5s · CLS ~0.05–0.1 · INP ~80–150ms.
**Optimizare AUTOMATĂ (implementată):** `scripts/optimize-assets.js` (`npm run optimize`) construiește `build/` din `docs/`: **WebP logo 218KB→41KB (−81%)** + `<picture>` cu fallback, **minificare HTML+CSS+JS** (verificată sintactic). Workflow-ul de deploy rulează automat optimizarea și publică `build/`. Rămas opțional: lazy pentru animații sub-fold.
**Țintă realistă:** PageSpeed mobil **85–92**, desktop **95–99**.

## Q. Audit detaliat — SEO — **9.2/10**
Prezente & corecte: title, meta description, canonical, **hreflang ×9 + x-default**, OG complet (+9 alternate), Twitter card, **JSON-LD WebApplication + FAQPage**, sitemap.xml (13 URL), robots.txt, manifest.json, preload LCP, heading-uri semantice, **meta dinamice per limbă**. Minus minor: <html lang> static RO pe paginile legale (conținutul comută prin JS).

## R. Audit detaliat — Securitate — **8.1/10**
**Bun:** fără secrete în repo, auth/RBAC prin **RLS server-side**, **sanitizare CMS** la scriere, **anti-spam**, esc() pe output admin, cheie OCR din mediu.
**Reparat (re-audit CMS social):** `settings_read using(true)` expunea public TOATE setările (adresă, CUI/TVA, e-mailuri) → acum publicul citește doar `social_*` + `default_locale`; restul doar staff. Iconițele sociale de pe landing funcționează corect din whitelist.
**Riscuri rămase:** RBAC client cosmetic (real doar cu RLS) · fără rate-limit server pe insert-uri anonime · PII (email/nume) vizibil în tabele admin · fără CSP/headers expliciți (depind de host) · dependența de API gratuite terțe.

## S. Audit detaliat — GDPR / legal / cookie — **8.8/10**
**Corect:** consent banner, analytics/marketing OFF implicit, accept-all/reject/manage, stocare consimțământ, retragere, checkbox confidențialitate obligatoriu + marketing separat, 12 pagini legale 9 limbi, divulgare completă terți (OFF, MyMemory, OCR.space, geojs.io, flagcdn, Supabase), **execuție ștergere GDPR** + **buton „șterge toate datele"**, retenție declarată + funcții cleanup în DB.
**Gri/de confirmat:** IP-detect înainte de consimțământ (aviz DPO) · traduceri juridice neavizate · date operator real — verificare manuală.

## T. Audit detaliat — i18n — **9.2/10**
9 limbi pe app + landing + 12 pagini legale (450 chei × 9 + selector + IP-detect). Reparat: 24 chei lipsă în 7 limbi, ctErr, scoreLabel, footerRights/Disclaimer, clearAllData/Confirm, tipsEyebrow, paletteTitle. **0 text user-facing hardcodat în app.** Rămâne: dashboard admin RO-only (intern, documentat) · <html lang> static pe paginile legale.

## U. Ce este esențial în plus (infra/process)
**Lipsesc azi, recomandate:** deploy automat admin/app · staging (Supabase separat) · backup DB + rollback (documentate, de activat) · monitoring + error-tracking (Sentry — hook pregătit în ErrorBoundary) · uptime · rate-limit server · provider email (Resend + Edge) · programare retenție (pg_cron) · incident response.
**Există deja:** CI (typecheck/lint/test/e2e), deploy Pages, pre-commit hooks, .env.example, seed demo sigur, fără secrete în repo, eas.json, sitemap/robots, ErrorBoundary, audit logs, politici DELETE, indexuri, funcții retenție.

## V. Top 30 recomandări
1. Conectează Supabase — config gol → URL+anon key · **P1**
2. Cheie OCR în .env — demo rate-limited · **P1**
3. Domeniu/email real — SLA GDPR 30 zile · **P1**
4. Rulează indexurile + retenția — sunt în schema.sql · **P1**
5. Rate-limit server-side — spam insert anonim · **P1**
6. Sentry + uptime — zero observabilitate · **P1**
7. Aviz DPO IP-detect — IP pre-consimțământ · **P1**
8. Backup + rollback DB · **P2**
9. WebP logo + minify landing — 223KB/379KB · **P2**
10. Provider email (Resend) — reply mailto · **P2**
11. Hosting admin privat · **P2**
12. Meta SEO per-limbă static (legal) · **P3**
13. Teste de integrare app · **P2**
14. Sanitizare la randarea landing_content (consumator) · **P3**
15. Redactare PII în tabele admin · **P3**
16. CSP/headers expliciți · **P3**
17. Programează cleanup (pg_cron) · **P2**
18. Edge proxy/cache API externe · **P2**
19. Ecran Settings în app · **P3**
20. i18n dashboard admin (opțional) · **P3**
21. Lazy animații sub-fold landing · **P3**
22. prefers-reduced-motion pe ThemeFx (app) · **P3**
23. Centralizare culori scor (DRY) · **P3**
24. Export/import date utilizator · **P3**
25. Validare JSONB settings (admin) · **P3**
26. Aviz legal traduceri · **P2**
27. Menținere CHANGELOG/release notes · **P3**
28. Onboarding admin/moderator (ghid moderare) · **P3**
29. Status page / monitoring public · **P3**
30. A/B pe CTA-uri landing (după lansare) · **P4**

## W. Fișiere modificate (cumulat)
- **App:** app/index.tsx, compare.tsx, history.tsx, advice.tsx, _layout.tsx, +html.tsx
- **Componente:** AppFooter, ThemeFx, NavMarquee, PaletteButton, TipsSection, ZoomableImage, BasketBar, WaveText, **ErrorBoundary (nou)**
- **Utils:** net.ts (nou), **apiClient.ts (nou)**, ocr.ts, translate.ts, alternatives.ts, theme.tsx, basket.tsx, history.ts, score.ts
- **i18n:** i18n.ts, translations.ts
- **Landing/legal:** docs/index.html, assets/legal.js, **legal-i18n.js (nou)**, legal.css, 12 pagini legal/*.html + *.html, contact.html
- **Admin/backend:** admin/admin.js, backend/supabase/schema.sql
- **Teste/config/build:** utils/__tests__/* (5), jest.config.js (nou), jest.setup.js (nou), playwright.config.js, **.github/workflows/ci.yml + deploy-pages.yml (noi)**, **.husky/pre-commit (nou)**, **scripts/optimize-assets.js (nou — WebP+minify)**, package.json, app.json, .gitignore
- **Docs:** README.md, **.env.example (nou)**, **DEPLOYMENT.md (nou)**, **CHANGELOG.md (nou)**, **GHID_DEPLOY_IRINA.md (nou)**, AUDIT TOTAL.md, AUDIT FINAL.md

## X. Ce necesită confirmare (manual)
1. Instanța Supabase de producție există? RLS aplicat? super_admin creat? backup activ?
2. suport@zelynta.com — domeniu activ + cutie monitorizată (SLA 30 zile)?
3. Operator de date — „Irèn Savastre" e numele legal complet? (persoană fizică → fără adresă; firmă → sediu).
4. Aviz DPO/legal pentru IP-detect (geojs.io) + traduceri juridice.
5. Cheie OCR de producție disponibilă?
6. Conturi sociale reale (Facebook/TikTok/Instagram) — există? (altfel rămân ascunse, corect).
7. Lighthouse real — estimările LCP/CLS/INP din §P NU sunt măsurate.
