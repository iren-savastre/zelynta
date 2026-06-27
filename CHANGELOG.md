# Changelog — Zelynta

Toate modificările notabile ale proiectului. Format bazat pe [Keep a Changelog](https://keepachangelog.com/),
versionare [SemVer](https://semver.org/).

## [Unreleased] — pregătire lansare

### Adăugat
- Detecție automată a limbii după IP (app + landing + pagini legale), fallback engleză.
- Pagini legale (12) traduse integral în 9 limbi, cu selector de limbă și disclaimer „RO oficial".
- Teste unitare (Jest/jest-expo) pentru scoring, detecție palmier și traducere.
- CI (GitHub Actions): typecheck, lint, teste unitare, e2e (Playwright, admin demo).
- Deploy automat al landing-ului pe GitHub Pages (workflow dedicat).
- Execuție „dreptul de a fi uitat" (GDPR) în admin: ștergerea datelor personale asociate unui e-mail + audit.
- Buton „Șterge toate datele" în aplicație (control GDPR utilizator).
- Audit DB extins: triggere pentru schimbări de rol, settings, CMS, tichete, raportări, cereri GDPR.
- ErrorBoundary global în aplicație (fallback prietenos + reload).
- Anti-spam: cooldown client-side pe toate formularele publice.
- Stare de încărcare premium (spinner + skeleton) la alternative.
- Documentație: `DEPLOYMENT.md` (runbook), `.env.example`, `AUDIT TOTAL.md`.

### Reparat
- 24 de chei i18n existau doar în RO+EN → adăugate în fr/it/es/de/ru/pl/nl (aplicația nu mai cade pe engleză).
- SEO meta (title/description/OG/Twitter) acum dinamic per limbă pe landing.
- Texte provizorii/placeholder eliminate și rescrise conform GDPR și realității aplicației.
- Robustețe rețea: verificare status HTTP + timeout (AbortController) pe toate apelurile externe.
- Obiect randat ca element React în panoul de zoom; dark mode neutru/tematic; scroll dublu; footer full-width.
- Confirmări la acțiunile de moderare distructive în admin.

### Securitate
- Cheia OCR citită din mediu (`EXPO_PUBLIC_OCR_KEY`), cu avertisment în dev pentru cheia demo.
- Eliminat e-mailul personal din User-Agent-ul cererilor către API-uri externe.
- Politici DELETE (RLS) pentru admin/super_admin, necesare execuției ștergerii GDPR.

---

> Pentru detalii complete și starea curentă, vezi `AUDIT TOTAL.md` și `AUDIT FINAL.md`.
