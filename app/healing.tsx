import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ThemeFx from "../components/ThemeFx";
import { HEALING } from "../utils/healingContent";
import { MAP1_TEXT, MAP2_TEXT } from "../utils/healingTranscript";
import { translateText } from "../utils/translate";
import { PALETTES, useTheme, type ThemeColors } from "../utils/theme";

const isWeb = Platform.OS === "web";
const MAP1 = require("../assets/images/healing-web-1.jpg");
const MAP2 = require("../assets/images/healing-web-2.jpg");
const RATIO = 3168 / 2448;

const DEATHS: [string, number][] = [
  ["Boli de inimă", 614348], ["Cancer", 591699], ["Erori medicale", 251454],
  ["Boli respiratorii", 147101], ["Accidente", 136053], ["AVC", 133103],
  ["Alzheimer", 93541], ["Diabet", 76488], ["Gripă / pneumonie", 55227],
  ["Boli renale", 48146], ["Sinucidere", 42773],
];
const MAXD = 614348;
const CHRONIC: [string, number][] = [
  ["Hipertensiune", 21.9], ["Hiperlipidemie", 18.0], ["Alergii & sinuzite", 13.5],
  ["Artrită", 13.0], ["Tulb. de dispoziție", 10.6], ["Diabet (1 & 2)", 9.5],
  ["Anxietate", 6.7], ["Astm", 6.2], ["Boală coronariană", 5.3],
  ["Tiroidă", 4.0], ["Pulmonar obstructiv", 3.5],
];
// Cele 7 chakre — nume + rolul fiecareia (ca pe pagina web), in 9 limbi.
type L9 = Record<string, string>;
const CHAKRAS: { n: string; color: string; name: L9; desc: L9 }[] = [
  {
    n: "7", color: "#8b5cf6",
    name: { ro: "Coroană", en: "Crown", fr: "Couronne", it: "Corona", es: "Corona", de: "Krone", ru: "Корона", pl: "Korona", nl: "Kroon" },
    desc: { ro: "Conexiune cu Sursa", en: "Connection to the Source", fr: "Connexion à la Source", it: "Connessione con la Sorgente", es: "Conexión con la Fuente", de: "Verbindung zur Quelle", ru: "Связь с Источником", pl: "Połączenie ze Źródłem", nl: "Verbinding met de Bron" },
  },
  {
    n: "6", color: "#4f46e5",
    name: { ro: "Al treilea ochi", en: "Third eye", fr: "Troisième œil", it: "Terzo occhio", es: "Tercer ojo", de: "Drittes Auge", ru: "Третий глаз", pl: "Trzecie oko", nl: "Derde oog" },
    desc: { ro: "Intuiție", en: "Intuition", fr: "Intuition", it: "Intuizione", es: "Intuición", de: "Intuition", ru: "Интуиция", pl: "Intuicja", nl: "Intuïtie" },
  },
  {
    n: "5", color: "#3b82f6",
    name: { ro: "Gât", en: "Throat", fr: "Gorge", it: "Gola", es: "Garganta", de: "Hals", ru: "Горло", pl: "Gardło", nl: "Keel" },
    desc: { ro: "Comunicare", en: "Communication", fr: "Communication", it: "Comunicazione", es: "Comunicación", de: "Kommunikation", ru: "Общение", pl: "Komunikacja", nl: "Communicatie" },
  },
  {
    n: "4", color: "#22c55e",
    name: { ro: "Inimă", en: "Heart", fr: "Cœur", it: "Cuore", es: "Corazón", de: "Herz", ru: "Сердце", pl: "Serce", nl: "Hart" },
    desc: { ro: "Iubire & echilibru", en: "Love & balance", fr: "Amour & équilibre", it: "Amore ed equilibrio", es: "Amor y equilibrio", de: "Liebe & Gleichgewicht", ru: "Любовь и равновесие", pl: "Miłość i równowaga", nl: "Liefde & balans" },
  },
  {
    n: "3", color: "#eab308",
    name: { ro: "Plex solar", en: "Solar plexus", fr: "Plexus solaire", it: "Plesso solare", es: "Plexo solar", de: "Solarplexus", ru: "Солнечное сплетение", pl: "Splot słoneczny", nl: "Zonnevlecht" },
    desc: { ro: "Putere personală", en: "Personal power", fr: "Pouvoir personnel", it: "Potere personale", es: "Poder personal", de: "Persönliche Kraft", ru: "Личная сила", pl: "Osobista siła", nl: "Persoonlijke kracht" },
  },
  {
    n: "2", color: "#f97316",
    name: { ro: "Sacral", en: "Sacral", fr: "Sacré", it: "Sacrale", es: "Sacro", de: "Sakral", ru: "Сакральная", pl: "Sakralna", nl: "Sacraal" },
    desc: { ro: "Emoții & creativitate", en: "Emotions & creativity", fr: "Émotions & créativité", it: "Emozioni e creatività", es: "Emociones y creatividad", de: "Emotionen & Kreativität", ru: "Эмоции и творчество", pl: "Emocje i kreatywność", nl: "Emoties & creativiteit" },
  },
  {
    n: "1", color: "#ef4444",
    name: { ro: "Rădăcină", en: "Root", fr: "Racine", it: "Radice", es: "Raíz", de: "Wurzel", ru: "Корень", pl: "Korzeń", nl: "Wortel" },
    desc: { ro: "Stabilitate", en: "Stability", fr: "Stabilité", it: "Stabilità", es: "Estabilidad", de: "Stabilität", ru: "Стабильность", pl: "Stabilność", nl: "Stabiliteit" },
  },
];
const fmtN = (n: number) => n.toLocaleString("ro-RO");

