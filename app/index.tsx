import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    ActivityIndicator,
    Animated,
    BackHandler,
    Easing,
    Image,
    KeyboardAvoidingView,
    Linking,
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
import JuicyButton from "../components/JuicyButton";
import AppFooter from "../components/AppFooter";
import NavMarquee from "../components/NavMarquee";
import PaletteButton from "../components/PaletteButton";
import ThemeFx from "../components/ThemeFx";
import TipsSection from "../components/TipsSection";
import WaveText from "../components/WaveText";
import { getProductAdvice } from "../utils/advice";
import { getBetterAlternatives, type Alternative } from "../utils/alternatives";
import { persistAppLanguage } from "../i18n/i18n";
import { fetchProductByBarcode } from "../utils/apiClient";
import { useBasket } from "../utils/basket";
import { saveToHistory } from "../utils/history";
import { getPalmNote, hasPalmOil } from "../utils/palm";
import { translateText } from "../utils/translate";
import { pickM } from "../i18n/methodology";
import BodyDiagram from "../components/BodyDiagram";
import { organsForAdditive, organName } from "../utils/bodyMap";
import { localizeInci } from "../utils/inci";
import { extractAdditiveTags, extractIngredientsSegment, ocrImage } from "../utils/ocr";
import { analyzeProduct, stripAdditives, productDisplay } from "../utils/score";
import { mixHex, PALETTES, useTheme, type ThemeColors } from "../utils/theme";

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
  { code: "bg", label: "Български", flag: "🇧🇬", cc: "bg" },
  { code: "el", label: "Ελληνικά", flag: "🇬🇷", cc: "gr" },
];

// Pe Windows/web emoji-urile de drapel nu se randează → folosim imagini reale
function flagUrl(cc: string, w: number) {
  return `https://flagcdn.com/w${w}/${cc}.png`;
}

// Etichete pentru traducerea automata a ingredientelor (in toate cele 11 limbi)
const autoLabels = {
  translating: { ro: "Se traduce…", en: "Translating…", fr: "Traduction…", it: "Traduzione…", es: "Traduciendo…", de: "Wird übersetzt…", ru: "Перевод…", pl: "Tłumaczenie…", nl: "Vertalen…" } as Record<string, string>,
  auto: { ro: "tradus automat", en: "auto-translated", fr: "traduit automatiquement", it: "tradotto automaticamente", es: "traducido automáticamente", de: "automatisch übersetzt", ru: "автоперевод", pl: "przetłumaczone automatycznie", nl: "automatisch vertaald" } as Record<string, string>,
};

const levelColors: Record<string, string> = {
  safe: "#038141",
  moderate: "#FECB02",
  caution: "#EE8100",
  risk: "#E63E11",
};

// Titlul sectiunii cu silueta corpului (organe afectate), in 9 limbi.
const bodyTitle: Record<string, string> = {
  ro: "Ce poate afecta în corp",
  en: "What it can affect in the body",
  fr: "Ce qu'il peut affecter dans le corps",
  it: "Cosa può colpire nel corpo",
  es: "Qué puede afectar en el cuerpo",
  de: "Was es im Körper beeinflussen kann",
  ru: "На что может влиять в организме",
  pl: "Na co może wpływać w organizmie",
  nl: "Wat het in het lichaam kan beïnvloeden",
  bg: "На какво може да въздейства в тялото",
  el: "Τι μπορεί να επηρεάσει στο σώμα",
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
        backgroundColor: c.isDark ? "rgba(26,33,28,0.82)" : "rgba(255,255,255,0.78)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderWidth: 1,
        borderColor: c.glassBorder,
        boxShadow: c.isDark
          ? "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -6px 14px rgba(0,0,0,0.2)"
          : "0 24px 60px rgba(31,55,38,0.2), inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -6px 14px rgba(31,55,38,0.05)",
      }
    : {};
}

