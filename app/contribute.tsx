import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ThemeFx from "../components/ThemeFx";
import {
  contributeProduct,
  isContributionEnabled,
  type ContributeErrorKind,
} from "../utils/offContribute";
import { PALETTES, useTheme, type ThemeColors } from "../utils/theme";

const isWeb = Platform.OS === "web";

/**
 * Ecranul prin care utilizatorul adauga un produs lipsa in Open Food Facts.
 *
 * Ajunge aici doar dupa o scanare esuata, cu codul de bare deja completat —
 * partea cea mai anevoioasa e deci facuta. Restul campurilor sunt optionale
 * in afara numelui: un produs cu nume si cod e deja util, iar restul poate fi
 * completat mai tarziu de oricine (imbogatire progresiva). Un formular cu 15
 * campuri obligatorii nu ar fi completat de nimeni.
 */
export default function Contribute() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { colors, palette } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 900;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const paletteEmoji = (PALETTES.find((p) => p.id === palette) || PALETTES[0]).emoji;

  const params = useLocalSearchParams<{
    barcode?: string;
    name?: string;
    ingredients?: string;
  }>();
  const barcode = String(params.barcode ?? "");

  // Numele si ingredientele pot veni pre-completate din OCR. Utilizatorul le
  // confirma sau le corecteaza — nu trimitem niciodata text nevazut de el.
  const [name, setName] = useState(String(params.name ?? ""));
  const [brand, setBrand] = useState("");
  const [ingredients, setIngredients] = useState(String(params.ingredients ?? ""));

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errKind, setErrKind] = useState<ContributeErrorKind | null>(null);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  async function submit() {
    if (sending) return;
    setErrKind(null);
    setSending(true);
    const r = await contributeProduct({
      barcode,
      productName: name,
      brands: brand,
      ingredientsText: ingredients,
      lang: i18n.language,
    });
    setSending(false);
    if (r.ok) setSent(true);
    else setErrKind(r.kind);
  }

  /** Fiecare motiv de esec are alt mesaj — la fel ca la cautarea de produse. */
  function errorText(kind: ContributeErrorKind): string {
    switch (kind) {
      case "INVALID_INPUT":
        return t("contribErrInvalid");
      case "NETWORK_ERROR":
        return t("errorConnection");
      case "RATE_LIMITED":
        return t("errorRateLimited");
      case "REJECTED":
        return t("contribErrRejected");
      default:
        return t("errorUpstream");
    }
  }

  const canSend = name.trim().length >= 2 && !sending && isContributionEnabled();

  return (
    <View style={styles.screen}>
      <StatusBar style={colors.isDark ? "light" : "dark"} />
      <ThemeFx emoji={paletteEmoji} />

      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <TouchableOpacity
          style={styles.iconTile}
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel={t("cancel")}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("contribTitle")}</Text>
        <View style={styles.iconTileGhost} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]}
          keyboardShouldPersistTaps="handled"
        >
          {sent ? (
            // ---- Confirmare ----
            <View style={styles.okCard}>
              <Text style={styles.okIcon}>🌍</Text>
              <Text style={styles.okTitle}>{t("contribOk")}</Text>
              <Text style={styles.okHint}>{t("contribOkHint")}</Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={goBack}
                accessibilityRole="button"
              >
                <Text style={styles.primaryBtnTxt}>{t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.introCard}>
                <Text style={styles.intro}>{t("contribIntro")}</Text>
                <View style={styles.privacyRow}>
                  <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.privacy}>{t("contribPrivacy")}</Text>
                </View>
              </View>

              {/* Codul de bare nu se editeaza: vine din scanare, e cheia produsului. */}
              <View style={styles.field}>
                <Text style={styles.label}>{t("contribBarcode")}</Text>
                <View style={styles.readonlyBox}>
                  <Ionicons name="barcode-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.readonlyTxt}>{barcode || "—"}</Text>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t("contribName")}</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder={t("contribNamePh")}
                  placeholderTextColor={colors.textFaint}
                  autoCapitalize="sentences"
                  accessibilityLabel={t("contribName")}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  {t("contribBrand")} <Text style={styles.optional}>{t("contribOptional")}</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder={t("contribBrandPh")}
                  placeholderTextColor={colors.textFaint}
                  autoCapitalize="words"
                  accessibilityLabel={t("contribBrand")}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  {t("contribIngredients")}{" "}
                  <Text style={styles.optional}>{t("contribOptional")}</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.inputMulti]}
                  value={ingredients}
                  onChangeText={setIngredients}
                  placeholder={t("contribIngredientsPh")}
                  placeholderTextColor={colors.textFaint}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  accessibilityLabel={t("contribIngredients")}
                />
              </View>

              {errKind && (
                <View style={styles.errBox}>
                  <Ionicons name="alert-circle-outline" size={18} color="#b3261e" />
                  <Text style={styles.errTxt}>{errorText(errKind)}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, !canSend && styles.primaryBtnOff]}
                onPress={submit}
                disabled={!canSend}
                accessibilityRole="button"
                accessibilityLabel={t("contribSubmit")}
              >
                {sending ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.primaryBtnTxt}>{t("contribSending")}</Text>
                  </>
                ) : (
                  <Text style={styles.primaryBtnTxt}>{t("contribSubmit")}</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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

    scroll: { padding: 16, gap: 14, paddingBottom: 140 },
    scrollDesktop: { maxWidth: 620, alignSelf: "center", width: "100%" },

    introCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
      gap: 10,
    },
    intro: { fontSize: 14, lineHeight: 20, color: c.text },
    privacyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    privacy: { fontSize: 12, color: c.textMuted, flex: 1 },

    field: { gap: 6 },
    label: { fontSize: 13, fontWeight: "700", color: c.text },
    optional: { fontWeight: "500", color: c.textFaint },
    input: {
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: c.text,
    },
    inputMulti: { minHeight: 110 },

    readonlyBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    readonlyTxt: { fontSize: 15, fontWeight: "700", color: c.textMuted, letterSpacing: 0.5 },

    errBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "rgba(179,38,30,0.10)",
      borderRadius: 12,
      padding: 12,
    },
    errTxt: { flex: 1, fontSize: 13, color: "#b3261e", fontWeight: "600" },

    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: c.primary,
      borderRadius: 14,
      paddingVertical: 15,
      marginTop: 4,
    },
    primaryBtnOff: { opacity: 0.45 },
    primaryBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },

    okCard: {
      backgroundColor: c.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      padding: 22,
      alignItems: "center",
      gap: 10,
      marginTop: 20,
    },
    okIcon: { fontSize: 44 },
    okTitle: { fontSize: 20, fontWeight: "800", color: c.text, textAlign: "center" },
    okHint: {
      fontSize: 14,
      lineHeight: 20,
      color: c.textMuted,
      textAlign: "center",
      marginBottom: 6,
    },
  });
