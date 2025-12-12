import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  FlatList,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import Svg, { Rect } from "react-native-svg";
import MaskedView from "@react-native-masked-view/masked-view";
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  interpolate,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { Moon } from "lunarphase-js";

const { width } = Dimensions.get("window");
const MOON_SIZE = 150;
const STAR_COUNT = 60;

// default fallback API key (uses the key from your earlier code if you don't pass one)
const DEFAULT_WEATHERAPI_KEY = "5c728cfd1ea14fc6ad3162608251012";

interface Props {
  locationTimezone: string;
  locationCity?: string; // optional; preferred for WeatherAPI lookup
  weatherApiKey?: string;
}

const PHASES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
];

function getPhaseName(percent: number) {
  if (percent === 0 || percent === 1) return PHASES[0];
  if (percent <= 0.125) return PHASES[1];
  if (percent <= 0.25) return PHASES[2];
  if (percent <= 0.375) return PHASES[3];
  if (percent <= 0.625) return PHASES[4];
  if (percent <= 0.75) return PHASES[5];
  if (percent <= 0.875) return PHASES[6];
  return PHASES[7];
}

function getMaskPercent(phaseName: string) {
  switch (phaseName) {
    case "New Moon":
      return 0;
    case "Waxing Crescent":
      return 0.28;
    case "First Quarter":
      return 0.5;
    case "Waxing Gibbous":
      return 0.78;
    case "Full Moon":
      return 1;
    case "Waning Gibbous":
      return 0.78;
    case "Last Quarter":
      return 0.5;
    case "Waning Crescent":
      return 0.28;
    default:
      return 1;
  }
}

// small timezone -> city fallback to use for WeatherAPI when locationCity not provided
const tzToCityFallback: Record<string, string> = {
  "Asia/Kolkata": "Mumbai",
  "America/St_Johns": "St. John's",
  "Australia/Adelaide": "Adelaide",
  "Australia/Darwin": "Darwin",
  "Australia/Broken_Hill": "Broken Hill",
  "Australia/Eucla": "Eucla",
  "Indian/Cocos": "West Island",
  "Europe/London": "London",
  "America/New_York": "New York",
  "Asia/Tokyo": "Tokyo",
  "Asia/Dubai": "Dubai",
  "Australia/Sydney": "Sydney",
  "Europe/Paris": "Paris",
  "Europe/Athens": "Athens",
  "Africa/Cairo": "Cairo",
  "Europe/Moscow": "Moscow",
  "Asia/Riyadh": "Riyadh",
  "Asia/Colombo": "Colombo",
  "Asia/Kathmandu": "Kathmandu",
  "Australia/Melbourne": "Melbourne",
  "Asia/Shanghai": "Shanghai",
  "Asia/Hong_Kong": "Hong Kong",
  "Europe/Madrid": "Madrid",
  "America/Mexico_City": "Mexico City",
  "Asia/Tokyo": "Tokyo",
  "Australia/Perth": "Perth",
};

