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
