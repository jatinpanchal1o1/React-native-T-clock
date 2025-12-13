import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import RNPickerSelect from "react-native-picker-select";
import MoonUniverses from "../../components/moonUniverse";
import ZodiacPlanetaryClock from "../../components/zodic";

interface WeatherData {
  temp_c: number;
  condition: {
    text: string;
    icon: string;
  };
}

export default function App() {

  const [weather, setWeather] = useState<WeatherData | null>(null);

  const [locationTZ, setLocationTZ] = useState("Asia/Kolkata");
  const [locationCity, setLocationCity] = useState("Mumbai");

  const [timeString, setTimeString] = useState("");
  const [dateString, setDateString] = useState("");
  const [timeParts, setTimeParts] = useState({ h: 0, m: 0, s: 0 });

  const apiKey = "5c728cfd1ea14fc6ad3162608251012";

  // ---- TIME HELPERS ----
  const extractTimeParts = (timezone: string) => {
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).formatToParts(now);

    const p: any = {};
    parts.forEach((x) => {
      if (x.type !== "literal") p[x.type] = x.value;
    });

    return {
      h: parseInt(p.hour),
      m: parseInt(p.minute),
      s: parseInt(p.second),
    };
  };

  const updateTimeForTimezone = (timezone: string) => {
    const now = new Date();

    setTimeString(
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now)
    );

    setDateString(
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now)
    );

    setTimeParts(extractTimeParts(timezone));
  };

  useEffect(() => {
    updateTimeForTimezone(locationTZ);
    const timer = setInterval(() => updateTimeForTimezone(locationTZ), 1000);
    return () => clearInterval(timer);
  }, [locationTZ]);

  // ---- WEATHER ----
  const getWeather = async () => {
    try {
      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${locationCity}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.current) return;

      setWeather(data.current);
    } catch (err) {
      console.log("Weather error:", err);
    }
  };

  useEffect(() => {
    getWeather();
  }, [locationCity]);

  // ---- COLOR LOGIC ----
  const digitalSum = (num: number) =>
    num.toString(2).split("").filter((x) => x === "1").length;

  const colorFromSum = (sum: number) => {
    switch (sum) {
      case 1:
        return [0, 0, 255];
      case 2:
        return [255, 0, 0];
      case 3:
        return [0, 255, 0];
      default:
        return [255, 255, 255];
    }
  };

  const hColor = colorFromSum(digitalSum(timeParts.h));
  const mColor = colorFromSum(digitalSum(timeParts.m));
  const sColor = colorFromSum(digitalSum(timeParts.s));

  const mix = (a: number, b: number, c: number) => Math.floor((a + b + c) / 3);

  const finalColor = [
    mix(hColor[0], mColor[0], sColor[0]),
    mix(hColor[1], mColor[1], sColor[1]),
    mix(hColor[2], mColor[2], sColor[2]),
  ];

  // ---- LOCATIONS ----
  const locations = [
    { label: "New Delhi", tz: "Asia/Kolkata", city: "New Delhi" },
    { label: "London", tz: "Europe/London", city: "London" },
    { label: "New York", tz: "America/New_York", city: "New York" },
    { label: "Mumbai", tz: "Asia/Kolkata", city: "Mumbai" },
    { label: "Tokyo", tz: "Asia/Tokyo", city: "Tokyo" },
    { label: "Dubai", tz: "Asia/Dubai", city: "Dubai" },
    { label: "Sydney", tz: "Australia/Sydney", city: "Sydney" },
    { label: "Paris", tz: "Europe/Paris", city: "Paris" },
    { label: "Greece", tz: "Europe/Athens", city: "Athens" },
    { label: "Egypt", tz: "Africa/Cairo", city: "Cairo" },
    { label: "Russia", tz: "Europe/Moscow", city: "Moscow" },
    { label: "Saudi Arabia", tz: "Asia/Riyadh", city: "Riyadh" },
    { label: "Sri Lanka", tz: "Asia/Colombo", city: "Colombo" },
    { label: "Nepal", tz: "Asia/Kathmandu", city: "Kathmandu" },
    { label: "Australia", tz: "Australia/Melbourne", city: "Melbourne" },
    { label: "China", tz: "Asia/Shanghai", city: "Shanghai" },
    { label: "Hong Kong", tz: "Asia/Hong_Kong", city: "Hong Kong" },
    { label: "Spain", tz: "Europe/Madrid", city: "Madrid" },
    { label: "Mexico", tz: "America/Mexico_City", city: "Mexico City" },
     // ---- NEW LOCATIONS YOU REQUESTED ----
    { label: "Newfoundland & Labrador", tz: "America/St_Johns", city: "St. John's" },
    { label: "South Australia", tz: "Australia/Adelaide", city: "Adelaide" },
    { label: "Northern Territory", tz: "Australia/Darwin", city: "Darwin" },
    { label: "New South Wales (West)", tz: "Australia/Broken_Hill", city: "Broken Hill" },
    { label: "Western Australia (Southeast)", tz: "Australia/Eucla", city: "Eucla" },
    { label: "Cocos Islands", tz: "Indian/Cocos", city: "West Island" },
  ];

  return (
    <LinearGradient
      colors={[
        `rgb(${finalColor[0]},${finalColor[1]},${finalColor[2]})`,
        "#000",
      ]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.time}>{timeString}</Text>
        <Text style={styles.date}>{dateString}</Text>

        {weather && (
          <View style={styles.weather}>
            <Image
              source={{ uri: "https:" + weather.condition.icon }}
              style={{ width: 50, height: 50 }}
            />
            <Text style={styles.weatherText}>
              🌡 {weather.temp_c}°C — {weather.condition.text}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 60 }}>
          <MoonUniverses 
           locationTimezone={locationTZ}  
           locationCity={locationCity}                   // optional but recommended for accurate weatherapi lookups
           weatherApiKey= {apiKey}    // optional - will use default key if omitted// 
            />
        </View>
        <View style = {{ marginTop: 50 }}>
        <ZodiacPlanetaryClock locationTimezone={locationTZ} theme="white"/>
        </View>
      </ScrollView>
      <View style={{ marginVertical: 1 }}>
      <View style={shadowBox}>
      <RNPickerSelect
        onValueChange={(labelValue) => {
          const selected = locations.find((l) => l.label === labelValue);
          if (selected) {
            setLocationTZ(selected.tz);
            setLocationCity(selected.city);
          }
        }}
        items={locations.map((item) => ({
          label: item.label,
          value: item.label,
        }))}
        style={pickerStyles}
        useNativeAndroidPickerStyle={false}
      />
      </View>
      </View>
    </LinearGradient>
  );
}

