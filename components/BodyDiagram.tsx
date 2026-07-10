import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Defs, RadialGradient, Stop } from "react-native-svg";
import { ORGANS, type OrganId } from "../utils/bodyMap";

const AC = Animated.createAnimatedComponent(Circle);

// Silueta umana stilizata (viewBox 100 x 220) cu organele care se aprind.
// `organs` = lista de organe afectate; `color` = culoarea riscului (glow).
export default function BodyDiagram({
  organs,
  color = "#EE8100",
  size = 210,
}: {
  organs: OrganId[];
  color?: string;
  size?: number;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.75] });
  const glowR = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  const active = new Set(organs);

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size * 2.2} viewBox="0 0 100 220">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Silueta corpului (front) */}
        <G fill="#c7d2cc" opacity={0.55}>
          {/* cap */}
          <Circle cx="50" cy="16" r="12" />
          {/* gat */}
          <Path d="M45 27 h10 v6 h-10 z" />
          {/* trunchi */}
          <Path d="M34 33 q16 -6 32 0 l3 60 q-19 8 -38 0 z" />
          {/* brate */}
          <Path d="M34 36 l-14 44 4 2 14 -42 z" />
          <Path d="M66 36 l14 44 -4 2 -14 -42 z" />
          {/* bazin */}
          <Path d="M31 92 q19 8 38 0 l-4 26 h-30 z" />
          {/* picioare */}
          <Path d="M37 118 l-3 90 7 0 4 -88 z" />
          <Path d="M63 118 l3 90 -7 0 -4 -88 z" />
        </G>

        {/* Aura pulsatoare + punct pe fiecare organ afectat */}
        {(Object.keys(ORGANS) as OrganId[]).map((id) => {
          if (!active.has(id)) return null;
          const o = ORGANS[id];
          const animR = Animated.multiply(glowR, o.r);
          return (
            <G key={id}>
              <AC
                cx={o.cx}
                cy={o.cy}
                r={animR as any}
                fill="url(#glow)"
                opacity={glowOpacity as any}
              />
              <Circle cx={o.cx} cy={o.cy} r={3.4} fill={color} />
              <Circle cx={o.cx} cy={o.cy} r={3.4} fill="none" stroke="#fff" strokeWidth={0.8} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
