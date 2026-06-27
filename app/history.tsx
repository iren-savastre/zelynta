import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ThemeFx from "../components/ThemeFx";
import ZoomableImage from "../components/ZoomableImage";
import { getFavorites } from "../utils/favorites";
import { clearAllData, getHistory, HistoryItem } from "../utils/history";
import { scoreColor } from "../utils/score";
import { PALETTES, useTheme, type ThemeColors } from "../utils/theme";

const isWeb = Platform.OS === "web";
type Tab = "history" | "favorites";

export default function History() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, palette } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 900;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const paletteEmoji = (PALETTES.find((p) => p.id === palette) || PALETTES[0]).emoji;
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

  function onClearAll() {
    Alert.alert(t("clearAllData"), t("clearAllConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("clearAllData"),
        style: "destructive",
        onPress: () => {
          clearAllData().then(load);
        },
      },
    ]);
  }

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

  const TABS: { key: Tab; icon: any; label: string }[] = [
    { key: "history", icon: "time", label: t("tabHistory") },
    { key: "favorites", icon: "heart", label: t("tabFavorites") },
  ];

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
        <Text style={styles.headerTitle}>{t("historyTitle")}</Text>
        <TouchableOpacity
          style={styles.iconTile}
          onPress={() => router.push("/compare")}
          accessibilityRole="button"
          accessibilityLabel={t("compareButton")}
        >
          <Ionicons name="git-compare" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Taburi Istoric / Favorite */}
      <View style={[styles.tabs, isDesktop && styles.centered]}>
        {TABS.map((tb) => {
          const active = tab === tb.key;
          return (
            <TouchableOpacity
              key={tb.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(tb.key)}
              accessibilityRole="button"
            >
              <Ionicons name={tb.icon} size={17} color={active ? "#fff" : colors.textMuted} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tb.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyTile}>
            <Ionicons
              name={tab === "history" ? "time-outline" : "heart-outline"}
              size={34}
              color={colors.primary}
            />
          </View>
          <Text style={styles.emptyText}>
            {tab === "history" ? t("historyEmpty") : t("favoritesEmpty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.barcode}
          contentContainerStyle={[styles.list, isDesktop && styles.listDesktop]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.clearAllBtn}
              onPress={onClearAll}
              accessibilityRole="button"
              accessibilityLabel={t("clearAllData")}
            >
              <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
              <Text style={styles.clearAllTxt}>{t("clearAllData")}</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => openProduct(item.barcode)}>
              <ZoomableImage uri={item.imageUrl} style={styles.thumb} accessibilityLabel={item.name} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.brand} numberOfLines={1}>
                  {item.brand}
                </Text>
                <Text style={styles.date}>{formatDate(item.scannedAt)}</Text>
              </View>
              <View style={[styles.scoreBadge, { backgroundColor: scoreColor(item.score) }]}>
                <Text style={styles.scoreText}>{item.score}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
    centered: { maxWidth: 760, alignSelf: "center", width: "100%" },
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
      ...(isWeb ? { boxShadow: "0 6px 14px rgba(20,48,31,0.12)" } : { elevation: 3 }),
    },
    headerTitle: { fontSize: 19, fontWeight: "800", color: c.text },
    tabs: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      gap: 8,
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      ...(isWeb ? { boxShadow: "0 6px 14px rgba(20,48,31,0.1)" } : { elevation: 2 }),
    },
    tabActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
      ...(isWeb
        ? ({ boxShadow: "0 10px 22px rgba(20,48,31,0.22)" } as any)
        : { elevation: 5 }),
    },
    tabText: { fontSize: 15, fontWeight: "800", color: c.textMuted },
    tabTextActive: { color: "#FFFFFF" },
    empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
    emptyTile: {
      width: 76,
      height: 76,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.primary + "1A",
    },
    emptyText: { fontSize: 16, color: c.textMuted, maxWidth: 280, textAlign: "center" },
    list: { padding: 16 },
    clearAllBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 18,
      marginBottom: 8,
      paddingVertical: 11,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      alignSelf: "center",
    },
    clearAllTxt: { fontSize: 13.5, color: c.textMuted, fontWeight: "600" },
    listDesktop: { maxWidth: 760, alignSelf: "center", width: "100%", paddingTop: 4 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
      marginBottom: 12,
      gap: 14,
      ...reliefWeb(c),
    },
    thumb: { width: 60, height: 60, borderRadius: 14 },
    info: { flex: 1 },
    name: { fontSize: 15.5, fontWeight: "800", color: c.text },
    brand: { fontSize: 13, color: c.textMuted, marginTop: 1 },
    date: { fontSize: 12, color: c.textFaint, marginTop: 3 },
    scoreBadge: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      ...(isWeb
        ? ({ boxShadow: "0 8px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)" } as any)
        : { elevation: 3 }),
    },
    scoreText: { fontSize: 18, fontWeight: "900", color: "#fff" },
  });
