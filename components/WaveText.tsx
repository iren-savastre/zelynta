import { useEffect, useRef } from "react";
import { Animated, type TextStyle, View } from "react-native";

/**
 * Text cu literele care fac „val" (ca numele Zelynta de pe landing page).
 * Doar design — animație decorativă.
 *
 * Fara `playKey`: valul ruleaza in bucla continua (ex. footer).
 * Cu `playKey`: valul ruleaza O SINGURA data la fiecare schimbare a lui —
 * asa poate fi pus in alternanta cu alta animatie (rosia care sare).
 */
export default function WaveText({
  text,
  style,
  playKey,
}: {
  text: string;
  style?: TextStyle | TextStyle[];
  playKey?: number;
}) {
  const letters = text.split("");
  const anims = useRef(letters.map(() => new Animated.Value(0))).current;

  // Mod continuu (comportamentul original), doar cand nu e controlat de parinte.
  useEffect(() => {
    if (playKey !== undefined) return;
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
  }, [anims, letters.length, playKey]);

  // Mod controlat: o singura trecere de val per schimbare de playKey.
  useEffect(() => {
    if (playKey === undefined || playKey === 0) return;
    const step = 90;
    const pass = Animated.parallel(
      anims.map((v, i) =>
        Animated.sequence([
          Animated.delay(i * step),
          Animated.timing(v, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      )
    );
    pass.start();
    return () => pass.stop();
  }, [playKey, anims]);

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
