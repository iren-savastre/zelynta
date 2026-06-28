import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { type ThemeColors } from "../utils/theme";
import WaveText from "./WaveText";

const isWeb = Platform.OS === "web";
const SITE = "https://iren-savastre.github.io/zelynta/";
const FOOT = "#10231a";

function open(url: string) {
  Linking.openURL(url).catch(() => {});
}

function FloatLeaf({ left, size, delay, dur }: { left: string; size: number; delay: number; dur: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: dur, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay, dur]);
  return (
    <Animated.Text
      style={{
        pointerEvents: "none",
        position: "absolute",
        bottom: 0,
        left: left as any,
        fontSize: size,
        opacity: v.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 0.14, 0.14, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [20, -260] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "70deg"] }) },
        ],
      }}
    >
      🍃
    </Animated.Text>
  );
}

const SOCIAL: { ic: any; url: string }[] = [
  { ic: "logo-facebook", url: SITE },
  { ic: "logo-tiktok", url: SITE },
  { ic: "logo-instagram", url: SITE },
];

// Butoane de store (sub social). URL-urile pot fi schimbate aici sau din CMS (landing).
const STORE_URL = "https://github.com/iren-savastre/zelynta/releases/latest";
const STORES: { img: any; url: string; label: string }[] = [
  { img: require("../assets/images/google-play.png"), url: STORE_URL, label: "Google Play" },
  { img: require("../assets/images/app-store.png"), url: STORE_URL, label: "App Store" },
];

// head/label sunt CHEI i18n (traduse cu t() la randare).
// route = navigare în app (fără 404). Conținutul Legal/Suport e importat din paginile site-ului.
type Item = { label: string; route: string; ic: any };
const COLS: { head: string; headIc: any; items: Item[] }[] = [
  {
    head: "footerColProduct",
    headIc: "grid",
    items: [
      { label: "footerFeatures", route: "/", ic: "sparkles-outline" },
      { label: "footerHow", route: "/advice", ic: "list-outline" },
      { label: "footerFaq", route: "/legal/support", ic: "help-circle-outline" },
    ],
  },
  {
    head: "footerColLegal",
    headIc: "document-text",
    items: [
      { label: "footerPrivacy", route: "/legal/privacy", ic: "shield-checkmark-outline" },
      { label: "footerTerms", route: "/legal/terms", ic: "document-text-outline" },
      { label: "footerCookies", route: "/legal/cookies", ic: "browsers-outline" },
      { label: "footerGdpr", route: "/legal/gdpr", ic: "key-outline" },
    ],
  },
  {
    head: "footerColSupport",
    headIc: "help-buoy",
    items: [
      { label: "footerContact", route: "/legal/contact", ic: "mail-outline" },
      { label: "footerSupport", route: "/legal/support", ic: "help-buoy-outline" },
      { label: "footerReport", route: "/legal/report", ic: "warning-outline" },
    ],
  },
];

export default function AppFooter({
  isDesktop,
}: {
  colors?: ThemeColors;
  isDesktop: boolean;
}) {
  const year = new Date().getFullYear();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.outer}>
      <View style={styles.accent} />
      <View style={styles.body}>
        <FloatLeaf left="10%" size={18} delay={0} dur={11000} />
        <FloatLeaf left="34%" size={14} delay={3000} dur={14000} />
        <FloatLeaf left="64%" size={20} delay={6000} dur={13000} />
        <FloatLeaf left="88%" size={15} delay={2000} dur={12000} />

        <View style={[styles.inner, isDesktop && styles.innerDesktop]}>
          <View style={styles.top}>
            <View style={styles.brandCol}>
              <View style={styles.brandRow}>
                <Image
                  source={require("../assets/images/icon.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <WaveText text="Zelynta" style={styles.brand} />
              </View>
              <Text style={styles.desc}>{t("footerDesc")}</Text>
              <View style={styles.social}>
                {SOCIAL.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.soc}
                    onPress={() => open(s.url)}
                    accessibilityRole="button"
                  >
                    <Ionicons name={s.ic} size={18} color="#cfe7d4" />
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.stores}>
                {STORES.map((s, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => open(s.url)}
                    accessibilityRole="button"
                    accessibilityLabel={s.label}
                    style={styles.storeBtn}
                  >
                    <Image source={s.img} style={styles.storeImg} resizeMode="contain" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {COLS.map((c, ci) => (
              <View key={ci} style={styles.col}>
                <View style={styles.colHeadRow}>
                  <View style={styles.headTile}>
                    <Ionicons name={c.headIc} size={15} color="#0e2a1c" />
                  </View>
                  <Text style={styles.colHead}>{t(c.head)}</Text>
                </View>
                {c.items.map((it, i) => (
                  <TouchableOpacity key={i} style={styles.linkRow} onPress={() => router.push(it.route as any)}>
                    <Ionicons name={it.ic} size={15} color="#7fbf95" />
                    <Text style={styles.link}>{t(it.label)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.hr} />
          <Text style={styles.copy}>
            © {year} {t("footerRights")} · {t("footerDisclaimer")}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: "100%", marginTop: 44 },
  accent: {
    height: 5,
    width: "100%",
    backgroundColor: "#2E7D32",
    ...(isWeb
      ? ({ backgroundImage: "linear-gradient(90deg,#85BB2F,#2E7D32 45%,#0d9488)" } as any)
      : {}),
  },
  body: { width: "100%", backgroundColor: FOOT, overflow: "hidden" },
  inner: { width: "100%", paddingHorizontal: 22, paddingVertical: 34 },
  innerDesktop: { maxWidth: 1180, alignSelf: "center", paddingHorizontal: 24, paddingVertical: 48 },
  // rând care se înfășoară: desktop = un rând, tabletă = 2 rânduri, telefon = stivuit
  top: { flexDirection: "row", flexWrap: "wrap", gap: 30, rowGap: 32 },
  brandCol: { flexGrow: 1, flexBasis: 280, minWidth: 240, maxWidth: 420, gap: 14 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 40, height: 40 },
  brand: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 0.5 },
  desc: { color: "#9fb3a6", fontSize: 13.5, lineHeight: 20 },
  social: { flexDirection: "row", gap: 10, marginTop: 2 },
  stores: { flexDirection: "column", alignItems: "flex-start", gap: 10, marginTop: 14 },
  storeBtn: { borderRadius: 9, overflow: "hidden" },
  storeImg: { height: 44, width: 150 },
  soc: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },
  col: { gap: 11, flexGrow: 1, flexBasis: 160, minWidth: 150 },
  colHeadRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 4 },
  headTile: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6ee787",
    ...(isWeb
      ? ({ backgroundImage: "linear-gradient(150deg,#6ee787,#22c55e)" } as any)
      : {}),
  },
  colHead: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  link: { color: "#b6c7bb", fontSize: 14 },
  hr: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 22 },
  copy: { color: "#7f948a", fontSize: 12.5, lineHeight: 18 },
});
