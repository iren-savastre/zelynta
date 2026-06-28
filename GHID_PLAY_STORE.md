# 📱 Ghid: de la cod la Google Play (pas cu pas)

> Salut din nou, Irina! 🙋‍♀️ Acum ducem Zelynta în Google Play. Nu te speria de cuvinte ca „AAB" sau „bundle" — sunt doar niște fișiere și butoane. Mergi pas cu pas, bifează, bea un ceai 🍵. Hai!

---

## 0. De ce ai nevoie (o singură dată)
- **Cont Google Play Developer** — https://play.google.com/console (taxă unică ~25 USD).
- **Cont Expo / EAS** — gratis: https://expo.dev
- **Cheie OCR.space** de producție (nu cea demo) — https://ocr.space/ocrapi
- **Politica de confidențialitate hostată** (URL public) — vezi pasul 4.
- Node instalat pe calculator.

---

## 1. Pune cheia OCR ca „secret" în EAS 🔑
Ca build-ul de producție să folosească cheia ta reală (nu demo), rulează în folderul proiectului:
```bash
npm install -g eas-cli      # o singură dată
eas login                   # te loghezi cu contul Expo
eas secret:create --scope project --name EXPO_PUBLIC_OCR_KEY --value CHEIA_TA_OCR
```
> Așa cheia nu stă în cod, dar build-ul o folosește automat. ✅

---

## 2. Construiește aplicația (AAB) 🏗️
```bash
eas build --platform android --profile production
```
- Durează ~10–20 min (se construiește în cloud-ul Expo).
- La final primești un link de descărcare pentru fișierul **`.aab`** (Android App Bundle) — ăsta e „pachetul" pe care îl urci în Play.
- `app.json`/`eas.json` sunt deja configurate (AAB, fără permisiune audio, rationale cameră, versionare automată).

> 💡 Vrei să testezi întâi pe telefonul tău? Fă un APK de preview: `eas build --platform android --profile preview` → îl instalezi direct pe telefon.

---

## 3. Testează pe un telefon REAL 📲
Înainte de magazin, instalează preview-ul (APK) pe un Android fizic și verifică:
- [ ] Scanare cod de bare (camera pornește, citește)
- [ ] Citire ingrediente din poză (OCR cu cheia reală)
- [ ] Scor, aditivi, comparație, istoric, favorite
- [ ] Schimbarea limbii (inclusiv bg/el)
- [ ] „Șterge toate datele"

---

## 4. Hostează Politica de confidențialitate 🔒 (OBLIGATORIU)
Google **cere** un URL public cu politica de confidențialitate.
- Activează GitHub Pages (Settings → Pages → Source = GitHub Actions) → ai deja paginile legale.
- URL-ul va fi cam: `https://iren-savastre.github.io/zelynta/legal/privacy.html`
- Notează-l, îl pui în Play Console (pasul 6).

---

## 5. Creează aplicația în Play Console 🆕
1. https://play.google.com/console → **Create app**.
2. Nume: **Zelynta** · Limbă implicită: Română (sau Engleză) · Tip: **App** · Gratis.
3. Acceptă declarațiile.

---

## 6. Completează „App content" (formularele) 📋
În meniul **Policy → App content**:
- **Privacy policy:** lipește URL-ul de la pasul 4.
- **Data safety:** completează conform fișierului **`STORE_LISTING.md`** (secțiunea Data Safety) — îți spune exact ce să bifezi.
- **Content rating:** completează chestionarul (răspunsuri „Nu" la violență/conținut sexual etc.) → vei primi PEGI 3 / Everyone.
- **Target audience:** nu pentru copii (general).
- **Ads:** declară că **NU** are reclame.

---

## 7. Pregătește pagina din magazin (Store listing) 🖼️
**Main store listing** — folosește textele din **`STORE_LISTING.md`**:
- Nume scurt + descriere scurtă (80 caractere) + descriere lungă.
- **Iconiță 512×512** (ai `assets/images/icon.png` — exportă la 512×512 dacă nu e).
- **Feature graphic 1024×500** (un banner — îl poți face simplu cu logo + slogan).
- **Screenshot-uri** (minim 2, telefon): fă capturi din app (scanare, rezultat, comparație).
- Categorie: **Health & Fitness** (sau Food & Drink).

---

## 8. Urcă AAB-ul și lansează 🚀
1. **Testing → Internal testing → Create new release**.
2. Urcă fișierul **`.aab`** de la pasul 2.
3. Adaugă note de versiune (ex: „Prima versiune").
4. **Review → Start rollout to Internal testing** → adaugă-te ca tester (email) și testează din Play.
5. Când ești mulțumită: promovează la **Production** (sau Closed/Open testing întâi).

> ⏳ Prima dată, Google verifică aplicația (poate dura **câteva zile – 1 săptămână**). E normal. Răbdare. 🧘

> 💡 Alternativă automată (avansat): `eas submit --platform android` urcă AAB-ul singur (necesită un „service account" Google JSON configurat o dată).

---

## ✅ Checklist final înainte de „Production"
- [ ] Cheia OCR reală pusă ca secret EAS
- [ ] AAB construit și testat pe telefon real
- [ ] URL privacy hostat și pus în Play Console
- [ ] Data Safety completat (vezi STORE_LISTING.md)
- [ ] Content rating obținut
- [ ] Listing complet (descriere + iconiță + feature graphic + 2+ screenshot-uri)
- [ ] Versiune testată pe Internal testing track

---

Gata! 🏆 După aprobare, Zelynta e în Google Play, gata să ajute oameni să înțeleagă ce mănâncă. Mândrie maximă. 💚

*Detalii tehnice complete (web, admin, Supabase) sunt în `DEPLOYMENT.md`. Texte de listing + Data Safety în `STORE_LISTING.md`.*
