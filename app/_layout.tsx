import { Stack } from "expo-router";
import Head from "expo-router/head";
import { useEffect } from "react";
import { resolveAppLanguage } from "../i18n/i18n";
import { ThemeProvider, useTheme } from "../utils/theme";
import { BasketProvider } from "../utils/basket";
import BasketBar from "../components/BasketBar";
import CookieBanner from "../components/CookieBanner";
import ErrorBoundary from "../components/ErrorBoundary";

function StackNav() {
  const { colors } = useTheme();
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 280,
          gestureEnabled: true,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ animation: "none" }} />
        <Stack.Screen
          name="history"
          options={{
            // Istoricul se aseaza PESTE aplicatie (panou glisant de jos),
            // nu ca pagina separata — ecranul din spate ramane vizibil.
            // History sits OVER the app (a bottom sliding panel),
            // not as a separate page — the screen behind stays visible.
            presentation: "transparentModal",
            animation: "slide_from_bottom",
            animationDuration: 320,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="compare"
          options={{ animation: "slide_from_bottom", animationDuration: 320 }}
        />
        <Stack.Screen
          name="advice"
          options={{ animation: "slide_from_right", animationDuration: 320 }}
        />
        <Stack.Screen
          name="contribute"
          options={{ animation: "slide_from_bottom", animationDuration: 320 }}
        />
      </Stack>
      <BasketBar />
      <CookieBanner />
    </>
  );
}

export default function RootLayout() {
  // Limba se stabilește DUPĂ montare, nu la import. Pe web, prima randare
  // trebuie să fie identică cu HTML-ul venit de la server (vezi i18n.ts);
  // dacă am schimba limba mai devreme, React ar găsi alt text decât aștepta.
  // The language is resolved AFTER mounting, not at import time. On web, the
  // first render must match the HTML that came from the server exactly (see
  // i18n.ts); if we changed the language earlier, React would find text different from what it expected.
  useEffect(() => {
    resolveAppLanguage();
  }, []);

  return (
    <ErrorBoundary>
      {/* Titlul paginii pentru versiunea web. Trebuie pus aici, prin Head-ul
          expo-router: un <title> scris direct în +html.tsx rămâne al doilea în
          document, iar browserul îl ia pe primul — cel gol, pus de router. */}
      {/* The page title for the web version. Must be set here, through
          expo-router's Head: a <title> written directly in +html.tsx ends up
          second in the document, and the browser picks the first one — the
          empty one the router put there. */}
      <Head>
        <title>Zelynta — scanează produse, înțelege etichetele</title>
        <meta
          name="description"
          content="Scanezi un produs și afli scorul de sănătate, aditivii explicați, avertismentele și alternative mai bune. Fără cont, datele rămân la tine."
        />
      </Head>
      <ThemeProvider>
        <BasketProvider>
          <StackNav />
        </BasketProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