// Disclaimer PROEMINENT (cerinta politicilor de store: continutul Healing Web
// prezinta perspective alternative — trebuie separat clar de sfatul medical).
const DISC_TOP: Record<string, string> = {
  ro: "Conținut cultural și istoric, prezentat doar spre informare. Reflectă opiniile autorului hărții, nu ale Zelynta. NU este sfat medical: pentru orice problemă de sănătate consultă medicul și nu întrerupe niciodată un tratament prescris.",
  en: "Cultural and historical content, presented for information only. It reflects the map author's views, not Zelynta's. This is NOT medical advice: for any health issue consult your doctor and never stop a prescribed treatment.",
  fr: "Contenu culturel et historique, présenté à titre informatif uniquement. Il reflète les opinions de l'auteur de la carte, pas celles de Zelynta. Ce n'est PAS un avis médical : pour tout problème de santé, consultez votre médecin et n'arrêtez jamais un traitement prescrit.",
  it: "Contenuto culturale e storico, presentato solo a scopo informativo. Riflette le opinioni dell'autore della mappa, non di Zelynta. NON è un consiglio medico: per qualsiasi problema di salute consulta il medico e non interrompere mai una terapia prescritta.",
  es: "Contenido cultural e histórico, presentado solo con fines informativos. Refleja las opiniones del autor del mapa, no las de Zelynta. NO es consejo médico: ante cualquier problema de salud consulta a tu médico y nunca interrumpas un tratamiento recetado.",
  de: "Kultureller und historischer Inhalt, nur zur Information. Er gibt die Ansichten des Kartenautors wieder, nicht die von Zelynta. Dies ist KEIN medizinischer Rat: Bei Gesundheitsproblemen wende dich an deinen Arzt und setze niemals eine verordnete Behandlung ab.",
  ru: "Культурный и исторический контент, представлен только для информации. Он отражает взгляды автора карты, а не Zelynta. Это НЕ медицинский совет: при любых проблемах со здоровьем обращайтесь к врачу и никогда не прекращайте назначенное лечение.",
  pl: "Treść kulturowa i historyczna, prezentowana wyłącznie w celach informacyjnych. Odzwierciedla poglądy autora mapy, nie Zelynta. To NIE jest porada medyczna: w razie problemów zdrowotnych skonsultuj się z lekarzem i nigdy nie przerywaj przepisanego leczenia.",
  nl: "Culturele en historische inhoud, alleen ter informatie. Het weerspiegelt de opvattingen van de maker van de kaart, niet die van Zelynta. Dit is GEEN medisch advies: raadpleeg bij gezondheidsproblemen je arts en stop nooit met een voorgeschreven behandeling.",
};

