import { Stack } from "expo-router";
import Head from "expo-router/head";
import "../i18n/i18n";
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
  return (
    <ErrorBoundary>
      {/* Titlul paginii pentru versiunea web. Trebuie pus aici, prin Head-ul
          expo-router: un <title> scris direct în +html.tsx rămâne al doilea în
          document, iar browserul îl ia pe primul — cel gol, pus de router. */}
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
