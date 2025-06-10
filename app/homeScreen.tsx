import api, { getAPIToken } from "@/services/api";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const API_KEY = process.env.EXPO_PUBLIC_WEATHERAPI_KEY;
const CITY_NAME = "Columbus";



export default function WeatherScreen() {
  type WeatherResponse = {
    location: {
      name: string;
      localtime: string;
    };
    current: {
      temp_f: number;
      humidity: number;
      wind_mph: number;
      condition: {
        text: string;
        icon: string;
      };
    };
  };

  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    console.log(API_KEY)
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${CITY_NAME}`
      );
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    const userUID = getAuth().currentUser?.uid || '';
    console.log(userUID);

  if(userUID){
      api.get(`/users/${userUID}`,
        {
          headers: {
            Authorization: `Bearer ${getAPIToken()}`,
            ...(Platform.OS !== 'web' && {
            'Content-Type': 'application/json',
            }),
          }
      }).then((result) => {setUserFirstName(result.data.firstName || 'User')
        console.log(result.data);
      })
      .catch((error) => {console.log("An error has occurred: ", error)});
  }
  }, []);

  
  const [userFirstName, setUserFirstName] = useState('');
  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Hey, {userFirstName}</Text>
      </View>

      {/* Weather Card */}
      <View style={styles.card}>
        {loading ? (
          <ActivityIndicator size="large" color="#4ac1d3" />
        ) : weatherData ? (
          <>
            <Text style={styles.cardTitle}>
              Now in {weatherData.location.name}
            </Text>
            <Text style={styles.subText}>{weatherData.location.localtime}</Text>

            <View style={styles.weatherRow}>
              <Text style={styles.tempText}>
                {weatherData.current.temp_f}°F
              </Text>
              <Image
                source={{ uri: "https:" + weatherData.current.condition.icon }}
                style={styles.icon}
              />
            </View>

            <Text style={styles.description}>
              {weatherData.current.condition.text}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>
                💧 {weatherData.current.humidity}%
              </Text>
              <Text style={styles.footerText}>
                🌬️ {weatherData.current.wind_mph} mph
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.footerText}>Failed to load weather data.</Text>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Icon name="home" size={28} color="#fff"  />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="car" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="user" size={28} color="#fff" onPress={() => {router.push("/profile")}}/>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  header: { backgroundColor: "#99e0ef", padding: 20 },
  headerText: { fontSize: 24, fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold" },
  subText: { color: "#777", marginBottom: 10 },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tempText: { fontSize: 48, fontWeight: "bold", marginRight: 10 },
  icon: { width: 64, height: 64 },
  description: { color: "#444", marginBottom: 15 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { color: "#555" },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#4ac1d3",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
});


