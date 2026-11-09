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

## Trimiterea ingredientelor în Open Food Facts / Open Beauty Facts

Când un produs nu e găsit, utilizatorul fotografiază eticheta și poate trimite
rezultatul în baza publică, ca următorul care scanează produsul să-l găsească gata analizat.
Trimiterea trece prin funcția `off-contribute` de pe server, care ține **parola contului
Open Food Facts doar ca secret Supabase**, deci ea nu ajunge niciodată în aplicație.

Pași (o singură dată):

1. **SQL Editor** → rulează [`off-contribute.sql`](./off-contribute.sql) (creează tabelul pentru limitarea trimiterilor).
2. **Edge Functions → Secrets** → adaugă:
   - `OFF_USER` = numele de utilizator al contului Open Food Facts (user_id, nu emailul)
   - `OFF_PASSWORD` = parola acelui cont
   - `CONTRIB_SALT` = un text lung și aleator (ex. 40 de caractere amestecate; nu trebuie ținut minte)
3. **Edge Functions → Deploy a new function → Via Editor** → nume `off-contribute` →
   lipește conținutul din [`functions/off-contribute/index.ts`](./functions/off-contribute/index.ts) → *Deploy*.
   (Sau din terminal: `npx supabase functions deploy off-contribute --project-ref <ref>`.)
4. Pune `Project URL` și `anon public key` în [`utils/publicConfig.ts`](../../utils/publicConfig.ts)
   (pentru aplicație), pe lângă `docs/assets/config.js` și `admin/config.js`.

Limite anti-abuz: max. 20 de trimiteri/zi per telefon și 60/zi per rețea.
Telefonul și IP-ul sunt păstrate doar ca hash cu sare, 30 de zile.
Fără pașii de mai sus, butonul „Trimite” din aplicație deschide pagina produsului pe site (adăugare manuală).
