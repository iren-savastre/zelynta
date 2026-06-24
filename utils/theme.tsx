import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  inputBg: string;
  navbarBg: string;
  glassBg: string;
  glassBorder: string;
  overlay: string;
  isDark: boolean;
};

const light: ThemeColors = {
  bg: "#F7F7F2",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F0F0",
  border: "#DDD",
  text: "#222222",
  textMuted: "#666666",
  textFaint: "#999999",
  primary: "#2E7D32",
  inputBg: "#FFFFFF",
  navbarBg: "#FFFFFF",
  glassBg: "rgba(255,255,255,0.55)",
  glassBorder: "rgba(255,255,255,0.65)",
  overlay: "rgba(0,0,0,0.3)",
  isDark: false,
};

const dark: ThemeColors = {
  bg: "#0F1511",
  surface: "#1A211C",
  surfaceAlt: "#232B25",
  border: "#2E382F",
  text: "#ECF1EC",
  textMuted: "#A5B0A6",
  textFaint: "#7A847B",
  primary: "#5BBd62",
  inputBg: "#1A211C",
  navbarBg: "#161D18",
  glassBg: "rgba(30,40,32,0.55)",
  glassBorder: "rgba(120,140,122,0.25)",
  overlay: "rgba(0,0,0,0.55)",
  isDark: true,
};

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  colors: ThemeColors;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  colors: light,
  mode: "system",
  setMode: () => {},
  toggle: () => {},
});

const KEY = "zelynta_theme_mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") setModeState(v);
    });
  }, []);

  function setMode(m: ThemeMode) {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  }

  const effective = mode === "system" ? (system === "dark" ? "dark" : "light") : mode;
  const colors = effective === "dark" ? dark : light;

  function toggle() {
    setMode(colors.isDark ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ colors, mode, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
