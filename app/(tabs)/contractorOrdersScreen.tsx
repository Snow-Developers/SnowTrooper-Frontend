import ViewControl from "@/components/ViewSwitch";
import api, { getAPIToken } from "@/services/api";
import { router } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { db } from "../../services/firebaseConfig";

interface Order {
  orderId: string;
  city: string;
  cleaningSpecifics: string[];
  customerFName: string;
  customerLName: string;
  customerPhoneNumber: string;
  customerPropertySize: string;
  orderStatus: string;
  orderPlacedTime: any;
  orderFulfilledTime: any;
  prefTime: string[];
  streetAddress: string;
  state: string;
  zipCode: string;
  customerUid?: string; // Add customerUid for price calculation
}

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
const API_KEY = process.env.EXPO_PUBLIC_WEATHERAPI_KEY;

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingOrderId, setClaimingOrderId] = useState<string | null>(null);
  const [isContractor, setIsContractor] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const currentOrders = orders.filter(
    (order) => order.orderStatus === "IN-PROGRESS"
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        alert("You must be logged in.");
        setIsContractor(false);
        setLoading(false);
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          alert("User profile not found.");
          setIsContractor(false);
        } else {
          const data = userSnap.data();
          if (data.role !== "Contractor") {
            alert("You are not authorized to view this page.");
            setIsContractor(false);
          } else {
            setIsContractor(true);
            fetchOrders();
          }
        }
      } catch (e) {
        console.error("Error checking user role:", e);
        setIsContractor(false);
      } finally {
        setLoading(false);
      }

      setOrdersLoading(true);
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

  const fetchOrders = async () => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("contractorUid", "==", null),
        where("orderStatus", "==", "WAITING")
      );
      const snapshot = await getDocs(q);

      const fetched: Order[] = snapshot.docs.map((doc) => ({
        orderId: doc.data().orderId,
        city: doc.data().city,
        cleaningSpecifics: doc.data().cleaningSpecifics,
        customerFName: doc.data().customerFName,
        customerLName: doc.data().customerLName,
        customerPhoneNumber: doc.data().customerPhoneNumber,
        customerPropertySize: doc.data().customerPropertySize,
        orderStatus: doc.data().orderStatus,
        orderPlacedTime: doc.data().orderPlacedTime,
        orderFulfilledTime: doc.data().orderFulfilledTime,
        prefTime: doc.data().prefTime,
        streetAddress: doc.data().streetAddress,
        state: doc.data().state,
        zipCode: doc.data().zipCode,
        customerUid: doc.data().customerUid,
      }));

      setOrders(fetched);
    } catch (e) {
      console.error("Error loading orders:", e);
    }
  };

  const handleClaim = async (orderId: string) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to claim an order.");
      return;
    }

    try {
      setClaimingOrderId(orderId);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        alert("Your profile was not found in the database.");
        return;
      }

      const contractorData = userSnap.data();
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        contractorUid: user.uid,
        contractorFName: contractorData.firstName,
        contractorLName: contractorData.lastName,
        contractorPhoneNumber: contractorData.phoneNumber,
        orderStatus: "IN-PROGRESS",
      });

      alert("Order claimed successfully!");
      console.log(
        "Navigating to contractorOrderProcess with orderId:",
        orderId
      );
      router.push(`/contractorOrderProcess/${orderId}`);
      fetchOrders(); // refresh list
    } catch (error) {
      console.error("Error claiming order:", error);
      alert("Failed to claim order.");
    } finally {
      setClaimingOrderId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Checking user role...</Text>
      </View>
    );
  }

  if (!isContractor) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>
          You are not authorized to view this page.
        </Text>
      </View>
    );
  }

  function formatTimestamp(ts: any) {
    if (!ts || typeof ts !== "object" || typeof ts.seconds !== "number")
      return null;
    const date = new Date(ts.seconds * 1000);
    return date.toLocaleString();
  }

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

  // Component for available orders 
  function AvailableOrderCard({ order }: { order: Order }) {
    const [earnings, setEarnings] = useState<number | null>(null);
    const [loadingEarnings, setLoadingEarnings] = useState(true);

    useEffect(() => {
      const calculateEarnings = async () => {
        if (!order.customerUid) {
          console.log("No customerUid available for order:", order.orderId);
          setLoadingEarnings(false);
          return;
        }

        try {
          console.log(
            `[DEBUG] Calculating earnings for order ${order.orderId} with customerUid: ${order.customerUid}`
          );

          const response = await api.get(
            `/order/calculate/${order.customerUid}`,
            {
              headers: {
                Authorization: `Bearer ${getAPIToken()}`,
                ...(Platform.OS !== "web" && {
                  "Content-Type": "application/json",
                }),
                "ngrok-skip-browser-warning": "11111",
              },
            }
          );

          console.log(
            `[DEBUG] Price calculation successful for order ${order.orderId}:`,
            response.data
          );

          // Contractor earnings 
          const totalPrice = response.data.Total; 
          const contractorEarnings = Math.round(totalPrice * 0.7); // 70%, in cents
          const earningsInDollars = contractorEarnings / 100; // in dollars

          console.log(
            `[DEBUG] Contractor earnings for order ${
              order.orderId
            }: $${earningsInDollars.toFixed(2)}`
          );
          setEarnings(earningsInDollars);
        } catch (error) {
          console.error(
            `[DEBUG] Error calculating earnings for order ${order.orderId}:`,
            error
          );
          setEarnings(null);
        } finally {
          setLoadingEarnings(false);
        }
      };

      calculateEarnings();
    }, [order.customerUid, order.orderId]);

    return (
      <Card key={order.orderId} style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📍 {order.city}</Text>
            <View style={styles.earningsContainer}>
              {loadingEarnings ? (
                <ActivityIndicator size="small" color="#2ecc71" />
              ) : earnings !== null ? (
                <Text style={styles.earningsText}>
                  Earn: ${earnings.toFixed(2)}
                </Text>
              ) : (
                <Text style={styles.earningsError}>Price N/A</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>
              {order.customerFName} {order.customerLName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{order.customerPhoneNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Property Size:</Text>
            <Text style={styles.value}>{order.customerPropertySize}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Services:</Text>
            <Text style={styles.value}>
              {order.cleaningSpecifics.join(", ")}
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={() => handleClaim(order.orderId)}
            loading={claimingOrderId === order.orderId}
            disabled={claimingOrderId === order.orderId}
            style={styles.claimButton}
          >
            {claimingOrderId === order.orderId ? "Claiming..." : "Claim Order"}
          </Button>
        </Card.Content>
      </Card>
    );
  }

  function OrderCard({ order }: { order: Order }) {
    const [weather, setWeather] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
      const fetchWeather = async () => {
        try {
          const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${order.zipCode}`
          );
          const data = await response.json();
          setWeather(data);
        } catch (error) {
          console.error("Error fetching weather for order:", error);
          setWeather(null);
        } finally {
          setLoading(false);
        }
      };
      fetchWeather();
    }, [order.zipCode]);

    return (
      <Card style={styles.orderCard}>
        <Card.Content>
          {/* Weather Corner */}
          <View style={styles.weatherCorner}>
            {loading ? (
              <ActivityIndicator size="small" color="#4ac1d3" />
            ) : weather?.current ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={{ uri: "https:" + weather.current.condition.icon }}
                  style={{ width: 28, height: 28, marginRight: 6 }}
                />
                <Text style={{ fontWeight: "bold", marginRight: 6 }}>
                  {weather.current.temp_f.toFixed(0)}°F
                </Text>
                <Text style={{ fontSize: 12, color: "#555" }}>
                  💧{weather.current.precip_in}&quot;
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: 12, color: "#888" }}>No weather</Text>
            )}
          </View>

          <Text style={styles.cardTitle}>Order #{order.orderId}</Text>
          <Text
            style={[
              styles.status,
              { color: getStatusColor(order.orderStatus) },
            ]}
          >
            Status: {order.orderStatus}
          </Text>
          <View style={styles.customerSection}>
            <Text style={styles.customerHeader}>Customer Info:</Text>
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>
                  {order.customerFName} {order.customerLName}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{order.customerPhoneNumber}</Text>
              </View>
            </>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>
              {order.streetAddress}, {order.city}, {order.state} {order.zipCode}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Cleaning:</Text>
            <Text style={styles.value}>
              {order.cleaningSpecifics.join(", ")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Preferred Time:</Text>
            <Text style={styles.value}>{order.prefTime.join(", ")}</Text>
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

          {order.orderStatus !== "CANCELLED" && (
            <Button
              mode="contained"
              style={styles.locationButton}
              labelStyle={styles.locationButtonText}
            >
              Go to Address
            </Button>
          )}

          {/*Change to use if customer is within range of location to display I'm here button*/}
          {order.orderStatus !== "CANCELLED" && (
            <Button
              mode="contained"
              style={styles.hereButton}
              labelStyle={styles.locationButtonText}
            >
              I&apos;m here
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <ViewControl
        values={["Available Orders", "Current Orders"]}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
        width={300}
        height={40}
        activeColor="#ffffff"
        inactiveColor="#d3d3d3"
        activeTextColor="#000"
        textColor="#333"
        borderRadius={20}
        containerStyle={{ alignSelf: "center", marginVertical: 20 }}
      />

      {/* Show available orders when selectedIndex is 0 */}
      {selectedIndex === 0 && (
        <>
          <Text style={styles.title}>Available Orders</Text>
          <Text style={styles.subtitle}>Tap to claim an open job</Text>

          {orders.length === 0 ? (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.statusText}>
                  🚫 No available orders at the moment.
                </Text>
              </Card.Content>
            </Card>
          ) : (
            orders.map((order) => (
              <AvailableOrderCard key={order.orderId} order={order} />
            ))
          )}
        </>
      )}

      {/* Show current orders if selectedIndex is 1 */}
      {selectedIndex === 1 && (
        <>
          <Text style={styles.title}>Current Orders</Text>
          <Text style={styles.subtitle}>
            Go to customer&apos;s address or say &quot;I&apos;m here&quot;
          </Text>
          {ordersLoading ? (
            <ActivityIndicator size="large" color="#4ac1d3" />
          ) : currentOrders.length === 0 ? (
            <Text style={styles.emptyText}>No current orders.</Text>
          ) : (
            currentOrders.map((order) => (
              <OrderCard key={order.orderId + "_current"} order={order} />
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
    margin: 30,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  card: {
    marginBottom: 15,
    elevation: 3,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  earningsContainer: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2ecc71",
  },
  earningsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  earningsError: {
    fontSize: 12,
    color: "#e74c3c",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#555",
  },
  value: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111",
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  claimButton: {
    marginTop: 15,
  },
  statusText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  locationButton: {
    marginTop: 12,
    backgroundColor: "#00c1de",
    borderRadius: 6,
    paddingVertical: 6,
  },
  hereButton: {
    marginTop: 12,
    backgroundColor: "#A7DA20",
    borderRadius: 6,
    paddingVertical: 6,
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  weatherCorner: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  customerSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  customerHeader: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    color: "#888",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 56,
    marginBottom: 8,
    color: "#333",
    alignSelf: "center",
  },
});
