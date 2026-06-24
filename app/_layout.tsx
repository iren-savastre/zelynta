import { Stack } from "expo-router";
import "../i18n/i18n";
import { ThemeProvider, useTheme } from "../utils/theme";
import { BasketProvider } from "../utils/basket";
import BasketBar from "../components/BasketBar";

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
          options={{ animation: "slide_from_bottom", animationDuration: 320 }}
        />
        <Stack.Screen
          name="compare"
          options={{ animation: "slide_from_bottom", animationDuration: 320 }}
        />
      </Stack>
      <BasketBar />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <BasketProvider>
        <StackNav />
      </BasketProvider>
    </ThemeProvider>
  );
}
