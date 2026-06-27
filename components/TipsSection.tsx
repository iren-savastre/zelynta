import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, Text, View } from "react-native";
import { type ThemeColors } from "../utils/theme";

const isWeb = Platform.OS === "web";

const ICONS: any[] = [
  "camera-outline",
  "flask-outline",
  "git-compare-outline",
  "stats-chart-outline",
  "heart-outline",
  "warning-outline",
];
const TINTS = ["#22d3ee", "#a78bfa", "#60a5fa", "#34d399", "#fb7185", "#fbbf24"];

export default function TipsSection({
  title,
  eyebrow,
  tips,
  colors,
  isDesktop,
}: {
  title: string;
  eyebrow?: string;
  tips: string[];
  colors: ThemeColors;
  isDesktop: boolean;
}) {
  return (
    <View style={[styles.wrap, isDesktop && styles.wrapDesktop]}>
      <View style={[styles.eyebrow, { backgroundColor: colors.primary + "1A" }]}>
        <Ionicons name="sparkles" size={13} color={colors.primary} />
        <Text style={[styles.eyebrowTxt, { color: colors.primary }]}>{eyebrow ?? "Tips & Tricks"}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
        {tips.map((tip, i) => (
          <View
            key={i}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isDesktop && styles.cardDesktop,
              isWeb
                ? ({
                    boxShadow: colors.isDark
                      ? "0 14px 34px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)"
                      : "0 14px 34px rgba(31,55,38,0.14), inset 0 1px 0 rgba(255,255,255,0.85)",
                  } as any)
                : { elevation: 3 },
            ]}
          >
            <View style={[styles.icTile, { backgroundColor: TINTS[i % TINTS.length] }]}>
              <Ionicons name={ICONS[i % ICONS.length]} size={20} color="#fff" />
            </View>
            <Text style={[styles.tipTxt, { color: colors.textMuted }]}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", alignItems: "center", marginTop: 30, paddingHorizontal: 4 },
  wrapDesktop: {
    maxWidth: 1180,
    alignSelf: "center",
    paddingHorizontal: 20,
    alignItems: "flex-start",
    marginTop: 44,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
  },
  eyebrowTxt: { fontSize: 12, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  title: { fontSize: 22, fontWeight: "800", marginTop: 12, marginBottom: 4 },
  grid: { width: "100%", marginTop: 18, gap: 14 },
  gridDesktop: { flexDirection: "row", flexWrap: "wrap" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  cardDesktop: { width: "31.7%", flexGrow: 1, marginRight: "1.45%", marginBottom: 14 },
  icTile: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    ...(isWeb
      ? ({ boxShadow: "0 8px 16px rgba(20,48,31,0.2), inset 0 1px 0 rgba(255,255,255,0.4)" } as any)
      : { elevation: 2 }),
  },
  tipTxt: { flex: 1, fontSize: 14, lineHeight: 19, fontWeight: "500" },
});
