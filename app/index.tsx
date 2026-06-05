import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { additivesInfo } from "../i18n/additives";

const languages = [
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
];

const levelColors: Record<string, string> = {
  safe: "#038141",
  moderate: "#FECB02",
  caution: "#EE8100",
};

// Returnează o culoare pe baza unui scor 0-100
function scoreColor(score: number) {
  if (score >= 66) return "#038141"; // verde
  if (score >= 33) return "#EE8100"; // portocaliu
  return "#E63E11"; // roșu
}

// Culoare pentru un nutrient: cu cât valoarea e mai mare, cu atât mai rău
function nutrientColor(value: number, midThreshold: number, highThreshold: number) {
  if (value <= midThreshold) return "#038141";
  if (value <= highThreshold) return "#EE8100";
  return "#E63E11";
}

export default function Index() {
  const { t, i18n } = useTranslation();
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState("");
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const currentLang =
    languages.find((l) => l.code === i18n.language) ?? languages[1];

  function selectLanguage(code: string) {
    i18n.changeLanguage(code);
    setLangMenuOpen(false);
  }

  async function fetchProduct() {
    if (!barcode) {
      setError(t("errorEmpty"));
      return;
    }
    setLoading(true);
    setError("");
    setProduct(null);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1) {
        setProduct(data.product);
      } else {
        setError(t("errorNotFound"));
      }
    } catch (e) {
      setError(t("errorConnection"));
    } finally {
      setLoading(false);
    }
  }

  const n = product?.nutriments ?? {};

  // Aditivii
  const additiveTags: string[] = product?.additives_tags ?? [];
  const additives = additiveTags.map((tag: string) => {
    const code = tag.replace("en:", "").toLowerCase();
    const info = (additivesInfo as any)[code];
    return {
      code: code.toUpperCase(),
      name: info?.name ?? "",
      use: info?.use ?? "",
      level: info?.level ?? null,
    };
  });

  function levelText(level: string | null) {
    if (level === "safe") return t("levelSafe");
    if (level === "moderate") return t("levelModerate");
    if (level === "caution") return t("levelCaution");
    return "";
  }

  // Valorile nutriționale (per 100g)
  const calories = n["energy-kcal_100g"] ?? null;
  const sugars = n["sugars_100g"] ?? null;
  const satFat = n["saturated-fat_100g"] ?? null;
  const salt = n["salt_100g"] ?? null;

  // Calculul scorului 0-100
  function computeScore() {
    let score = 100;
    if (calories != null) score -= Math.min(20, (calories / 500) * 20);
    if (sugars != null) score -= Math.min(25, (sugars / 30) * 25);
    if (satFat != null) score -= Math.min(25, (satFat / 15) * 25);
    if (salt != null) score -= Math.min(20, (salt / 2) * 20);
    additives.forEach((a) => {
      if (a.level === "caution") score -= 5;
      else if (a.level === "moderate") score -= 2;
    });
    return Math.max(0, Math.round(score));
  }
  const score = product ? computeScore() : 0;

  // Lista de nutrienți cu bulinele lor
  function buildNutrientBadges() {
    const rows: { label: string; value: number; unit: string; color: string }[] = [];
    if (calories != null)
      rows.push({
        label: t("energy"),
        value: Math.round(calories),
        unit: "kcal",
        color: nutrientColor(calories, 150, 350),
      });
    if (sugars != null)
      rows.push({
        label: t("sugars"),
        value: Math.round(sugars * 10) / 10,
        unit: "g",
        color: nutrientColor(sugars, 5, 15),
      });
    if (satFat != null)
      rows.push({
        label: t("saturatedFat"),
        value: Math.round(satFat * 10) / 10,
        unit: "g",
        color: nutrientColor(satFat, 2, 5),
      });
    if (salt != null)
      rows.push({
        label: t("salt"),
        value: Math.round(salt * 100) / 100,
        unit: "g",
        color: nutrientColor(salt, 0.3, 1.5),
      });
    return rows;
  }
  const nutrientBadges = product ? buildNutrientBadges() : [];

  return (
    <View style={styles.screen}>
      <View style={styles.langCorner}>
        <TouchableOpacity
          style={styles.globeButton}
          onPress={() => setLangMenuOpen(true)}
        >
          <Text style={styles.globeText}>🌐 {currentLang.flag}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={langMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLangMenuOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLangMenuOpen(false)}
        >
          <View style={styles.langMenu}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langItem,
                  i18n.language === lang.code && styles.langItemActive,
                ]}
                onPress={() => selectLanguage(lang.code)}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.langLabel,
                    i18n.language === lang.code && styles.langLabelActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("title")}</Text>
        <Text style={styles.subtitle}>{t("subtitle")}</Text>

        <TextInput
          style={styles.input}
          placeholder={t("placeholder")}
          value={barcode}
          onChangeText={setBarcode}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={fetchProduct}>
          <Text style={styles.buttonText}>{t("searchButton")}</Text>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 24 }} />
        )}

        {error !== "" && <Text style={styles.error}>{error}</Text>}

        {product && (
          <View style={styles.card}>
           <View style={styles.headerRow}>
              {product.image_url && (
                <Image
                  source={{ uri: product.image_url }}
                  style={styles.productImageSmall}
                  resizeMode="contain"
                />
              )}
              <View style={styles.headerInfo}>
                <Text style={styles.productName}>
                  {product.brands
                    ? product.brands.split(",")[0]
                    : t("unknownBrand")}
                </Text>
                <Text style={styles.productBrand}>
                  {product.product_name || t("unknownName")}
                </Text>
                <View style={styles.scorePill}>
                  <View
                    style={[styles.scoreDot, { backgroundColor: scoreColor(score) }]}
                  />
                  <Text
                    style={[styles.scorePillText, { color: scoreColor(score) }]}
                  >
                    {score}/100
                  </Text>
                </View>
              </View>
            </View>

            {/* Nutrienții cu buline */}
            {nutrientBadges.map((row, idx) => (
              <View key={idx} style={styles.nutrientRow}>
                <View style={[styles.nutrientDot, { backgroundColor: row.color }]} />
                <Text style={styles.nutrientLabel}>{row.label}</Text>
                <Text style={styles.nutrientValue}>
                  {row.value} {row.unit}
                </Text>
              </View>
            ))}

             {/* Ingrediente */}
            <Text style={styles.scoreLabel}>{t("ingredientsLabel")}</Text>
            <Text style={styles.ingredients}>
              {product[`ingredients_text_${i18n.language}`] ||
                product.ingredients_text_en ||
                product.ingredients_text ||
                t("noIngredients")}
            </Text>
            
            {/* Aditivii */}
            <Text style={styles.scoreLabel}>{t("additivesLabel")}</Text>
            {additives.length === 0 ? (
              <Text style={styles.scoreUnknown}>{t("noAdditives")}</Text>
            ) : (
              additives.map((add, idx) => (
                <View key={idx} style={styles.additiveRow}>
                  <View
                    style={[
                      styles.additiveDot,
                      { backgroundColor: add.level ? levelColors[add.level] : "#999" },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.additiveName}>
                      {add.code}
                      {add.name ? ` · ${add.name}` : ""}
                    </Text>
                    {add.use !== "" && (
                      <Text style={styles.additiveUse}>
                        {add.use}
                        {add.level ? ` — ${levelText(add.level)}` : ""}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}

            <Text style={styles.disclaimer}>{t("disclaimer")}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F7F2" },
  langCorner: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  globeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  globeText: { fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 95,
    paddingHorizontal: 16,
  },
  langMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  langItemActive: { backgroundColor: "#EAF5EA" },
  langFlag: { fontSize: 20 },
  langLabel: { fontSize: 16, color: "#333" },
  langLabelActive: { color: "#2E7D32", fontWeight: "700" },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: { fontSize: 42, fontWeight: "bold", color: "#2E7D32" },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2E7D32",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  error: { color: "#C62828", marginTop: 20, fontSize: 16 },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
  },
  productImage: {
    width: "100%",
    height: 180,
    marginBottom: 12,
    borderRadius: 8,
  },
  productName: { fontSize: 22, fontWeight: "bold", color: "#222" },
  productBrand: { fontSize: 16, color: "#666", marginBottom: 12 },
  scoreCircleWrap: {
    alignItems: "center",
    marginVertical: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreNumber: { color: "#FFFFFF", fontSize: 42, fontWeight: "bold" },
  scoreOutOf: { color: "#FFFFFF", fontSize: 12, opacity: 0.9 },
  nutrientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  nutrientDot: { width: 16, height: 16, borderRadius: 8 },
  nutrientLabel: { flex: 1, fontSize: 15, color: "#333" },
  nutrientValue: { fontSize: 15, fontWeight: "700", color: "#222" },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
    marginTop: 20,
    marginBottom: 8,
  },
  scoreUnknown: { fontSize: 14, color: "#999", fontStyle: "italic" },
  additiveRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  additiveDot: { width: 12, height: 12, borderRadius: 6 },
  additiveName: { fontSize: 14, fontWeight: "600", color: "#222" },
  additiveUse: { fontSize: 13, color: "#777" },
  disclaimer: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 20,
    lineHeight: 17,
  },
  ingredients: { fontSize: 14, color: "#444", marginTop: 4 },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    marginBottom: 16,
  },
  scoreDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  scorePillText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  productImageSmall: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  headerInfo: {
    flex: 1,
  },
});