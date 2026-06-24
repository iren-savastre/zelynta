import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { saveToHistory } from "../utils/history";
import { analyzeProduct } from "../utils/score";
import { isFavorite, toggleFavorite } from "../utils/favorites";
import { getBetterAlternatives, type Alternative } from "../utils/alternatives";
import { useTheme, type ThemeColors } from "../utils/theme";
import { useBasket } from "../utils/basket";
import JuicyButton from "../components/JuicyButton";

const languages = [
  { code: "ro", label: "Română", flag: "🇷🇴", cc: "ro" },
  { code: "en", label: "English", flag: "🇬🇧", cc: "gb" },
  { code: "fr", label: "Français", flag: "🇫🇷", cc: "fr" },
  { code: "it", label: "Italiano", flag: "🇮🇹", cc: "it" },
  { code: "es", label: "Español", flag: "🇪🇸", cc: "es" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", cc: "de" },
  { code: "ru", label: "Русский", flag: "🇷🇺", cc: "ru" },
  { code: "pl", label: "Polski", flag: "🇵🇱", cc: "pl" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱", cc: "nl" },
];

// Pe Windows/web emoji-urile de drapel nu se randează → folosim imagini reale
function flagUrl(cc: string, w: number) {
  return `https://flagcdn.com/w${w}/${cc}.png`;
}

const levelColors: Record<string, string> = {
  safe: "#038141",
  moderate: "#FECB02",
  caution: "#EE8100",
  risk: "#E63E11",
};

const isWeb = Platform.OS === "web";

// Stiluri „glass" (doar web — folosesc CSS real pasat de react-native-web)
function makeGlass(c: ThemeColors): any {
  return isWeb
    ? {
        backgroundColor: c.glassBg,
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        borderWidth: 1,
        borderColor: c.glassBorder,
        boxShadow: c.isDark
          ? "0 8px 32px rgba(0,0,0,0.35)"
          : "0 8px 32px rgba(31,55,38,0.12)",
      }
    : {};
}

function makeGlassStrong(c: ThemeColors): any {
  return isWeb
    ? {
        backgroundColor: c.isDark ? "rgba(26,33,28,0.78)" : "rgba(255,255,255,0.72)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderWidth: 1,
        borderColor: c.glassBorder,
        boxShadow: c.isDark
          ? "0 12px 48px rgba(0,0,0,0.45)"
          : "0 12px 48px rgba(31,55,38,0.16)",
      }
    : {};
}

function desktopBg(c: ThemeColors): any {
  if (!isWeb) return {};
  return c.isDark
    ? {
        backgroundColor: "#0F1511",
        backgroundImage:
          "radial-gradient(900px 600px at 12% 8%, rgba(46,125,50,0.22), transparent 60%), radial-gradient(800px 700px at 90% 100%, rgba(91,189,98,0.14), transparent 55%), linear-gradient(135deg,#10160F 0%,#131A14 45%,#0F1511 100%)",
      }
    : {
        backgroundColor: "#e6efe6",
        backgroundImage:
          "radial-gradient(900px 600px at 12% 8%, rgba(46,125,50,0.18), transparent 60%), radial-gradient(800px 700px at 90% 100%, rgba(133,187,47,0.16), transparent 55%), linear-gradient(135deg,#dfeada 0%,#eef3ec 45%,#e3ede6 100%)",
      };
}

function scoreColor(score: number) {
  if (score >= 66) return "#038141";
  if (score >= 33) return "#EE8100";
  return "#E63E11";
}

function nutrientColor(value: number, midThreshold: number, highThreshold: number) {
  if (value <= midThreshold) return "#038141";
  if (value <= highThreshold) return "#EE8100";
  return "#E63E11";
}

export default function Index() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, toggle } = useTheme();
  const basket = useBasket();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const glass = useMemo(() => makeGlass(colors), [colors]);
  const glassStrong = useMemo(() => makeGlassStrong(colors), [colors]);
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 900;
  const params = useLocalSearchParams<{ barcode?: string }>();

  // Roșia care țopăie 🍅
  const hop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hop, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(hop, {
          toValue: 0,
          duration: 600,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
        Animated.delay(900),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [hop]);
  const hopTranslate = hop.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -28],
  });
  const hopScale = hop.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.06, 1],
  });

  // Animație zoom poză (scale + fade)
  const zoom = useRef(new Animated.Value(0)).current;
  function openZoom(url: string) {
    setZoomImage(url);
    zoom.setValue(0);
    Animated.spring(zoom, {
      toValue: 1,
      friction: 6,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }
  function closeZoom() {
    Animated.timing(zoom, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => setZoomImage(null));
  }
  const zoomScale = zoom.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const zoomRotate = zoom.interpolate({
    inputRange: [0, 1],
    outputRange: ["-8deg", "0deg"],
  });
  useEffect(() => {
    if (params.barcode) {
      setBarcode(params.barcode);
      fetchProductByCode(params.barcode);
    }
  }, [params.barcode]);
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState("");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedAdditive, setSelectedAdditive] = useState<any>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [altLoading, setAltLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const currentLang =
    languages.find((l) => l.code === i18n.language) ?? languages[1];

  function selectLanguage(code: string) {
    i18n.changeLanguage(code);
    setLangMenuOpen(false);
  }

 async function fetchProductByCode(code: string) {
    setLoading(true);
    setError("");
    setProduct(null);
    setSelectedAdditive(null);
    setScannerOpen(false);
    setLangMenuOpen(false);

    // Caută pe rând în 3 baze: alimente, cosmetice, produse generale
    const databases = [
      "https://world.openfoodfacts.org",
      "https://world.openbeautyfacts.org",
      "https://world.openproductsfacts.org",
    ];

    try {
      for (const base of databases) {
        try {
          const response = await fetch(
            `${base}/api/v2/product/${code}.json`,
            {
              headers: {
                "User-Agent": "Zelynta/1.0 (iren.savastre@example.com)",
              },
            }
          );
          const data = await response.json();
          if (data.status === 1) {
            setProduct(data.product);
            setLoading(false);
            return; // produs găsit, ne oprim
          }
        } catch (e) {
          // dacă o bază eșuează, continuăm cu următoarea
        }
      }
      // dacă am terminat toate bazele fără rezultat
      setError(t("errorNotFound"));
    } catch (e) {
      setError(t("errorConnection"));
    } finally {
      setLoading(false);
    }
  }

  function fetchProduct() {
    if (!barcode) {
      setError(t("errorEmpty"));
      return;
    }
    fetchProductByCode(barcode);
  }

  async function openScanner() {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setTorchOn(false);
    setScannerOpen(true);
  }

  function closeScanner() {
    setTorchOn(false);
    setScannerOpen(false);
  }

  function handleBarcodeScanned({ data }: { data: string }) {
    if (!scannerOpen) return; // evită declanșarea multiplă
    // Feedback haptic la scanare reușită
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
    }
    closeScanner();
    setBarcode(data);
    fetchProductByCode(data);
  }

  const n = product?.nutriments ?? {};
  const lang = i18n.language;

  // Analiza completă (scor + motive + aditivi + cosmetice) — partajată cu comparația/alternativele
  const analysis = useMemo(
    () =>
      product
        ? analyzeProduct(product, lang)
        : { score: 0, reasons: [], additives: [], cosmetics: [] },
    [product, lang]
  );
  const additives = analysis.additives;
  const cosmetics = analysis.cosmetics;
  const scoreData = analysis;
  const score = analysis.score;

  function levelText(level: string | null) {
    if (level === "safe") return t("levelSafe");
    if (level === "moderate") return t("levelModerate");
    if (level === "caution") return t("levelCaution");
    if (level === "risk") return t("levelRisk");
    return "";
  }

  function reasonLabel(r: (typeof analysis.reasons)[number]) {
    if (r.kind === "nutrient") {
      const map: Record<string, string> = {
        sugars: t("sugars"),
        energy: t("energy"),
        saturatedFat: t("saturatedFat"),
        salt: t("salt"),
      };
      return map[r.key] ?? r.key;
    }
    return `${r.name}${r.level ? ` — ${levelText(r.level)}` : ""}`;
  }

  function scoreVerdict(s: number) {
    if (s >= 66) return t("verdictHealthy");
    if (s >= 33) return t("verdictModerate");
    return t("verdictUnhealthy");
  }

  const calories = n["energy-kcal_100g"] ?? null;
  const sugars = n["sugars_100g"] ?? null;
  const satFat = n["saturated-fat_100g"] ?? null;
  const salt = n["salt_100g"] ?? null;
useEffect(() => {
    if (!product) return;
    saveToHistory({
      barcode: product.code ?? barcode,
      name: product.product_name || t("unknownName"),
      brand: product.brands ? product.brands.split(",")[0] : t("unknownBrand"),
      imageUrl: product.image_url ?? "",
      score,
      scannedAt: Date.now(),
    });
    // Starea de favorit
    setShowBreakdown(false);
    isFavorite(product.code ?? barcode).then(setFavorite);
    // Caută alternative mai bune
    setAlternatives([]);
    setAltLoading(true);
    getBetterAlternatives(product, score, lang)
      .then(setAlternatives)
      .finally(() => setAltLoading(false));
  }, [product]);

  function currentHistoryItem() {
    return {
      barcode: product.code ?? barcode,
      name: product.product_name || t("unknownName"),
      brand: product.brands ? product.brands.split(",")[0] : t("unknownBrand"),
      imageUrl: product.image_url ?? "",
      score,
      scannedAt: Date.now(),
    };
  }

  async function onToggleFavorite() {
    if (!product) return;
    const now = await toggleFavorite(currentHistoryItem());
    setFavorite(now);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }
 function buildNutrientBadges() {
    const rows: {
      label: string;
      value: number;
      unit: string;
      color: string;
      percent: number;
    }[] = [];

    // Calculează poziția săgeții ASTFEL încât să se alinieze cu culorile:
    // sub mid = zona verde (0-50%), între mid-high = galben/portocaliu (50-75%), peste high = roșu (75-100%)
    function pos(value: number, mid: number, high: number) {
      if (value <= mid) return (value / mid) * 50;
      if (value <= high) return 50 + ((value - mid) / (high - mid)) * 25;
      return Math.min(100, 75 + ((value - high) / high) * 25);
    }

    if (calories != null)
      rows.push({
        label: t("energy"),
        value: Math.round(calories),
        unit: "kcal",
        color: nutrientColor(calories, 150, 350),
        percent: pos(calories, 150, 350),
      });
    if (sugars != null)
      rows.push({
        label: t("sugars"),
        value: Math.round(sugars * 10) / 10,
        unit: "g",
      color: nutrientColor(sugars, 3, 10),
        percent: pos(sugars, 3, 10),
      });
    if (satFat != null)
      rows.push({
        label: t("saturatedFat"),
        value: Math.round(satFat * 10) / 10,
        unit: "g",
        color: nutrientColor(satFat, 2, 5),
        percent: pos(satFat, 2, 5),
      });
    if (salt != null)
      rows.push({
        label: t("salt"),
        value: Math.round(salt * 100) / 100,
        unit: "g",
        color: nutrientColor(salt, 0.3, 1.5),
        percent: pos(salt, 0.3, 1.5),
      });
    return rows;
  }
  const nutrientBadges = product ? buildNutrientBadges() : [];
  // Ambalaj
  function detectPackaging() {
    const pkg = (
      (product?.packaging ?? "") + (product?.packaging_tags ?? "")
    ).toLowerCase();
    if (pkg.includes("glass") || pkg.includes("verre") || pkg.includes("sticl"))
      return "glass";
    if (
      pkg.includes("metal") || pkg.includes("can") || pkg.includes("aluminium") ||
      pkg.includes("canette") || pkg.includes("doza") || pkg.includes("alu")
    )
      return "metal";
    if (pkg.includes("carton") || pkg.includes("brick") || pkg.includes("paper"))
      return "carton";
    if (pkg.includes("plastic") || pkg.includes("pet") || pkg.includes("plastique"))
      return "plastic";
    return "unknown";
  }
  const packaging = product ? detectPackaging() : "unknown";
  const packagingColor =
    packaging === "glass" ? "#038141"
    : packaging === "metal" ? "#85BB2F"
    : packaging === "carton" ? "#85BB2F"
    : packaging === "plastic" ? "#EE8100"
    : "#999";
  const packagingText =
    packaging === "glass" ? t("packagingGlass")
    : packaging === "metal" ? t("packagingMetal")
    : packaging === "carton" ? t("packagingCarton")
    : packaging === "plastic" ? t("packagingPlastic")
    : t("packagingUnknown");
    const isBeverage = /water|eau|apa|drink|beverage|boisson|soda|juice|jus|cola|limonad/i.test(
    (product?.categories ?? "") + (product?.product_name ?? "") + (product?.brands ?? "")
  );
const additiveDesc = selectedAdditive ? selectedAdditive.desc : "";

  return (
    <KeyboardAvoidingView
      style={[styles.screen, isWeb && styles.screenWeb]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />
      {/* Scanner camera */}
      {scannerOpen && (
        <Modal visible transparent={false} animationType="slide">
          <View style={styles.scannerScreen}>
            <CameraView
              style={styles.camera}
              facing="back"
              enableTorch={torchOn}
              barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
              }}
              onBarcodeScanned={handleBarcodeScanned}
            />
            <View style={styles.scanFrame}>
              <View style={[styles.scanCorner, styles.scanCornerTL]} />
              <View style={[styles.scanCorner, styles.scanCornerTR]} />
              <View style={[styles.scanCorner, styles.scanCornerBL]} />
              <View style={[styles.scanCorner, styles.scanCornerBR]} />
            </View>
            <TouchableOpacity
              style={[styles.torchButton, torchOn && styles.torchButtonOn]}
              onPress={() => setTorchOn((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={t("torch")}
            >
              <Text style={styles.torchIcon}>{torchOn ? "🔦" : "💡"}</Text>
            </TouchableOpacity>
            <View style={styles.scannerOverlay}>
              <Text style={styles.scannerText}>{t("scanInstructions")}</Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeScanner}
                accessibilityRole="button"
                accessibilityLabel={t("cancel")}
              >
                <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Zoom poză produs */}
      {zoomImage && (
        <Modal visible transparent animationType="none" onRequestClose={closeZoom}>
          <Animated.View style={[styles.zoomOverlay, { opacity: zoom }]}>
            <Pressable style={styles.zoomBackdrop} onPress={closeZoom} />
            <Animated.Image
              source={{ uri: zoomImage }}
              style={[
                styles.zoomImage,
                {
                  transform: [{ scale: zoomScale }, { rotate: zoomRotate }],
                },
              ]}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.zoomClose}
              onPress={closeZoom}
              accessibilityRole="button"
              accessibilityLabel={t("cancel")}
            >
              <Text style={styles.zoomCloseText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
      )}

      {/* Meniu limbi */}
      {langMenuOpen && (
        <Modal visible transparent animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setLangMenuOpen(false)}
          >
            <View style={[styles.langMenu, isWeb && glass]}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langItem,
                    i18n.language === lang.code && styles.langItemActive,
                  ]}
                  onPress={() => selectLanguage(lang.code)}
                >
                  <Image
                    source={{ uri: flagUrl(lang.cc, 80) }}
                    style={styles.langFlagImg}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Detalii aditiv */}
      {selectedAdditive && (
        <Modal visible transparent animationType="fade">
          <Pressable
            style={styles.additiveModalOverlay}
            onPress={() => setSelectedAdditive(null)}
          >
            <Pressable style={styles.additiveModal} onPress={() => {}}>
              <View style={styles.additiveModalHeader}>
                <View
                  style={[
                    styles.additiveModalDot,
                    {
                      backgroundColor: selectedAdditive.level
                        ? levelColors[selectedAdditive.level]
                        : "#999",
                    },
                  ]}
                />
                <Text style={styles.additiveModalTitle}>
                  {selectedAdditive.code}
                  {selectedAdditive.name ? ` · ${selectedAdditive.name}` : ""}
                </Text>
              </View>
              {selectedAdditive.level && (
                <Text
                  style={[
                    styles.additiveModalLevel,
                    { color: levelColors[selectedAdditive.level] },
                  ]}
                >
                  {levelText(selectedAdditive.level)}
                </Text>
              )}
              <Text style={styles.additiveModalDesc}>{additiveDesc}</Text>
              <TouchableOpacity
                style={styles.additiveModalClose}
                onPress={() => setSelectedAdditive(null)}
              >
                <Text style={styles.additiveModalCloseText}>{t("cancel")}</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}

     <View style={[styles.navbar, isWeb && glass, isDesktop && styles.topBar]}>
        <View style={styles.brandRow}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>Zelynta</Text>
        </View>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={[styles.iconButton, isWeb && glass]}
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={t("theme")}
          >
            <Text style={styles.iconButtonText}>{colors.isDark ? "☀️" : "🌙"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.historyButton, isWeb && glass]}
            onPress={() => router.push("/history")}
            accessibilityRole="button"
            accessibilityLabel={t("historyTitle")}
          >
            <Text style={styles.flagButtonText}>📜</Text>
            <Text style={styles.historyButtonText}>{t("historyTitle")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flagButton, isWeb && glass]}
            onPress={() => setLangMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={currentLang.label}
          >
            <Image
              source={{ uri: flagUrl(currentLang.cc, 40) }}
              style={styles.flagImg}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.container, isDesktop && styles.containerDesktop]}
        keyboardShouldPersistTaps="handled"
      >
       <View style={[styles.workspace, isDesktop && styles.workspaceDesktop]}>
        <View style={[styles.leftPanel, isDesktop && styles.leftPanelDesktop, isDesktop && glassStrong]}>
        <Animated.Image
          source={require("../assets/images/icon.png")}
          style={[
            styles.logo,
            { transform: [{ translateY: hopTranslate }, { scale: hopScale }] },
          ]}
          resizeMode="contain"
        />

        <Text style={styles.subtitle}>{t("subtitle")}</Text>


        <JuicyButton
          big
          emoji="🍅"
          label={t("scanButton")}
          onPress={openScanner}
          colorTop="#FF6B5A"
          colorBottom="#C42E1C"
        />

        <TextInput
          style={[styles.input, isWeb && glass]}
          placeholder={t("placeholder")}
          value={barcode}
          onChangeText={setBarcode}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={fetchProduct}
          accessibilityLabel={t("placeholder")}
        />

        <JuicyButton
          emoji="🍏"
          label={t("searchButton")}
          onPress={fetchProduct}
          disabled={!barcode || loading}
          colorTop="#7BC950"
          colorBottom="#3E8E2E"
        />
        </View>

        <View style={[styles.rightCol, isDesktop && styles.rightColDesktop]}>
        {isDesktop && !product && !loading && error === "" && (
          <View style={[styles.emptyState, glass]}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>{t("subtitle")}</Text>
          </View>
        )}

        {loading && (
          <View style={[styles.card, isWeb && glassStrong]}>
            <View style={styles.headerRow}>
              <View style={[styles.skeleton, styles.skelImage]} />
              <View style={{ flex: 1, gap: 8 }}>
                <View style={[styles.skeleton, styles.skelLineLg]} />
                <View style={[styles.skeleton, styles.skelLineSm]} />
                <View style={[styles.skeleton, styles.skelPill]} />
              </View>
            </View>
            <View style={[styles.skeleton, styles.skelBar]} />
            <View style={[styles.skeleton, styles.skelBar]} />
            <View style={[styles.skeleton, styles.skelBar]} />
          </View>
        )}

        {!loading && error !== "" && (
          <View style={[styles.errorCard, isWeb && glassStrong]}>
            <Text style={styles.errorIcon}>😕</Text>
            <Text style={styles.errorTitle}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => (barcode ? fetchProduct() : openScanner())}
              accessibilityRole="button"
            >
              <Text style={styles.retryButtonText}>↻ {t("retry")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {product && (
          <View style={[styles.card, isWeb && glassStrong]}>
            <View style={styles.headerRow}>
              {product.image_url && (
                <TouchableOpacity
                  onPress={() => openZoom(product.image_url)}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={product.product_name || t("unknownName")}
                >
                  <Image
                    source={{ uri: product.image_url }}
                    style={styles.productImageSmall}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
              <View style={styles.headerInfo}>
                <Text style={styles.productName}>
                  {product.product_name ||
                    (product.brands ? product.brands.split(",")[0] : t("unknownName"))}
                </Text>
                <Text style={styles.productBrand}>
                  {product.brands
                    ? product.brands.split(",")[0]
                    : t("unknownBrand")}
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <TouchableOpacity
                  style={styles.favButton}
                  onPress={onToggleFavorite}
                  accessibilityRole="button"
                  accessibilityLabel={t("favorite")}
                >
                  <Text style={styles.favIcon}>{favorite ? "❤️" : "🤍"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.favButton,
                    basket.has(product.code ?? barcode) && styles.favButtonOn,
                  ]}
                  onPress={() => basket.toggle(currentHistoryItem())}
                  accessibilityRole="button"
                  accessibilityLabel={t("basketAdd")}
                >
                  <Text style={styles.favIcon}>
                    {basket.has(product.code ?? barcode) ? "🧺" : "➕"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Gauge circular de scor */}
            <View style={styles.scoreSection}>
              <View
                style={[
                  styles.scoreRing,
                  isWeb
                    ? ({
                        backgroundImage: `conic-gradient(${scoreColor(
                          score
                        )} ${score * 3.6}deg, ${colors.surfaceAlt} ${score * 3.6}deg)`,
                      } as any)
                    : { borderWidth: 8, borderColor: scoreColor(score) },
                ]}
              >
                <View style={styles.scoreRingInner}>
                  <Text style={[styles.scoreRingNum, { color: scoreColor(score) }]}>
                    {score}
                  </Text>
                  <Text style={styles.scoreRingOutOf}>{t("scoreOutOf")}</Text>
                </View>
              </View>
              <View style={styles.scoreVerdictCol}>
                <Text
                  style={[styles.scoreVerdict, { color: scoreColor(score) }]}
                >
                  {scoreVerdict(score)}
                </Text>
                {scoreData.reasons.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setShowBreakdown((v) => !v)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.scoreWhy}>
                      {showBreakdown ? "▾ " : "▸ "}
                      {t("scoreWhyTitle")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {showBreakdown && scoreData.reasons.length > 0 && (
              <View style={styles.breakdown}>
                {scoreData.reasons.map((r, idx) => (
                  <View key={idx} style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel} numberOfLines={1}>
                      {reasonLabel(r)}
                    </Text>
                    <Text style={styles.breakdownDelta}>{r.delta}</Text>
                  </View>
                ))}
              </View>
            )}
{nutrientBadges.map((row, idx) => (
              <View key={idx} style={styles.nutrientBlock}>
                <View style={styles.nutrientRow}>
                  <View style={[styles.nutrientDot, { backgroundColor: row.color }]} />
                  <Text style={styles.nutrientLabel}>{row.label}</Text>
                  <Text style={styles.nutrientValue}>
                    {row.value} {row.unit}
                  </Text>
                </View>
                <View style={styles.baremWrap}>
                  <View style={styles.baremArrowRow}>
                    <Text style={[styles.baremArrow, { marginLeft: `${row.percent}%` }]}>
                      ▼
                    </Text>
                  </View>
                  <View style={styles.baremBar}>
                    <View style={[styles.baremSeg, { backgroundColor: "#038141" }]} />
                    <View style={[styles.baremSeg, { backgroundColor: "#85BB2F" }]} />
                    <View style={[styles.baremSeg, { backgroundColor: "#EE8100" }]} />
                    <View style={[styles.baremSeg, { backgroundColor: "#E63E11" }]} />
                  </View>
                </View>
              </View>
            ))}

           {packaging !== "unknown" && (
              <>
                <Text style={styles.scoreLabel}>{t("packagingLabel")}</Text>
                <View style={[styles.novaBadge, { backgroundColor: packagingColor }]}>
                  <Text style={styles.novaBadgeText}>{packagingText}</Text>
                </View>
                {packaging === "plastic" && isBeverage && (
                  <Text style={styles.microNote}>{t("microplasticNote")}</Text>
                )}
              </>
            )}
            <Text style={styles.scoreLabel}>{t("ingredientsLabel")}</Text>
            <Text style={styles.ingredients}>
              {product[`ingredients_text_${i18n.language}`] ||
                product.ingredients_text_en ||
                product.ingredients_text ||
                t("noIngredients")}
            </Text>

            <Text style={styles.scoreLabel}>{t("additivesLabel")}</Text>
            {additives.length === 0 ? (
              <Text style={styles.scoreUnknown}>{t("noAdditives")}</Text>
            ) : (
              additives.map((add, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.additiveRow}
                  onPress={() => setSelectedAdditive(add)}
                >
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
                  <Text style={styles.additiveArrow}>›</Text>
                </TouchableOpacity>
              ))
            )}
            {cosmetics.length > 0 && (
              <>
                <Text style={styles.scoreLabel}>{t("cosmeticsLabel")}</Text>
                {cosmetics.map((c, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.additiveRow}
                    onPress={() => setSelectedAdditive(c)}
                  >
                    <View
                      style={[
                        styles.additiveDot,
                        { backgroundColor: c.level ? levelColors[c.level] : "#999" },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.additiveName}>{c.code}</Text>
                      {c.use !== "" && (
                        <Text style={styles.additiveUse}>
                          {c.use}
                          {c.level ? ` — ${levelText(c.level)}` : ""}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.additiveArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Alternative mai bune */}
            {(altLoading || alternatives.length > 0) && (
              <>
                <Text style={styles.scoreLabel}>{t("alternativesLabel")}</Text>
                {altLoading && alternatives.length === 0 && (
                  <Text style={styles.altLoading}>{t("alternativesLoading")}</Text>
                )}
                {alternatives.map((alt) => (
                  <TouchableOpacity
                    key={alt.barcode}
                    style={styles.altCard}
                    onPress={() => {
                      setBarcode(alt.barcode);
                      fetchProductByCode(alt.barcode);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={alt.name}
                  >
                    {alt.imageUrl ? (
                      <Image
                        source={{ uri: alt.imageUrl }}
                        style={styles.altThumb}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.altThumb} />
                    )}
                    <View style={styles.altInfo}>
                      <Text style={styles.altName} numberOfLines={1}>
                        {alt.name}
                      </Text>
                      {alt.brand !== "" && (
                        <Text style={styles.altBrand} numberOfLines={1}>
                          {alt.brand}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.altScore, { color: scoreColor(alt.score) }]}>
                      {alt.score}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.altAdd,
                        basket.has(alt.barcode) && styles.altAddOn,
                      ]}
                      onPress={() =>
                        basket.toggle({
                          barcode: alt.barcode,
                          name: alt.name,
                          brand: alt.brand,
                          imageUrl: alt.imageUrl,
                          score: alt.score,
                          scannedAt: Date.now(),
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={t("basketAdd")}
                    >
                      <Text style={styles.altAddText}>
                        {basket.has(alt.barcode) ? "🧺" : "➕"}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <Text style={styles.disclaimer}>{t("disclaimer")}</Text>
          </View>
        )}
        </View>
       </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  screenWeb: desktopBg(c),
  workspace: { width: "100%", alignItems: "center" },
  workspaceDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 28,
    maxWidth: 1180,
    alignSelf: "center",
  },
  leftPanel: { width: "100%", maxWidth: 400, alignItems: "center" },
  leftPanelDesktop: {
    width: 420,
    maxWidth: 420,
    borderRadius: 28,
    padding: 32,
    ...(isWeb ? { position: "sticky" as any, top: 110 } : {}),
  },
  rightCol: { width: "100%", maxWidth: 400, alignItems: "center" },
  rightColDesktop: { flex: 1, maxWidth: 560, alignItems: "stretch" },
  emptyState: {
    borderRadius: 28,
    paddingVertical: 80,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  emptyIcon: { fontSize: 48, opacity: 0.5 },
  emptyTitle: { fontSize: 16, color: c.textMuted, textAlign: "center", maxWidth: 280 },
  topBar: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    ...(isWeb ? { position: "sticky" as any, top: 16, zIndex: 50 } : {}),
  },
  topBarActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandLogo: { width: 38, height: 38 },
  brandName: { fontSize: 22, fontWeight: "800", color: c.primary, letterSpacing: 0.5 },
  scannerScreen: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  scanFrame: {
    position: "absolute",
    top: "35%",
    left: "15%",
    right: "15%",
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  scanCorner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#FFFFFF",
  },
  scanCornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  scanCornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  scanCornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  scanCornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  scannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 30,
    alignItems: "center",
    gap: 16,
  },
  scannerText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "#222" },
  torchButton: {
    position: "absolute",
    top: 60,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  torchButtonOn: { backgroundColor: "rgba(255,213,79,0.9)" },
  torchIcon: { fontSize: 24 },
  // Buton search dezactivat
  buttonDisabled: { backgroundColor: "transparent", borderWidth: 2, borderColor: c.border },
  buttonTextDisabled: { color: c.textFaint },
  // Skeleton
  skeleton: { backgroundColor: c.surfaceAlt, borderRadius: 8, opacity: 0.8 },
  skelImage: { width: 90, height: 90, borderRadius: 8 },
  skelLineLg: { height: 20, width: "70%" },
  skelLineSm: { height: 14, width: "50%" },
  skelPill: { height: 16, width: 90, marginTop: 4 },
  skelBar: { height: 28, width: "100%", marginTop: 14 },
  // Card eroare
  errorCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },
  errorIcon: { fontSize: 44 },
  errorTitle: { fontSize: 16, color: c.textMuted, textAlign: "center", fontWeight: "600" },
  retryButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 6,
  },
  retryButtonText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  // Gauge de scor
  scoreSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 8,
  },
  scoreRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surfaceAlt,
  },
  scoreRingInner: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreRingNum: { fontSize: 30, fontWeight: "800", lineHeight: 34 },
  scoreRingOutOf: { fontSize: 10, color: c.textFaint, marginTop: -2 },
  scoreVerdictCol: { flex: 1, gap: 6 },
  scoreVerdict: { fontSize: 22, fontWeight: "800" },
  scoreWhy: { fontSize: 14, color: c.primary, fontWeight: "600" },
  breakdown: {
    backgroundColor: c.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
    gap: 6,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  breakdownLabel: { flex: 1, fontSize: 13, color: c.textMuted },
  breakdownDelta: { fontSize: 13, fontWeight: "700", color: "#E63E11" },
 navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: isWeb ? 14 : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 10,
    ...(isWeb
      ? {}
      : {
          backgroundColor: c.navbarBg,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
        }),
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: c.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: c.border,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: c.primary,
  },
  flagButton: {
    backgroundColor: c.surface,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: c.border,
  },
  flagButtonText: { fontSize: 24 },
  iconButton: {
    backgroundColor: c.surface,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: c.border,
  },
  iconButtonText: { fontSize: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 95,
    paddingHorizontal: 16,
  },
  langMenu: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 10,
    width: 200,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  langItem: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  langItemActive: {
    backgroundColor: c.isDark ? "rgba(91,189,98,0.18)" : "#EAF5EA",
    borderColor: c.primary,
  },
  langFlag: { fontSize: 30 },
  langFlagImg: { width: 40, height: 28, borderRadius: 4 },
  flagImg: { width: 30, height: 21, borderRadius: 3 },
  langLabel: { fontSize: 16, color: c.text },
  langLabelActive: { color: c.primary, fontWeight: "700" },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  containerDesktop: {
    justifyContent: "flex-start",
    paddingTop: 24,
    paddingHorizontal: 32,
  },
  title: { fontSize: 42, fontWeight: "bold", color: c.primary },
  subtitle: {
    fontSize: 16,
    color: c.textMuted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  scanBigButton: {
    backgroundColor: c.primary,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  scanBigButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  input: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: c.inputBg,
    color: c.text,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: c.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  error: { color: "#C62828", marginTop: 20, fontSize: 16 },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: c.surface,
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  productImageSmall: { width: 90, height: 90, borderRadius: 8 },
  headerInfo: { flex: 1 },
  productName: { fontSize: 22, fontWeight: "bold", color: c.text },
  productBrand: { fontSize: 16, color: c.textMuted, marginBottom: 6 },
  scorePill: { flexDirection: "row", alignItems: "center", gap: 8 },
  scoreDot: { width: 14, height: 14, borderRadius: 7 },
  scorePillText: { fontSize: 18, fontWeight: "bold" },
  nutrientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  nutrientDot: { width: 16, height: 16, borderRadius: 8 },
  nutrientLabel: { flex: 1, fontSize: 15, color: c.textMuted },
  nutrientValue: { fontSize: 15, fontWeight: "700", color: c.text },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: c.textMuted,
    marginTop: 20,
    marginBottom: 8,
  },
  scoreUnknown: { fontSize: 14, color: c.textFaint, fontStyle: "italic" },
  ingredients: { fontSize: 14, color: c.textMuted, marginTop: 4 },
  additiveRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  additiveDot: { width: 12, height: 12, borderRadius: 6 },
  additiveName: { fontSize: 14, fontWeight: "600", color: c.text },
  additiveUse: { fontSize: 13, color: c.textFaint },
  additiveArrow: { fontSize: 22, color: c.textFaint, fontWeight: "bold" },
  additiveModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  additiveModal: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  additiveModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  additiveModalDot: { width: 16, height: 16, borderRadius: 8 },
  additiveModalTitle: { fontSize: 18, fontWeight: "bold", color: c.text, flex: 1 },
  additiveModalLevel: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
  additiveModalDesc: { fontSize: 15, color: c.textMuted, lineHeight: 22 },
  additiveModalClose: {
    backgroundColor: c.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  additiveModalCloseText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  disclaimer: {
    fontSize: 12,
    color: c.textFaint,
    fontStyle: "italic",
    marginTop: 20,
    lineHeight: 17,
  },
  nutrientBlock: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  baremWrap: { marginTop: 6, paddingHorizontal: 2 },
  baremArrowRow: { width: "100%" },
  baremArrow: { fontSize: 10, color: c.textMuted },
  baremBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 2,
  },
  baremSeg: { flex: 1, height: "100%" },
  novaBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  novaBadgeText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  microNote: {
    fontSize: 13,
    color: "#B45309",
    marginTop: 8,
    fontStyle: "italic",
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 8,
  },
  // Favorite
  favButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surfaceAlt,
  },
  favButtonOn: { backgroundColor: c.isDark ? "rgba(91,189,98,0.25)" : "#EAF5EA" },
  favIcon: { fontSize: 20 },
  zoomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  zoomImage: { width: "88%", height: "70%" },
  zoomClose: {
    position: "absolute",
    top: 50,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomCloseText: { color: "#FFF", fontSize: 22, fontWeight: "700" },
  altAdd: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surface,
  },
  altAddOn: { backgroundColor: c.isDark ? "rgba(91,189,98,0.25)" : "#EAF5EA" },
  altAddText: { fontSize: 16 },
  // Alternative
  altCard: {
    backgroundColor: c.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  altThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: c.surface },
  altInfo: { flex: 1 },
  altName: { fontSize: 14, fontWeight: "600", color: c.text },
  altBrand: { fontSize: 12, color: c.textFaint },
  altScore: { fontSize: 16, fontWeight: "800" },
  altLoading: { fontSize: 13, color: c.textFaint, fontStyle: "italic", marginTop: 6 },
});