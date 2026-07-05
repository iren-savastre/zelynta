import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  View,
} from "react-native";
import ThemeFx from "../components/ThemeFx";
import { MAP2_TEXT } from "../utils/healingTranscript";
import { translateText } from "../utils/translate";
import { PALETTES, useTheme, type ThemeColors } from "../utils/theme";

const isWeb = Platform.OS === "web";
const MAP2 = require("../assets/images/healing-web-2.jpg");
const RATIO = 3168 / 2448;

type L9 = Record<string, string>;

// Ghidul Hartii 2 — explicatii clare, in cele 9 limbi ale aplicatiei.
const G: Record<string, L9> = {
  title: {
    ro: "Harta 2 — Ghid & index",
    en: "Map 2 — Guide & index",
    fr: "Carte 2 — Guide & index",
    it: "Mappa 2 — Guida & indice",
    es: "Mapa 2 — Guía & índice",
    de: "Karte 2 — Leitfaden & Index",
    ru: "Карта 2 — Руководство и указатель",
    pl: "Mapa 2 — Przewodnik i indeks",
    nl: "Kaart 2 — Gids & index",
  },
  intro: {
    ro: "Pagina a doua a hărții The Healing Web este „manualul” primei pagini: explică filosofia hărții și adună într-un singur loc statisticile, diagrama corp–minte și marele index de afecțiuni cu remediile asociate. Mai jos ai fiecare componentă explicată, apoi întregul text al paginii, lizibil și copiabil.",
    en: "The second page of The Healing Web map is the “manual” of the first: it explains the map's philosophy and gathers in one place the statistics, the body–mind diagram and the big index of conditions with their associated remedies. Below you'll find each component explained, then the full text of the page, readable and copyable.",
    fr: "La deuxième page de la carte The Healing Web est le « manuel » de la première : elle explique la philosophie de la carte et réunit les statistiques, le diagramme corps–esprit et le grand index des affections avec leurs remèdes associés. Ci-dessous, chaque composant est expliqué, puis le texte complet de la page, lisible et copiable.",
    it: "La seconda pagina della mappa The Healing Web è il “manuale” della prima: spiega la filosofia della mappa e riunisce le statistiche, il diagramma corpo–mente e il grande indice delle condizioni con i rimedi associati. Qui sotto trovi ogni componente spiegato, poi il testo completo della pagina, leggibile e copiabile.",
    es: "La segunda página del mapa The Healing Web es el «manual» de la primera: explica la filosofía del mapa y reúne las estadísticas, el diagrama cuerpo–mente y el gran índice de dolencias con sus remedios asociados. Abajo tienes cada componente explicado y luego el texto completo de la página, legible y copiable.",
    de: "Die zweite Seite der The-Healing-Web-Karte ist das „Handbuch“ der ersten: Sie erklärt die Philosophie der Karte und versammelt Statistiken, das Körper–Geist-Diagramm und das große Verzeichnis der Beschwerden mit den zugehörigen Mitteln. Unten findest du jede Komponente erklärt und dann den vollständigen Text der Seite, lesbar und kopierbar.",
    ru: "Вторая страница карты The Healing Web — это «руководство» к первой: она объясняет философию карты и собирает в одном месте статистику, диаграмму тело–разум и большой указатель недугов с соответствующими средствами. Ниже — объяснение каждого компонента, а затем полный текст страницы, удобный для чтения и копирования.",
    pl: "Druga strona mapy The Healing Web to „podręcznik” pierwszej: wyjaśnia filozofię mapy i zbiera w jednym miejscu statystyki, diagram ciało–umysł oraz wielki indeks dolegliwości z przypisanymi środkami. Poniżej znajdziesz wyjaśnienie każdego elementu, a następnie pełny tekst strony, czytelny i możliwy do skopiowania.",
    nl: "De tweede pagina van The Healing Web-kaart is de “handleiding” van de eerste: ze legt de filosofie van de kaart uit en bundelt de statistieken, het lichaam–geest-diagram en de grote index van kwalen met bijbehorende remedies. Hieronder vind je elk onderdeel uitgelegd, en daarna de volledige tekst van de pagina, leesbaar en kopieerbaar.",
  },
  s1t: {
    ro: "Arborele vieții",
    en: "The tree of life",
    fr: "L'arbre de vie",
    it: "L'albero della vita",
    es: "El árbol de la vida",
    de: "Der Baum des Lebens",
    ru: "Древо жизни",
    pl: "Drzewo życia",
    nl: "De levensboom",
  },
  s1d: {
    ro: "Ilustrația centrală: sănătatea ca un arbore cu rădăcini (alimentație, somn, mișcare, liniște) și ramuri (organele și sistemele corpului). Mesajul autorului: îngrijește rădăcinile, iar coroana înflorește.",
    en: "The central illustration: health as a tree with roots (food, sleep, movement, calm) and branches (the body's organs and systems). The author's message: care for the roots and the crown blossoms.",
    fr: "L'illustration centrale : la santé comme un arbre avec des racines (alimentation, sommeil, mouvement, calme) et des branches (les organes et systèmes du corps). Le message de l'auteur : soignez les racines et la cime fleurit.",
    it: "L'illustrazione centrale: la salute come un albero con radici (cibo, sonno, movimento, calma) e rami (organi e sistemi del corpo). Il messaggio dell'autore: cura le radici e la chioma fiorisce.",
    es: "La ilustración central: la salud como un árbol con raíces (alimentación, sueño, movimiento, calma) y ramas (los órganos y sistemas del cuerpo). El mensaje del autor: cuida las raíces y la copa florece.",
    de: "Die zentrale Illustration: Gesundheit als Baum mit Wurzeln (Ernährung, Schlaf, Bewegung, Ruhe) und Ästen (Organe und Systeme des Körpers). Die Botschaft des Autors: Pflege die Wurzeln, und die Krone blüht.",
    ru: "Центральная иллюстрация: здоровье как дерево с корнями (питание, сон, движение, покой) и ветвями (органы и системы тела). Послание автора: заботьтесь о корнях — и крона расцветёт.",
    pl: "Centralna ilustracja: zdrowie jako drzewo z korzeniami (jedzenie, sen, ruch, spokój) i gałęziami (narządy i układy ciała). Przesłanie autora: dbaj o korzenie, a korona zakwitnie.",
    nl: "De centrale illustratie: gezondheid als een boom met wortels (voeding, slaap, beweging, rust) en takken (de organen en systemen van het lichaam). De boodschap van de maker: verzorg de wortels en de kruin bloeit.",
  },
  s2t: {
    ro: "Statisticile de sănătate",
    en: "The health statistics",
    fr: "Les statistiques de santé",
    it: "Le statistiche sulla salute",
    es: "Las estadísticas de salud",
    de: "Die Gesundheitsstatistiken",
    ru: "Статистика здоровья",
    pl: "Statystyki zdrowotne",
    nl: "De gezondheidsstatistieken",
  },
  s2d: {
    ro: "Două tabele cu date din SUA: principalele cauze de deces (boli de inimă, cancer, erori medicale…) și cele mai răspândite afecțiuni cronice (hipertensiune, colesterol, alergii…). Le găsești redesenate, animate, și în pagina principală Healing Web, la secțiunea „Diagrame”.",
    en: "Two tables with US data: the leading causes of death (heart disease, cancer, medical errors…) and the most prevalent chronic conditions (hypertension, cholesterol, allergies…). You'll find them redrawn and animated on the main Healing Web page, in the “Diagrams” section.",
    fr: "Deux tableaux avec des données américaines : les principales causes de décès (maladies cardiaques, cancer, erreurs médicales…) et les affections chroniques les plus répandues (hypertension, cholestérol, allergies…). Vous les retrouverez redessinés et animés sur la page principale Healing Web, section « Diagrammes ».",
    it: "Due tabelle con dati USA: le principali cause di morte (malattie cardiache, cancro, errori medici…) e le condizioni croniche più diffuse (ipertensione, colesterolo, allergie…). Le trovi ridisegnate e animate nella pagina principale Healing Web, sezione “Diagrammi”.",
    es: "Dos tablas con datos de EE. UU.: las principales causas de muerte (enfermedades cardíacas, cáncer, errores médicos…) y las dolencias crónicas más prevalentes (hipertensión, colesterol, alergias…). Las encontrarás redibujadas y animadas en la página principal de Healing Web, sección «Diagramas».",
    de: "Zwei Tabellen mit US-Daten: die häufigsten Todesursachen (Herzkrankheiten, Krebs, medizinische Fehler…) und die verbreitetsten chronischen Beschwerden (Bluthochdruck, Cholesterin, Allergien…). Du findest sie neu gezeichnet und animiert auf der Healing-Web-Hauptseite im Abschnitt „Diagramme“.",
    ru: "Две таблицы с данными по США: основные причины смерти (болезни сердца, рак, медицинские ошибки…) и самые распространённые хронические недуги (гипертония, холестерин, аллергии…). Они перерисованы и анимированы на главной странице Healing Web в разделе «Диаграммы».",
    pl: "Dwie tabele z danymi z USA: główne przyczyny zgonów (choroby serca, rak, błędy medyczne…) oraz najczęstsze schorzenia przewlekłe (nadciśnienie, cholesterol, alergie…). Znajdziesz je przerysowane i animowane na głównej stronie Healing Web, w sekcji „Diagramy”.",
    nl: "Twee tabellen met Amerikaanse data: de belangrijkste doodsoorzaken (hartziekten, kanker, medische fouten…) en de meest voorkomende chronische aandoeningen (hypertensie, cholesterol, allergieën…). Je vindt ze hertekend en geanimeerd op de Healing Web-hoofdpagina, sectie “Diagrammen”.",
  },
  s3t: {
    ro: "Diagrama corp–minte (cele 7 chakre)",
    en: "The body–mind diagram (the 7 chakras)",
    fr: "Le diagramme corps–esprit (les 7 chakras)",
    it: "Il diagramma corpo–mente (i 7 chakra)",
    es: "El diagrama cuerpo–mente (los 7 chakras)",
    de: "Das Körper–Geist-Diagramm (die 7 Chakren)",
    ru: "Диаграмма тело–разум (7 чакр)",
    pl: "Diagram ciało–umysł (7 czakr)",
    nl: "Het lichaam–geest-diagram (de 7 chakra's)",
  },
  s3d: {
    ro: "Silueta umană cu cele 7 centre energetice din tradiția orientală, de la Rădăcină (stabilitate) la Coroană (conexiune cu Sursa). Fiecare chakră e explicată în pagina principală Healing Web.",
    en: "The human silhouette with the 7 energy centres of Eastern tradition, from Root (stability) to Crown (connection to the Source). Each chakra is explained on the main Healing Web page.",
    fr: "La silhouette humaine avec les 7 centres énergétiques de la tradition orientale, de la Racine (stabilité) à la Couronne (connexion à la Source). Chaque chakra est expliqué sur la page principale Healing Web.",
    it: "La sagoma umana con i 7 centri energetici della tradizione orientale, dalla Radice (stabilità) alla Corona (connessione con la Sorgente). Ogni chakra è spiegato nella pagina principale Healing Web.",
    es: "La silueta humana con los 7 centros energéticos de la tradición oriental, desde la Raíz (estabilidad) hasta la Corona (conexión con la Fuente). Cada chakra se explica en la página principal de Healing Web.",
    de: "Die menschliche Silhouette mit den 7 Energiezentren der östlichen Tradition, von der Wurzel (Stabilität) bis zur Krone (Verbindung zur Quelle). Jedes Chakra wird auf der Healing-Web-Hauptseite erklärt.",
    ru: "Силуэт человека с 7 энергетическими центрами восточной традиции — от Корня (стабильность) до Короны (связь с Источником). Каждая чакра объяснена на главной странице Healing Web.",
    pl: "Sylwetka człowieka z 7 centrami energetycznymi tradycji wschodniej — od Korzenia (stabilność) po Koronę (połączenie ze Źródłem). Każda czakra jest wyjaśniona na głównej stronie Healing Web.",
    nl: "Het menselijk silhouet met de 7 energiecentra uit de oosterse traditie, van Wortel (stabiliteit) tot Kroon (verbinding met de Bron). Elke chakra wordt uitgelegd op de Healing Web-hoofdpagina.",
  },
  s4t: {
    ro: "Indexul de afecțiuni & remedii",
    en: "The index of conditions & remedies",
    fr: "L'index des affections & remèdes",
    it: "L'indice di disturbi & rimedi",
    es: "El índice de dolencias & remedios",
    de: "Das Verzeichnis der Beschwerden & Mittel",
    ru: "Указатель недугов и средств",
    pl: "Indeks dolegliwości i środków",
    nl: "De index van kwalen & remedies",
  },
  s4d: {
    ro: "Inima paginii: zeci de afecțiuni (hipertensiune, cancer, diabet, anxietate, insomnie…), fiecare cu trei perspective — cauze posibile, abordarea farmaceutică („Pharma”) și abordarea holistică („Holistic”). Textul complet, tradus automat, e mai jos: caută afecțiunea, apoi copiază orice termen ca să-l cercetezi singur.",
    en: "The heart of the page: dozens of conditions (hypertension, cancer, diabetes, anxiety, insomnia…), each with three perspectives — possible causes, the pharmaceutical approach (“Pharma”) and the holistic approach (“Holistic”). The full text, auto-translated, is below: find the condition, then copy any term to research it yourself.",
    fr: "Le cœur de la page : des dizaines d'affections (hypertension, cancer, diabète, anxiété, insomnie…), chacune avec trois perspectives — causes possibles, approche pharmaceutique (« Pharma ») et approche holistique (« Holistic »). Le texte complet, traduit automatiquement, est ci-dessous : trouvez l'affection, puis copiez n'importe quel terme pour faire vos propres recherches.",
    it: "Il cuore della pagina: decine di condizioni (ipertensione, cancro, diabete, ansia, insonnia…), ognuna con tre prospettive — possibili cause, approccio farmaceutico (“Pharma”) e approccio olistico (“Holistic”). Il testo completo, tradotto automaticamente, è qui sotto: trova la condizione, poi copia qualsiasi termine per approfondire da solo.",
    es: "El corazón de la página: decenas de dolencias (hipertensión, cáncer, diabetes, ansiedad, insomnio…), cada una con tres perspectivas — posibles causas, el enfoque farmacéutico («Pharma») y el enfoque holístico («Holistic»). El texto completo, traducido automáticamente, está abajo: busca la dolencia y copia cualquier término para investigarlo por tu cuenta.",
    de: "Das Herz der Seite: Dutzende Beschwerden (Bluthochdruck, Krebs, Diabetes, Angst, Schlaflosigkeit…), jede mit drei Perspektiven — mögliche Ursachen, der pharmazeutische Ansatz („Pharma“) und der ganzheitliche Ansatz („Holistic“). Der vollständige, automatisch übersetzte Text steht unten: Finde die Beschwerde und kopiere jeden Begriff, um selbst zu recherchieren.",
    ru: "Сердце страницы: десятки недугов (гипертония, рак, диабет, тревожность, бессонница…), каждый с тремя ракурсами — возможные причины, фармацевтический подход («Pharma») и холистический подход («Holistic»). Полный текст с автопереводом ниже: найдите недуг и скопируйте любой термин, чтобы изучить его самостоятельно.",
    pl: "Serce strony: dziesiątki dolegliwości (nadciśnienie, rak, cukrzyca, lęk, bezsenność…), każda z trzema perspektywami — możliwe przyczyny, podejście farmaceutyczne („Pharma”) i podejście holistyczne („Holistic”). Pełny tekst, przetłumaczony automatycznie, jest poniżej: znajdź dolegliwość i skopiuj dowolny termin, aby samodzielnie go zbadać.",
    nl: "Het hart van de pagina: tientallen kwalen (hypertensie, kanker, diabetes, angst, slapeloosheid…), elk met drie invalshoeken — mogelijke oorzaken, de farmaceutische aanpak (“Pharma”) en de holistische aanpak (“Holistic”). De volledige, automatisch vertaalde tekst staat hieronder: zoek de kwaal en kopieer elke term om zelf onderzoek te doen.",
  },
  fullTitle: {
    ro: "Textul complet al paginii",
    en: "The full text of the page",
    fr: "Le texte complet de la page",
    it: "Il testo completo della pagina",
    es: "El texto completo de la página",
    de: "Der vollständige Text der Seite",
    ru: "Полный текст страницы",
    pl: "Pełny tekst strony",
    nl: "De volledige tekst van de pagina",
  },
  fullNote: {
    ro: "Extras automat de pe hartă și tradus automat — pot exista mici greșeli. Ține apăsat pe un cuvânt ca să-l selectezi și să-l copiezi.",
    en: "Auto-extracted from the map and auto-translated — small errors may exist. Long-press a word to select and copy it.",
    fr: "Extrait automatiquement de la carte et traduit automatiquement — de petites erreurs sont possibles. Appui long sur un mot pour le sélectionner et le copier.",
    it: "Estratto automaticamente dalla mappa e tradotto automaticamente — possono esserci piccoli errori. Tieni premuto su una parola per selezionarla e copiarla.",
    es: "Extraído automáticamente del mapa y traducido automáticamente — puede haber pequeños errores. Mantén pulsada una palabra para seleccionarla y copiarla.",
    de: "Automatisch von der Karte extrahiert und automatisch übersetzt — kleine Fehler sind möglich. Halte ein Wort gedrückt, um es zu markieren und zu kopieren.",
    ru: "Автоматически извлечено с карты и автоматически переведено — возможны небольшие ошибки. Удерживайте слово, чтобы выделить и скопировать его.",
    pl: "Automatycznie wyodrębnione z mapy i przetłumaczone automatycznie — możliwe drobne błędy. Przytrzymaj słowo, aby je zaznaczyć i skopiować.",
    nl: "Automatisch van de kaart uitgelezen en automatisch vertaald — kleine fouten zijn mogelijk. Houd een woord lang ingedrukt om het te selecteren en te kopiëren.",
  },
  translating: {
    ro: "⏳ Se traduce automat…",
    en: "⏳ Translating…",
    fr: "⏳ Traduction en cours…",
    it: "⏳ Traduzione in corso…",
    es: "⏳ Traduciendo…",
    de: "⏳ Wird übersetzt…",
    ru: "⏳ Идёт перевод…",
    pl: "⏳ Tłumaczenie…",
    nl: "⏳ Vertalen…",
  },
};
const g = (key: string, lang: string) => G[key]?.[lang] ?? G[key]?.en ?? "";

