import api, { getAPIToken } from "@/services/api";
import * as Location from 'expo-location';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";

const API_KEY = process.env.EXPO_PUBLIC_WEATHERAPI_KEY;





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

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
  }, []);

  const fetchWeather = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);


    let CITY_NAME;
    if(errorMsg !== "Permission to access location was denied"){
      if(location){
        CITY_NAME = `${location?.coords.latitude}, ${location?.coords.longitude}`
      }else{
        console.log("Error getting user location");
        return;
      }
    }else{
      console.log(errorMsg);
    }
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

  //Get user first name from Firestore
  const [userFirstName, setUserFirstName] = useState('');
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user : any) => {
      if(!user) return;
          api.get(`/users/${user.uid}`,
            {
              headers: {
                Authorization: `Bearer ${getAPIToken()}`,
                ...(Platform.OS !== 'web' && {
                'Content-Type': 'application/json',
                }),
                "ngrok-skip-browser-warning": "11111",
              }
          }).then((result) => {
            setUserFirstName(result.data.firstName || 'User');
            console.log(result.data);
          })
          .catch((error) => {console.log("An error has occurred: ", error)});
      });
      return () => unsubscribe();
  }, []);

  const getGreeting = (date = new Date()) =>{
    const hour = date.getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }

  };


  return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        {/* <ImageBackground source={require("../../assets/images/ST_White_Logo_Shield.png")} resizeMode="center" style={styles.image}>
        </ImageBackground> */}
        <View style={styles.header}>
          <Text style={styles.headerText}>{getGreeting()}, {userFirstName}</Text>
        </View>

        {/* Weather Card */}
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator size="large" color="#4ac1d3" />
          ) : weatherData && weatherData.location ? (
            <>
              <Text style={styles.cardTitle}>
                Now in {weatherData.location.name}
              </Text>
              <Text style={styles.subText}>{weatherData.location.localtime}</Text>

              <View style={styles.weatherRow}>
                <Text style={styles.tempText}>
                  {weatherData.current.temp_f.toFixed(0)}°F
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
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f2f2f2",
  },
  header: { padding: 20 },
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
  // imageBackground: {
  //   justifyContent: "center",
  // },
  // image: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   opacity: 1,
  //   position: 'absolute',
  //   zIndex: 1
  // },
});


