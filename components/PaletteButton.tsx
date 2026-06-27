import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { PALETTES, useTheme } from "../utils/theme";

/**
 * Selector de teme de culoare (15 palete, ca pe landing page).
 * DOAR design — schimbă accentul aplicației. Nu folosește emoji.
 */
export default function PaletteButton({ glass }: { glass?: any }) {
  const { t } = useTranslation();
  const { colors, palette, setPalette } = useTheme();
  const [open, setOpen] = useState(false);
  const current = PALETTES.find((p) => p.id === palette) || PALETTES[0];

  return (
    <>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.navbarBg, borderColor: colors.border }, glass]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t("paletteTitle")}
      >
        <Text style={styles.btnEmoji}>{current.emoji}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>{t("paletteTitle")}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel={t("cancel")}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
              {PALETTES.map((p) => {
                const active = p.id === palette;
                const swatch = colors.isDark ? p.primaryDark : p.primary;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.item}
                    onPress={() => {
                      setPalette(p.id);
                      setOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={p.label}
                  >
                    <View
                      style={[
                        styles.swatch,
                        { backgroundColor: swatch + "26" },
                        active && { borderColor: swatch, borderWidth: 3 },
                      ]}
                    >
                      <Text style={styles.swatchEmoji}>{p.emoji}</Text>
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.label,
                        { color: active ? colors.primary : colors.textMuted, fontWeight: active ? "800" : "600" },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnEmoji: { fontSize: 20 },
  swatchEmoji: { fontSize: 26 },
  overlay: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  sheet: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "75%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 18, fontWeight: "800" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  item: { width: 88, alignItems: "center", paddingVertical: 10 },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  label: { fontSize: 12, textAlign: "center" },
});
