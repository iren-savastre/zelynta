import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getConsent, setConsent } from "../utils/consent";
import { PALETTES, useTheme, type ThemeColors } from "../utils/theme";

const isWeb = Platform.OS === "web";

export default function CookieBanner() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors, palette } = useTheme();
  const pal = PALETTES.find((p) => p.id === palette) || PALETTES[0];
  const styles = useMemo(() => makeStyles(colors, pal.primaryDark), [colors, pal.primaryDark]);

  const [show, setShow] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    getConsent().then((c) => {
      if (alive && !c) {
        setShow(true);
        Animated.timing(anim, {
          toValue: 1,
          duration: 460,
          delay: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    });
    return () => {
      alive = false;
    };
  }, [anim]);

  const dismiss = (optional: boolean) => {
    setConsent(optional);
    Animated.timing(anim, {
      toValue: 0,
      duration: 280,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setShow(false));
  };

  if (!show) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => dismiss(false)}
          accessibilityRole="button"
          accessibilityLabel={t("cookieReject") || "Închide"}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={18} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.headRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t("cookieTitle")}</Text>
            <Text style={styles.text}>{t("cookieText")}</Text>
          </View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => {
              dismiss(false);
              router.push("/legal/cookies" as any);
            }}
            accessibilityRole="link"
          >
            <Text style={styles.linkTxt}>{t("cookieDetails")}</Text>
          </TouchableOpacity>

          <View style={styles.spacer} />

          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={() => dismiss(false)}
            accessibilityRole="button"
          >
            <Text style={styles.ghostTxt}>{t("cookieReject")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => dismiss(true)}
            accessibilityRole="button"
          >
            <Text style={styles.primaryTxt}>{t("cookieAccept")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

function makeStyles(c: ThemeColors, accent: string) {
  return StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      // Aplicatia e edge-to-edge pe Android: lasam loc barei de navigare si
      // aer fata de marginile ecranului, altfel cardul "intra in pereti".
      paddingHorizontal: 18,
      paddingBottom: isWeb ? 16 : 52,
      alignItems: "center",
      zIndex: 9999,
    },
    card: {
      width: "100%",
      maxWidth: 560,
      backgroundColor: c.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      paddingVertical: 13,
      paddingHorizontal: 14,
      shadowColor: "#000",
      shadowOpacity: c.isDark ? 0.5 : 0.18,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 14 },
      elevation: 16,
    },
    closeBtn: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    headRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", paddingRight: 22 },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: accent,
      shadowOpacity: 0.5,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    title: { fontSize: 14.5, fontWeight: "800", color: c.text, marginBottom: 3 },
    text: { fontSize: 12, lineHeight: 17, color: c.textMuted },
    btnRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap", // pe ecrane inguste butoanele coboara pe randul urmator
      marginTop: 12,
      gap: 8,
    },
    spacer: { flex: 1 },
    linkBtn: { paddingVertical: 8, paddingHorizontal: 4 },
    linkTxt: { fontSize: 13, fontWeight: "600", color: c.textMuted, textDecorationLine: "underline" },
    ghostBtn: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bg,
    },
    ghostTxt: { fontSize: 12.5, fontWeight: "700", color: c.text },
    primaryBtn: {
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 12,
      backgroundColor: c.primary,
      shadowColor: accent,
      shadowOpacity: 0.45,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    primaryTxt: { fontSize: 13.5, fontWeight: "800", color: "#fff" },
  });
}
