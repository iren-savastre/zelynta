# Zelynta — Backend (Supabase) · setup

Backend real pentru recenzii, contact, suport, raportări, cereri GDPR, analytics agregat și un dashboard de moderare cu RBAC. Securitatea e impusă de **Row-Level Security** la nivel de bază de date.

## Pași (o singură dată)

1. **Creează un proiect** pe https://supabase.com (free tier e suficient pentru început).
2. În **SQL Editor** → rulează tot conținutul din [`schema.sql`](./schema.sql).
3. **Creează contul tău de admin:** Authentication → Users → *Add user* (email + parolă).
4. Tot în SQL Editor, **promovează-te super_admin** (înlocuiește emailul):
   ```sql
   update public.profiles set role='super_admin' where email='emailul_tau@exemplu.com';
   ```
5. **Ia cheile publice:** Project Settings → API → copiază `Project URL` și `anon public key`.
6. **Lipește-le în 2 locuri** (sunt chei publice, sigure pentru client — securitatea e în RLS):
   - Site public: [`docs/assets/config.js`](../../docs/assets/config.js)
   - Dashboard admin: [`admin/config.js`](../../admin/config.js)

## Ce devine real după setup
- **Recenziile** trimise de pe site se salvează ca `pending` și apar pe landing **doar după aprobare**.
- **Contact / Suport / Raportări / Cereri GDPR** ajung în dashboard (nu doar pe e-mail).
- **Analytics** agregat (eveniment + dispozitiv/OS/browser/limbă, fără IP, doar cu consimțământ).
- **Dashboard-ul admin** (`/admin`) permite moderare cu roluri + audit log.

## Roluri (RBAC)
`super_admin`, `admin`, `moderator`, `support`, `content_manager`, `analyst`, `readonly`.
Setezi rolul unui user din SQL: `update public.profiles set role='moderator' where email='...';`

## Hosting
- **Site public** (`docs/`) — rămâne pe GitHub Pages.
- **Dashboard admin** (`admin/`) — îl poți pune pe **Netlify/Vercel** (drag & drop folderul `admin/`) sau orice hosting static. Login-ul + permisiunile sunt impuse de Supabase (server-side), deci e sigur și ca SPA static.

## Privacy / GDPR
- Fără IP brut, fără localizare precisă. `country` se completează doar dacă adaugi o Edge Function care îl derivă din header CDN (recomandare, opțional).
- Evenimentele analytics se trimit **doar dacă** utilizatorul a acceptat categoria *Analytics* în cookie consent.
- Documentează în Politica de confidențialitate ce colectezi (deja pregătit, de actualizat cu „analytics agregat" când îl activezi).

## Adăugarea produselor lipsă în Open Food Facts / Open Beauty Facts (`off-contribute`)

Ecranul „Adaugă produsul” din aplicație (`app/contribute.tsx`) trimite produsul la funcția
[`functions/off-contribute`](./functions/off-contribute/index.ts). Funcția ține **parola contului
Open Food Facts doar ca secret Supabase** (nu ajunge niciodată în aplicație), verifică datele, limitează
trimiterile și trimite produsul în Open Food Facts (alimente) sau Open Beauty Facts (cosmetice, parfumuri).
Același cont Open Food Facts merge pe ambele.

Pași (o singură dată):

1. **SQL Editor** → rulează [`off-contribute.sql`](./off-contribute.sql) (tabelul pentru limitarea trimiterilor).
2. **Edge Functions → Secrets** → adaugă:
   - `OFF_USER` = numele de utilizator al contului Open Food Facts al aplicației (user_id, nu emailul)
   - `OFF_PASSWORD` = parola acelui cont
   - `CONTRIB_SALT` = un text lung și aleator (ex. 40 de caractere amestecate; nu trebuie ținut minte)
3. **Edge Functions → Deploy a new function → Via Editor** → nume `off-contribute` → lipește
   conținutul din `functions/off-contribute/index.ts` → **oprește „Verify JWT”** (aplicația nu trimite
   token Supabase) → *Deploy*.
   Din terminal: `npx supabase functions deploy off-contribute --no-verify-jwt --project-ref <ref>`.
4. În aplicație, pune adresa funcției în `.env` (și în variabilele EAS pentru build):
   `EXPO_PUBLIC_CONTRIB_URL=https://<ref>.supabase.co/functions/v1/off-contribute`
   Fără ea, funcția de contribuție rămâne oprită și butonul deschide Open Food Facts în browser.

Limite anti-abuz: max. 20 de trimiteri/zi per instalare și 60/zi per rețea.
Instalarea și IP-ul sunt păstrate doar ca hash cu sare, 30 de zile.
