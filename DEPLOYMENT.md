# Zelynta — Runbook de deployment & lansare

Ghid practic pentru a duce Zelynta în producție: landing, pagini legale, admin dashboard și aplicația mobilă/web. RO principal, termeni tehnici în engleză.

---

## 0. Componente & unde rulează

| Componentă | Sursă | Hosting recomandat |
|---|---|---|
| Landing + pagini legale | `docs/` | **GitHub Pages** (workflow `deploy-pages.yml`) |
| Admin / Moderator dashboard | `admin/` | Hosting static privat (Netlify/Vercel/Cloudflare Pages), **acces restrâns** |
| Backend (DB, auth, RLS) | `backend/supabase/schema.sql` | **Supabase** (proiect dedicat) |
| Aplicație (Android/iOS/web) | `app/`, `components/`, `utils/` | **EAS Build** → Play Store / App Store; web → static host |

---

## 1. Prerechizite

- Node 20+, npm.
- Cont **Supabase** (free tier suficient pentru start).
- Cont **Expo / EAS** pentru build-uri mobile.
- Cheie **OCR.space** de producție (https://ocr.space/ocrapi).
- Domeniu + cutie poștală pentru **suport@zelynta.com** (sau alt e-mail real, monitorizat — SLA GDPR 30 zile).

---

## 2. Variabile de mediu

Copiază `.env.example` → `.env` și completează:

```
EXPO_PUBLIC_OCR_KEY=<cheia ta OCR.space>
```

Pentru **landing** și **admin**, completează cheile publice Supabase în fișierele de config (NU service_role):
- `docs/assets/config.js` → `window.ZELYNTA_SUPABASE = { url, anonKey }`
- `admin/config.js` → `url`, `anonKey`

> ⚠️ Doar **anon key** (publică, protejată de RLS). NICIODATĂ `service_role` în client.

---

## 3. Backend Supabase (o singură dată)

1. Creează un proiect Supabase nou.
2. SQL Editor → rulează integral `backend/supabase/schema.sql` (creează tabele, RLS, roluri, triggere de audit, politici DELETE).
3. Creează primul utilizator admin: Authentication → Add user (email + parolă).
4. SQL: promovează-l la super_admin:
   ```sql
   update public.profiles set role = 'super_admin' where email = 'admin@zelynta.com';
   ```
5. Copiază **Project URL** + **anon key** (Settings → API) în config-urile de la pasul 2.
6. (Recomandat) Activează backup-urile zilnice (Supabase → Database → Backups).

---

## 4. Deploy landing + pagini legale (GitHub Pages)

- Settings → Pages → **Source = GitHub Actions**.
- La push pe `main` cu modificări în `docs/`, workflow-ul `deploy-pages.yml` publică automat.
- Verifică `https://<user>.github.io/zelynta/` (sau domeniul custom).
- După deploy: testează selectorul de limbă, cookie consent, formular contact/recenzii (Supabase), linkurile legale.

## 5. Deploy admin dashboard

- Hostează `admin/` pe un host static **privat** (Netlify/Vercel/Cloudflare Pages) — NU pe același domeniu public dacă vrei acces restrâns.
- Protejează accesul: autentificarea reală e Supabase Auth + RLS; suplimentar, poți pune Access/Basic-Auth la nivel de host.
- `?demo=1` rămâne disponibil doar pentru preview cu date fictive (nu în producție reală).

## 6. Build & submit aplicația (EAS)

```bash
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
npx eas submit --platform android
npx eas submit --platform ios
```
- Setează `EXPO_PUBLIC_OCR_KEY` în EAS (eas.json → env sau secret).
- Web: `npx expo export -p web` → deploy `dist/` pe host static.

---

## 7. Staging vs Producție

- **Staging:** un proiect Supabase separat + un branch/preview deploy. Testează aici migrările și fluxurile înainte de producție.
- **Producție:** proiect Supabase dedicat, chei separate, backup activat.
- Nu refolosi datele de staging în producție și invers.

## 8. Backup & rollback

- **DB:** backup zilnic Supabase + export manual înainte de orice migrare (`pg_dump` / Supabase backup).
- **Cod:** fiecare release = tag git (`v1.0.0`). Rollback = redeploy tag-ul anterior.
- **Landing:** GitHub Pages păstrează istoricul commit-urilor; revert + push redeployează.
- **App:** păstrează build-urile EAS anterioare; la nevoie, re-submit versiunea stabilă.

## 9. Monitorizare & error tracking

- App: există un **ErrorBoundary** (`components/ErrorBoundary.tsx`) care prinde erorile de render și oferă reload. Pentru telemetrie reală, setează un logger global `globalThis.__zelyntaLogError = (e) => {...}` (ex. integrare Sentry) — boundary-ul îl folosește automat.
- Recomandat la lansare: **Sentry** (app + landing), **uptime monitor** (UptimeRobot/BetterStack) pe landing + Supabase, alerte pe e-mail.
- Analytics: deja consent-gated pe landing; activează doar cu consimțământ.

## 10. Incident response (schiță)

1. Confirmă impactul (landing? app? admin? DB?).
2. Dacă e regresie de cod: rollback la ultimul tag stabil.
3. Dacă e Supabase: verifică status.supabase.com; restaurează din backup dacă e corupție de date.
4. Comunică pe canalul de suport; loghează incidentul.

---

## 11. Checklist de lansare (Release)

**Înainte de release:**
- [ ] `npm ci && npm run typecheck && npm run lint && npm test` — toate verzi
- [ ] `npm run test:e2e` — verde (admin demo)
- [ ] `EXPO_PUBLIC_OCR_KEY` de producție setată
- [ ] Supabase: schema rulată, super_admin creat, backup activ
- [ ] `config.js` (landing + admin) cu URL + anon key reale
- [ ] `suport@zelynta.com` activ și monitorizat
- [ ] Lighthouse landing: Perf/A11y/SEO ≥ țintele (mobil ≥ 85)
- [ ] WebP logo + minificare landing aplicate (vezi AUDIT TOTAL §Faza 2)
- [ ] Aviz DPO pentru IP-detect (geojs.io) + traduceri juridice
- [ ] Tag git `vX.Y.Z` + CHANGELOG actualizat

**După release:**
- [ ] Smoke test: landing (9 limbi), recenzii/contact, cookie consent
- [ ] App: scanare, OCR, comparație, istoric, „șterge toate datele"
- [ ] Admin: login, moderare (cu confirmare), execuție ștergere GDPR, audit logs
- [ ] Monitorizare activă (uptime + error tracking)
- [ ] Verifică prima cerere GDPR end-to-end

---

*Document menținut de echipa Zelynta. Vezi și `AUDIT TOTAL.md` pentru starea curentă și pașii rămași.*