// Eticheta blocului de text copiabil de sub harti (9 limbi).
const MAPTXT_LABEL: Record<string, string> = {
  ro: "Textul de pe hartă — ține apăsat ca să selectezi și să copiezi",
  en: "Text from the map — long-press to select and copy",
  fr: "Texte de la carte — appui long pour sélectionner et copier",
  it: "Testo della mappa — tieni premuto per selezionare e copiare",
  es: "Texto del mapa — mantén pulsado para seleccionar y copiar",
  de: "Text der Karte — lange drücken zum Markieren und Kopieren",
  ru: "Текст карты — удерживайте, чтобы выделить и скопировать",
  pl: "Tekst z mapy — przytrzymaj, aby zaznaczyć i skopiować",
  nl: "Tekst van de kaart — lang indrukken om te selecteren en kopiëren",
};

// Nota de traducere automata (9 limbi).
const TXT_TRANSLATING: Record<string, string> = {
  ro: "⏳ Se traduce automat…",
  en: "⏳ Translating…",
  fr: "⏳ Traduction en cours…",
  it: "⏳ Traduzione in corso…",
  es: "⏳ Traduciendo…",
  de: "⏳ Wird übersetzt…",
  ru: "⏳ Идёт перевод…",
  pl: "⏳ Tłumaczenie…",
  nl: "⏳ Vertalen…",
};

// Legendă scurtă (ro/en; restul cad pe en). Simbolurile sunt universale.
const LEG: Record<string, any> = {
  ro: {
    title: "Cum se citește harta",
    line: "Linie continuă = remediu / asociere",
    arrow: "Săgeți »»» = cauzalitate (X duce la Y)",
    merge: "Romb ◆ = remedii comune mai multor afecțiuni",
    sides:
      "Stânga = „tratează simptomul” (Big Pharma) · Dreapta = „tratează cauza” (holistic) · Centru = indexul de afecțiuni.",
    colors:
      "Culorile sunt doar pentru orientare (ca la metrou) — fiecare e un traseu, nu o categorie.",
  },
  en: {
    title: "How to read the map",
    line: "Solid line = remedy / association",
    arrow: "Arrows »»» = causation (X leads to Y)",
    merge: "Diamond ◆ = remedies shared by several conditions",
    sides:
      "Left = “treat the symptom” (Big Pharma) · Right = “treat the cause” (holistic) · Center = the index of conditions.",
    colors:
      "Colors are only for orientation (like a metro map) — each is a route, not a category.",
  },
};

