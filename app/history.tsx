import { useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getHistory, HistoryItem } from "../utils/history";
import { getFavorites } from "../utils/favorites";
import { scoreColor } from "../utils/score";
import { useTheme, type ThemeColors } from "../utils/theme";

type Tab = "history" | "favorites";

export default function History() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [tab, setTab] = useState<Tab>("history");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<HistoryItem[]>([]);

  const load = useCallback(() => {
    getHistory().then(setHistory);
    getFavorites().then(setFavorites);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const items = tab === "history" ? history : favorites;

  function openProduct(barcode: string) {
    router.push({ pathname: "/", params: { barcode } });
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString(i18n.language, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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
        <Text style={styles.headerTitle}>{t("historyTitle")}</Text>
        <TouchableOpacity
          onPress={() => router.push("/compare")}
          accessibilityRole="button"
          accessibilityLabel={t("compareButton")}
        >
          <Text style={styles.compareLink}>⚖️</Text>
        </TouchableOpacity>
      </View>

      {/* Taburi Istoric / Favorite */}
      <View style={styles.tabs}>
        {(["history", "favorites"] as Tab[]).map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, tab === key && styles.tabActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>
              {key === "history" ? t("tabHistory") : t("tabFavorites")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>{tab === "history" ? "📭" : "🤍"}</Text>
          <Text style={styles.emptyText}>
            {tab === "history" ? t("historyEmpty") : t("favoritesEmpty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.barcode}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => openProduct(item.barcode)}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.thumb}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Text style={{ fontSize: 24 }}>🥫</Text>
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.brand} numberOfLines={1}>
                  {item.brand}
                </Text>
                <Text style={styles.date}>{formatDate(item.scannedAt)}</Text>
              </View>
              <View style={styles.scoreCol}>
                <Text style={[styles.score, { color: scoreColor(item.score) }]}>
                  {item.score}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
    headerTitle: { fontSize: 18, fontWeight: "bold", color: c.text },
    compareLink: { fontSize: 22, width: 60, textAlign: "right" },
    tabs: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: c.surfaceAlt,
    },
    tabActive: { backgroundColor: c.primary },
    tabText: { fontSize: 15, fontWeight: "700", color: c.textMuted },
    tabTextActive: { color: "#FFFFFF" },
    empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    emptyIcon: { fontSize: 48 },
    emptyText: { fontSize: 16, color: c.textFaint },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      gap: 12,
    },
    thumb: { width: 56, height: 56, borderRadius: 8 },
    thumbPlaceholder: {
      backgroundColor: c.surfaceAlt,
      justifyContent: "center",
      alignItems: "center",
    },
    info: { flex: 1 },
    name: { fontSize: 15, fontWeight: "700", color: c.text },
    brand: { fontSize: 13, color: c.textMuted },
    date: { fontSize: 12, color: c.textFaint, marginTop: 2 },
    scoreCol: { alignItems: "center", gap: 8 },
    score: { fontSize: 20, fontWeight: "bold" },
  });
