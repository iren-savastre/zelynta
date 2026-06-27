# Zelynta

**RO** · Zelynta scanează produse (cod de bare sau lista de ingrediente) și îți arată un scor de sănătate, aditivii explicați, avertismente și alternative mai bune — într-o interfață clară, modernă și ușor de folosit. Date din baze deschise, fără cont.

**EN** · Zelynta scans products (barcode or ingredient list) and shows a health score, explained additives, warnings and better alternatives — in a clear, modern and easy-to-use interface. Open data, no account required.

---

## Structură / Structure

- `app/` — aplicația mobilă & web (Expo Router, React Native / react-native-web)
- `components/`, `utils/`, `i18n/` — componente, logică și traduceri (9 limbi)
- `docs/` — landing page și paginile legale (RO)
- `admin/` — panou de administrare (dashboard)

## Rulare / Run

```bash
npm install
npx expo start
```

Din output poți deschide aplicația pe Android, iOS sau în browser (web).

## Tehnologii / Tech

Expo SDK 54 · React Native · expo-router · i18next (9 limbi) · date din Open Food Facts / Open Beauty Facts / Open Products Facts.

## Variabile de mediu / Environment

- `EXPO_PUBLIC_OCR_KEY` — cheie OCR.space pentru recunoașterea textului din imagini (opțional; fără ea se folosește OCR-ul on-device).

---

© 2026 Irèn Savastre — toate drepturile rezervate. · © 2026 Irèn Savastre — all rights reserved.