function desktopBg(c: ThemeColors): any {
  if (!isWeb) return {};
  const a = c.primary; // accentul paletei curente
  const g1 = c.isDark ? "33" : "2B"; // intensitate glow
  const g2 = c.isDark ? "22" : "20";
  return {
    backgroundColor: c.bg,
    backgroundImage:
      `radial-gradient(900px 600px at 12% 8%, ${a}${g1}, transparent 60%), ` +
      `radial-gradient(800px 700px at 90% 100%, ${a}${g2}, transparent 55%), ` +
      `linear-gradient(135deg, ${c.bg} 0%, ${c.surfaceAlt} 45%, ${c.bg} 100%)`,
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
  const { colors, toggle, palette } = useTheme();
  const pal = PALETTES.find((p) => p.id === palette) || PALETTES[0];
  const paletteEmoji = pal.emoji;
  // butoanele (scanare/căutare) urmează tema
  const scanTop = pal.primaryDark;
  const scanBottom = pal.primary;
  const searchTop = pal.primary;
  const searchBottom = mixHex(pal.primary, 0.62, "#000000");

  // drapel animat (sway) — ca pe landing page
  const flagWave = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flagWave, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(flagWave, { toValue: -1, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [flagWave]);
  const flagRotate = flagWave.interpolate({ inputRange: [-1, 1], outputRange: ["-4deg", "4deg"] });
  const basket = useBasket();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const glass = useMemo(() => makeGlass(colors), [colors]);
  const glassStrong = useMemo(() => makeGlassStrong(colors), [colors]);
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 900;
  const isWide = isWeb && width >= 600; // tabletă+: aliniat sus (fără gol jos)
  const params = useLocalSearchParams<{ barcode?: string }>();

  // Roșia care țopăie 🍅 — bucla clasica: saritura + aterizare cu bounce.
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
  const [ocrLoading, setOcrLoading] = useState(false);
  // Mod dedicat de fotografiere a ingredientelor: scannerul de coduri e oprit
  // complet, camera focalizeaza linistita, iar utilizatorul alege momentul pozei.
  const [ocrMode, setOcrMode] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [altLoading, setAltLoading] = useState(false);
  const [ingredientsText, setIngredientsText] = useState("");
  const [ingredientsAuto, setIngredientsAuto] = useState(false);
  const [ingredientsTranslating, setIngredientsTranslating] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();

  const currentLang =
    languages.find((l) => l.code === i18n.language) ?? languages[1];

  function selectLanguage(code: string) {
    i18n.changeLanguage(code);
    persistAppLanguage(code);
    setLangMenuOpen(false);
  }

 async function fetchProductByCode(code: string) {
    // Numar de serie al cererii: scannerul poate declansa acelasi cod de mai
    // multe ori intr-o fractiune de secunda → doar ULTIMA cerere are voie sa
    // scrie rezultatul, altfel una lenta/esuata suprascrie produsul deja gasit
    // cu "negasit".
    const seq = ++fetchSeqRef.current;
    setLoading(true);
    setError("");
    setProduct(null);
    setSelectedAdditive(null);
    setScannerOpen(false);
    setLangMenuOpen(false);

    try {
      // Caută pe rând în 3 baze: alimente, cosmetice, produse generale
      const found = await fetchProductByBarcode(code);
      if (seq !== fetchSeqRef.current) return; // a pornit alta cautare intre timp
      if (found) {
        setProduct(found);
        setLoading(false);
        return; // produs găsit, ne oprim
      }
      // dacă am terminat toate bazele fără rezultat
      setError(t("errorNotFound"));
    } catch (e) {
      if (seq !== fetchSeqRef.current) return;
      setError(t("errorConnection"));
    } finally {
      if (seq === fetchSeqRef.current) setLoading(false);
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
    setTorchOn(false);
    // Deschidem camera direct — utilizatorul a apăsat, e clar că vrea camera.
    setScannerOpen(true);
    // Dacă permisiunea nu e încă acordată, o cerem în fundal (dialogul
    // de securitate al browserului/sistemului e obligatoriu, nu îl putem evita).
    if (!permission?.granted) {
      requestPermission().catch(() => {});
    }
  }

  function closeScanner() {
    setTorchOn(false);
    setScannerOpen(false);
    setOcrMode(false);
  }

  useEffect(() => {
    if (!scannerOpen || Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeScanner();
      return true;
    });
    return () => sub.remove();
  }, [scannerOpen]);

  function handleBarcodeScanned({ data }: { data: string }) {
    if (!scannerOpen || ocrLoading) return; // evită declanșarea multiplă
    // Scannerul emite acelasi cod de mai multe ori pe secunda inainte ca
    // starea sa apuce sa se schimbe — ignoram repetarile apropiate.
    const now = Date.now();
    if (
      data === lastScanRef.current.code &&
      now - lastScanRef.current.at < 4000
    )
      return;
    lastScanRef.current = { code: data, at: now };
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

  // Nr. de serie al cautarii curente (doar ultima are voie sa scrie starea)
  // si ultimul cod scanat (anti-dublura la scanari repetate ale camerei).
  const fetchSeqRef = useRef(0);
  const lastScanRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });

  // Produsul curent, accesibil din bucla de recunoastere automata fara
  // problemele de "closure invechit" ale state-ului.
  const productRef = useRef<any>(null);
  useEffect(() => {
    productRef.current = product;
  }, [product]);

  // Recunoastere AUTOMATA a ingredientelor: cat timp modul foto e activ,
  // camera incearca singura (poza -> OCR) pana gaseste text — fara buton.
  useEffect(() => {
    if (!ocrMode || !scannerOpen) return;
    let alive = true;
    (async () => {
      // Lasam autofocusul sa se aseze dupa comutarea modului.
      await new Promise((r) => setTimeout(r, 1200));
      for (let attempt = 0; alive && attempt < 12; attempt++) {
        try {
          setOcrLoading(true);
          const r = await snapAndRead();
          if (!alive) return;
          // Sub ~25 de caractere e zgomot (colt de eticheta, blur) — reincercam.
          if (r && r.text.length >= 25) {
            applyOcrResult(r.text, r.photoUri);
            return;
          }
        } catch {
          // eroare trecatoare (retea/captura) — reincercam
        } finally {
          if (alive) setOcrLoading(false);
        }
        await new Promise((r) => setTimeout(r, 800));
      }
      if (alive) {
        closeScanner();
        setError(t("ocrNoText"));
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocrMode, scannerOpen]);

  // Face o poza, o micsoreaza si intoarce textul citit (gol daca nu e text).
  async function snapAndRead(): Promise<{ text: string; photoUri: string } | null> {
    if (!cameraRef.current) return null;
    let photo;
    try {
      // Intai poza procesata normal (orientare si expunere corecte).
      photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    } catch {
      await new Promise((r) => setTimeout(r, 400));
      // Fallback: captura rapida, fara post-procesare.
      photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        skipProcessing: true,
      });
    }
    // Micsoram poza inainte de OCR: sub limita de 1MB a OCR.space (gratuit)
    // si cu orientarea EXIF aplicata corect (pozele mari veneau rotite/goale).
    const small = photo?.uri
      ? await manipulateAsync(photo.uri, [{ resize: { width: 1280 } }], {
          compress: 0.7,
          format: SaveFormat.JPEG,
          base64: true,
        })
      : null;
    const text = await ocrImage(small?.uri ?? photo?.uri, small?.base64 ?? undefined);
    return { text: (text ?? "").trim(), photoUri: photo?.uri ?? "" };
  }

  // Aplica textul citit: il ataseaza produsului deschis (scanat cu cod de
  // bare) sau creeaza un produs de sine statator. Poza nu contine codul de
  // bare, deci legatura o facem prin produsul deschis in acel moment.
  function applyOcrResult(text: string, photoUri: string) {
    const prevProduct =
      productRef.current && !String(productRef.current.code ?? "").startsWith("ocr-")
        ? productRef.current
        : null;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    closeScanner();
    setError("");
    // Aditivii ii cautam in TOT textul (etichetele multilingve repeta lista —
    // prindem orice cod E indiferent de limba); pentru afisare pastram doar
    // lista de ingrediente, in limba preferata, si o traducem automat.
    const tags = extractAdditiveTags(text);
    const { segment, srcLang } = extractIngredientsSegment(text, i18n.language);
    if (prevProduct) {
      // COMPLETAM produsul existent, nu il stricam: textul din baza de date e
      // scris de oameni (procente corecte), pe cand OCR-ul mai greseste cifre
      // (ex. "72%" citit "8%"). Textul din poza intra DOAR daca produsul nu
      // are deloc ingrediente; aditivii din poza se adauga intotdeauna.
      const merged: any = { ...prevProduct };
      const hasIngredients = Object.keys(prevProduct).some(
        (k) =>
          k.startsWith("ingredients_text") &&
          String((prevProduct as any)[k] ?? "").trim()
      );
      if (!hasIngredients) {
        merged.ingredients_text = segment;
        merged.lang = srcLang; // limba-sursa pentru traducerea automata
      }
      merged.additives_tags = [
        ...new Set([...(prevProduct.additives_tags ?? []), ...tags]),
      ];
      setProduct(merged);
    } else {
      setProduct({
        code: `ocr-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        product_name: t("ocrTitle"),
        brands: "",
        image_url: photoUri,
        ingredients_text: segment,
        lang: srcLang, // limba-sursa pentru traducerea automata
        additives_tags: tags,
        nutriments: {},
        categories_tags: [],
      });
    }
  }

  const n = product?.nutriments ?? {};
  const lang = i18n.language;
  // Text de ingrediente FĂRĂ aditivi (au secțiunea lor separată în UI) și cu
  // termenii INCI de pe cosmetice ("aqua") localizați în limba aleasă ("apă").
  const ingredientsDisplay = useMemo(
    () => localizeInci(stripAdditives(ingredientsText, lang), lang),
    [ingredientsText, lang]
  );

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
  const display = product
    ? productDisplay(product)
    : { title: "", subtitle: "" };
  const advice = product ? getProductAdvice(product, lang) : null;
  const palm = product && hasPalmOil(product) ? getPalmNote(lang) : null;

  // Ingrediente: foloseste limba aleasa daca exista; altfel traduce automat online.
  useEffect(() => {
    if (!product) {
      setIngredientsText("");
      setIngredientsAuto(false);
      setIngredientsTranslating(false);
      return;
    }
    const native = (product[`ingredients_text_${lang}`] || "").trim();
    if (native) {
      setIngredientsText(native);
      setIngredientsAuto(false);
      setIngredientsTranslating(false);
      return;
    }
    const enText = (product.ingredients_text_en || "").trim();
    const origText = (product.ingredients_text || "").trim();
    if (lang === "en") {
      setIngredientsText(enText || origText);
      setIngredientsAuto(false);
      return;
    }
    const source = enText || origText;
    const sourceLang = enText ? "en" : product.lang || "en";
    if (!source) {
      setIngredientsText("");
      setIngredientsAuto(false);
      return;
    }
    let cancelled = false;
    setIngredientsText(source); // arata originalul cat se traduce
    setIngredientsAuto(false);
    setIngredientsTranslating(true);
    translateText(source, sourceLang, lang)
      .then((tx) => {
        if (cancelled) return;
        setIngredientsText(tx);
        setIngredientsAuto(tx.trim() !== source.trim());
      })
      .finally(() => {
        if (!cancelled) setIngredientsTranslating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product, lang]);

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
        noData: t("noNutritionData"),
        noCosmeticData: t("noCosmeticData"),
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
  const fiber = n["fiber_100g"] ?? null;
  const proteins = n["proteins_100g"] ?? null;
useEffect(() => {
    if (!product) return;
    saveToHistory({
      barcode: product.code ?? barcode,
      name: display.title || t("unknownName"),
      brand: display.subtitle,
      imageUrl: product.image_url ?? "",
      score,
      scannedAt: Date.now(),
    });
    setShowBreakdown(false);
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
      name: display.title || t("unknownName"),
      brand: display.subtitle,
      imageUrl: product.image_url ?? "",
      score,
      scannedAt: Date.now(),
    };
  }

 function buildNutrientBadges() {
    const rows: {
      label: string;
      value: number;
      unit: string;
      color: string;
      percent: number;
      reverse?: boolean; // nutrienti "buni" (fibre/proteine): mult = verde
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
    // Nutrienti "buni" — logica inversa: cu cat mai mult, cu atat mai verde.
    // Praguri per 100g dupa reglementarea UE: fibre >=3g "sursa", >=6g "bogat";
    // proteine — semnificativ peste ~8g/100g.
    const goodColor = (v: number, mid: number, high: number) =>
      v >= high ? "#038141" : v >= mid ? "#85BB2F" : "#EE8100";
    if (fiber != null)
      rows.push({
        label: t("fiber"),
        value: Math.round(fiber * 10) / 10,
        unit: "g",
        color: goodColor(fiber, 3, 6),
        percent: pos(fiber, 3, 6),
        reverse: true,
      });
    if (proteins != null)
      rows.push({
        label: t("proteins"),
        value: Math.round(proteins * 10) / 10,
        unit: "g",
        color: goodColor(proteins, 4, 8),
        percent: pos(proteins, 4, 8),
        reverse: true,
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
const additiveDesc = selectedAdditive ? selectedAdditive.desc : "";

  return (
    <KeyboardAvoidingView
      style={[styles.screen, isWeb && styles.screenWeb]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />
      <ThemeFx emoji={paletteEmoji} />
      {/* Scanner camera */}
      {scannerOpen && (
        <Modal visible transparent={false} animationType="slide">
          <View style={styles.scannerScreen}>
              <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              autofocus="on"
              enableTorch={torchOn}
              // In modul foto-ingrediente analizorul de coduri de bare e oprit
              // complet — altfel pe Android captura esueaza ("Failed to capture").
              barcodeScannerSettings={
                ocrMode || ocrLoading
                  ? undefined
                  : { barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }
              }
              onBarcodeScanned={ocrMode || ocrLoading ? undefined : handleBarcodeScanned}
              onMountError={(e: any) => {
                console.warn("Camera mount error:", e?.message ?? e);
                setError(t("cameraBlockedHelp"));
                setScannerOpen(false);
              }}
            />
            {permission && !permission.granted && (
              <View style={styles.permDenied}>
                <Text style={styles.permIcon}>📷</Text>
                <Text style={styles.permTitle}>{t("cameraBlockedTitle")}</Text>
                <Text style={styles.permHelp}>{t("cameraBlockedHelp")}</Text>
                {permission.canAskAgain && (
                  <TouchableOpacity
                    style={styles.permButton}
                    onPress={() => requestPermission().catch(() => {})}
                  >
                    <Text style={styles.permButtonText}>{t("retry")}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.cancelButton, { marginTop: 12 }]}
                  onPress={closeScanner}
                >
                  <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
                </TouchableOpacity>
              </View>
            )}
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
            <View style={[styles.scannerOverlay, { paddingBottom: 30 + insets.bottom }]}>
              {ocrMode && (
                <Text style={styles.scannerText}>{t("ocrAim")}</Text>
              )}
              {ocrMode ? (
                <View
                  style={[
                    styles.ingredientsButton,
                    { flexDirection: "row", alignItems: "center", gap: 8 },
                  ]}
                >
                  <ActivityIndicator color="#222" />
                  <Text style={styles.ingredientsButtonText}>{t("ocrSearching")}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.ingredientsButton}
                  onPress={() => setOcrMode(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t("readIngredients")}
                >
                  <Text style={styles.ingredientsButtonText}>
                    📝 {t("readIngredients")}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={ocrMode ? () => setOcrMode(false) : closeScanner}
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
            <ScrollView
              style={styles.zoomScrollOuter}
              contentContainerStyle={styles.zoomScrollAll}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.zoomCard, isDesktop && styles.zoomCardDesktop]} accessibilityViewIsModal>
                <Animated.View
                  style={[
                    styles.zoomCircle,
                    isDesktop && styles.zoomCircleDesktop,
                    { transform: [{ scale: zoomScale }, { rotate: zoomRotate }] },
                  ]}
                >
                  <Image source={{ uri: zoomImage }} style={styles.zoomCircleImg} resizeMode="contain" />
                </Animated.View>

                <View style={[styles.zoomDetails, isDesktop && styles.zoomDetailsDesktop]}>
                  <Text style={styles.zoomName} numberOfLines={isDesktop ? 3 : 2}>
                    {display.title && display.title !== "null" && display.title !== "undefined"
                      ? display.title
                      : t("unknownName")}
                  </Text>
                  {display.subtitle !== "" && <Text style={styles.zoomBrand}>{display.subtitle}</Text>}

                  <View style={styles.zoomScoreRow}>
                    <View style={[styles.zoomScoreBadge, { backgroundColor: scoreColor(score) }]}>
                      <Text style={styles.zoomScoreNum}>{score}</Text>
                    </View>
                    <View>
                      <Text style={[styles.zoomVerdict, { color: scoreColor(score) }]}>
                        {scoreVerdict(score)}
                      </Text>
                      <Text style={styles.zoomScoreCap}>{t("mockScoreCap", { defaultValue: "scor / 100" })}</Text>
                    </View>
                  </View>

                  {nutrientBadges.length > 0 && (
                    <View style={styles.zoomSection}>
                      <Text style={styles.zoomSecTitle}>{t("nutritionLabel")}</Text>
                      <View style={styles.zoomNutriWrap}>
                        {nutrientBadges.map((nb) => (
                          <View key={nb.label} style={styles.zoomNutri}>
                            <View style={[styles.zoomNutriDot, { backgroundColor: nb.color }]} />
                            <Text style={styles.zoomNutriLabel}>{nb.label}</Text>
                            <Text style={styles.zoomNutriVal}>
                              {nb.value}
                              {nb.unit}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {additives.length > 0 && (
                    <View style={styles.zoomSection}>
                      <Text style={styles.zoomSecTitle}>{t("additivesLabel")}</Text>
                      <View style={styles.zoomChips}>
                        {additives.map((a: any, i: number) => {
                          const col = a.level ? levelColors[a.level] : "#9aa";
                          return (
                            <View
                              key={a.code ?? i}
                              style={[styles.zoomChip, { backgroundColor: col + "33", borderColor: col }]}
                            >
                              <Text style={styles.zoomChipText} numberOfLines={1}>
                                {a.name}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {palm && (
                    <View style={styles.zoomWarn}>
                      <Text style={styles.zoomWarnTitle}>🌴 {palm.label}</Text>
                      <Text style={styles.zoomWarnText}>{palm.text}</Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

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
        <Modal visible transparent animationType="fade" onRequestClose={() => setLangMenuOpen(false)}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setLangMenuOpen(false)}
          >
            <View style={[styles.langMenu, isWeb && glassStrong]}>
              {languages.map((lang) => {
                const active = i18n.language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langItem, active && styles.langItemActive]}
                    onPress={() => selectLanguage(lang.code)}
                    accessibilityRole="button"
                    accessibilityLabel={lang.label}
                  >
                    <Image
                      source={{ uri: flagUrl(lang.cc, 80) }}
                      style={styles.langFlagImg}
                      resizeMode="cover"
                    />
                    <Text
                      style={[styles.langLabel, active && styles.langLabelActive]}
                    >
                      {lang.label}
                    </Text>
                    {active && <Text style={styles.langCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Detalii aditiv */}
      {selectedAdditive && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setSelectedAdditive(null)}>
          <Pressable
            style={styles.additiveModalOverlay}
            onPress={() => setSelectedAdditive(null)}
          >
            <Pressable style={styles.additiveModal} onPress={() => {}} accessibilityViewIsModal accessibilityRole="none">
              {/* X fix sus-dreapta — mereu vizibil, chiar si cand derulezi */}
              <TouchableOpacity
                style={styles.additiveModalX}
                onPress={() => setSelectedAdditive(null)}
                accessibilityRole="button"
                accessibilityLabel={t("cancel")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.additiveModalXText}>✕</Text>
              </TouchableOpacity>
              <ScrollView
                style={styles.additiveModalScroll}
                contentContainerStyle={{ paddingBottom: 4 }}
                showsVerticalScrollIndicator={false}
              >
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

              {/* Silueta corpului: organele afectate se aprind si pulseaza */}
              {(() => {
                const organs = organsForAdditive(selectedAdditive.code);
                if (!organs.length) return null;
                const col = selectedAdditive.level
                  ? levelColors[selectedAdditive.level]
                  : "#EE8100";
                return (
                  <View style={styles.bodyBox}>
                    <Text style={styles.bodyTitle}>{bodyTitle[lang] ?? bodyTitle.en}</Text>
                    <BodyDiagram organs={organs} color={col} size={110} />
                    <View style={styles.organChips}>
                      {organs.map((oid) => (
                        <View key={oid} style={[styles.organChip, { borderColor: col }]}>
                          <View style={[styles.organDot, { backgroundColor: col }]} />
                          <Text style={styles.organChipText}>{organName(oid, lang)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })()}

              {/* Surse științifice — evaluările publice pe care se bazează nivelurile de risc */}
              <Text style={styles.additiveSourcesTitle}>{pickM("sciSources", lang)}</Text>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://www.efsa.europa.eu/en/topics/topic/food-additives"
                  ).catch(() => {})
                }
                accessibilityRole="link"
              >
                <Text style={styles.additiveSourceLink}>
                  • EFSA — {pickM("efsaDesc", lang)} ↗
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://monographs.iarc.who.int/list-of-classifications"
                  ).catch(() => {})
                }
                accessibilityRole="link"
              >
                <Text style={styles.additiveSourceLink}>
                  • IARC — {pickM("iarcDesc", lang)} ↗
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.additiveModalClose}
                onPress={() => setSelectedAdditive(null)}
              >
                <Text style={styles.additiveModalCloseText}>{t("cancel")}</Text>
              </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}

     <View style={[styles.navbar, isWeb && glass, isDesktop && styles.topBar]}>
        <View style={styles.brandRow}>
          <Animated.Image
            source={require("../assets/images/icon.png")}
            style={[
              styles.brandLogo,
              { transform: [{ translateY: hopTranslate }, { scale: hopScale }] },
            ]}
            resizeMode="contain"
          />
          <WaveText text="Zelynta" style={styles.brandName} />
        </View>
        {isDesktop &&
          (() => {
            const m = t("navMottos", { returnObjects: true });
            return Array.isArray(m) ? (
              <NavMarquee phrases={m as string[]} color={colors.textMuted} accent={colors.primary} />
            ) : null;
          })()}
        <View style={styles.topBarActions}>
          <PaletteButton glass={isWeb ? glass : undefined} />
          <TouchableOpacity
            style={[styles.iconButton, isWeb && glass]}
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel={t("theme")}
          >
            <Text style={styles.navEmoji}>{colors.isDark ? "☀️" : "🌙"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flagButton, isWeb && glass]}
            onPress={() => setLangMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={currentLang.label}
          >
            <Animated.Image
              source={{ uri: flagUrl(currentLang.cc, 40) }}
              style={[styles.flagImg, { transform: [{ rotate: flagRotate }] }]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.container,
          isWide && styles.containerWide,
          isDesktop && styles.containerDesktop,
          // loc pentru bara de jos suprapusa, ca sa nu acopere finalul paginii
          { paddingBottom: 118 },
        ]}
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
          colorTop={scanTop}
          colorBottom={scanBottom}
        />

        <View style={styles.manualRow}>
          <TextInput
            style={[styles.inputSmall, isWeb && glass]}
            placeholder={t("placeholder")}
            placeholderTextColor={colors.textMuted}
            value={barcode}
            onChangeText={setBarcode}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={fetchProduct}
            accessibilityLabel={t("placeholder")}
          />
          <TouchableOpacity
            style={[styles.searchIconBtn, { backgroundColor: searchTop }, (!barcode || loading) && { opacity: 0.5 }]}
            onPress={fetchProduct}
            disabled={!barcode || loading}
            accessibilityRole="button"
            accessibilityLabel={t("searchButton")}
          >
            <Ionicons name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

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
            {error === t("errorNotFound") && (
              <Text style={styles.errorHint}>{t("notFoundHint")}</Text>
            )}
            {error === t("errorNotFound") && (
              <TouchableOpacity
                style={styles.ocrFillButton}
                onPress={() => {
                  setError("");
                  setOcrMode(true);
                  openScanner();
                }}
                accessibilityRole="button"
                accessibilityLabel={t("readIngredients")}
              >
                <Text style={styles.ocrFillButtonText}>📷 {t("readIngredients")}</Text>
              </TouchableOpacity>
            )}
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
                  {display.title || t("unknownName")}
                </Text>
                {display.subtitle !== "" && (
                  <Text style={styles.productBrand}>{display.subtitle}</Text>
                )}
              </View>
              <View style={{ gap: 8 }}>
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
                <TouchableOpacity
                  onPress={() => router.push("/methodology")}
                  accessibilityRole="link"
                >
                  <Text style={styles.methodologyLink}>
                    ℹ️ {pickM("title", lang)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showBreakdown && scoreData.reasons.length > 0 && (
              <View style={styles.breakdown}>
                {scoreData.reasons.map((r: any, idx) => (
                  <View
                    key={r.kind === "nutrient" ? `n_${r.key}` : `i_${r.name ?? idx}`}
                    style={styles.breakdownRow}
                  >
                    <Text style={styles.breakdownLabel} numberOfLines={1}>
                      {reasonLabel(r)}
                    </Text>
                    <Text style={styles.breakdownDelta}>{r.delta}</Text>
                  </View>
                ))}
              </View>
            )}
{nutrientBadges.map((row) => (
              <View key={row.label} style={styles.nutrientBlock}>
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
                    {(row.reverse
                      ? ["#E63E11", "#EE8100", "#85BB2F", "#038141"]
                      : ["#038141", "#85BB2F", "#EE8100", "#E63E11"]
                    ).map((segColor, segIdx) => (
                      <View
                        key={segIdx}
                        style={[styles.baremSeg, { backgroundColor: segColor }]}
                      />
                    ))}
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
                {packaging === "plastic" && (
                  <Text style={styles.microNote}>{t("microplasticNote")}</Text>
                )}
              </>
            )}
            <Text style={styles.scoreLabel}>{t("ingredientsLabel")}</Text>
            <Text style={styles.ingredients}>
              {ingredientsDisplay || t("noIngredients")}
            </Text>
            {ingredientsTranslating && (
              <Text style={styles.ingredientsAuto}>
                ⏳ {autoLabels.translating[lang] ?? autoLabels.translating.en}
              </Text>
            )}
            {ingredientsAuto && !ingredientsTranslating && (
              <Text style={styles.ingredientsAuto}>
                🌐 {autoLabels.auto[lang] ?? autoLabels.auto.en}
              </Text>
            )}
            {/* Completeaza/actualizeaza ingredientele direct de pe eticheta:
                camera se deschide gata in modul foto, iar rezultatul se
                toarna in ACEASTA pagina (nume + nutritie pastrate). */}
            <TouchableOpacity
              style={styles.ocrFillButton}
              onPress={() => {
                setOcrMode(true);
                openScanner();
              }}
              accessibilityRole="button"
              accessibilityLabel={t("readIngredients")}
            >
              <Text style={styles.ocrFillButtonText}>📷 {t("readIngredients")}</Text>
            </TouchableOpacity>

            {palm && (
              <View style={styles.palmBox}>
                <Text style={styles.palmTitle}>🌴 {palm.label}</Text>
                <Text style={styles.palmText}>{palm.text}</Text>
              </View>
            )}

            <Text style={styles.scoreLabel}>{t("additivesLabel")}</Text>
            {additives.length === 0 ? (
              <Text style={styles.scoreUnknown}>{t("noAdditives")}</Text>
            ) : (
              additives.map((add, idx) => (
                <TouchableOpacity
                  key={add.code ?? idx}
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
                    key={c.code ?? idx}
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

            {/* Buton catre pagina de recomandari */}
            {advice && (
              <TouchableOpacity
                style={styles.adviceButton}
                onPress={() =>
                  router.push({
                    pathname: "/advice",
                    params: {
                      category: advice.category,
                      name: display.title || t("unknownName"),
                      score: String(score),
                    },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={advice.labels.title}
              >
                <Text style={styles.adviceButtonIcon}>{advice.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.adviceButtonTitle}>{advice.labels.title}</Text>
                  <Text style={styles.adviceButtonSub} numberOfLines={1}>
                    {advice.benefits}
                  </Text>
                </View>
                <Text style={styles.adviceButtonArrow}>›</Text>
              </TouchableOpacity>
            )}

            {/* Alternative mai bune */}
            {(altLoading || alternatives.length > 0) && (
              <>
                <Text style={styles.scoreLabel}>{t("alternativesLabel")}</Text>
                {altLoading && alternatives.length === 0 && (
                  <View>
                    <View style={styles.altLoadingRow}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.altLoading}>{t("alternativesLoading")}</Text>
                    </View>
                    {[0, 1].map((i) => (
                      <View key={i} style={[styles.altCard, styles.altSkeleton]}>
                        <View style={[styles.altThumb, styles.skeleton]} />
                        <View style={styles.altInfo}>
                          <View style={[styles.skeleton, styles.skelLine, { width: "68%" }]} />
                          <View style={[styles.skeleton, styles.skelLine, { width: "38%", marginTop: 7 }]} />
                        </View>
                      </View>
                    ))}
                  </View>
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

       {(() => {
         const tp = t("tips", { returnObjects: true });
         return Array.isArray(tp) ? (
           <TipsSection
             title={t("tipsTitle")}
             eyebrow={t("tipsEyebrow")}
             tips={tp as string[]}
             colors={colors}
             isDesktop={isDesktop}
           />
         ) : null;
       })()}

       <View
         style={{
           alignSelf: "stretch",
           marginHorizontal: isDesktop ? -32 : -24,
           marginTop: "auto", // împinge footer-ul la baza paginii când conținutul e scurt
         }}
       >
         <AppFooter isDesktop={isDesktop} />
       </View>
      </ScrollView>

      {/* Bara de jos, suprapusa peste aplicatie (pandantul headerului) —
          gazduieste Istoricul, scos din header ca sa nu-l aglomereze. */}
      <View style={[styles.bottomBar, isWeb && glass]}>
        <TouchableOpacity
          style={styles.bottomBarBtn}
          onPress={() => router.push("/history")}
          accessibilityRole="button"
          accessibilityLabel={t("historyTitle")}
        >
          <Text style={styles.navEmoji}>📜</Text>
          <Text style={styles.bottomBarTxt}>{t("historyTitle")}</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: "flex-start",
    gap: 28,
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  leftPanel: { width: "100%", maxWidth: 400, alignItems: "center" },
  leftPanelDesktop: {
    flex: 1,
    width: "auto",
    maxWidth: 720,
    borderRadius: 28,
    padding: 34,
    alignSelf: "stretch",
    ...(isWeb ? { position: "sticky" as any, top: 110 } : {}),
  },
  rightCol: { width: "100%", maxWidth: 400, alignItems: "center" },
  rightColDesktop: { flex: 1, alignSelf: "stretch", alignItems: "stretch" },
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
  // Butoanele de actiune (palete/dark/limba) au prioritate — nu se micsoreaza
  // niciodata; numele „Zelynta" cedeaza spatiu daca ecranul e ingust.
  topBarActions: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 0 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1, minWidth: 0 },
  brandLogo: { width: 38, height: 38, flexShrink: 0 },
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
  ingredientsButton: {
    backgroundColor: "#FFD54F",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    minWidth: 220,
    alignItems: "center",
  },
  ingredientsButtonText: { fontSize: 16, fontWeight: "800", color: "#222" },
  permDenied: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#10160F",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 14,
  },
  permIcon: { fontSize: 56 },
  permTitle: { fontSize: 20, fontWeight: "800", color: "#FFF", textAlign: "center" },
  permHelp: {
    fontSize: 15,
    color: "#C9D2C9",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 360,
  },
  permButton: {
    backgroundColor: c.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  permButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
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
  errorHint: { fontSize: 13.5, color: c.textMuted, textAlign: "center", lineHeight: 20, marginTop: 6, maxWidth: 300 },
  retryButton: {
    backgroundColor: c.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 6,
  },
  retryButtonText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  ocrFillButton: {
    alignSelf: "flex-start",
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  ocrFillButtonText: { color: c.primary, fontSize: 13.5, fontWeight: "800" },
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
  methodologyLink: { fontSize: 12.5, color: c.textFaint, fontWeight: "600", marginTop: 2 },
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
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 10,
    // Distanta generoasa fata de butoanele de navigare ale telefonului.
    paddingBottom: isWeb ? 10 : 56,
    backgroundColor: c.navbarBg,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  bottomBarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 18,
    ...(isWeb ? ({ boxShadow: "0 6px 14px rgba(20,48,31,0.10)" } as any) : { elevation: 2 }),
  },
  bottomBarTxt: { color: c.primary, fontSize: 14.5, fontWeight: "800" },
  flagButton: {
    backgroundColor: c.surface,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: c.border,
    ...(isWeb ? { boxShadow: "0 6px 14px rgba(20,48,31,0.12)" } : { elevation: 3 }),
  },
  flagButtonText: { fontSize: 24 },
  iconButton: {
    backgroundColor: c.surface,
    borderRadius: 14,
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: c.border,
    ...(isWeb ? { boxShadow: "0 6px 14px rgba(20,48,31,0.12)" } : { elevation: 3 }),
  },
  iconButtonText: { fontSize: 18 },
  navEmoji: { fontSize: 20, lineHeight: 24 },
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
    padding: 8,
    width: 232,
    gap: 2,
    ...(isWeb ? ({ boxShadow: "0 12px 28px rgba(0,0,0,0.15)" } as any) : { elevation: 6 }),
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  langItemActive: {
    backgroundColor: c.isDark ? "rgba(91,189,98,0.18)" : "#EAF5EA",
  },
  langFlag: { fontSize: 30 },
  langFlagImg: { width: 30, height: 21, borderRadius: 3 },
  flagImg: { width: 30, height: 21, borderRadius: 3 },
  langLabel: { fontSize: 15, color: c.text, flex: 1 },
  langLabelActive: { color: c.primary, fontWeight: "700" },
  langCheck: { fontSize: 15, color: c.primary, fontWeight: "800" },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  containerWide: {
    justifyContent: "flex-start",
    paddingTop: 24,
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
  manualRow: {
    width: "100%",
    maxWidth: 320,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  inputSmall: {
    flex: 1,
    backgroundColor: c.inputBg,
    color: c.text,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  searchIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
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
  ingredientsAuto: { fontSize: 12, color: c.textFaint, fontStyle: "italic", marginTop: 4 },
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
    maxHeight: "86%",
  },
  additiveModalScroll: { width: "100%" },
  additiveModalX: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surfaceAlt,
  },
  additiveModalXText: { fontSize: 17, fontWeight: "800", color: c.textMuted, lineHeight: 20 },
  bodyBox: {
    marginTop: 14,
    backgroundColor: c.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    paddingVertical: 14,
    alignItems: "center",
  },
  bodyTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: c.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  organChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  organChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  organDot: { width: 8, height: 8, borderRadius: 4 },
  organChipText: { fontSize: 12.5, fontWeight: "700", color: c.text },
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
  additiveSourcesTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: c.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 10,
  },
  additiveSourceLink: {
    fontSize: 13,
    color: c.primary,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 4,
  },
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
  // Avertisment ulei de palmier
  palmBox: {
    backgroundColor: c.isDark ? "rgba(238,129,0,0.14)" : "#FFF4E5",
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: c.isDark ? "rgba(238,129,0,0.35)" : "#FCD9A8",
  },
  palmTitle: { fontSize: 15, fontWeight: "800", color: "#C2410C" },
  palmText: { fontSize: 14, color: c.textMuted, lineHeight: 20 },
  // Buton catre recomandari
  adviceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: c.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: c.isDark ? "rgba(91,189,98,0.25)" : "#CDE8CD",
  },
  adviceButtonIcon: { fontSize: 28 },
  adviceButtonTitle: { fontSize: 15, fontWeight: "800", color: c.text },
  adviceButtonSub: { fontSize: 13, color: c.textFaint, marginTop: 2 },
  adviceButtonArrow: { fontSize: 24, color: c.textFaint, fontWeight: "bold" },
  logo: {
    width: 140,
    height: 140,
    marginTop: 34, // spatiu pentru saltul rosiei, ca sa nu intre in navbar
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
  zoomBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    ...(isWeb ? ({ backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" } as any) : {}) },
  zoomScrollOuter: { flex: 1, width: "100%" },
  zoomScrollAll: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 90 },
  zoomCard: { alignItems: "center", justifyContent: "center", gap: 22, paddingHorizontal: 24, width: "100%" },
  zoomCardDesktop: {
    flexDirection: "row",
    gap: 56,
    maxWidth: 1080,
    paddingHorizontal: 40,
    justifyContent: "center",
  },
  zoomCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.85)",
    ...(isWeb ? ({ boxShadow: "0 30px 70px rgba(0,0,0,0.5)" } as any) : { elevation: 10 }),
  },
  zoomCircleDesktop: { width: 420, height: 420, borderRadius: 210, borderWidth: 7 },
  zoomCircleImg: { width: "82%", height: "82%" },
  zoomDetails: { alignItems: "center", maxWidth: 420 },
  zoomDetailsDesktop: { alignItems: "flex-start", flex: 1, maxWidth: 520 },
  zoomName: { color: "#fff", fontSize: 24, fontWeight: "900", textAlign: "center", letterSpacing: 0.2 },
  zoomBrand: { color: "rgba(255,255,255,0.7)", fontSize: 16, marginTop: 6, fontWeight: "600" },
  zoomScoreRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 22 },
  zoomScoreBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...(isWeb ? ({ boxShadow: "0 14px 30px rgba(0,0,0,0.35)" } as any) : { elevation: 6 }),
  },
  zoomScoreNum: { color: "#fff", fontSize: 30, fontWeight: "900" },
  zoomVerdict: { fontSize: 20, fontWeight: "900" },
  zoomScoreCap: { color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 },
  zoomScroll: { maxHeight: "82%" as any, alignSelf: "stretch" },
  zoomScrollInner: { alignItems: "center", paddingBottom: 8 },
  zoomSection: { marginTop: 22, alignSelf: "stretch" },
  zoomSecTitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  zoomNutriWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  zoomNutri: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  zoomNutriDot: { width: 9, height: 9, borderRadius: 5 },
  zoomNutriLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
  zoomNutriVal: { color: "#fff", fontSize: 13, fontWeight: "800" },
  zoomChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  zoomChip: { borderRadius: 10, borderWidth: 1, paddingVertical: 6, paddingHorizontal: 11, maxWidth: 220 },
  zoomChipText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  zoomWarn: {
    marginTop: 20,
    alignSelf: "stretch",
    backgroundColor: "rgba(234,88,12,0.18)",
    borderWidth: 1,
    borderColor: "rgba(251,146,60,0.5)",
    borderRadius: 14,
    padding: 14,
  },
  zoomWarnTitle: { color: "#fdba74", fontSize: 14, fontWeight: "800", marginBottom: 4 },
  zoomWarnText: { color: "#fed7aa", fontSize: 13.5, lineHeight: 19 },
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
  altLoading: { fontSize: 13, color: c.textFaint, fontStyle: "italic" },
  altLoadingRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 8, marginBottom: 2 },
  altSkeleton: { opacity: 0.7 },
  skelLine: { height: 10, borderRadius: 6 },
});