export default function Healing() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, palette } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const paletteEmoji = (PALETTES.find((p) => p.id === palette) || PALETTES[0]).emoji;
  const { width } = useWindowDimensions();

  const lang = i18n.language;
  const d = HEALING[lang] ?? HEALING.en ?? HEALING.ro;
  const leg = LEG[lang] ?? LEG.en;
  const [zoom, setZoom] = useState<any>(null);
  // Blocurile de text copiabil de sub harti (inchise implicit).
  const [showTxt1, setShowTxt1] = useState(false);
  const [showTxt2, setShowTxt2] = useState(false);
  // Traducerea automata a textului (lenesa: doar cand deschizi blocul).
  const [txt1, setTxt1] = useState<string | null>(null);
  const [txt2, setTxt2] = useState<string | null>(null);
  const [txtBusy, setTxtBusy] = useState(false);
  useEffect(() => {
    // la schimbarea limbii, traducerile se refac
    setTxt1(null);
    setTxt2(null);
  }, [lang]);
  useEffect(() => {
    if (!showTxt1 || txt1 !== null || lang === "en") return;
    setTxtBusy(true);
    translateText(MAP1_TEXT, "en", lang)
      .then(setTxt1)
      .finally(() => setTxtBusy(false));
  }, [showTxt1, txt1, lang]);
  useEffect(() => {
    if (!showTxt2 || txt2 !== null || lang === "en") return;
    setTxtBusy(true);
    translateText(MAP2_TEXT, "en", lang)
      .then(setTxt2)
      .finally(() => setTxtBusy(false));
  }, [showTxt2, txt2, lang]);
  const displayTxt1 = lang === "en" ? MAP1_TEXT : txt1 ?? MAP1_TEXT;
  const displayTxt2 = lang === "en" ? MAP2_TEXT : txt2 ?? MAP2_TEXT;

  // ---- Vizualizator cu PINCH-ZOOM propriu (doua degete), pan si dublu-tap. ----
  // maximumZoomScale de la ScrollView functioneaza doar pe iOS; implementarea
  // asta cu PanResponder merge identic pe Android/iOS, fara dependinte noi.
  const { height: winH } = useWindowDimensions();
  const zs = useRef({
    s: 1, tx: 0, ty: 0,                     // scara si translatia curenta
    startS: 1, startTx: 0, startTy: 0,       // valorile la inceputul gestului
    startDist: 0, panX: 0, panY: 0,
    mode: "none" as "none" | "pan" | "pinch",
    lastTap: 0, w: 0, h: 0,
  }).current;
  zs.w = width; zs.h = winH; // mereu actuale (obiectul e ref, nu re-randeaza)
  const zScale = useRef(new Animated.Value(1)).current;
  const zPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const applyZ = () => {
    zScale.setValue(zs.s);
    zPan.setValue({ x: zs.tx, y: zs.ty });
  };
  const clampZ = () => {
    const iw = zs.w * zs.s;
    const ih = (zs.w / RATIO) * zs.s;
    const mx = Math.max(0, (iw - zs.w) / 2);
    const my = Math.max(0, (ih - zs.h) / 2);
    zs.tx = Math.min(mx, Math.max(-mx, zs.tx));
    zs.ty = Math.min(my, Math.max(-my, zs.ty));
  };
  // Mareste/micsoreaza pastrand punctul focal (fx,fy — fata de centrul ecranului) pe loc.
  // Limita 10x: harta 2 (indexul) are scris foarte marunt — la 6x inca nu se
  // citea comod; peste rezolutia nativa literele se inmoaie usor, dar cresc.
  const zoomTo = (ns: number, fx: number, fy: number) => {
    ns = Math.min(10, Math.max(1, ns));
    const r = ns / zs.s;
    zs.tx = zs.tx + (fx - zs.tx) * (1 - r);
    zs.ty = zs.ty + (fy - zs.ty) * (1 - r);
    zs.s = ns;
    clampZ();
    applyZ();
  };
  const zoomPR = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const t = e.nativeEvent.touches;
        zs.mode = "none";
        if (t.length === 1) {
          const now = Date.now();
          if (now - zs.lastTap < 280) {
            // dublu-tap: comuta 1x <-> 3x, centrat pe locul atins
            zoomTo(zs.s > 1.3 ? 1 : 3, t[0].pageX - zs.w / 2, t[0].pageY - zs.h / 2);
            zs.lastTap = 0;
          } else zs.lastTap = now;
        }
      },
      onPanResponderMove: (e) => {
        const t = e.nativeEvent.touches;
        if (t.length >= 2) {
          const dist = Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
          if (zs.mode !== "pinch") {
            zs.mode = "pinch";
            zs.startDist = dist;
            zs.startS = zs.s;
            return;
          }
          if (zs.startDist > 0) {
            const fx = (t[0].pageX + t[1].pageX) / 2 - zs.w / 2;
            const fy = (t[0].pageY + t[1].pageY) / 2 - zs.h / 2;
            zoomTo(zs.startS * (dist / zs.startDist), fx, fy);
          }
        } else if (t.length === 1) {
          if (zs.mode !== "pan") {
            zs.mode = "pan";
            zs.startTx = zs.tx;
            zs.startTy = zs.ty;
            zs.panX = t[0].pageX;
            zs.panY = t[0].pageY;
            return;
          }
          zs.tx = zs.startTx + (t[0].pageX - zs.panX);
          zs.ty = zs.startTy + (t[0].pageY - zs.panY);
          clampZ();
          applyZ();
        }
      },
      onPanResponderRelease: () => {
        zs.mode = "none";
      },
      onPanResponderTerminate: () => {
        zs.mode = "none";
      },
    })
  ).current;
  const openMap = (src: any) => {
    zs.s = 1; zs.tx = 0; zs.ty = 0;
    applyZ();
    setZoom(src);
  };

  // animația barelor + bara „secol” (0 -> 1 la intrare)
  const prog = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(prog, { toValue: 1, duration: 1200, delay: 250, useNativeDriver: false }).start();
  }, [prog]);
  const barW = (pct: number) =>
    prog.interpolate({ inputRange: [0, 1], outputRange: ["0%", `${pct}%`] });

  const contentW = Math.min(width, 820) - 36;
  const mapH = contentW / RATIO;
  const paras = (s: string) => String(s).split("\n\n");

  return (
    <View style={styles.root}>
      <ThemeFx emoji={paletteEmoji} />
      <StatusBar style={colors.isDark ? "light" : "dark"} />

      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("back") || "Înapoi"}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          The Healing Web
        </Text>
        {/* distantier invizibil — doar ca titlul sa ramana centrat */}
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={!isWeb}>
        {/* Disclaimer proeminent — separat clar de sfatul medical */}
        <View style={styles.discTop}>
          <Text style={styles.discTopIcon}>⚠️</Text>
          <Text style={styles.discTopText}>{DISC_TOP[lang] ?? DISC_TOP.en}</Text>
        </View>

        <Text style={styles.eyebrow}>{d.eyebrow}</Text>
        <Text style={styles.h1}>The Healing Web</Text>
        <Text style={styles.lead}>{d.lead}</Text>

        <TouchableOpacity activeOpacity={0.9} onPress={() => openMap(MAP1)}>
          <Image source={MAP1} style={[styles.map, { width: contentW, height: mapH }]} />
        </TouchableOpacity>
        <Text style={styles.cap}>{leg.title === "How to read the map" ? "Map 1 — The network · tap to zoom" : "Harta 1 — Rețeaua · apasă pentru zoom"}</Text>
        <TouchableOpacity
          style={styles.mapTxtToggle}
          onPress={() => setShowTxt1((v) => !v)}
          accessibilityRole="button"
        >
          <Text style={styles.mapTxtIcon}>📋</Text>
          <Text style={styles.mapTxtLabel}>{MAPTXT_LABEL[lang] ?? MAPTXT_LABEL.en}</Text>
          <Ionicons
            name={showTxt1 ? "chevron-up" : "chevron-down"}
            size={17}
            color={colors.primary}
          />
        </TouchableOpacity>
        {showTxt1 && (
          <View style={styles.mapTxtBox}>
            {txtBusy && txt1 === null && lang !== "en" && (
              <Text style={styles.mapTxtNote}>
                {TXT_TRANSLATING[lang] ?? TXT_TRANSLATING.en}
              </Text>
            )}
            <ScrollView style={styles.mapTxtScroll} nestedScrollEnabled>
              <Text selectable style={styles.mapTxtBody}>{displayTxt1}</Text>
            </ScrollView>
          </View>
        )}

        <TouchableOpacity activeOpacity={0.9} onPress={() => openMap(MAP2)}>
          <Image source={MAP2} style={[styles.map, { width: contentW, height: mapH }]} />
        </TouchableOpacity>
        <Text style={styles.cap}>{leg.title === "How to read the map" ? "Map 2 — Guide & index · tap to zoom" : "Harta 2 — Ghid & index · apasă pentru zoom"}</Text>

        {/* Ghidul dedicat al Hartii 2 — pagina explicita, cu tot textul lizibil */}
        <TouchableOpacity
          style={styles.map2Guide}
          onPress={() => router.push("/healing-map2" as any)}
          accessibilityRole="button"
        >
          <Text style={styles.map2GuideIcon}>📖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.map2GuideTitle}>
              {leg.title === "How to read the map"
                ? "Understand Map 2 — the full guide"
                : "Înțelege Harta 2 — ghidul complet"}
            </Text>
            <Text style={styles.map2GuideSub}>
              {leg.title === "How to read the map"
                ? "Every component explained + the readable index"
                : "Fiecare componentă explicată + indexul lizibil"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.mapTxtToggle}
          onPress={() => setShowTxt2((v) => !v)}
          accessibilityRole="button"
        >
          <Text style={styles.mapTxtIcon}>📋</Text>
          <Text style={styles.mapTxtLabel}>{MAPTXT_LABEL[lang] ?? MAPTXT_LABEL.en}</Text>
          <Ionicons
            name={showTxt2 ? "chevron-up" : "chevron-down"}
            size={17}
            color={colors.primary}
          />
        </TouchableOpacity>
        {showTxt2 && (
          <View style={styles.mapTxtBox}>
            {txtBusy && txt2 === null && lang !== "en" && (
              <Text style={styles.mapTxtNote}>
                {TXT_TRANSLATING[lang] ?? TXT_TRANSLATING.en}
              </Text>
            )}
            <ScrollView style={styles.mapTxtScroll} nestedScrollEnabled>
              <Text selectable style={styles.mapTxtBody}>{displayTxt2}</Text>
            </ScrollView>
          </View>
        )}

        {/* Legendă */}
        <View style={styles.legend}>
          <Text style={styles.legTitle}>{leg.title}</Text>
          <Text style={styles.legItem}>▬ {leg.line}</Text>
          <Text style={styles.legItem}>{leg.arrow}</Text>
          <Text style={styles.legItem}>{leg.merge}</Text>
          <Text style={styles.legItem}>{leg.sides}</Text>
          <Text style={styles.legItem}>🎨 {leg.colors}</Text>
        </View>

        {/* Diagrame */}
        <Text style={styles.secTitle}>Diagrame</Text>

        <View style={styles.dia}>
          <Text style={styles.diaTitle}>1 · Relaționarea</Text>
          <View style={[styles.relNode, { backgroundColor: "#fdecec", borderColor: "#f5c6c6" }]}>
            <Text style={[styles.relB, { color: "#b42318" }]}>Tratează simptomul</Text>
            <Text style={styles.relS}>Big Pharma · medicina occidentală</Text>
          </View>
          <Text style={styles.relArrow}>↑ ↓</Text>
          <View style={[styles.relNode, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Text style={[styles.relB, { color: colors.text }]}>INDEX</Text>
            <Text style={styles.relS}>afecțiuni & simptome</Text>
          </View>
          <Text style={styles.relArrow}>↑ ↓</Text>
          <View style={[styles.relNode, { backgroundColor: colors.surfaceAlt, borderColor: "#bfe3c8" }]}>
            <Text style={[styles.relB, { color: colors.primary }]}>Tratează cauza</Text>
            <Text style={styles.relS}>Holistic · natural</Text>
          </View>
        </View>

        <View style={styles.dia}>
          <Text style={styles.diaTitle}>2 · Statistici (conform hărții)</Text>
          <View style={styles.century}>
            <View style={styles.centuryHead}>
              <Text style={styles.centuryTitle}>Secolul XXI</Text>
              <Text style={styles.centuryRange}>2001 — prezent</Text>
            </View>
            <View style={styles.centuryTrack}>
              <Animated.View style={[styles.centuryFill, { width: barW(24) }]} />
            </View>
          </View>
          <Text style={styles.diaSub}>Cauze de deces în SUA</Text>
          {DEATHS.map(([l, v]) => (
            <View key={l} style={styles.barRow}>
              <Text style={styles.barLabel} numberOfLines={1}>{l}</Text>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, { width: barW((v / MAXD) * 100), backgroundColor: "#e63e11" }]} />
              </View>
              <Text style={styles.barVal}>{fmtN(v)}</Text>
            </View>
          ))}
          <Text style={[styles.diaSub, { marginTop: 14 }]}>Afecțiuni cronice prevalente (% populație)</Text>
          {CHRONIC.map(([l, v]) => (
            <View key={l} style={styles.barRow}>
              <Text style={styles.barLabel} numberOfLines={1}>{l}</Text>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, { width: barW((v / 25) * 100), backgroundColor: colors.primary }]} />
              </View>
              <Text style={styles.barVal}>{v}%</Text>
            </View>
          ))}
        </View>

        <View style={styles.dia}>
          <Text style={styles.diaTitle}>3 · Corp & energie — cele 7 chakre</Text>
          {CHAKRAS.map((ck) => (
            <View key={ck.n} style={styles.chk}>
              <View style={[styles.chkDot, { backgroundColor: ck.color }]}>
                <Text style={styles.chkN}>{ck.n}</Text>
              </View>
              <View style={styles.chkBody}>
                <Text style={styles.chkT}>{ck.name[lang] ?? ck.name.en}</Text>
                <Text style={styles.chkD}>{ck.desc[lang] ?? ck.desc.en}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Eseuri */}
        <View style={styles.essay}>
          <Text style={styles.essayTitle}>{d.leftTitle}</Text>
          {paras(d.leftBody).map((p, i) => (
            <Text key={i} style={styles.p}>
              {p}
            </Text>
          ))}
        </View>
        <View style={styles.essay}>
          <Text style={styles.essayTitle}>{d.rightTitle}</Text>
          {paras(d.rightBody).map((p, i) => (
            <Text key={i} style={styles.p}>
              {p}
            </Text>
          ))}
        </View>

        <Text style={styles.note}>{d.disclaimer}</Text>
      </ScrollView>

      <Modal visible={!!zoom} transparent animationType="fade" onRequestClose={() => setZoom(null)}>
        <View style={styles.zoomWrap}>
          {/* Pinch cu doua degete = zoom · un deget = tragere · dublu-tap = 3x */}
          <View style={styles.zoomStage} {...zoomPR.panHandlers}>
            {zoom && (
              <Animated.Image
                source={zoom}
                resizeMode="contain"
                style={{
                  width: width,
                  height: width / RATIO,
                  marginTop: Math.max(0, (winH - width / RATIO) / 2),
                  transform: [
                    { translateX: zPan.x },
                    { translateY: zPan.y },
                    { scale: zScale },
                  ],
                }}
              />
            )}
          </View>
          <TouchableOpacity style={styles.zoomClose} onPress={() => setZoom(null)} accessibilityLabel={t("cancel") || "Închide"}>
            <Text style={styles.zoomCloseTxt}>✕</Text>
          </TouchableOpacity>
          {/* Butoane — alternativa la pinch (utile si pe web, la mouse) */}
          <View style={styles.zoomBtnRow}>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => zoomTo(zs.s / 1.5, 0, 0)}
              accessibilityRole="button"
              accessibilityLabel="Zoom out"
            >
              <Text style={styles.zoomBtnTxt}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => zoomTo(1, 0, 0)}
              accessibilityRole="button"
              accessibilityLabel="Reset zoom"
            >
              <Text style={[styles.zoomBtnTxt, { fontSize: 16 }]}>⟲</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => zoomTo(zs.s * 1.5, 0, 0)}
              accessibilityRole="button"
              accessibilityLabel="Zoom in"
            >
              <Text style={styles.zoomBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    topbar: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: isWeb ? 16 : 52,
      paddingBottom: 12,
      paddingHorizontal: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      backgroundColor: c.surface,
      gap: 8,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.surfaceAlt,
    },
    topTitle: { flex: 1, fontSize: 17, fontWeight: "800", color: c.text, textAlign: "center" },
    topSpacer: { width: 40, height: 40 },
    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 60,
      maxWidth: 820,
      width: "100%",
      alignSelf: "center",
    },
    discTop: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
      backgroundColor: c.isDark ? "rgba(238,129,0,0.16)" : "#FFF4E5",
      borderWidth: 1,
      borderColor: c.isDark ? "rgba(238,129,0,0.45)" : "#F5C98A",
      borderRadius: 14,
      padding: 14,
      marginBottom: 18,
    },
    discTopIcon: { fontSize: 18 },
    discTopText: { flex: 1, fontSize: 13, lineHeight: 19, color: c.text, fontWeight: "600" },
    eyebrow: { fontSize: 12, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase", color: c.primary, marginBottom: 8 },
    h1: { fontSize: 30, fontWeight: "900", color: c.text, marginBottom: 8 },
    lead: { fontSize: 15, lineHeight: 22, color: c.textMuted, marginBottom: 18 },
    map: { borderRadius: 14, backgroundColor: c.surfaceAlt },
    cap: { fontSize: 12.5, color: c.textMuted, marginTop: 8, marginBottom: 16 },
    mapTxtToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 10,
    },
    mapTxtIcon: { fontSize: 16 },
    map2Guide: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderTopWidth: 3,
      borderTopColor: c.primary,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
    },
    map2GuideIcon: { fontSize: 24 },
    map2GuideTitle: { fontSize: 14.5, fontWeight: "800", color: c.text },
    map2GuideSub: { fontSize: 12.5, color: c.textMuted, marginTop: 2 },
    mapTxtLabel: { flex: 1, fontSize: 13, fontWeight: "700", color: c.text, lineHeight: 18 },
    mapTxtBox: {
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      padding: 14,
      marginBottom: 16,
    },
    // Derulare INTERIOARA: se vede tot textul, nimic nu se taie.
    mapTxtScroll: { maxHeight: 420 },
    mapTxtNote: { fontSize: 12, fontStyle: "italic", color: c.textFaint, marginBottom: 8 },
    mapTxtBody: { fontSize: 12.5, lineHeight: 19, color: c.textMuted },
    legend: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginTop: 6,
      marginBottom: 8,
      gap: 6,
    },
    legTitle: { fontSize: 16, fontWeight: "800", color: c.text, marginBottom: 4 },
    legItem: { fontSize: 13.5, lineHeight: 20, color: c.textMuted },
    secTitle: { fontSize: 22, fontWeight: "900", color: c.text, marginTop: 26, marginBottom: 4 },
    dia: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      borderTopWidth: 3,
      borderTopColor: c.primary,
      padding: 16,
      marginTop: 14,
    },
    diaTitle: { fontSize: 15.5, fontWeight: "800", color: c.text, marginBottom: 10 },
    diaSub: { fontSize: 12.5, fontWeight: "700", color: c.textMuted, marginBottom: 8 },
    century: { backgroundColor: "#13301f", borderRadius: 14, padding: 14, marginBottom: 14 },
    centuryHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
    centuryTitle: { fontSize: 16, fontWeight: "800", color: "#9be7a6", letterSpacing: 0.5 },
    centuryRange: { fontSize: 12, color: "#9db5a6" },
    centuryTrack: { height: 11, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)", overflow: "hidden" },
    centuryFill: { height: "100%", borderRadius: 999, backgroundColor: "#5bbd62" },
    relNode: { borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center" },
    relB: { fontSize: 14, fontWeight: "800", marginBottom: 3 },
    relS: { fontSize: 12, color: c.textMuted, textAlign: "center" },
    relArrow: { textAlign: "center", color: c.primary, fontSize: 16, marginVertical: 5 },
    barRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
    barLabel: { width: 110, fontSize: 11.5, color: c.text, textAlign: "right" },
    barTrack: { flex: 1, height: 16, borderRadius: 999, backgroundColor: c.surfaceAlt, overflow: "hidden" },
    barFill: { height: "100%", borderRadius: 999 },
    barVal: { width: 62, fontSize: 11, fontWeight: "700", color: c.textMuted },
    chk: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
    chkDot: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    chkN: { color: "#fff", fontWeight: "800", fontSize: 15 },
    chkBody: { flex: 1 },
    chkT: { fontSize: 14.5, fontWeight: "700", color: c.text },
    chkD: { fontSize: 12.5, color: c.textMuted, marginTop: 1 },
    essay: {
      backgroundColor: c.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      padding: 20,
      marginTop: 18,
    },
    essayTitle: { fontSize: 19, fontWeight: "800", color: c.primary, marginBottom: 12 },
    p: { fontSize: 14.5, lineHeight: 23, color: c.textMuted, marginBottom: 11 },
    note: {
      fontSize: 12.5,
      lineHeight: 19,
      color: c.textMuted,
      backgroundColor: c.surfaceAlt,
      borderRadius: 12,
      padding: 14,
      marginTop: 20,
    },
    zoomWrap: { flex: 1, backgroundColor: "rgba(8,16,11,0.96)" },
    zoomStage: { flex: 1, overflow: "hidden" },
    zoomClose: {
      position: "absolute",
      top: 44,
      right: 18,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    zoomCloseTxt: { color: "#fff", fontSize: 20, fontWeight: "700" },
    zoomBtnRow: {
      position: "absolute",
      bottom: 34,
      alignSelf: "center",
      flexDirection: "row",
      gap: 12,
      backgroundColor: "rgba(255,255,255,0.14)",
      borderRadius: 999,
      padding: 8,
    },
    zoomBtn: {
      minWidth: 52,
      height: 52,
      borderRadius: 26,
      paddingHorizontal: 10,
      backgroundColor: "rgba(255,255,255,0.22)",
      alignItems: "center",
      justifyContent: "center",
    },
    zoomBtnTxt: { color: "#fff", fontSize: 26, fontWeight: "800" },
  });
}
