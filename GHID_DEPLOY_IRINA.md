# 🚀 Ghidul lui Irina: cum dai drumul la Zelynta în lume

> **Intro (citește-l, e scurt și amuzant):**
> Salut, Irina! 👋 Felicitări — ai în mâini o aplicație pe bune: scanezi un produs, îți spune dacă te iubește sau te minte. Acum urmează partea „înfricoșătoare": **deploy-ul**. Vestea bună? Nu trebuie să fii hacker în hanorac cu glugă într-o pivniță întunecată. 🧑‍💻🕶️
> Tot ce ai de făcut e să copiezi niște chei dintr-un loc în altul, ca atunci când muți cheile de la o geantă la alta. Dacă te blochezi, respiri, bei un ceai 🍵 și o iei de la pasul anterior. Nimic din ce faci aici nu explodează. (Probabil.) Hai!

---

## Ce vom „lansa" (ca să știi harta)

| Ce | Unde ajunge | Greutate |
|---|---|---|
| 🌐 Landing + pagini legale (`docs/`) | GitHub Pages (gratis) | ⭐ ușor |
| 🗄️ Backendul (baza de date) | Supabase (gratis la start) | ⭐⭐ mediu |
| 🛡️ Dashboard admin (`admin/`) | un host privat | ⭐⭐ mediu |
| 📱 Aplicația (Android/iOS) | EAS → magazine | ⭐⭐⭐ mai târziu |

> Sfat: fă pașii **în ordine**. Bifează-i pe rând. Nu sări la „aplicația în magazin" până nu merge restul. 🐢

---

## 🧰 De ce ai nevoie (pregătește-le o dată)
- Un cont **GitHub** (probabil ai deja — acolo stă codul).
- Un cont **Supabase** (gratis): https://supabase.com
- O cheie **OCR.space** gratuită: https://ocr.space/ocrapi (durează 2 minute).
- Un **e-mail real** pentru suport (ex. `suport@zelynta.com`) pe care chiar îl citești.
- Node instalat (pentru build-uri) — dar pentru landing nici nu-ți trebuie.

---

## PASUL 1 — Baza de date (Supabase) 🗄️
Aici „construim sertarele" în care stau recenziile, mesajele etc.

1. Intră pe https://supabase.com → **New project**. Alege un nume (ex. `zelynta`) și o parolă de bază de date (salveaz-o!).
2. În stânga: **SQL Editor** → **New query**.
3. Deschide fișierul `backend/supabase/schema.sql` din proiect, **copiază tot**, lipește în editor, apasă **Run** ▶️.
   - Dacă apare verde „Success" → 🎉 sertarele sunt gata (tabele, reguli, indexuri).
4. Fă-te tu șefă (super admin):
   - **Authentication** → **Add user** → pune e-mailul tău + o parolă.
   - Apoi **SQL Editor** → rulează (înlocuiește e-mailul):
     ```sql
     update public.profiles set role='super_admin' where email='emailul_tau@exemplu.com';
     ```
5. Ia cheile: **Settings** → **API**. Copiază **Project URL** și **anon public key**. (Pe astea le lipim la pasul 3.)
   - ⚠️ Cheia **`service_role` NU se folosește niciodată** în site/admin. E ca PIN-ul de la card — rămâne secretă.

---

## PASUL 2 — Cheia OCR 🔑
1. Intră pe https://ocr.space/ocrapi → ia o cheie gratuită (îți vine pe e-mail).
2. Creează un fișier `.env` în proiect (copiază `.env.example`) și pune:
   ```
   EXPO_PUBLIC_OCR_KEY=cheia_ta_de_la_ocrspace
   ```
   (Asta e doar pentru aplicație. Landing-ul nu are nevoie de ea.)

---

## PASUL 3 — Lipește cheile Supabase 🔌
Completează cele **două** fișiere de config cu URL + anon key de la Pasul 1:
- `docs/assets/config.js` →
  ```js
  window.ZELYNTA_SUPABASE = { url: "URL-UL_TĂU", anonKey: "ANON_KEY-UL_TĂU" };
  ```
