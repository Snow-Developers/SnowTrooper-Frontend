import api, { getAPIToken } from "@/services/api";
import * as Location from "expo-location";
import { router } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card } from "react-native-paper";
const API_KEY = process.env.EXPO_PUBLIC_WEATHERAPI_KEY;

type Order = {
  orderId: string;
  orderStatus: string;
  orderPlacedTime: any;
  orderFulfilledTime: any;
  cleaningSpecifics: string[];
  prefTime: string[];
  contractorFName: string;
  contractorLName: string;
  contractorPhoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
};

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

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    setOrdersLoading(true);
    const unsubscribe = onAuthStateChanged(getAuth(), (user: any) => {
      if (user) {
        api
          .get(`/order/history/${user.uid}`, {
            headers: {
              Authorization: `Bearer ${getAPIToken()}`,
              ...(Platform.OS !== "web" && {
                "Content-Type": "application/json",
              }),
              "ngrok-skip-browser-warning": "11111",
            },
          })
          .then((result) => {
            setOrders(result.data || []);
          })
          .catch((error) => {
            console.error("Error fetching orders:", error);
            setOrders([]);
          })
          .finally(() => {
            setOrdersLoading(false);
          });
      } else {
        setOrders([]);
        setOrdersLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const currentOrders = orders.filter(
    (order) =>
      order.orderStatus === "IN-PROGRESS" || order.orderStatus === "WAITING"
  );

  const fetchWeather = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);

    let CITY_NAME;
    if (errorMsg !== "Permission to access location was denied") {
      if (location) {
        CITY_NAME = `${location?.coords.latitude}, ${location?.coords.longitude}`;
      } else {
        console.log("Error getting user location");
        return;
      }
    } else {
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
  const [userFirstName, setUserFirstName] = useState("");
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user: any) => {
      if (!user) return;
      api
        .get(`/users/${user.uid}`, {
          headers: {
            Authorization: `Bearer ${getAPIToken()}`,
            ...(Platform.OS !== "web" && {
              "Content-Type": "application/json",
            }),
            "ngrok-skip-browser-warning": "11111",
          },
        })
        .then((result) => {
          setUserFirstName(result.data.firstName || "User");
          console.log(result.data);
        })
        .catch((error) => {
          console.log("An error has occurred: ", error);
        });
    });
    return () => unsubscribe();
  }, []);

  const getGreeting = (date = new Date()) => {
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        {/* <ImageBackground source={require("../../assets/images/ST_White_Logo_Shield.png")} resizeMode="center" style={styles.image}>
        </ImageBackground> */}
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {getGreeting()}, {userFirstName}
          </Text>
        </View>

        {/* Weather Card */}
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator size="large" color="#4ac1d3" />
          ) : weatherData?.location?.name && weatherData ? (
            <>
              <Text style={styles.cardTitle}>
                Now in {weatherData.location.name}
              </Text>
              <Text style={styles.subText}>
                {weatherData.location.localtime}
              </Text>

              <View style={styles.weatherRow}>
                <Text style={styles.tempText}>
                  {weatherData.current.temp_f.toFixed(0)}°F
                </Text>
                <Image
                  source={{
                    uri: "https:" + weatherData.current.condition.icon,
                  }}
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

        {/* Current Orders Section */}

        <Pressable
          style={styles.createOrderButton}
          onPress={() => router.push("/customerOrderRequest")}
        >
          <Text style={styles.buttonText}>Create New Order</Text>
        </Pressable>
        <Text style={styles.sectionTitle}>Current Orders</Text>
        {ordersLoading ? (
          <ActivityIndicator size="large" color="#4ac1d3" />
        ) : currentOrders.length === 0 ? (
          <Text style={styles.emptyText}>No current orders.</Text>
        ) : (
          currentOrders.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function for formatting timestamps
function formatTimestamp(ts: any) {
  if (!ts || typeof ts !== "object" || typeof ts.seconds !== "number")
    return null;
  const date = new Date(ts.seconds * 1000);
  return date.toLocaleString();
}

function OrderCard({ order }: { order: Order }) {
  const hasContractor =
    order.contractorFName &&
    order.contractorLName &&
    order.contractorPhoneNumber;
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.cardTitle}>Order #{order.orderId}</Text>
        <Text
          style={[styles.status, { color: getStatusColor(order.orderStatus) }]}
        >
          Status: {order.orderStatus}
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>
            {order.streetAddress}, {order.city}, {order.state} {order.zipCode}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Cleaning:</Text>
          <Text style={styles.value}>
            {order.cleaningSpecifics?.join(", ") || "None"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Preferred Time:</Text>
          <Text style={styles.value}>
            {order.prefTime?.join(", ") || "Not specified"}
          </Text>
        </View>
        {order.orderPlacedTime && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Placed:</Text>
            <Text style={styles.value}>
              {formatTimestamp(order.orderPlacedTime)}
            </Text>
          </View>
        )}
        {order.orderFulfilledTime && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fulfilled:</Text>
            <Text style={styles.value}>
              {formatTimestamp(order.orderFulfilledTime)}
            </Text>
          </View>
        )}
        <View style={styles.contractorSection}>
          <Text style={styles.contractorHeader}>Contractor Info:</Text>
          {hasContractor ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>
                  {order.contractorFName} {order.contractorLName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{order.contractorPhoneNumber}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.value}>
              No contractor has picked up the order yet.
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

// Status color mapping
function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "#2ecc71"; // green
    case "IN-PROGRESS":
      return "#f39c12"; // orange
    case "WAITING":
      return "#7f8c8d"; // gray
    case "CANCELED":
      return "#e74c3c"; // red
    default:
      return "#555"; // fallback
  }
}

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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
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
  createOrderButton: {
    backgroundColor: "#4ac1d3",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: "center",
    marginTop: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 56,
    marginBottom: 8,
    color: "#333",
    alignSelf: "center",
  },
  emptyText: {
    color: "#888",
    marginBottom: 16,
    textAlign: "center",
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111",
    textAlign: "right",
    flex: 2,
    marginLeft: 10,
  },
  contractorSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  contractorHeader: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
});
