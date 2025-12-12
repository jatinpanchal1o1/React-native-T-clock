import React, { useEffect, useState } from "react";
import { View, Image, Dimensions, Platform } from "react-native";
import Svg, { Circle } from "react-native-svg";
import MaskedView from "@react-native-masked-view/masked-view";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Moon } from "lunarphase-js";

const { width } = Dimensions.get("window");
const MOON_SIZE = 150;
interface LocationProps {
  locationTimezone: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function MoonUniverse({ locationTimezone }: LocationProps) {
  const [illumination, setIllumination] = useState(1);
  const [waxing, setWaxing] = useState(true);

  const glow = useSharedValue(0.5);
  const maskOffset = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const now = new Date().toLocaleString("en-US", {
      timeZone: locationTimezone,
    });
    const localDate = new Date(now);

    const lunarPercent = Moon.lunarAgePercent(localDate);
    const waxingPhase = lunarPercent <= 0.5;

    const illum = waxingPhase
      ? lunarPercent * 2
      : (1 - lunarPercent) * 2;

    setWaxing(waxingPhase);
    setIllumination(illum);

    // Glow animation
    glow.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );

    // Mask animation
    maskOffset.value = withTiming(illum, {
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
    });

    // Rotation animation
    rotation.value = withRepeat(
      withTiming(1, { duration: 60000, easing: Easing.linear }),
      -1
    );
  }, [locationTimezone]);

  // Glow style
  const glowStyle = useAnimatedStyle(() => {
    const scale = 1 + glow.value * 0.1;
    return {
      transform: [{ scale }],
      shadowRadius: Platform.OS === "ios" ? 40 + glow.value * 40 : 0,
      shadowOpacity: Platform.OS === "ios" ? 0.5 + glow.value * 0.3 : 0,
    };
  });

  // Mask slide movement
  const maskStyle = useAnimatedStyle(() => {
    const direction = waxing ? 1 : -1;
    const offset = (1 - maskOffset.value) * MOON_SIZE * direction;
    return {
      transform: [{ translateX: offset }],
    };
  });

  // Moon rotation + slight opacity change
  const moonStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(rotation.value, [0, 1], [0, 360])}deg`,
      },
    ],
    opacity: interpolate(maskOffset.value, [0, 1], [0.85, 1]),
  }));

  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 30,
      }}
    >
      {/* STARFIELD */}
      <Svg height={width * 0.8} width={width} style={{ position: "absolute" }}>
        {[...Array(80)].map((_, i) => (
          <Circle
            key={i}
            cx={Math.random() * width}
            cy={Math.random() * width * 0.8}
            r={Math.random() * 2}
            fill={`rgba(255,255,255,${Math.random()})`}
          />
        ))}
      </Svg>

      {/* MOON CONTAINER */}
      <Animated.View
        style={[
          {
            width: MOON_SIZE,
            height: MOON_SIZE,
            borderRadius: MOON_SIZE / 2,
            shadowColor: "#00f2ff",
            alignItems: "center",
            justifyContent: "center",
          },
          glowStyle,
        ]}
      >
        <MaskedView
          style={{ width: MOON_SIZE, height: MOON_SIZE }}
          maskElement={
            <AnimatedView
              style={[
                {
                  width: MOON_SIZE,
                  height: MOON_SIZE,
                  borderRadius: MOON_SIZE / 2,
                  backgroundColor: "white",
                },
                maskStyle,
              ]}
            />
          }
        >
          <AnimatedImage
            source={require("../assets/images/moon.png")} 
            style={[
              {
                width: MOON_SIZE,
                height: MOON_SIZE,
                borderRadius: MOON_SIZE / 2,
              },
              moonStyle,
            ]}
            resizeMode="cover"
          />
        </MaskedView>
      </Animated.View>
               {/* <View style={{ marginTop: 1 }}>
    <Image
      source={require("../assets/images/moon.png")}
      style={{ width: 200, height: 200, backgroundColor: "red" }}
    />
  </View> */}
    </View>
  );
}
