import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ThemeFx from "../components/ThemeFx";
import ZoomableImage from "../components/ZoomableImage";
import { fetchProductByBarcode } from "../utils/apiClient";
import { getFavorites } from "../utils/favorites";
import { getHistory, HistoryItem } from "../utils/history";
import { analyzeProduct, productDisplay, scoreColor } from "../utils/score";
import { PALETTES, useTheme, type ThemeColors } from "../utils/theme";

const isWeb = Platform.OS === "web";

async function fetchProduct(code: string): Promise<any | null> {
  return fetchProductByBarcode(code);
}

export default function Compare() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, palette } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 900;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const lang = i18n.language;
  const paletteEmoji = (PALETTES.find((p) => p.id === palette) || PALETTES[0]).emoji;

  const params = useLocalSearchParams<{ codes?: string }>();
  const [candidates, setCandidates] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [products, setProducts] = useState<[any, any] | null>(null);
  const [loading, setLoading] = useState(false);
  const [cmpError, setCmpError] = useState(false);

  useEffect(() => {
    Promise.all([getHistory(), getFavorites()]).then(([h, f]) => {
      const map = new Map<string, HistoryItem>();
      [...f, ...h].forEach((it) => {
        if (!map.has(it.barcode)) map.set(it.barcode, it);
      });
      setCandidates([...map.values()]);
    });
  }, []);

  useEffect(() => {
    const codes = params.codes?.split(",").filter(Boolean) ?? [];
    if (codes.length === 2) {
      setSelected(codes);
      setLoading(true);
      Promise.all([fetchProduct(codes[0]), fetchProduct(codes[1])]).then((res) => {
        setProducts(res as [any, any]);
        setLoading(false);
      });
    }
  }, [params.codes]);

  function toggle(barcode: string) {
    setProducts(null);
    setCmpError(false);
    setSelected((prev) => {
      if (prev.includes(barcode)) return prev.filter((b) => b !== barcode);
      if (prev.length >= 2) return [prev[1], barcode];
      return [...prev, barcode];
    });
  }

  const doCompare = useCallback(async () => {
    if (selected.length !== 2) return;
    setLoading(true);
    setCmpError(false);
    const [a, b] = await Promise.all([fetchProduct(selected[0]), fetchProduct(selected[1])]);
    if (!a || !b) {
      setProducts(null);
      setCmpError(true); // cel puțin un produs nu a putut fi încărcat
    } else {
      setProducts([a, b]);
    }
    setLoading(false);
  }, [selected]);

  function num(v: any) {
    return v == null ? "—" : Math.round(v * 10) / 10;
  }
  // ce parte e mai bună: 'a' | 'b' | null
  function best(va: any, vb: any, lowerBetter: boolean): "a" | "b" | null {
    if (va == null || vb == null || va === vb) return null;
    const aWins = lowerBetter ? va < vb : va > vb;
    return aWins ? "a" : "b";
  }

  const [pa, pb] = products ?? [null, null];
  const na = pa?.nutriments ?? {};
  const nb = pb?.nutriments ?? {};
  const aA = pa ? analyzeProduct(pa, lang) : null;
  const aB = pb ? analyzeProduct(pb, lang) : null;
  const winner =
    aA && aB ? (aA.score > aB.score ? "a" : aB.score > aA.score ? "b" : null) : null;

  function ProductCol({ p, a, side }: { p: any; a: any; side: "a" | "b" }) {
    const isWin = winner === side;
    return (
      <View style={[styles.col, isWin && styles.colWin]}>
        {isWin && (
          <View style={styles.crown}>
            <Ionicons name="trophy" size={14} color="#fff" />
            <Text style={styles.crownTxt}>{t("compareButton")}</Text>
          </View>
        )}
        <ZoomableImage uri={p.image_url} style={styles.colImage} accessibilityLabel={p.product_name} />
        <Text style={styles.colName} numberOfLines={2}>
          {productDisplay(p).title}
        </Text>
        <View
          style={[
            styles.colScore,
            isWeb
              ? ({
                  backgroundImage: `conic-gradient(${scoreColor(a.score)} ${a.score * 3.6}deg, ${
                    colors.surfaceAlt
                  } 0deg)`,
                } as any)
              : { borderWidth: 6, borderColor: scoreColor(a.score) },
          ]}
        >
          <View style={styles.colScoreInner}>
            <Text style={[styles.colScoreNum, { color: scoreColor(a.score) }]}>{a.score}</Text>
          </View>
        </View>
      </View>
    );
  }

  function MetricRow({
    label,
    va,
    vb,
    unit,
    lowerBetter,
  }: {
    label: string;
    va: any;
    vb: any;
    unit: string;
    lowerBetter: boolean;
  }) {
    const b = best(va, vb, lowerBetter);
    return (
      <View style={styles.mRow}>
        <View style={[styles.mCell, b === "a" && styles.mCellBest]}>
          <Text style={[styles.mVal, b === "a" && styles.mValBest]}>
            {num(va)}
            {va != null ? unit : ""}
          </Text>
        </View>
        <Text style={styles.mLabel}>{label}</Text>
        <View style={[styles.mCell, b === "b" && styles.mCellBest]}>
          <Text style={[styles.mVal, b === "b" && styles.mValBest]}>
            {num(vb)}
            {vb != null ? unit : ""}
          </Text>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>{t("compareTitle")}</Text>
        <View style={styles.iconTileGhost} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]}>
        {products && pa && pb && aA && aB ? (
          <View style={styles.compareCard}>
            <View style={styles.cols}>
              <ProductCol p={pa} a={aA} side="a" />
              <View style={styles.vs}>
                <Text style={styles.vsTxt}>VS</Text>
              </View>
              <ProductCol p={pb} a={aB} side="b" />
            </View>

            <View style={styles.metrics}>
              <MetricRow label={t("energy")} va={na["energy-kcal_100g"]} vb={nb["energy-kcal_100g"]} unit=" kcal" lowerBetter />
              <MetricRow label={t("sugars")} va={na["sugars_100g"]} vb={nb["sugars_100g"]} unit="g" lowerBetter />
              <MetricRow label={t("saturatedFat")} va={na["saturated-fat_100g"]} vb={nb["saturated-fat_100g"]} unit="g" lowerBetter />
              <MetricRow label={t("salt")} va={na["salt_100g"]} vb={nb["salt_100g"]} unit="g" lowerBetter />
              <MetricRow label={t("additivesLabel")} va={(pa?.additives_tags ?? []).length} vb={(pb?.additives_tags ?? []).length} unit="" lowerBetter />
              <MetricRow label={t("scoreLabel")} va={aA.score} vb={aB.score} unit="" lowerBetter={false} />
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={() => setProducts(null)}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
              <Text style={styles.resetTxt}>{t("compareSelect")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {cmpError && (
              <View style={styles.errBox}>
                <Ionicons name="alert-circle" size={18} color="#C0341C" />
                <Text style={styles.errTxt}>{t("errorConnection")}</Text>
              </View>
            )}
            <Text style={styles.hint}>{t("compareSelect")}</Text>
            {candidates.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyTile}>
                  <Ionicons name="git-compare" size={32} color={colors.primary} />
                </View>
                <Text style={styles.emptyTxt}>{t("historyEmpty")}</Text>
              </View>
            ) : (
              candidates.map((item) => {
                const isSel = selected.includes(item.barcode);
                const idx = selected.indexOf(item.barcode);
                return (
                  <TouchableOpacity
                    key={item.barcode}
                    style={[styles.row, isSel && styles.rowSelected]}
                    onPress={() => toggle(item.barcode)}
                  >
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="contain" />
                    ) : (
                      <View style={[styles.thumb, styles.thumbPh]}>
                        <Text style={{ fontSize: 22 }}>🥫</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.brand} numberOfLines={1}>
                        {item.brand}
                      </Text>
                    </View>
                    <View style={[styles.scoreBadge, { backgroundColor: scoreColor(item.score) }]}>
                      <Text style={styles.scoreBadgeTxt}>{item.score}</Text>
                    </View>
                    <View style={[styles.check, isSel && styles.checkOn]}>
                      {isSel ? (
                        <Text style={styles.checkMark}>{idx + 1}</Text>
                      ) : (
                        <Ionicons name="add" size={16} color={colors.textMuted} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {!products && selected.length === 2 && (
        <View style={[styles.ctaWrap, isDesktop && styles.ctaWrapDesktop]}>
          <TouchableOpacity style={styles.cta} onPress={doCompare} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="git-compare" size={20} color="#fff" />
                <Text style={styles.ctaText}>{t("compareButton")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
    headerTitle: { fontSize: 19, fontWeight: "800", color: c.text },
    scroll: { padding: 16, gap: 12, paddingBottom: 120 },
    scrollDesktop: { maxWidth: 760, alignSelf: "center", width: "100%" },
    hint: { fontSize: 14, color: c.textMuted, textAlign: "center", marginBottom: 6, fontWeight: "600" },
    errBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "#FCE6E1",
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginBottom: 10,
    },
    errTxt: { flex: 1, color: "#C0341C", fontSize: 13.5, fontWeight: "600" },
    empty: { alignItems: "center", gap: 16, paddingTop: 60 },
    emptyTile: {
      width: 76,
      height: 76,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.primary + "1A",
    },
    emptyTxt: { fontSize: 16, color: c.textMuted, maxWidth: 280, textAlign: "center" },

    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 12,
      gap: 12,
      borderWidth: 2,
      borderColor: "transparent",
      ...reliefWeb(c),
    },
    rowSelected: { borderColor: c.primary },
    thumb: { width: 52, height: 52, borderRadius: 12 },
    thumbPh: { backgroundColor: c.surfaceAlt, justifyContent: "center", alignItems: "center" },
    name: { fontSize: 15, fontWeight: "800", color: c.text },
    brand: { fontSize: 13, color: c.textMuted },
    scoreBadge: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    scoreBadgeTxt: { color: "#fff", fontSize: 16, fontWeight: "900" },
    check: {
      width: 30,
      height: 30,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkOn: { backgroundColor: c.primary, borderColor: c.primary },
    checkMark: { color: "#FFF", fontSize: 15, fontWeight: "900" },

    ctaWrap: { position: "absolute", bottom: 24, left: 16, right: 16 },
    ctaWrapDesktop: { left: 0, right: 0, alignItems: "center" },
    cta: {
      flexDirection: "row",
      gap: 10,
      backgroundColor: c.primary,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 28,
      alignItems: "center",
      justifyContent: "center",
      minWidth: isWeb ? 300 : undefined,
      ...(isWeb ? ({ boxShadow: "0 14px 30px rgba(20,48,31,0.3)" } as any) : { elevation: 6 }),
    },
    ctaText: { color: "#FFF", fontSize: 17, fontWeight: "800" },

    compareCard: { backgroundColor: c.surface, borderRadius: 22, padding: 18, ...reliefWeb(c) },
    cols: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    col: {
      flex: 1,
      alignItems: "center",
      gap: 10,
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "transparent",
    },
    colWin: { borderColor: c.primary, backgroundColor: c.primary + "10" },
    crown: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: c.primary,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    crownTxt: { color: "#fff", fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
    colImage: { width: 96, height: 96, borderRadius: 16 },
    colName: { fontSize: 14, fontWeight: "800", color: c.text, textAlign: "center" },
    colScore: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: "center",
      justifyContent: "center",
    },
    colScoreInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    colScoreNum: { fontSize: 22, fontWeight: "900" },
    vs: { paddingTop: 56, alignItems: "center", justifyContent: "center" },
    vsTxt: { fontSize: 14, fontWeight: "900", color: c.textFaint, letterSpacing: 1 },

    metrics: { marginTop: 22, gap: 6 },
    mRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
    mCell: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: c.surfaceAlt,
    },
    mCellBest: { backgroundColor: "#22c55e" },
    mVal: { fontSize: 15, fontWeight: "800", color: c.text },
    mValBest: { color: "#fff" },
    mLabel: { flex: 1.2, fontSize: 12.5, color: c.textMuted, textAlign: "center", fontWeight: "600" },

    resetBtn: {
      flexDirection: "row",
      gap: 8,
      alignSelf: "center",
      alignItems: "center",
      marginTop: 18,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceAlt,
    },
    resetTxt: { fontSize: 14, color: c.primary, fontWeight: "700" },
  });
