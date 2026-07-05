import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ThemeFx from "../components/ThemeFx";
import { getAdviceByCategory } from "../utils/advice";
import { adviceLabels } from "../i18n/advice";
import { PALETTES, useTheme, type ThemeColors } from "../utils/theme";

const isWeb = Platform.OS === "web";

export default function AdvicePage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, palette } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 900;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const params = useLocalSearchParams<{ category?: string; name?: string; score?: string }>();
  const paletteEmoji = (PALETTES.find((p) => p.id === palette) || PALETTES[0]).emoji;

  const advice = getAdviceByCategory(params.category ?? "generic", i18n.language);

  // Recomandarea pentru copii tine cont de scor: produsele slabe (0/portocaliu)
  // nu se recomanda copiilor. Fara scor (undefined) pastram comportamentul vechi.
  const score = params.score != null ? parseInt(params.score, 10) : NaN;
  const pickLbl = (f: Record<string, string>) => f[i18n.language] ?? f.en ?? f.ro ?? "";
  let childKey = advice.labels.children;
  let childText = advice.children;
  let childKind: "good" | "moderate" | "bad" = "good";
  if (!Number.isNaN(score)) {
    if (score < 40) {
      childKind = "bad";
      childKey = pickLbl(adviceLabels.childrenWarn);
      childText = pickLbl(adviceLabels.childrenBad);
    } else if (score < 66) {
      childKind = "moderate";
      childKey = pickLbl(adviceLabels.childrenWarn);
      childText = pickLbl(adviceLabels.childrenModerate);
    }
  }

  const rows: { icon: any; color: string; key: string; text: string }[] = [
    { icon: "leaf", color: "#34d399", key: advice.labels.benefits, text: advice.benefits },
    { icon: "time", color: "#60a5fa", key: advice.labels.when, text: advice.when },
    { icon: "bulb", color: "#fbbf24", key: advice.labels.how, text: advice.how },
    { icon: "people", color: "#a78bfa", key: advice.labels.who, text: advice.who },
  ].filter((r) => r.text !== "");

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {advice.labels.title}
        </Text>
        <View style={styles.iconTileGhost} />
      </View>

      <ScrollView contentContainerStyle={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>{advice.icon}</Text>
          </View>
          {params.name ? (
            <Text style={styles.productName} numberOfLines={2}>
              {params.name}
            </Text>
          ) : null}
          <Text style={styles.heroTitle}>{advice.labels.title}</Text>
        </View>

        <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
          {rows.map((r) => (
            <View key={r.key} style={[styles.card, isDesktop && styles.cardDesktop]}>
              <View style={[styles.cardIcon, { backgroundColor: r.color }]}>
                <Ionicons name={r.icon} size={20} color="#fff" />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardKey}>{r.key}</Text>
                <Text style={styles.cardText}>{r.text}</Text>
              </View>
            </View>
          ))}
        </View>

        {childText !== "" && (
          <View style={styles.childBox}>
            <View style={styles.childHead}>
              <View
                style={[
                  styles.childIcon,
                  childKind === "bad" && { backgroundColor: "#E63E11" },
                  childKind === "moderate" && { backgroundColor: "#EE8100" },
                ]}
              >
                <Ionicons
                  name={
                    childKind === "bad"
                      ? "alert-circle"
                      : childKind === "moderate"
                        ? "warning"
                        : "happy"
                  }
                  size={20}
                  color="#fff"
                />
              </View>
              <Text style={styles.childKey}>{childKey}</Text>
            </View>
            <Text style={styles.childText}>{childText}</Text>
          </View>
        )}

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
    headerTitle: { fontSize: 19, fontWeight: "800", color: c.text, flex: 1, textAlign: "center" },

    container: { padding: 16, paddingBottom: 50, gap: 16 },
    containerDesktop: { maxWidth: 880, alignSelf: "center", width: "100%", paddingTop: 24 },

    hero: { alignItems: "center", gap: 10, paddingVertical: 10 },
    heroIcon: {
      width: 86,
      height: 86,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.primary + "1A",
      borderWidth: 1,
      borderColor: c.primary + "33",
    },
    heroEmoji: { fontSize: 44 },
    productName: { fontSize: 22, fontWeight: "900", color: c.text, textAlign: "center" },
    heroTitle: {
      fontSize: 13,
      fontWeight: "800",
      color: c.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },

    grid: { gap: 14 },
    gridDesktop: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 0 as any },
    card: {
      flexDirection: "row",
      gap: 14,
      backgroundColor: c.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      ...reliefWeb(c),
    },
    cardDesktop: { width: "48.5%", marginBottom: 16, alignItems: "flex-start" },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      ...(isWeb
        ? ({ boxShadow: "0 8px 16px rgba(20,48,31,0.2), inset 0 1px 0 rgba(255,255,255,0.4)" } as any)
        : { elevation: 2 }),
    },
    cardBody: { flex: 1, gap: 5 },
    cardKey: {
      fontSize: 12.5,
      fontWeight: "900",
      color: c.text,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    cardText: { fontSize: 14.5, color: c.textMuted, lineHeight: 21 },

    childBox: {
      backgroundColor: c.isDark ? "rgba(91,189,98,0.14)" : "#EAF5EA",
      borderRadius: 18,
      padding: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: c.isDark ? "rgba(91,189,98,0.30)" : "#CDE8CD",
    },
    childHead: { flexDirection: "row", alignItems: "center", gap: 11 },
    childIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.primary,
    },
    childKey: { fontSize: 15, fontWeight: "900", color: c.primary, flex: 1 },
    childText: { fontSize: 14.5, color: c.text, lineHeight: 21 },

    discWrap: { flexDirection: "row", gap: 8, alignItems: "flex-start", marginTop: 6, paddingHorizontal: 4 },
    disclaimer: { flex: 1, fontSize: 12, color: c.textFaint, fontStyle: "italic", lineHeight: 17 },
  });
