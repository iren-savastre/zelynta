import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ThemeFx from "../components/ThemeFx";
import { HEALING } from "../utils/healingContent";
import { PALETTES, useTheme, type ThemeColors } from "../utils/theme";

const isWeb = Platform.OS === "web";
const MAP1 = require("../assets/images/healing-web-1.jpg");
const MAP2 = require("../assets/images/healing-web-2.jpg");
const RATIO = 3168 / 2448;

const DEATHS: [string, number][] = [
  ["Boli de inimă", 614348], ["Cancer", 591699], ["Erori medicale", 251454],
  ["Boli respiratorii", 147101], ["Accidente", 136053], ["AVC", 133103],
  ["Alzheimer", 93541], ["Diabet", 76488], ["Gripă / pneumonie", 55227],
  ["Boli renale", 48146], ["Sinucidere", 42773],
];
const MAXD = 614348;
const CHRONIC: [string, number][] = [
  ["Hipertensiune", 21.9], ["Hiperlipidemie", 18.0], ["Alergii & sinuzite", 13.5],
  ["Artrită", 13.0], ["Tulb. de dispoziție", 10.6], ["Diabet (1 & 2)", 9.5],
  ["Anxietate", 6.7], ["Astm", 6.2], ["Boală coronariană", 5.3],
  ["Tiroidă", 4.0], ["Pulmonar obstructiv", 3.5],
];
const CHAKRAS: [string, string, string][] = [
  ["7", "Coroană", "#8b5cf6"], ["6", "Al treilea ochi", "#4f46e5"],
  ["5", "Gât", "#3b82f6"], ["4", "Inimă", "#22c55e"],
  ["3", "Plex solar", "#eab308"], ["2", "Sacral", "#f97316"], ["1", "Rădăcină", "#ef4444"],
];
const fmtN = (n: number) => n.toLocaleString("ro-RO");

// Legendă scurtă (ro/en; restul cad pe en). Simbolurile sunt universale.
const LEG: Record<string, any> = {
  ro: {
    title: "Cum se citește harta",
    line: "Linie continuă = remediu / asociere",
    arrow: "Săgeți »»» = cauzalitate (X duce la Y)",
    merge: "Romb ◆ = remedii comune mai multor afecțiuni",
    sides:
      "Stânga = „tratează simptomul” (Big Pharma) · Dreapta = „tratează cauza” (holistic) · Centru = indexul de afecțiuni.",
    colors:
      "Culorile sunt doar pentru orientare (ca la metrou) — fiecare e un traseu, nu o categorie.",
  },
  en: {
    title: "How to read the map",
    line: "Solid line = remedy / association",
    arrow: "Arrows »»» = causation (X leads to Y)",
    merge: "Diamond ◆ = remedies shared by several conditions",
    sides:
      "Left = “treat the symptom” (Big Pharma) · Right = “treat the cause” (holistic) · Center = the index of conditions.",
    colors:
      "Colors are only for orientation (like a metro map) — each is a route, not a category.",
  },
};

