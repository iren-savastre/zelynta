import { Stack } from "expo-router";
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
      </Stack>
      <BasketBar />
      <CookieBanner />
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BasketProvider>
          <StackNav />
        </BasketProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
