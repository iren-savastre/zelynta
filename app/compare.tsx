import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getHistory, HistoryItem } from "../utils/history";
import { getFavorites } from "../utils/favorites";
import { analyzeProduct, productDisplay, scoreColor } from "../utils/score";
import { useTheme, type ThemeColors } from "../utils/theme";
import ZoomableImage from "../components/ZoomableImage";

const DATABASES = [
  "https://world.openfoodfacts.org",
  "https://world.openbeautyfacts.org",
  "https://world.openproductsfacts.org",
];

async function fetchProduct(code: string): Promise<any | null> {
  for (const base of DATABASES) {
    try {
      const res = await fetch(`${base}/api/v2/product/${code}.json`, {
        headers: { "User-Agent": "Zelynta/1.0 (iren.savastre@example.com)" },
      });
      const data = await res.json();
      if (data.status === 1) return data.product;
    } catch {}
  }
  return null;
}

export default function Compare() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const lang = i18n.language;

  const params = useLocalSearchParams<{ codes?: string }>();
  const [candidates, setCandidates] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [products, setProducts] = useState<[any, any] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getHistory(), getFavorites()]).then(([h, f]) => {
      const map = new Map<string, HistoryItem>();
      [...f, ...h].forEach((it) => {
        if (!map.has(it.barcode)) map.set(it.barcode, it);
      });
      setCandidates([...map.values()]);
    });
  }, []);

  // Preîncărcare din casetă (parametru codes=a,b) → comparație automată
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
    setSelected((prev) => {
      if (prev.includes(barcode)) return prev.filter((b) => b !== barcode);
      if (prev.length >= 2) return [prev[1], barcode];
      return [...prev, barcode];
    });
  }

  const doCompare = useCallback(async () => {
    if (selected.length !== 2) return;
    setLoading(true);
    const [a, b] = await Promise.all([
      fetchProduct(selected[0]),
      fetchProduct(selected[1]),
    ]);
    setProducts([a, b]);
    setLoading(false);
  }, [selected]);

  function num(v: any) {
    return v == null ? "—" : Math.round(v * 10) / 10;
  }

  function renderColumn(p: any) {
    if (!p) return <View style={styles.col} />;
    const a = analyzeProduct(p, lang);
    return (
      <View style={styles.col}>
        <ZoomableImage
          uri={p.image_url}
          style={styles.colImage}
          accessibilityLabel={p.product_name}
        />
        <Text style={styles.colName} numberOfLines={2}>
          {productDisplay(p).title}
        </Text>
        <View style={[styles.colScore, { borderColor: scoreColor(a.score) }]}>
          <Text style={[styles.colScoreNum, { color: scoreColor(a.score) }]}>
            {a.score}
          </Text>
        </View>
      </View>
    );
  }

  function metricRow(label: string, va: any, vb: any, unit: string) {
    return (
      <View style={styles.metricRow}>
        <Text style={styles.metricVal}>
          {num(va)}
          {va != null ? unit : ""}
        </Text>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricVal}>
          {num(vb)}
          {vb != null ? unit : ""}
        </Text>
      </View>
    );
  }

  const [pa, pb] = products ?? [null, null];
  const na = pa?.nutriments ?? {};
  const nb = pb?.nutriments ?? {};

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
        <Text style={styles.headerTitle}>{t("compareTitle")}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {products && pa && pb ? (
          <View style={styles.compareCard}>
            <View style={styles.cols}>
              {renderColumn(pa)}
              {renderColumn(pb)}
            </View>
            <View style={styles.metrics}>
              {metricRow(t("energy"), na["energy-kcal_100g"], nb["energy-kcal_100g"], "")}
              {metricRow(t("sugars"), na["sugars_100g"], nb["sugars_100g"], "g")}
              {metricRow(t("saturatedFat"), na["saturated-fat_100g"], nb["saturated-fat_100g"], "g")}
              {metricRow(t("salt"), na["salt_100g"], nb["salt_100g"], "g")}
              {metricRow(
                t("additivesLabel"),
                (pa?.additives_tags ?? []).length,
                (pb?.additives_tags ?? []).length,
                ""
              )}
            </View>
            <TouchableOpacity style={styles.resetBtn} onPress={() => setProducts(null)}>
              <Text style={styles.resetBtnText}>↺</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.hint}>{t("compareSelect")}</Text>
            {candidates.map((item) => {
              const isSel = selected.includes(item.barcode);
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
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
                  </View>
                  <Text style={[styles.score, { color: scoreColor(item.score) }]}>
                    {item.score}
                  </Text>
                  <View style={[styles.check, isSel && styles.checkOn]}>
                    {isSel && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      {!products && selected.length === 2 && (
        <TouchableOpacity style={styles.cta} onPress={doCompare} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.ctaText}>⚖️ {t("compareButton")}</Text>
          )}
        </TouchableOpacity>
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
    hint: { fontSize: 14, color: c.textMuted, textAlign: "center", marginBottom: 4 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 12,
      gap: 12,
      borderWidth: 2,
      borderColor: "transparent",
    },
    rowSelected: { borderColor: c.primary },
    thumb: { width: 48, height: 48, borderRadius: 8 },
    thumbPh: { backgroundColor: c.surfaceAlt, justifyContent: "center", alignItems: "center" },
    name: { fontSize: 15, fontWeight: "700", color: c.text },
    brand: { fontSize: 13, color: c.textMuted },
    score: { fontSize: 18, fontWeight: "bold" },
    check: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    checkOn: { backgroundColor: c.primary, borderColor: c.primary },
    checkMark: { color: "#FFF", fontSize: 14, fontWeight: "900" },
    cta: {
      position: "absolute",
      bottom: 24,
      left: 16,
      right: 16,
      backgroundColor: c.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
    },
    ctaText: { color: "#FFF", fontSize: 17, fontWeight: "800" },
    compareCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
    },
    cols: { flexDirection: "row", gap: 12 },
    col: { flex: 1, alignItems: "center", gap: 8 },
    colImage: { width: 90, height: 90, borderRadius: 10 },
    colImagePh: { backgroundColor: c.surfaceAlt, justifyContent: "center", alignItems: "center" },
    colName: { fontSize: 14, fontWeight: "700", color: c.text, textAlign: "center" },
    colScore: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 5,
      alignItems: "center",
      justifyContent: "center",
    },
    colScoreNum: { fontSize: 22, fontWeight: "800" },
    metrics: { marginTop: 18, gap: 4 },
    metricRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    metricVal: { flex: 1, fontSize: 14, fontWeight: "700", color: c.text, textAlign: "center" },
    metricLabel: { flex: 1.4, fontSize: 12, color: c.textMuted, textAlign: "center" },
    resetBtn: { alignSelf: "center", marginTop: 14, padding: 8 },
    resetBtnText: { fontSize: 22, color: c.primary },
  });