const shadowBox: ViewStyle = {
  backgroundColor: "rgba(0,0,0,0.35)",
  borderRadius: 27,

  // 🌐 Web
  boxShadow: "0px 14px 36px rgba(0,0,0,0.45)",

  // 🍎 iOS
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.45,
  shadowRadius: 20,

  // 🤖 Android
  elevation: 16,
};

///---------------------/////

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  inner: {
    alignItems: "center",
    paddingTop: 100,
    paddingBottom: 100,
  },

  time: {
    fontSize: 60,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 20,

    textShadowColor: "rgba(255,255,255,0.85)",
    textShadowRadius: 16,
  },

  date: {
    color: "#fff",
    fontSize: 24,
    marginTop: 10,
    opacity: 0.9,
  },

  weather: {
    marginTop: 30,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    opacity: 0.9,

    ...shadowBox,
  },

  weatherText: {
    color: "#fff",
    fontSize: 22,
    marginTop: 10,
  },
});

// ---- STYLES ----
const pickerStyles = {
  inputIOS: {
    fontSize: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    color: "white",
    textAlign: "center" as const,
    backgroundColor: "transparent",
  },
  inputAndroid: {
    fontSize: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    color: "white",
    textAlign: "center" as const,
    backgroundColor: "transparent",
  },
};
