import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ThemeFx from "../components/ThemeFx";
import { pickM } from "../i18n/methodology";
import { PALETTES, useTheme, type ThemeColors } from "../utils/theme";

const isWeb = Platform.OS === "web";

// Culorile celor 4 niveluri de risc — identice cu cele din analiza produsului.
const LEVELS: { key: string; labelKey: string; color: string }[] = [
  { key: "risk", labelKey: "levelRisk", color: "#E63E11" },
  { key: "caution", labelKey: "levelCaution", color: "#EE8100" },
  { key: "moderate", labelKey: "levelModerate", color: "#FECB02" },
  { key: "safe", labelKey: "levelSafe", color: "#038141" },
];

// Autoritățile citate — nume oficiale + link către pagina publică relevantă.
const AUTHORITIES: { abbr: string; descKey: string; url: string }[] = [
  {
    abbr: "EFSA",
    descKey: "efsaDesc",
    url: "https://www.efsa.europa.eu/en/topics/topic/food-additives",
  },
  {
    abbr: "IARC / OMS",
    descKey: "iarcDesc",
    url: "https://monographs.iarc.who.int/list-of-classifications",
  },
  {
    abbr: "UE",
    descKey: "euDesc",
    url: "https://food.ec.europa.eu/food-safety/food-improvement-agents/additives/database_en",
  },
  {
    abbr: "🔬",
    descKey: "studiesDesc",
    url: "",
  },
];

export default function MethodologyPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, palette } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 900;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const lang = i18n.language;
  const paletteEmoji = (PALETTES.find((p) => p.id === palette) || PALETTES[0]).emoji;

  return (
    <View style={styles.screen}>
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      <ThemeFx emoji={paletteEmoji} />

      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <TouchableOpacity
          style={styles.iconTile}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/");
          }}
          accessibilityRole="button"
          accessibilityLabel={t("cancel")}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {pickM("title", lang)}
        </Text>
        <View style={styles.iconTileGhost} />
      </View>

      <ScrollView contentContainerStyle={[styles.container, isDesktop && styles.containerDesktop]}>
        <Text style={styles.intro}>{pickM("intro", lang)}</Text>

        {/* 1 · Nutriția */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={[styles.numBadge, { backgroundColor: "#34d399" }]}>
              <Text style={styles.numBadgeText}>1</Text>
            </View>
            <Text style={styles.cardTitle}>{pickM("nutriTitle", lang)}</Text>
          </View>
          <Text style={styles.cardText}>{pickM("nutriText", lang)}</Text>
        </View>

        {/* 2 · Aditivii */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={[styles.numBadge, { backgroundColor: "#a78bfa" }]}>
              <Text style={styles.numBadgeText}>2</Text>
            </View>
            <Text style={styles.cardTitle}>{pickM("addTitle", lang)}</Text>
          </View>
          <Text style={styles.cardText}>{pickM("addText", lang)}</Text>

          <Text style={styles.levelsTitle}>{pickM("levelsTitle", lang)}</Text>
          <View style={styles.levels}>
            {LEVELS.map((lv) => (
              <View key={lv.key} style={styles.levelPill}>
                <View style={[styles.levelDot, { backgroundColor: lv.color }]} />
                <Text style={styles.levelText}>{t(lv.labelKey)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Autorități / surse */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{pickM("authTitle", lang)}</Text>
          {AUTHORITIES.map((a) => (
            <TouchableOpacity
              key={a.descKey}
              style={styles.authRow}
              disabled={!a.url}
              onPress={() => a.url && Linking.openURL(a.url).catch(() => {})}
              accessibilityRole={a.url ? "link" : "text"}
            >
              <View style={styles.authBadge}>
                <Text style={styles.authBadgeText}>{a.abbr}</Text>
              </View>
              <Text style={styles.authDesc}>
                {pickM(a.descKey, lang)}
                {a.url ? " ↗" : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3 · Onestitatea datelor */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={[styles.numBadge, { backgroundColor: "#60a5fa" }]}>
              <Text style={styles.numBadgeText}>3</Text>
            </View>
            <Text style={styles.cardTitle}>{pickM("honestyTitle", lang)}</Text>
          </View>
          <Text style={styles.cardText}>{pickM("honestyText", lang)}</Text>
        </View>

        <Text style={styles.opinion}>{pickM("opinion", lang)}</Text>

        <View style={styles.discWrap}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textFaint} />
          <Text style={styles.disclaimer}>{t("disclaimer")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const reliefWeb = (c: ThemeColors): any =>
  isWeb
    ? {
        boxShadow: c.isDark
          ? "0 12px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 12px 28px rgba(31,55,38,0.13), inset 0 1px 0 rgba(255,255,255,0.85)",
      }
    : { elevation: 3 };

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 50,
      paddingBottom: 14,
      paddingHorizontal: 16,
      backgroundColor: c.navbarBg,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerDesktop: { paddingTop: 18 },
    iconTile: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      ...(isWeb ? ({ boxShadow: "0 6px 14px rgba(20,48,31,0.12)" } as any) : { elevation: 3 }),
    },
    iconTileGhost: { width: 42, height: 42 },
    headerTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: c.text,
      flex: 1,
      textAlign: "center",
      paddingHorizontal: 6,
    },

    container: { padding: 16, paddingBottom: 50, gap: 16 },
    containerDesktop: { maxWidth: 760, alignSelf: "center", width: "100%", paddingTop: 24 },

    intro: { fontSize: 15, color: c.textMuted, lineHeight: 22, paddingHorizontal: 4 },

    card: {
      backgroundColor: c.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      gap: 10,
      ...reliefWeb(c),
    },
    cardHead: { flexDirection: "row", alignItems: "center", gap: 11 },
    numBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    numBadgeText: { color: "#fff", fontWeight: "900", fontSize: 15 },
    cardTitle: { fontSize: 16.5, fontWeight: "900", color: c.text, flex: 1 },
    cardText: { fontSize: 14.5, color: c.textMuted, lineHeight: 22 },

    levelsTitle: { fontSize: 14, fontWeight: "800", color: c.text, marginTop: 4 },
    levels: { gap: 8 },
    levelPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.surfaceAlt,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 9,
      paddingHorizontal: 14,
      alignSelf: "flex-start",
    },
    levelDot: { width: 13, height: 13, borderRadius: 7 },
    levelText: { fontSize: 14, fontWeight: "700", color: c.text },

    authRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.surfaceAlt,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      padding: 12,
    },
    authBadge: {
      minWidth: 64,
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: c.primary + "1A",
      borderWidth: 1,
      borderColor: c.primary + "33",
      alignItems: "center",
    },
    authBadgeText: { fontSize: 13, fontWeight: "900", color: c.primary },
    authDesc: { flex: 1, fontSize: 13.5, color: c.textMuted, lineHeight: 19 },

    opinion: {
      fontSize: 13.5,
      color: c.textMuted,
      fontStyle: "italic",
      lineHeight: 20,
      paddingHorizontal: 4,
    },
    discWrap: { flexDirection: "row", gap: 8, alignItems: "flex-start", paddingHorizontal: 4 },
    disclaimer: { flex: 1, fontSize: 12, color: c.textFaint, fontStyle: "italic", lineHeight: 17 },
  });
