import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

/**
 * Prompter pentru navbar (doar desktop): motouri care curg orizontal,
 * cu un separator între ele. Pur decorativ.
 */
export default function NavMarquee({
  phrases,
  color,
  accent,
}: {
  phrases: string[];
  color: string;
  accent: string;
}) {
  const x = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);

  useEffect(() => {
    if (!w) return;
    x.setValue(-w);
    const anim = Animated.loop(
      Animated.timing(x, {
        toValue: 0,
        duration: Math.max(8000, w * 16),
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [w, x]);

  const Set = ({ measure }: { measure?: boolean }) => (
    <View
      style={styles.set}
      onLayout={measure ? (e) => setW(e.nativeEvent.layout.width) : undefined}
    >
      {phrases.map((p, i) => (
        <View key={i} style={styles.item}>
          <Text style={[styles.txt, { color }]} numberOfLines={1}>
            {p}
          </Text>
          <View style={[styles.sep, { backgroundColor: accent }]} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.wrap, { pointerEvents: "none" } as any]}>
      <Animated.View style={[styles.track, { transform: [{ translateX: x }] }]}>
        <Set measure />
        <Set />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: "hidden", marginHorizontal: 20, height: 24, justifyContent: "center" },
  track: { flexDirection: "row" },
  set: { flexDirection: "row" },
  item: { flexDirection: "row", alignItems: "center" },
  txt: { fontSize: 13.5, fontWeight: "700", letterSpacing: 0.2 },
  sep: { width: 6, height: 6, borderRadius: 2, marginHorizontal: 18, transform: [{ rotate: "45deg" }] },
});
