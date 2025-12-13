import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Line, G, Text as SvgText } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedText = Animated.createAnimatedComponent(SvgText);

const SIZE = 340;
const CENTER = SIZE / 2;
const R_OUTER = 155;
const R_MINUTE = 150;
const R_NUMBER = 125;
const R_ZODIAC = 110;
const R_PLANET = 90;

const ZODIAC = ["♈︎","♉︎","♊︎","♋︎","♌︎","♍︎","♎︎","♏︎","♐︎","♑︎","♒︎","♓︎"];
const PLANETS = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];

const THEMES: any = {
  dark: { ring: "#555", glow: "#fff", zodiac: "#8888ff" },
  gold: { ring: "#bfa14a", glow: "#ffd966", zodiac: "#ffdd88" },
  cosmic: { ring: "#6a5acd", glow: "#9f8cff", zodiac: "#b19cff" },
  white: { ring: "#ccc", glow: "#fff", zodiac: "#aaaaff", bg: "#111" },
};

const GlowCircle = ({ cx, cy, r, color, intensity = 1 }: any) => (
  <>
    <Circle cx={cx} cy={cy} r={r + 8 * intensity} fill={color} opacity={0.15} />
    <Circle cx={cx} cy={cy} r={r + 4 * intensity} fill={color} opacity={0.3} />
    <Circle cx={cx} cy={cy} r={r} fill={color} />
  </>
);

export default function ZodiacPlanetaryClock({ locationTimezone, theme = "cosmic" }: any) {
  const colors = THEMES[theme];

  const sec = useSharedValue(0);
  const min = useSharedValue(0);
  const hr = useSharedValue(0);

  const moon = useSharedValue(0);
  const venus = useSharedValue(0);
  const mars = useSharedValue(0);

  const activePlanet = useSharedValue(0);
  const activeSign = useSharedValue(0);
  const planetTextOpacity = useSharedValue(0);
  const signTextOpacity = useSharedValue(0);

  const getZonedTime = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: locationTimezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const t: any = {};
    parts.forEach(p => p.type !== "literal" && (t[p.type] = Number(p.value)));
    return t;
  };

  useEffect(() => {
    const tick = () => {
      const t = getZonedTime();
      sec.value = t.second * 6;
      min.value = t.minute * 6 + t.second * 0.1;
      hr.value = (t.hour % 12) * 30 + t.minute * 0.5;

      activePlanet.value = t.hour % 7;
      activeSign.value = t.hour % 12;

      planetTextOpacity.value = withTiming(1, { duration: 800 });
      signTextOpacity.value = withTiming(1, { duration: 800 });
    };

    tick();
    const timer = setInterval(tick, 1000);

    moon.value = withRepeat(withTiming(360, { duration: 27000, easing: Easing.linear }), -1);
    venus.value = withRepeat(withTiming(360, { duration: 60000, easing: Easing.linear }), -1);
    mars.value = withRepeat(withTiming(360, { duration: 90000, easing: Easing.linear }), -1);

    return () => clearInterval(timer);
  }, [locationTimezone]);

  const rotateCenter = (v: any) =>
    useAnimatedProps(() => ({
      transform: [
        { translateX: CENTER },
        { translateY: CENTER },
        { rotate: `${v.value}deg` },
        { translateX: -CENTER },
        { translateY: -CENTER },
      ],
    }));

  const polar = (deg: number, r: number) => {
    const a = (deg - 90) * (Math.PI / 180);
    return { x: CENTER + Math.cos(a) * r, y: CENTER + Math.sin(a) * r };
  };

  const outerTextRadius = R_OUTER + 8;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>

        <Circle cx={CENTER} cy={CENTER} r={R_OUTER} stroke={colors.ring} strokeWidth={3} fill="none" />

        {[...Array(60)].map((_, i) => {
          const o = polar(i * 6, R_MINUTE);
          const iR = polar(i * 6, i % 5 === 0 ? R_MINUTE - 14 : R_MINUTE - 7);
          return <Line key={i} x1={o.x} y1={o.y} x2={iR.x} y2={iR.y} stroke="#777" strokeWidth={i % 5 === 0 ? 2 : 1} />;
        })}

        {[...Array(12)].map((_, i) => {
          const { x, y } = polar((i + 1) * 30, R_NUMBER);
          return <SvgText key={i} x={x} y={y} fill="#fff" fontSize="20" fontWeight="600" textAnchor="middle" alignmentBaseline="middle">{i + 1}</SvgText>;
        })}

        <Circle cx={CENTER} cy={CENTER} r={R_ZODIAC} stroke={colors.zodiac} strokeWidth={3} opacity={0.2} />
        <Circle cx={CENTER} cy={CENTER} r={R_ZODIAC} stroke={colors.ring} strokeWidth={1} />

        {ZODIAC.map((z, i) => {
          const { x, y } = polar(i * 30 + 15, R_ZODIAC - 12);
          const isActive = i === activeSign.value;
          return <SvgText key={i} x={x} y={y} fill={isActive ? colors.glow : '#aaa'} fontSize={isActive ? 18 : 16} textAnchor="middle" alignmentBaseline="middle">{z}</SvgText>;
        })}

        <AnimatedG animatedProps={rotateCenter(moon)}>
          <GlowCircle cx={CENTER} cy={CENTER - R_PLANET} r={4} color={colors.glow} intensity={activePlanet.value === 3 ? 2 : 1} />
        </AnimatedG>
        <AnimatedG animatedProps={rotateCenter(venus)}>
          <GlowCircle cx={CENTER} cy={CENTER - (R_PLANET - 14)} r={5} color="#ffd966" intensity={activePlanet.value === 1 ? 2 : 1} />
        </AnimatedG>
        <AnimatedG animatedProps={rotateCenter(mars)}>
          <GlowCircle cx={CENTER} cy={CENTER - (R_PLANET - 28)} r={6} color="#ff6b6b" intensity={activePlanet.value === 6 ? 2 : 1} />
        </AnimatedG>

        <AnimatedG animatedProps={rotateCenter(hr)}>
          <Line x1={CENTER} y1={CENTER} x2={CENTER} y2={CENTER - 70} stroke="#fff" strokeWidth={6} />
        </AnimatedG>
        <AnimatedG animatedProps={rotateCenter(min)}>
          <Line x1={CENTER} y1={CENTER} x2={CENTER} y2={CENTER - 95} stroke="#ccc" strokeWidth={4} />
        </AnimatedG>
        <AnimatedG animatedProps={rotateCenter(sec)}>
          <Line x1={CENTER} y1={CENTER} x2={CENTER} y2={CENTER - 115} stroke="#ff5555" strokeWidth={2} />
        </AnimatedG>

        {/* Display planet and sign outside the clock circle */}

        <AnimatedText
          x={CENTER}
          y={CENTER - outerTextRadius} // above clock
          fill={colors.glow}
          fontSize={16}
          textAnchor="middle"
          alignmentBaseline="middle"
          animatedProps={useAnimatedProps(() => ({ opacity: planetTextOpacity.value }))}
        >
          {PLANETS[activePlanet.value]}
        </AnimatedText>

        <AnimatedText
          x={CENTER}
          y={CENTER + outerTextRadius + 2} // below clock
          fill={colors.glow}
          fontSize={16}
          textAnchor="middle"
          alignmentBaseline="middle"
          animatedProps={useAnimatedProps(() => ({ opacity: signTextOpacity.value }))}
        >
          {ZODIAC[activeSign.value]}
        </AnimatedText>

      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" }
});
