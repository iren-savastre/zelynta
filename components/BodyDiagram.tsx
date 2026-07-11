import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import Svg, {
  Circle, G, Path, Defs, RadialGradient, LinearGradient, Stop,
  Ellipse, Line, Polyline,
} from "react-native-svg";
import { ORGANS, type OrganId } from "../utils/bodyMap";

const AC = Animated.createAnimatedComponent(Circle);

// --- ADN dublu-helix (precalculat) pe lateral, viewBox 100x220 ---
const DNA_CX = 88, DNA_TOP = 40, DNA_BOT = 198, DNA_AMP = 7, DNA_K = (2 * Math.PI) / 42;
const dnaA: string[] = [], dnaB: string[] = [], dnaRungs: { x1: number; x2: number; y: number; front: boolean }[] = [];
for (let y = DNA_TOP; y <= DNA_BOT; y += 4) {
  const p = DNA_K * (y - DNA_TOP);
  dnaA.push(`${(DNA_CX + DNA_AMP * Math.sin(p)).toFixed(1)},${y}`);
  dnaB.push(`${(DNA_CX - DNA_AMP * Math.sin(p)).toFixed(1)},${y}`);
}
for (let y = DNA_TOP; y <= DNA_BOT; y += 12) {
  const p = DNA_K * (y - DNA_TOP);
  dnaRungs.push({ x1: DNA_CX + DNA_AMP * Math.sin(p), x2: DNA_CX - DNA_AMP * Math.sin(p), y, front: Math.cos(p) > 0 });
}

// Corp uman holografic masculin (viewBox 100 x 220) cu organele care se aprind.
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
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.85] });
  const glowR = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  const active = new Set(organs);

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size * 2.2} viewBox="0 0 100 220">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#00b4e5" stopOpacity="0.42" />
            <Stop offset="100%" stopColor="#0088ff" stopOpacity="0.12" />
          </LinearGradient>
          <RadialGradient id="disc" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#00d0ff" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#00d0ff" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* disc de lumina sub picioare */}
        <Ellipse cx="50" cy="212" rx="34" ry="5" fill="url(#disc)" />

        {/* corp translucid MASCULIN (umeri lati, V-taper, solduri inguste) */}
        {/* stratul de "glow" difuz (stroke gros translucid dedesubt) */}
        <G fill="none" stroke="#00e5ff" strokeOpacity={0.22} strokeWidth={3.4} strokeLinejoin="round">
          <BodyPaths />
        </G>
        <G fill="url(#body)" stroke="#1f9fca" strokeWidth={1.2} strokeLinejoin="round">
          <BodyPaths />
        </G>

        {/* linii de scanare pe torso */}
        <G stroke="#4fb3d0" strokeWidth={0.4} opacity={0.45}>
          {[40, 52, 64, 76, 88, 100].map((y) => (
            <Line key={y} x1="30" y1={y} x2="70" y2={y} />
          ))}
        </G>

        {/* retea de energie centrala */}
        <G stroke="#37c8ff" strokeWidth={0.5} opacity={0.5} fill="none">
          <Path d="M50 30 L50 92 M50 52 L40 74 M50 52 L60 74 M50 74 L44 100 M50 74 L56 100" />
        </G>

        {/* ADN dublu-helix */}
        <G>
          <Polyline points={dnaA.join(" ")} fill="none" stroke="#1f9fca" strokeWidth={1} opacity={0.95} />
          <Polyline points={dnaB.join(" ")} fill="none" stroke="#3fa8c8" strokeWidth={1} opacity={0.7} />
          {dnaRungs.map((r, i) => (
            <G key={i}>
              <Line x1={r.x1} y1={r.y} x2={r.x2} y2={r.y} stroke={r.front ? "#2f9fc0" : "#2aa0d0"} strokeWidth={1} opacity={r.front ? 0.9 : 0.4} />
              <Circle cx={r.x1} cy={r.y} r={1.2} fill="#2f9fc0" />
              <Circle cx={r.x2} cy={r.y} r={1.2} fill="#2f9fc0" />
            </G>
          ))}
        </G>

        {/* Aura pulsatoare + punct pe fiecare organ afectat */}
        {(Object.keys(ORGANS) as OrganId[]).map((id) => {
          if (!active.has(id)) return null;
          const o = ORGANS[id];
          const animR = Animated.multiply(glowR, o.r);
          return (
            <G key={id}>
              <AC cx={o.cx} cy={o.cy} r={animR as any} fill="url(#glow)" opacity={glowOpacity as any} />
              <Circle cx={o.cx} cy={o.cy} r={2.6} fill={color} />
              <Circle cx={o.cx} cy={o.cy} r={2.6} fill="none" stroke="#fff" strokeWidth={0.7} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// Formele corpului masculin (refolosite pentru stratul de glow + cel principal)
function BodyPaths() {
  return (
    <>
      {/* cap */}
      <Ellipse cx="50" cy="15" rx="7" ry="8" />
      {/* gat */}
      <Path d="M46 22 h8 v6 h-8 z" />
      {/* umeri / trapez lat */}
      <Path d="M50 27 q-6 1 -10 3 q-11 4 -15 11 q7 -3 14 -3 h22 q7 0 14 3 q-4 -7 -15 -11 q-4 -2 -10 -3 z" />
      {/* tors piept in V (lat sus, ingust la talie) */}
      <Path d="M30 40 q20 -5 40 0 l-9 52 q-11 3 -22 0 z" />
      {/* brate */}
      <Path d="M31 42 l-9 46 q-1 5 3 6 q4 1 5 -4 l8 -46 z" />
      <Path d="M69 42 l9 46 q1 5 -3 6 q-4 1 -5 -4 l-8 -46 z" />
      {/* bazin ingust */}
      <Path d="M40 92 q10 4 20 0 l-2 16 q-8 3 -16 0 z" />
      {/* picioare drepte/musculoase */}
      <Path d="M42 108 h7 l-2 96 q-1 6 -4 6 q-3 0 -4 -6 l-2 -64 q-1 -18 5 -32 z" />
      <Path d="M58 108 h-7 l2 96 q1 6 4 6 q3 0 4 -6 l2 -64 q1 -18 -5 -32 z" />
    </>
  );
}
