import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAdviceByCategory } from "../utils/advice";
import { useTheme, type ThemeColors } from "../utils/theme";

export default function AdvicePage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const params = useLocalSearchParams<{ category?: string; name?: string }>();

  const advice = getAdviceByCategory(params.category ?? "generic", i18n.language);

  const rows = [
    { key: advice.labels.benefits, text: advice.benefits },
    { key: advice.labels.when, text: advice.when },
    { key: advice.labels.how, text: advice.how },
    { key: advice.labels.who, text: advice.who },
  ].filter((r) => r.text !== "");

  return (
    <View style={styles.screen}>
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/");
          }}
        >
          <Text style={styles.backButton}>‹ {t("cancel")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {advice.icon} {advice.labels.title}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {params.name ? (
          <Text style={styles.productName} numberOfLines={2}>
            {params.name}
          </Text>
        ) : null}

        {rows.map((r, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={styles.rowKey}>{r.key}</Text>
            <Text style={styles.rowText}>{r.text}</Text>
          </View>
        ))}

        {advice.children !== "" && (
          <View style={styles.childBox}>
            <Text style={styles.childKey}>👶 {advice.labels.children}</Text>
            <Text style={styles.childText}>{advice.children}</Text>
          </View>
        )}

        <Text style={styles.disclaimer}>{t("disclaimer")}</Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 50,
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: c.navbarBg,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backButton: { fontSize: 16, color: c.primary, fontWeight: "600", width: 60 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: c.text, flex: 1, textAlign: "center" },
    container: { padding: 16, paddingBottom: 40, gap: 14 },
    productName: { fontSize: 20, fontWeight: "800", color: c.text, marginBottom: 4 },
    row: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 14,
      gap: 4,
    },
    rowKey: {
      fontSize: 13,
      fontWeight: "800",
      color: c.primary,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    rowText: { fontSize: 15, color: c.textMuted, lineHeight: 22 },
    childBox: {
      backgroundColor: c.isDark ? "rgba(91,189,98,0.14)" : "#EAF5EA",
      borderRadius: 14,
      padding: 14,
      gap: 4,
      borderWidth: 1,
      borderColor: c.isDark ? "rgba(91,189,98,0.30)" : "#CDE8CD",
    },
    childKey: { fontSize: 14, fontWeight: "800", color: c.primary },
    childText: { fontSize: 15, color: c.text, lineHeight: 22 },
    disclaimer: {
      fontSize: 12,
      color: c.textFaint,
      fontStyle: "italic",
      marginTop: 8,
      lineHeight: 17,
    },
  });
