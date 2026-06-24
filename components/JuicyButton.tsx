import { useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const isWeb = Platform.OS === "web";

type Props = {
  label: string;
  emoji?: string;
  onPress?: () => void;
  disabled?: boolean;
  colorTop: string; // partea de sus a fructului (lucioasă)
  colorBottom: string; // baza 3D (umbra solidă dedesubt)
  textColor?: string;
  big?: boolean;
  style?: StyleProp<ViewStyle>;
};

const DEPTH = 7;

export default function JuicyButton({
  label,
  emoji,
  onPress,
  disabled,
  colorTop,
  colorBottom,
  textColor = "#FFFFFF",
  big,
  style,
}: Props) {
  const press = useRef(new Animated.Value(0)).current;
  const wobble = useRef(new Animated.Value(0)).current;

  function animateTo(v: number) {
    Animated.timing(press, {
      toValue: v,
      duration: v ? 70 : 120,
      easing: v ? Easing.out(Easing.quad) : Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }).start();
  }

  function handlePress() {
    if (disabled) return;
    // mic „topăit" de fruct la apăsare
    wobble.setValue(0);
    Animated.timing(wobble, {
      toValue: 1,
      duration: 420,
      easing: Easing.elastic(2.2),
      useNativeDriver: true,
    }).start();
    onPress?.();
  }

  const translateY = press.interpolate({
    inputRange: [0, 1],
    outputRange: [0, DEPTH],
  });
  const wobbleScale = wobble.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 1.08, 1],
  });

  const faceColor: any = isWeb
    ? {
        backgroundImage: `linear-gradient(180deg, ${colorTop} 0%, ${colorBottom} 100%)`,
        backgroundColor: colorTop,
      }
    : { backgroundColor: colorTop };

  return (
    <Pressable
      onPressIn={() => animateTo(1)}
      onPressOut={() => animateTo(0)}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.wrap, big && styles.wrapBig, disabled && styles.disabled, style]}
    >
      {/* baza 3D (umbra solidă a fructului) */}
      <View style={[styles.base, { backgroundColor: colorBottom }]} />
      {/* fața fructului */}
      <Animated.View
        style={[
          styles.face,
          big && styles.faceBig,
          faceColor,
          { transform: [{ translateY }, { scale: wobbleScale }] },
        ]}
      >
        {/* luciu de sus */}
        <View style={styles.gloss} />
        <View style={styles.content}>
          {emoji ? <Text style={[styles.emoji, big && styles.emojiBig]}>{emoji}</Text> : null}
          <Text style={[styles.label, big && styles.labelBig, { color: textColor }]}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    maxWidth: 400,
    paddingBottom: DEPTH,
    marginBottom: 16,
  },
  wrapBig: {},
  disabled: { opacity: 0.55 },
  base: {
    position: "absolute",
    left: 0,
    right: 0,
    top: DEPTH + 2,
    bottom: 0,
    borderRadius: 26,
  },
  face: {
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: isWeb ? 0 : 0,
    ...(isWeb
      ? { boxShadow: "inset 0 2px 4px rgba(255,255,255,0.45)" }
      : {}),
  },
  faceBig: { paddingVertical: 20, borderRadius: 30 },
  gloss: {
    position: "absolute",
    top: 4,
    left: 12,
    right: 12,
    height: "42%",
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  content: { flexDirection: "row", alignItems: "center", gap: 10 },
  emoji: { fontSize: 22 },
  emojiBig: { fontSize: 28 },
  label: { fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
  labelBig: { fontSize: 19 },
});
