import { Component, type ReactNode } from "react";
import { Platform, Pressable, Text, View } from "react-native";

// Mesaje minimale, bilingve (i18n poate fi exact ce a eșuat) — fallback engleză.
function msgs() {
  let lang = "en";
  try {
    // citim limba salvată fără a depinde de i18n (care poate fi sursa erorii)
    if (typeof navigator !== "undefined" && navigator.language) lang = navigator.language.slice(0, 2);
  } catch {}
  const ro = lang === "ro";
  return {
    title: ro ? "Ceva nu a mers bine" : "Something went wrong",
    body: ro
      ? "A apărut o eroare neașteptată. Poți reîncărca aplicația."
      : "An unexpected error occurred. You can reload the app.",
    btn: ro ? "Reîncarcă" : "Reload",
  };
}

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Hook de logare opțional: dacă există un logger global (ex. setat de un provider
    // de monitorizare), îl folosim; altfel doar consola. Fără PII.
    try {
      const w: any = typeof globalThis !== "undefined" ? globalThis : {};
      if (typeof w.__zelyntaLogError === "function") w.__zelyntaLogError(error);
      else console.error("[Zelynta] Eroare de render:", error);
    } catch {}
  }

  reload = () => {
    if (Platform.OS === "web" && typeof location !== "undefined") {
      location.reload();
    } else {
      this.setState({ hasError: false });
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    const m = msgs();
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 28,
          backgroundColor: "#0f1511",
        }}
      >
        <Text style={{ fontSize: 44, marginBottom: 14 }}>🧩</Text>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#fff", textAlign: "center" }}>
          {m.title}
        </Text>
        <Text
          style={{ fontSize: 15, color: "#9fb3a6", textAlign: "center", marginTop: 8, maxWidth: 320 }}
        >
          {m.body}
        </Text>
        <Pressable
          onPress={this.reload}
          accessibilityRole="button"
          style={{
            marginTop: 22,
            backgroundColor: "#2E7D32",
            paddingVertical: 13,
            paddingHorizontal: 28,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{m.btn}</Text>
        </Pressable>
      </View>
    );
  }
}
