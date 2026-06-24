import { useRouter, usePathname } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBasket } from "../utils/basket";
import { addFavorite } from "../utils/favorites";
import { scoreColor } from "../utils/score";
import { useTheme, type ThemeColors } from "../utils/theme";
import ZoomableImage from "./ZoomableImage";

export default function BasketBar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { items, remove, clear } = useBasket();
  const [open, setOpen] = useState(false);

  // Ascunde bara pe ecranul de comparație (acolo are propriul flux)
  if (items.length === 0 || pathname === "/compare") return null;

  async function saveAllToFavorites() {
    for (const it of items) await addFavorite(it);
    setOpen(false);
  }

  function compareAll() {
    const codes = items.slice(0, 2).map((i) => i.barcode);
    setOpen(false);
    router.push({ pathname: "/compare", params: { codes: codes.join(",") } });
  }

  return (
    <>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("basketTitle")}
      >
        <Text style={styles.fabIcon}>🧺</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{items.length}</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.panel} onPress={() => {}}>
            <View style={styles.handle} />
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>
                🧺 {t("basketTitle")} ({items.length})
              </Text>
              <TouchableOpacity onPress={clear}>
                <Text style={styles.clearText}>{t("basketClear")}</Text>
              </TouchableOpacity>
            </View>

            {items.map((it) => (
              <View key={it.barcode} style={styles.row}>
                <ZoomableImage uri={it.imageUrl} style={styles.thumb} accessibilityLabel={it.name} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>{it.name}</Text>
                  <Text style={styles.brand} numberOfLines={1}>{it.brand}</Text>
                </View>
                <Text style={[styles.score, { color: scoreColor(it.score) }]}>
                  {it.score}
                </Text>
                <TouchableOpacity onPress={() => remove(it.barcode)} hitSlop={10}>
                  <Text style={styles.remove}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionGhost]}
                onPress={saveAllToFavorites}
              >
                <Text style={styles.actionGhostText}>❤️ {t("basketSave")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, items.length < 2 && styles.actionDisabled]}
                onPress={compareAll}
                disabled={items.length < 2}
              >
                <Text style={styles.actionText}>⚖️ {t("compareButton")}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    fab: {
      position: "absolute",
      bottom: 24,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
    },
    fabIcon: { fontSize: 26 },
    badge: {
      position: "absolute",
      top: -4,
      right: -4,
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#E63E11",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
      borderWidth: 2,
      borderColor: c.bg,
    },
    badgeText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
    overlay: { flex: 1, backgroundColor: c.overlay, justifyContent: "flex-end" },
    panel: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 32,
      gap: 10,
      maxHeight: "80%",
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      marginBottom: 6,
    },
    panelHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    panelTitle: { fontSize: 18, fontWeight: "800", color: c.text },
    clearText: { fontSize: 14, color: "#E63E11", fontWeight: "600" },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    thumb: { width: 44, height: 44, borderRadius: 8 },
    thumbPh: { backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" },
    name: { fontSize: 14, fontWeight: "700", color: c.text },
    brand: { fontSize: 12, color: c.textMuted },
    score: { fontSize: 17, fontWeight: "800" },
    remove: { fontSize: 16, color: c.textFaint, paddingLeft: 4 },
    actions: { flexDirection: "row", gap: 10, marginTop: 12 },
    actionBtn: {
      flex: 1,
      backgroundColor: c.primary,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
    },
    actionText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
    actionGhost: { backgroundColor: c.surfaceAlt },
    actionGhostText: { color: c.text, fontSize: 15, fontWeight: "800" },
    actionDisabled: { opacity: 0.4 },
  });
