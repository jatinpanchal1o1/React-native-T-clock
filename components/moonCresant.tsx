import React, { useEffect, useState } from "react";
import { View, Animated, Easing } from "react-native";
import Svg, { Circle, ClipPath, Rect } from "react-native-svg";
import { Moon } from "lunarphase-js";

export default function MoonPhase() {
  const [phase, setPhase] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const illumination = Moon.lunarAgePercent(); // % of visible moon
    setPhase(illumination);

    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.4,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  const radius = 60;
  const width = radius * 2;

  // Calculate moon shadow width
  const shadowWidth = width * (1 - phase);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Svg width={width} height={width}>
        {/* Moon background */}
        <Circle cx={radius} cy={radius} r={radius} fill="#fff" />

        {/* Shadow (moon phase) */}
        <ClipPath id="shadow">
          <Rect
            x={phase < 0.5 ? 0 : width - shadowWidth}
            y={0}
            width={shadowWidth}
            height={width}
          />
        </ClipPath>

        <Circle
          cx={radius}
          cy={radius}
          r={radius}
          fill="#000"
          clipPath="url(#shadow)"
        />
      </Svg>
    </Animated.View>
  );
}
