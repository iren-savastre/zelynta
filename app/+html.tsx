import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

// Documentul HTML root pentru versiunea web (randare statică).
// Aici fixăm viewport-ul ca aplicația să se încadreze corect pe telefon.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ro">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Încadrare mobilă: lățime = ecranul, fără pinch-zoom, fără pan */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#2E7D32" />
        {/* PWA: instalabilă + funcțională offline */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Zelynta" />
        <meta name="application-name" content="Zelynta" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: globalCss }} />
        <script dangerouslySetInnerHTML={{ __html: swRegister }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

// Înregistrează service worker-ul (PWA offline). Rulează doar în browser, pe context sigur.
const swRegister = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
`;

const globalCss = `
html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
}
body {
  overflow-x: hidden;
  overscroll-behavior: none;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
#root {
  display: flex;
  flex-direction: column;
  max-width: 100vw;
  overflow-x: hidden;
}
* {
  -webkit-tap-highlight-color: transparent;
  box-sizing: border-box;
}
/* ===== bară de scroll personalizată (web) — urmează tema ===== */
:root {
  --zscroll-1: #85BB2F;
  --zscroll-2: #2E7D32;
  --zscroll-track: rgba(120,120,130,0.08);
}
* {
  scrollbar-width: thin;
  scrollbar-color: var(--zscroll-2) transparent;
}
::-webkit-scrollbar {
  width: 11px;
  height: 11px;
}
::-webkit-scrollbar-track {
  background: var(--zscroll-track);
  border-radius: 999px;
}
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--zscroll-1), var(--zscroll-2));
  border-radius: 999px;
  border: 3px solid transparent;
  background-clip: padding-box;
  transition: background .2s;
}
::-webkit-scrollbar-thumb:hover {
  border-width: 2px;
  background-clip: padding-box;
}
::-webkit-scrollbar-corner {
  background: transparent;
}
`;