export default function MoonUniverse({
  locationTimezone,
  locationCity,
  weatherApiKey,
}: Props) {
  const [phaseName, setPhaseName] = useState("Full Moon");
  const [moonrise, setMoonrise] = useState<string | null>(null);
  const [moonset, setMoonset] = useState<string | null>(null);

  // animated shared values
  const maskValue = useSharedValue(1);
  const glowValue = useSharedValue(0.5);
  const rotateValue = useSharedValue(0);
  const starDrift = useSharedValue(0);

  // Initialize stars once (random positions & sizes)
  const stars = React.useMemo(() => {
    return Array.from({ length: STAR_COUNT }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (width * 0.6),
      size: Math.random() * 2 + 0.8,
      delay: Math.random() * 2000,
      flickerSpeed: 800 + Math.random() * 1600,
      opacity: 0.2 + Math.random() * 0.9,
    }));
  }, []);

  // update moon phase, start animations, and request moonrise/moonset
  useEffect(() => {
    // compute local date in the target timezone (YYYY-MM-DD) for WeatherAPI
    const localString = new Date().toLocaleString("en-US", {
      timeZone: locationTimezone,
    });
    const localDate = new Date(localString);

    // lunar percentage 0..1
    const percent = Moon.lunarAgePercent(localDate);
    const newPhase = getPhaseName(percent);
    setPhaseName(newPhase);

    // animate mask to new value
    maskValue.value = withTiming(getMaskPercent(newPhase), {
      duration: 900,
      easing: Easing.inOut(Easing.ease),
    });

    // glow animation (ping-pong)
    glowValue.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // slow continuous rotation
    rotateValue.value = withRepeat(
      withTiming(1, { duration: 50000, easing: Easing.linear }),
      -1
    );

    // slow starfield drift (back-and-forth)
    starDrift.value = withRepeat(
      withTiming(1, { duration: 22000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // fetch moonrise/moonset via WeatherAPI (astronomy endpoint)
    const key = weatherApiKey ?? DEFAULT_WEATHERAPI_KEY;
    // determine city to query
    const cityQuery = locationCity ?? tzToCityFallback[locationTimezone] ?? "";

    if (key && cityQuery) {
      const yyyy = localDate.getFullYear();
      const mm = String(localDate.getMonth() + 1).padStart(2, "0");
      const dd = String(localDate.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const url = `https://api.weatherapi.com/v1/astronomy.json?key=${encodeURIComponent(
        key
      )}&q=${encodeURIComponent(cityQuery)}&dt=${dateStr}`;

      (async () => {
        try {
          const res = await fetch(url);
          const data = await res.json();
          // WeatherAPI returns astro.moonrise and astro.moonset strings
          const astro = data?.astronomy?.astro;
          if (astro) {
            setMoonrise(astro.moonrise || null);
            setMoonset(astro.moonset || null);
          } else {
            setMoonrise(null);
            setMoonset(null);
          }
        } catch (e) {
          // don't crash — just clear values
          console.warn("Moon astronomy fetch failed:", e);
          setMoonrise(null);
          setMoonset(null);
        }
      })();
    } else {
      // no API key or no city — clear values
      setMoonrise(null);
      setMoonset(null);
    }

    // cleanup when timezone changes: cancel reanimated loops
    return () => {
      try {
        cancelAnimation(maskValue);
        cancelAnimation(glowValue);
        cancelAnimation(rotateValue);
        cancelAnimation(starDrift);
      } catch (e) {
        /* ignore */
      }
    };
  }, [locationTimezone, locationCity, weatherApiKey]);

  // animated styles
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + glowValue.value * 0.08 }],
    shadowRadius: Platform.OS === "ios" ? 12 + glowValue.value * 10 : 0,
    shadowOpacity: Platform.OS === "ios" ? 0.45 + glowValue.value * 0.25 : 0,
  }));

  const moonRotationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(rotateValue.value, [0, 1], [0, 360])}deg`,
      },
    ],
  }));

  const maskAnimStyle = useAnimatedStyle(() => ({
    width: MOON_SIZE * maskValue.value,
  }));

  const starDriftStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(starDrift.value, [0, 1], [-10, 10]),
      },
    ],
  }));

  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 18,
      }}
    >
      {/* Starfield (animated) */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height: width * 0.6,
        }}
      >
        {stars.map((s, i) => {
          // each star has its own flicker animation using a mapped delay
          const flicker = useSharedValue(s.opacity);
          // start flicker for each star
          useEffect(() => {
            flicker.value = withRepeat(
              withTiming(0.2 + Math.random() * 0.9, {
                duration: s.flickerSpeed,
                easing: Easing.inOut(Easing.ease),
              }),
              -1,
              true
            );
            return () => {
              try {
                cancelAnimation(flicker);
              } catch {}
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
          }, []);

          const starAnim = useAnimatedStyle(() => ({
            opacity: flicker.value,
            transform: [
              {
                translateY: interpolate(starDrift.value, [0, 1], [s.y - 4, s.y + 4]),
              },
              { translateX: s.x },
            ],
          }));

          return (
            <Animated.View
              key={`star-${i}`}
              style={[
                {
                  position: "absolute",
                  width: s.size,
                  height: s.size,
                  borderRadius: s.size / 2,
                  backgroundColor: "white",
                  opacity: s.opacity,
                },
                starAnim,
              ]}
            />
          );
        })}
      </View>

      {/* Today's Phase Label */}
      <Text style={{ fontSize: 18, color: "#fff", marginBottom: 12 }}>
        Today: {phaseName}
      </Text>

      {/* Moon with glow, rotation, mask */}
      <Animated.View
        style={[
          {
            width: MOON_SIZE,
            height: MOON_SIZE,
            borderRadius: MOON_SIZE / 2,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#00eaff",
          },
          glowStyle,
        ]}
      >
        <MaskedView
          style={{ width: MOON_SIZE, height: MOON_SIZE }}
          maskElement={
            <Animated.View
              style={[
                {
                  height: MOON_SIZE,
                  backgroundColor: "white",
                },
                maskAnimStyle,
              ]}
            />
          }
        >
          <Animated.Image
            source={require("../assets/images/moon.png")}
            style={[
              {
                width: MOON_SIZE,
                height: MOON_SIZE,
                borderRadius: MOON_SIZE / 2,
              },
              moonRotationStyle,
            ]}
            resizeMode="cover"
          />
        </MaskedView>
      </Animated.View>

      {/* Moonrise / Moonset row */}
      <View style={{ flexDirection: "row", marginTop: 12, alignItems: "center" }}>
        <View style={{ alignItems: "center", marginHorizontal: 12 }}>
          <Text style={{ color: "#fff", fontSize: 12 }}>Moonrise</Text>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
            {moonrise ?? "—"}
          </Text>
        </View>
        <View style={{ width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.12)" }} />
        <View style={{ alignItems: "center", marginHorizontal: 12 }}>
          <Text style={{ color: "#fff", fontSize: 12 }}>Moonset</Text>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
            {moonset ?? "—"}
          </Text>
        </View>
      </View>

      {/* 8-phase preview row */}
      <Text style={{ marginTop: 20, marginBottom: 10, color: "#fff", fontSize: 15 }}>
        Moon Cycle Preview
      </Text>

      <FlatList
        horizontal
        data={PHASES}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingVertical: 6, paddingHorizontal: 8 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const pct = getMaskPercent(item);
          const previewWidth = Math.max(4, Math.round(40 * pct));
          return (
            <View style={{ alignItems: "center", marginHorizontal: 6 }}>
              <MaskedView
                style={{ width: 44, height: 44 }}
                maskElement={
                  <Svg width={44} height={44}>
                    <Rect
                      x={item.includes("Waning") ? 44 - previewWidth : 0}
                      y={0}
                      width={previewWidth}
                      height={44}
                      fill="white"
                    />
                  </Svg>
                }
              >
                <Image
                  source={require("../assets/images/moon.png")}
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                />
              </MaskedView>
              <Text style={{ color: "#fff", fontSize: 10, marginTop: 6, width: 60, textAlign: "center" }}>
                {item}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}
