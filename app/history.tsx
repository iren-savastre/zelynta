import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  clearHistory,
  getHistory,
  HistoryItem,
  removeFromHistory,
} from "../utils/history";

function scoreColor(score: number) {
  if (score >= 66) return "#038141";
  if (score >= 33) return "#EE8100";
  return "#E63E11";
}

export default function History() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);

  const load = useCallback(() => {
    getHistory().then(setItems);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function openProduct(barcode: string) {
    router.push({ pathname: "/", params: { barcode } });
  }

  async function handleRemove(barcode: string) {
    await removeFromHistory(barcode);
    load();
  }

  function handleClearAll() {
    Alert.alert(t("historyClearTitle"), t("historyClearConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("historyClearAll"),
        style: "destructive",
        onPress: async () => {
          await clearHistory();
          load();
        },
      },
    ]);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>‹ {t("cancel")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("historyTitle")}</Text>
        {items.length > 0 ? (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearButton}>{t("historyClearAll")}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>{t("historyEmpty")}</Text>
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
                  {item.brand}
                </Text>
                <Text style={styles.brand} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.date}>{formatDate(item.scannedAt)}</Text>
              </View>
              <View style={styles.scoreCol}>
                <Text style={[styles.score, { color: scoreColor(item.score) }]}>
                  {item.score}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemove(item.barcode)}
                  hitSlop={10}
                >
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F7F2" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: { fontSize: 16, color: "#2E7D32", fontWeight: "600", width: 60 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#222" },
  clearButton: {
    fontSize: 14,
    color: "#C62828",
    fontWeight: "600",
    width: 60,
    textAlign: "right",
  },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: "#999" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  thumbPlaceholder: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700", color: "#222" },
  brand: { fontSize: 13, color: "#666" },
  date: { fontSize: 12, color: "#999", marginTop: 2 },
  scoreCol: { alignItems: "center", gap: 8 },
  score: { fontSize: 20, fontWeight: "bold" },
  removeButton: { fontSize: 16, color: "#CCC" },
});