- `admin/config.js` → la fel (`url`, `anonKey`).

> Dacă lași gol → site-ul merge tot (formularele trimit pe e-mail prin „mailto"), dar recenziile și dashboard-ul real nu se conectează. Cu cheile puse → totul prinde viață. ✨

---

## PASUL 4 — Publică landing-ul 🌐 (partea ușoară, promit)
1. Pune codul pe GitHub (dacă nu e deja). 
2. Pe GitHub: **Settings** → **Pages** → **Source = GitHub Actions**.
3. Gata. La fiecare modificare în `docs/`, se publică **automat** (există deja un „roboțel" — `.github/workflows/deploy-pages.yml`).
4. Adresa va fi cam: `https://NUMELE-TĂU.github.io/zelynta/`. Deschide-o și **bucură-te** 🥳.
   - Test rapid: schimbă limba din colțul dreapta-sus, deschide „Preferințe cookie", trimite-ți un mesaj de test.

---

## PASUL 5 — Dashboard-ul admin 🛡️
- Pune folderul `admin/` pe un host **privat** (Netlify / Vercel / Cloudflare Pages — toate au plan gratis).
- Intri cu e-mailul + parola create la Pasul 1.4. Acolo moderezi recenzii, vezi mesaje, rezolvi cereri GDPR.
- 💡 Vrei doar să vezi cum arată, fără backend? Deschide `admin/index.html?demo=1` — date fictive, parola `demo`. (NU folosi modul demo în producție.)

---

## PASUL 6 — Aplicația în magazine 📱 (poate aștepta!)
Asta o lași la final, după ce landing + admin merg.
```bash
npx eas build --platform android --profile production
npx eas submit --platform android
```
(Pentru iOS la fel, cu `--platform ios`.) Pune `EXPO_PUBLIC_OCR_KEY` în setările EAS.
> Nu te grăbi aici — magazinele cer răbdare și ceva acte. Respiră. 🧘

---

## ✅ Bifează înainte să spui „GATA"
- [ ] Schema rulată în Supabase, tu = super_admin, backup activat (Database → Backups)
- [ ] Cheia OCR pusă în `.env`
- [ ] `config.js` (docs + admin) completate cu URL + anon key
- [ ] `suport@zelynta.com` chiar îl citești (la GDPR ai 30 de zile să răspunzi)
- [ ] Landing deschis și testat în câteva limbi
- [ ] Admin: te loghezi, aprobi o recenzie de test, vezi că apare pe site
- [ ] (Opțional, dar frumos) logo comprimat în WebP — vezi `DEPLOYMENT.md`

---

## 😵‍💫 Dacă ceva nu merge (ghid anti-panică)
- **„Nu apar recenziile"** → ai pus cheile în `config.js`? Ai rulat `schema.sql`? Recenzia trebuie **aprobată** din admin ca să apară public.
- **„Formularul nu trimite"** → fără Supabase, deschide aplicația de e-mail (normal). Cu Supabase, verifică cheile.
- **„Pagina e goală pe GitHub Pages"** → ai pus Source = GitHub Actions? Așteaptă 1–2 min după push.
- **„OCR-ul dă eroare"** → ai pus cheia ta, nu pe cea demo `helloworld`?
- **Orice altceva** → respiră, citește din nou pasul, și verifică `DEPLOYMENT.md` (versiunea „tehnică" a acestui ghid).

---

Ai reușit. Serios. 🏆 Zelynta e acum în lume, ajută oameni să înțeleagă ce mănâncă, și tu ai făcut asta posibilă. Mândrie maximă. 💚

*P.S. Detaliile tehnice complete (staging, rollback, monitoring) sunt în `DEPLOYMENT.md`. Acest ghid e versiunea „cu inimă".*
