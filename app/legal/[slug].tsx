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
  View,
} from "react-native";
import ThemeFx from "../../components/ThemeFx";
import { LEGAL_BLOCKS, LEGAL_DICT, type LegalBlock } from "../../utils/legalContent";
import { PALETTES, useTheme, type ThemeColors } from "../../utils/theme";

const isWeb = Platform.OS === "web";

export default function LegalPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, palette } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const lang = i18n.language;
  const paletteEmoji = (PALETTES.find((p) => p.id === palette) || PALETTES[0]).emoji;

  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const key = String(slug || "");
  const blocks: LegalBlock[] = LEGAL_BLOCKS[key] || [];

  const text = (k: string) =>
    LEGAL_DICT[lang]?.[k] ?? LEGAL_DICT.en?.[k] ?? LEGAL_DICT.ro?.[k] ?? "";

  // titlul din primul h1 (pentru bara de sus)
  const h1 = blocks.find((b) => b.tag === "h1");
  const headerTitle = h1 ? text(h1.key) : "Zelynta";

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
          {headerTitle}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={!isWeb}
      >
        {blocks.length === 0 ? (
          <Text style={styles.p}>—</Text>
        ) : (
          blocks.map((b, i) => {
            const val = text(b.key);
            if (!val) return null;
            if (b.tag === "h1") return null; // deja în bara de sus
            if (b.tag === "h2")
              return (
                <Text key={i} style={styles.h2}>
                  {val}
                </Text>
              );
            if (b.tag === "h3" || b.tag === "h4")
              return (
                <Text key={i} style={styles.h3}>
                  {val}
                </Text>
              );
            if (b.tag === "li")
              return (
                <View key={i} style={styles.liRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.li}>{val}</Text>
                </View>
              );
            return (
              <Text key={i} style={styles.p}>
                {val}
              </Text>
            );
          })
        )}
        <Text style={styles.foot}>
          © 2026 Irèn Savastre — {t("footerRights") || "toate drepturile rezervate."}
        </Text>
      </ScrollView>
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
    h2: { fontSize: 20, fontWeight: "800", color: c.text, marginTop: 22, marginBottom: 8 },
    h3: { fontSize: 16, fontWeight: "700", color: c.text, marginTop: 14, marginBottom: 4 },
    p: { fontSize: 15, lineHeight: 23, color: c.textMuted, marginBottom: 10 },
    liRow: { flexDirection: "row", gap: 8, marginBottom: 6, paddingLeft: 4 },
    bullet: { fontSize: 15, lineHeight: 23, color: c.primary },
    li: { flex: 1, fontSize: 15, lineHeight: 23, color: c.textMuted },
    foot: { fontSize: 12, color: c.textMuted, marginTop: 30, opacity: 0.7 },
  });
}
