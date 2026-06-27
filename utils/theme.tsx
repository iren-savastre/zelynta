import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

// amestecă culoarea `hex` peste `base` în proporția `t` (0..1). Doar pentru tente de fundal.
export function mixHex(hex: string, t: number, base: string): string {
  const p = (h: string) => {
    const s = h.replace("#", "");
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = p(hex);
  const [r2, g2, b2] = p(base);
  const m = (a: number, b: number) => Math.round(b + (a - b) * t);
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(m(r1, r2))}${h(m(g1, g2))}${h(m(b1, b2))}`;
}

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
  bg: "#101013",
  surface: "#1A1A1E",
  surfaceAlt: "#26262C",
  border: "#34343C",
  text: "#ECECF0",
  textMuted: "#A6A6AE",
  textFaint: "#76767F",
  primary: "#5BBd62",
  inputBg: "#1A1A1E",
  navbarBg: "#161619",
  glassBg: "rgba(28,28,33,0.55)",
  glassBorder: "rgba(140,140,152,0.22)",
  overlay: "rgba(0,0,0,0.58)",
  isDark: true,
};

export type ThemeMode = "system" | "light" | "dark";

// Palete de culoare (identice cu landing page-ul) — schimbă doar accentul (primary).
export type Palette = { id: string; label: string; emoji: string; primary: string; primaryDark: string };
export const PALETTES: Palette[] = [
  { id: "default", label: "Verde clasic", emoji: "🌱", primary: "#2E7D32", primaryDark: "#5BBD62" },
  { id: "mint", label: "Mentă", emoji: "🍃", primary: "#0d9488", primaryDark: "#2dd4bf" },
  { id: "sage", label: "Salvie", emoji: "🌿", primary: "#5f8a5f", primaryDark: "#8bbf8b" },
  { id: "eucalyptus", label: "Eucalipt", emoji: "🪴", primary: "#3a9d92", primaryDark: "#5cc6ba" },
  { id: "rosemary", label: "Rozmarin", emoji: "🌾", primary: "#157f6b", primaryDark: "#2bb89c" },
  { id: "lavender", label: "Lavandă", emoji: "🪻", primary: "#7c3aed", primaryDark: "#a78bfa" },
  { id: "chamomile", label: "Mușețel", emoji: "🌼", primary: "#c9a227", primaryDark: "#e6c34a" },
  { id: "ginger", label: "Ghimbir", emoji: "🫚", primary: "#c2620e", primaryDark: "#e8893a" },
  { id: "lemon", label: "Lămâie", emoji: "🍋", primary: "#ca8a04", primaryDark: "#eab308" },
  { id: "orange", label: "Portocală", emoji: "🍊", primary: "#ea580c", primaryDark: "#fb7c3c" },
  { id: "peach", label: "Piersică", emoji: "🍑", primary: "#f97316", primaryDark: "#fb923c" },
  { id: "raspberry", label: "Zmeură", emoji: "🍓", primary: "#be123c", primaryDark: "#f43f5e" },
  { id: "blueberry", label: "Afine", emoji: "🫐", primary: "#4338ca", primaryDark: "#818cf8" },
  { id: "blackberry", label: "Mure", emoji: "🍇", primary: "#6b21a8", primaryDark: "#a855f7" },
  { id: "pomegranate", label: "Rodie", emoji: "🍎", primary: "#9f1239", primaryDark: "#fb6f8e" },
];

type ThemeContextValue = {
  colors: ThemeColors;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
  palette: string;
  setPalette: (id: string) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  colors: light,
  mode: "system",
  setMode: () => {},
  toggle: () => {},
  palette: "default",
  setPalette: () => {},
});

const KEY = "zelynta_theme_mode";
const PKEY = "zelynta_palette";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [palette, setPaletteState] = useState<string>("default");

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === "light" || v === "dark" || v === "system") setModeState(v);
      })
      .catch(() => {});
    AsyncStorage.getItem(PKEY)
      .then((v) => {
        if (v && PALETTES.some((p) => p.id === v)) setPaletteState(v);
      })
      .catch(() => {});
  }, []);

  function setMode(m: ThemeMode) {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  }

  function setPalette(id: string) {
    setPaletteState(id);
    AsyncStorage.setItem(PKEY, id).catch(() => {});
  }

  const effective = mode === "system" ? (system === "dark" ? "dark" : "light") : mode;
  const base = effective === "dark" ? dark : light;
  const pal = PALETTES.find((p) => p.id === palette) || PALETTES[0];

  let colors: ThemeColors;
  if (pal.id === "default") {
    colors = { ...base, primary: base.isDark ? pal.primaryDark : pal.primary };
  } else if (base.isDark) {
    // dark: tentă subtilă din paletă pe fundaluri + accent
    const a = pal.primaryDark;
    colors = {
      ...base,
      primary: a,
      bg: mixHex(a, 0.05, "#101013"),
      surface: mixHex(a, 0.06, "#1A1A1E"),
      surfaceAlt: mixHex(a, 0.09, "#26262C"),
      navbarBg: mixHex(a, 0.07, "#161619"),
      border: mixHex(a, 0.16, "#34343C"),
      inputBg: mixHex(a, 0.06, "#1A1A1E"),
    };
  } else {
    // light: fundaluri tentate cu culoarea paletei (ca pe landing)
    const a = pal.primary;
    colors = {
      ...base,
      primary: a,
      bg: mixHex(a, 0.08, "#FFFFFF"),
      surface: mixHex(a, 0.03, "#FFFFFF"),
      surfaceAlt: mixHex(a, 0.1, "#FFFFFF"),
      navbarBg: mixHex(a, 0.04, "#FFFFFF"),
      border: mixHex(a, 0.22, "#DDDDDD"),
      inputBg: "#FFFFFF",
    };
  }

  // bara de scroll (web) urmează culoarea paletei
  useEffect(() => {
    if (typeof document !== "undefined" && document.documentElement) {
      const root = document.documentElement.style;
      root.setProperty("--zscroll-1", mixHex(colors.primary, 0.55, "#ffffff"));
      root.setProperty("--zscroll-2", colors.primary);
    }
  }, [colors.primary]);

  function toggle() {
    setMode(colors.isDark ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ colors, mode, setMode, toggle, palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
