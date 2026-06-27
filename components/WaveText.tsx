import { useEffect, useRef } from "react";
import { Animated, type TextStyle, View } from "react-native";

/**
 * Text cu literele care fac „val" (ca numele Zelynta de pe landing page).
 * Doar design — animație decorativă.
 */
export default function WaveText({
  text,
  style,
}: {
  text: string;
  style?: TextStyle | TextStyle[];
}) {
  const letters = text.split("");
  const anims = useRef(letters.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const step = 110;
    const loops = anims.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * step),
          Animated.timing(v, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay((letters.length - i) * step),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [anims, letters.length]);

  return (
    <View style={{ flexDirection: "row" }}>
      {letters.map((ch, i) => (
        <Animated.Text
          key={i}
          style={[
            style as any,
            {
              transform: [
                {
                  translateY: anims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5],
                  }),
                },
              ],
            },
          ]}
        >
          {ch}
        </Animated.Text>
      ))}
    </View>
  );
}
