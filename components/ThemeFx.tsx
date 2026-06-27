import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

/**
 * Emoji care plutesc pe fundal, specifice temei (ca animația de pe landing page).
 * Pur decorativ, sub conținut.
 */
export default function ThemeFx({ emoji }: { emoji: string }) {
  const { height } = Dimensions.get("window");
  const N = 10;
  const items = useRef(
    Array.from({ length: N }).map((_, i) => ({
      left: `${Math.round((i / N) * 96 + 2)}%`,
      size: 16 + (i % 4) * 9,
      delay: i * 650,
      dur: 9000 + (i % 5) * 1800,
      v: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    const loops = items.map((it) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(it.delay),
          Animated.timing(it.v, {
            toValue: 1,
            duration: it.dur,
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [items]);

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: "hidden", pointerEvents: "none" } as any]}>
      {items.map((it, i) => (
        <Animated.Text
          key={i}
          style={{
            position: "absolute",
            left: it.left as any,
            fontSize: it.size,
            opacity: it.v.interpolate({
              inputRange: [0, 0.12, 0.85, 1],
              outputRange: [0, 0.16, 0.16, 0],
            }),
            transform: [
              {
                translateY: it.v.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height + 40, -50],
                }),
              },
              {
                rotate: it.v.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "70deg"],
                }),
              },
            ],
          }}
        >
          {emoji}
        </Animated.Text>
      ))}
    </View>
  );
}
