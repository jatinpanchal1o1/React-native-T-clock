import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from "react-native-picker-select";

interface WeatherData {
  temp_c: number;
  condition: {
    text: string;
    icon: string;
  };
}

export default function App() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState("London");

  const apiKey = "5c728cfd1ea14fc6ad3162608251012";

  const getWeather = async () => {
  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.current) {
      console.log("Weather API error:", data);
      return; // prevent crash
    }

    setWeather(data.current);

  } catch (err) {
    console.log("Fetch error:", err);
  }
};

  // // Update clock every second
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    getWeather();
    return () => clearInterval(t);
  }, []);

  // Fetch weather on location change
  // useEffect(() => {
  //   fetch(
  //     `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}`
  //   )
  //     .then((res) => res.json())
  //     .then((d) => setWeather(d.current))
  //     .catch(() => {});
  // }, [location]);

  useEffect(()=>{
    getWeather();
  },[location])


  // Binary digital sum
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

  const h = colorFromSum(digitalSum(time.getHours()));
  const m = colorFromSum(digitalSum(time.getMinutes()));
  const s = colorFromSum(digitalSum(time.getSeconds()));

  // Mix colors
  const mix = (a: number, b: number, c: number) => Math.floor((a + b + c) / 3);
  const finalColor = [
    mix(h[0], m[0], s[0]),
    mix(h[1], m[1], s[1]),
    mix(h[2], m[2], s[2]),
  ];

  const locations = [
    "London","New York","Mumbai","Tokyo","Dubai","Sydney","Paris","Greece","Egypt","Russia","Saudi Arabia","India","Sri Lanka","Nepal","Australia","Japan","China","Hong Kong","Vietnam","Somalia","Morocco","Switzerland","United Kingdom","Brazil","United States","Kingman Reef","Canada","Brazil","Greenland","New Zealand","Israel","Italy","Germany","Spain","Portugal","Bermuda","Cuba","Bahamas","Mexico"
  ].map((item) => ({ label: item, value: item }));

  return (
    <LinearGradient
      colors={[
        `rgb(${finalColor[0]},${finalColor[1]},${finalColor[2]})`,
        "#000000",
      ]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner}>

        {/* Time */}
        <Text style={styles.time}>{time.toLocaleTimeString()}</Text>

        {/* Date */}
        <Text style={styles.date}>{time.toDateString()}</Text>

        {/* Weather */}
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
      </ScrollView>
         {/* Location Selector */}
        <RNPickerSelect
          onValueChange={(value) => setLocation(value)}
          items={locations}
          value={location}
          style={pickerStyles}
          useNativeAndroidPickerStyle={false}
        />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    alignItems: "center",
    paddingTop: 100,
    paddingBottom: 100,
    borderRadius: 40,
  },
  time: {
    fontSize: 60,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 20,
    textShadowColor: "#fff",
    textShadowRadius: 10,
  },
  date: {
    color: "#fff",
    fontSize: 24,
    marginTop: 10,
  },
  weather: {
    marginTop: 30,
    alignItems: "center",
  },
  weatherText: {
    color: "#fff",
    fontSize: 22,
    marginTop: 10,
  },
});

const pickerStyles = {
   inputIOS: {
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 12,
    color: "white",
    backgroundColor: "rgba(0,0,0,0.3)",
    marginVertical: 10,
    textAlign: "center",
  },
  inputAndroid: {
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 42,
    color: "white",
    backgroundColor: "rgba(0,0,0,0.3)",
    marginVertical: 10,
    textAlign: "center",
  },
  placeholder: {
    color: "#ccc",
    textAlign: "center",
  },
};