export default function HealingMap2() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, palette } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const paletteEmoji = (PALETTES.find((p) => p.id === palette) || PALETTES[0]).emoji;
  const { width } = useWindowDimensions();
  const lang = i18n.language;

  const contentW = Math.min(width, 820) - 36;

  // Traducerea automata a textului complet (o data per limba, cu cache).
  const [txt, setTxt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setTxt(null);
    if (lang === "en") return;
    setBusy(true);
    translateText(MAP2_TEXT, "en", lang)
      .then(setTxt)
      .finally(() => setBusy(false));
  }, [lang]);
  const displayTxt = lang === "en" ? MAP2_TEXT : txt ?? MAP2_TEXT;

  const SECTIONS = [
    { n: "1", tKey: "s1t", dKey: "s1d", color: "#22c55e" },
    { n: "2", tKey: "s2t", dKey: "s2d", color: "#60a5fa" },
    { n: "3", tKey: "s3t", dKey: "s3d", color: "#a78bfa" },
    { n: "4", tKey: "s4t", dKey: "s4d", color: "#f59e0b" },
  ];

  return (
    <View style={styles.root}>
      <ThemeFx emoji={paletteEmoji} />
      <StatusBar style={colors.isDark ? "light" : "dark"} />

      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/healing" as any);
          }}
          accessibilityRole="button"
          accessibilityLabel={t("cancel")}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          {g("title", lang)}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={!isWeb}>
        <Image source={MAP2} style={[styles.map, { width: contentW, height: contentW / RATIO }]} />

        <Text style={styles.intro}>{g("intro", lang)}</Text>

        {SECTIONS.map((s) => (
          <View key={s.n} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={[styles.numBadge, { backgroundColor: s.color }]}>
                <Text style={styles.numBadgeText}>{s.n}</Text>
              </View>
              <Text style={styles.cardTitle}>{g(s.tKey, lang)}</Text>
            </View>
            <Text style={styles.cardText}>{g(s.dKey, lang)}</Text>
          </View>
        ))}

        <Text style={styles.fullTitle}>📖 {g("fullTitle", lang)}</Text>
        <Text style={styles.fullNote}>{g("fullNote", lang)}</Text>
        {busy && txt === null && lang !== "en" && (
          <Text style={styles.fullNote}>{g("translating", lang)}</Text>
        )}
        <View style={styles.fullBox}>
          <Text selectable style={styles.fullBody}>
            {displayTxt}
          </Text>
        </View>
      </ScrollView>
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
    map: { borderRadius: 14, backgroundColor: c.surfaceAlt, marginBottom: 14 },
    intro: { fontSize: 14.5, lineHeight: 22, color: c.textMuted, marginBottom: 16 },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginBottom: 12,
      gap: 8,
    },
    cardHead: { flexDirection: "row", alignItems: "center", gap: 10 },
    numBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    numBadgeText: { color: "#fff", fontWeight: "900", fontSize: 14 },
    cardTitle: { flex: 1, fontSize: 15.5, fontWeight: "800", color: c.text },
    cardText: { fontSize: 13.5, lineHeight: 20, color: c.textMuted },
    fullTitle: { fontSize: 18, fontWeight: "900", color: c.text, marginTop: 16, marginBottom: 6 },
    fullNote: { fontSize: 12, fontStyle: "italic", color: c.textFaint, marginBottom: 8 },
    fullBox: {
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      padding: 14,
    },
    fullBody: { fontSize: 13.5, lineHeight: 21, color: c.textMuted },
  });
}