export default function Healing() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, palette } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const paletteEmoji = (PALETTES.find((p) => p.id === palette) || PALETTES[0]).emoji;
  const { width } = useWindowDimensions();

  const lang = i18n.language;
  const d = HEALING[lang] ?? HEALING.en ?? HEALING.ro;
  const leg = LEG[lang] ?? LEG.en;
  const [zoom, setZoom] = useState<any>(null);

  // animația barelor + bara „secol” (0 -> 1 la intrare)
  const prog = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(prog, { toValue: 1, duration: 1200, delay: 250, useNativeDriver: false }).start();
  }, [prog]);
  const barW = (pct: number) =>
    prog.interpolate({ inputRange: [0, 1], outputRange: ["0%", `${pct}%`] });

  const contentW = Math.min(width, 820) - 36;
  const mapH = contentW / RATIO;
  const paras = (s: string) => String(s).split("\n\n");

  return (
    <View style={styles.root}>
      <ThemeFx emoji={paletteEmoji} />
      <StatusBar style={colors.isDark ? "light" : "dark"} />

      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("back") || "Înapoi"}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          The Healing Web
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={!isWeb}>
        <Text style={styles.eyebrow}>{d.eyebrow}</Text>
        <Text style={styles.h1}>The Healing Web</Text>
        <Text style={styles.lead}>{d.lead}</Text>

        <TouchableOpacity activeOpacity={0.9} onPress={() => setZoom(MAP1)}>
          <Image source={MAP1} style={[styles.map, { width: contentW, height: mapH }]} />
        </TouchableOpacity>
        <Text style={styles.cap}>{leg.title === "How to read the map" ? "Map 1 — The network · tap to zoom" : "Harta 1 — Rețeaua · apasă pentru zoom"}</Text>

        <TouchableOpacity activeOpacity={0.9} onPress={() => setZoom(MAP2)}>
          <Image source={MAP2} style={[styles.map, { width: contentW, height: mapH }]} />
        </TouchableOpacity>
        <Text style={styles.cap}>{leg.title === "How to read the map" ? "Map 2 — Guide & index · tap to zoom" : "Harta 2 — Ghid & index · apasă pentru zoom"}</Text>

        {/* Legendă */}
        <View style={styles.legend}>
          <Text style={styles.legTitle}>{leg.title}</Text>
          <Text style={styles.legItem}>▬ {leg.line}</Text>
          <Text style={styles.legItem}>{leg.arrow}</Text>
          <Text style={styles.legItem}>{leg.merge}</Text>
          <Text style={styles.legItem}>{leg.sides}</Text>
          <Text style={styles.legItem}>🎨 {leg.colors}</Text>
        </View>

        {/* Diagrame */}
        <Text style={styles.secTitle}>Diagrame</Text>

        <View style={styles.dia}>
          <Text style={styles.diaTitle}>1 · Relaționarea</Text>
          <View style={[styles.relNode, { backgroundColor: "#fdecec", borderColor: "#f5c6c6" }]}>
            <Text style={[styles.relB, { color: "#b42318" }]}>Tratează simptomul</Text>
            <Text style={styles.relS}>Big Pharma · medicina occidentală</Text>
          </View>
          <Text style={styles.relArrow}>↑ ↓</Text>
          <View style={[styles.relNode, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Text style={[styles.relB, { color: colors.text }]}>INDEX</Text>
            <Text style={styles.relS}>afecțiuni & simptome</Text>
          </View>
          <Text style={styles.relArrow}>↑ ↓</Text>
          <View style={[styles.relNode, { backgroundColor: colors.surfaceAlt, borderColor: "#bfe3c8" }]}>
            <Text style={[styles.relB, { color: colors.primary }]}>Tratează cauza</Text>
            <Text style={styles.relS}>Holistic · natural</Text>
          </View>
        </View>

        <View style={styles.dia}>
          <Text style={styles.diaTitle}>2 · Statistici (conform hărții)</Text>
          <View style={styles.century}>
            <View style={styles.centuryHead}>
              <Text style={styles.centuryTitle}>Secolul XXI</Text>
              <Text style={styles.centuryRange}>2001 — prezent</Text>
            </View>
            <View style={styles.centuryTrack}>
              <Animated.View style={[styles.centuryFill, { width: barW(24) }]} />
            </View>
          </View>
          <Text style={styles.diaSub}>Cauze de deces în SUA</Text>
          {DEATHS.map(([l, v]) => (
            <View key={l} style={styles.barRow}>
              <Text style={styles.barLabel} numberOfLines={1}>{l}</Text>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, { width: barW((v / MAXD) * 100), backgroundColor: "#e63e11" }]} />
              </View>
              <Text style={styles.barVal}>{fmtN(v)}</Text>
            </View>
          ))}
          <Text style={[styles.diaSub, { marginTop: 14 }]}>Afecțiuni cronice prevalente (% populație)</Text>
          {CHRONIC.map(([l, v]) => (
            <View key={l} style={styles.barRow}>
              <Text style={styles.barLabel} numberOfLines={1}>{l}</Text>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, { width: barW((v / 25) * 100), backgroundColor: colors.primary }]} />
              </View>
              <Text style={styles.barVal}>{v}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.dia}>
          <Text style={styles.diaTitle}>3 · Corp & energie — cele 7 chakre</Text>
          {CHAKRAS.map(([n, t2, col]) => (
            <View key={n} style={styles.chk}>
              <View style={[styles.chkDot, { backgroundColor: col }]}>
                <Text style={styles.chkN}>{n}</Text>
              </View>
              <Text style={styles.chkT}>{t2}</Text>
            </View>
          ))}
        </View>

        {/* Eseuri */}
        <View style={styles.essay}>
          <Text style={styles.essayTitle}>{d.leftTitle}</Text>
          {paras(d.leftBody).map((p, i) => (
            <Text key={i} style={styles.p}>
              {p}
            </Text>
          ))}
        </View>
        <View style={styles.essay}>
          <Text style={styles.essayTitle}>{d.rightTitle}</Text>
          {paras(d.rightBody).map((p, i) => (
            <Text key={i} style={styles.p}>
              {p}
            </Text>
          ))}
        </View>

        <Text style={styles.note}>{d.disclaimer}</Text>
      </ScrollView>

      <Modal visible={!!zoom} transparent animationType="fade" onRequestClose={() => setZoom(null)}>
        <View style={styles.zoomWrap}>
          <ScrollView
            style={{ flex: 1 }}
            maximumZoomScale={5}
            minimumZoomScale={1}
            bouncesZoom
            contentContainerStyle={styles.zoomV}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.zoomH}>
              {zoom && (
                <Image
                  source={zoom}
                  style={{ width: width * 2.4, height: (width * 2.4) / RATIO }}
                  resizeMode="contain"
                />
              )}
            </ScrollView>
          </ScrollView>
          <TouchableOpacity style={styles.zoomClose} onPress={() => setZoom(null)} accessibilityLabel={t("cancel") || "Închide"}>
            <Text style={styles.zoomCloseTxt}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    topbar: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: isWeb ? 16 : 52,
      paddingBottom: 12,
      paddingHorizontal: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      backgroundColor: c.surface,
      gap: 8,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surfaceAlt,
    },
    topTitle: { flex: 1, fontSize: 17, fontWeight: "800", color: c.text, textAlign: "center" },
    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 60,
      maxWidth: 820,
      width: "100%",
      alignSelf: "center",
    },
    eyebrow: { fontSize: 12, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase", color: c.primary, marginBottom: 8 },
    h1: { fontSize: 30, fontWeight: "900", color: c.text, marginBottom: 8 },
    lead: { fontSize: 15, lineHeight: 22, color: c.textMuted, marginBottom: 18 },
    map: { borderRadius: 14, backgroundColor: c.surfaceAlt },
    cap: { fontSize: 12.5, color: c.textMuted, marginTop: 8, marginBottom: 16 },
    legend: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginTop: 6,
      marginBottom: 8,
      gap: 6,
    },
    legTitle: { fontSize: 16, fontWeight: "800", color: c.text, marginBottom: 4 },
    legItem: { fontSize: 13.5, lineHeight: 20, color: c.textMuted },
    secTitle: { fontSize: 22, fontWeight: "900", color: c.text, marginTop: 26, marginBottom: 4 },
    dia: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      borderTopWidth: 3,
      borderTopColor: c.primary,
      padding: 16,
      marginTop: 14,
    },
    diaTitle: { fontSize: 15.5, fontWeight: "800", color: c.text, marginBottom: 10 },
    diaSub: { fontSize: 12.5, fontWeight: "700", color: c.textMuted, marginBottom: 8 },
    century: { backgroundColor: "#13301f", borderRadius: 14, padding: 14, marginBottom: 14 },
    centuryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
    centuryTitle: { fontSize: 16, fontWeight: "800", color: "#9be7a6", letterSpacing: 0.5 },
    centuryRange: { fontSize: 12, color: "#9db5a6" },
    centuryTrack: { height: 11, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden" },
    centuryFill: { height: "100%", borderRadius: 999, backgroundColor: "#5bbd62" },
    relNode: { borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center" },
    relB: { fontSize: 14, fontWeight: "800", marginBottom: 3 },
    relS: { fontSize: 12, color: c.textMuted, textAlign: "center" },
    relArrow: { textAlign: "center", color: c.primary, fontSize: 16, marginVertical: 5 },
    barRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
    barLabel: { width: 110, fontSize: 11.5, color: c.text, textAlign: "right" },
    barTrack: { flex: 1, height: 16, borderRadius: 999, backgroundColor: c.surfaceAlt, overflow: "hidden" },
    barFill: { height: "100%", borderRadius: 999 },
    barVal: { width: 62, fontSize: 11, fontWeight: "700", color: c.textMuted },
    chk: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
    chkDot: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    chkN: { color: "#fff", fontWeight: "800", fontSize: 15 },
    chkT: { fontSize: 14.5, fontWeight: "600", color: c.text },
    essay: {
      backgroundColor: c.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      padding: 20,
      marginTop: 18,
    },
    essayTitle: { fontSize: 19, fontWeight: "800", color: c.primary, marginBottom: 12 },
    p: { fontSize: 14.5, lineHeight: 23, color: c.textMuted, marginBottom: 11 },
    note: {
      fontSize: 12.5,
      lineHeight: 19,
      color: c.textMuted,
      backgroundColor: c.surfaceAlt,
      borderRadius: 12,
      padding: 14,
      marginTop: 20,
    },
    zoomWrap: { flex: 1, backgroundColor: "rgba(8,16,11,0.96)" },
    zoomV: { flexGrow: 1, justifyContent: "center" },
    zoomH: { alignItems: "center" },
    zoomClose: {
      position: "absolute",
      top: 44,
      right: 18,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    zoomCloseTxt: { color: "#fff", fontSize: 20, fontWeight: "700" },
  });
}
