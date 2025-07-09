import api, { getAPIToken } from "@/services/api";
import { router } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button, Card } from "react-native-paper";
import DriverMap from "../../components/driverMap";
import { db } from "../../services/firebaseConfig";

type Order = {
  orderId: string;
  orderStatus: string;
  orderPlacedTime: string | null;
  orderFulfilledTime: string | null;
  cleaningSpecifics: string[];
  prefTime: string[];
  contractorFName: string;
  contractorLName: string;
  contractorPhoneNumber: string;
  contractorUid: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  hasArrived: boolean;
};

interface DriverLocation {
  latitude: number;
  longitude: number;
  speed: number;
  accuracy: number;
  heading: number;
  timestamp: any;
  isActive: boolean;
}

export default function CustomerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(
    null
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [locationUnsubscribe, setLocationUnsubscribe] = useState<
    (() => void) | null
  >(null);

  useEffect(() => {
    setLoading(true);
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
            console.log("Fetched orders:", result.data);
            setOrders(result.data || []);
          })
          .catch((error) => {
            console.error("Error fetching orders:", error);
            setOrders([]);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setOrders([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();

      if (locationUnsubscribe) {
        locationUnsubscribe();
      }
    };
  }, []);

  const currentOrders = orders.filter(
    (order) =>
      order.orderStatus === "IN-PROGRESS" || order.orderStatus === "WAITING"
  );
  const orderHistory = orders.filter(
    (order) =>
      order.orderStatus === "COMPLETED" || order.orderStatus === "CANCELLED"
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text style={styles.sectionTitle}>Current Orders</Text>
      {currentOrders.length === 0 ? (
        <Text style={styles.emptyText}>No current orders.</Text>
      ) : (
        currentOrders.map((order) => (
          <OrderCard
            key={order.orderId}
            order={order}
            onTrackLocation={(orderId) => handleTrackLocation(orderId)}
            isTracking={trackingOrderId === order.orderId}
            driverLocation={
              trackingOrderId === order.orderId ? driverLocation : null
            }
            locationLoading={
              trackingOrderId === order.orderId ? locationLoading : false
            }
            locationError={
              trackingOrderId === order.orderId ? locationError : null
            }
            lastUpdated={trackingOrderId === order.orderId ? lastUpdated : ""}
            isConnected={
              trackingOrderId === order.orderId ? isConnected : false
            }
            updateCount={trackingOrderId === order.orderId ? updateCount : 0}
          />
        ))
      )}

      <Text style={styles.sectionTitle}>Order History</Text>
      {orderHistory.length === 0 ? (
        <Text style={styles.emptyText}>No past orders.</Text>
      ) : (
        orderHistory.map((order) => (
          <OrderCard
            key={order.orderId}
            order={order}
            onTrackLocation={() => {}}
            isTracking={false}
            driverLocation={null}
            locationLoading={false}
            locationError={null}
            lastUpdated=""
            isConnected={false}
            updateCount={0}
          />
        ))
      )}
    </ScrollView>
  );

  function handleTrackLocation(orderId: string) {
    if (trackingOrderId === orderId) {
      // Stop tracking + Clean up existing tracking
      setTrackingOrderId(null);
      setDriverLocation(null);
      setLocationError(null);
      setIsConnected(false);
      setUpdateCount(0);

      if (locationUnsubscribe) {
        locationUnsubscribe();
        setLocationUnsubscribe(null);
      }
      return;
    }

    // Find the contractor
    const order = orders.find((o) => o.orderId === orderId);
    if (!order || !order.contractorUid) {
      setLocationError("No contractor assigned to this order");
      return;
    }

    // Start
    setTrackingOrderId(orderId);
    setLocationLoading(true);
    setLocationError(null);
    setUpdateCount(0);

    // Clean up any existing tracking before a new one starts
    if (locationUnsubscribe) {
      locationUnsubscribe();
    }

    // Call to start real-time tracking
    startRealtimeTracking(order.contractorUid);
  }

  function startRealtimeTracking(contractorUid: string) {
    console.log(`Starting location tracking for contractor: ${contractorUid}`);

    const locationRef = doc(db, "driverLocations", contractorUid);
    const unsubscribe = onSnapshot(
      locationRef,
      (docSnapshot) => {
        setLocationLoading(false);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as DriverLocation;
          console.log("Received location update:", data);

          setDriverLocation(data);
          setLastUpdated(new Date().toLocaleTimeString());
          setLocationError(null);
          setIsConnected(true);
          setUpdateCount((prev) => prev + 1);
        } else {
          console.log("No location document found for contractor");
          setDriverLocation(null);
          setLocationError(
            "Contractor location not available - they may not be sharing location"
          );
          setIsConnected(false);
        }
      },
      (err: any) => {
        console.error("Location tracking error:", err);
        setLocationError(
          `Failed to get contractor location: ${err?.message || err}`
        );
        setLocationLoading(false);
        setIsConnected(false);
      }
    );

    // Store the unsubscribe function for clean up
    setLocationUnsubscribe(() => unsubscribe);
  }
}

// Format timestamp
function formatTimestamp(ts: any) {
  if (!ts || typeof ts !== "object" || typeof ts.seconds !== "number")
    return null;
  const date = new Date(ts.seconds * 1000);
  return date.toLocaleString();
}

// Get driver status in driverLocations - FIXED VERSION
function getDriverStatus(
  driverLocation: DriverLocation | null,
  updateCount: number
) {
  if (!driverLocation)
    return { status: "Waiting for contractor...", color: "#999", icon: "⏳" };

  if (!driverLocation.isActive) {
    return { status: "Contractor Offline", color: "#ff4444", icon: "🔴" };
  }

  // Check if we have a valid timestamp
  if (driverLocation.timestamp) {
    try {
      let locationTime: Date;

      // Handle Firestore timestamp format
      if (
        driverLocation.timestamp.toDate &&
        typeof driverLocation.timestamp.toDate === "function"
      ) {
        locationTime = driverLocation.timestamp.toDate();
      } else if (driverLocation.timestamp.seconds) {
        locationTime = new Date(driverLocation.timestamp.seconds * 1000);
      } else if (driverLocation.timestamp instanceof Date) {
        locationTime = driverLocation.timestamp;
      } else {
        // If timestamp format is unknown, consider it live if we're getting updates
        return updateCount > 0
          ? { status: "Live Tracking Active", color: "#00cc44", icon: "🟢" }
          : { status: "Connecting...", color: "#999", icon: "⏳" };
      }

      const now = new Date();
      const timeDiff = (now.getTime() - locationTime.getTime()) / 1000; // seconds

      console.log(
        `Time difference: ${timeDiff} seconds, Update count: ${updateCount}`
      );

      // If the timestamp is more than 60 seconds old, show connection issues
      // But also consider update count - if we're getting recent updates, it's probably fine
      if (timeDiff > 60 && updateCount < 1) {
        return { status: "Connection Issues", color: "#ff8800", icon: "⚠️" };
      }
    } catch (error) {
      console.error("Error parsing timestamp:", error);
      // If there's an error parsing timestamp but we're getting updates, assume it's working
      return updateCount > 0
        ? { status: "Live Tracking Active", color: "#00cc44", icon: "🟢" }
        : { status: "Connection Issues", color: "#ff8800", icon: "⚠️" };
    }
  }

  // Default to live tracking if isActive is true and we're getting updates
  return { status: "Live Tracking Active", color: "#00cc44", icon: "🟢" };
}

function formatCoordinate(coord: number, type: "lat" | "lng") {
  const direction =
    type === "lat" ? (coord >= 0 ? "N" : "S") : coord >= 0 ? "E" : "W";
  return `${Math.abs(coord).toFixed(6)}° ${direction}`;
}

// OrderCard component to display individual order details
function OrderCard({
  order,
  onTrackLocation,
  isTracking,
  driverLocation,
  locationLoading,
  locationError,
  lastUpdated,
  isConnected,
  updateCount,
}: {
  order: Order;
  onTrackLocation: (orderId: string) => void;
  isTracking: boolean;
  driverLocation: DriverLocation | null;
  locationLoading: boolean;
  locationError: string | null;
  lastUpdated: string;
  isConnected: boolean;
  updateCount: number;
}) {
  const hasContractor =
    order.contractorFName &&
    order.contractorLName &&
    order.contractorPhoneNumber &&
    order.contractorUid;

  const handleGetLocation = () => {
    if (!hasContractor) {
      alert("No contractor assigned yet.");
      return;
    }
    onTrackLocation(order.orderId);
  };

  // Pass updateCount to getDriverStatus
  const driverStatus = driverLocation
    ? getDriverStatus(driverLocation, updateCount)
    : null;

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
          <Text style={styles.value}>{order.cleaningSpecifics.join(", ")}</Text>
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
              {order.contractorUid && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Contractor ID:</Text>
                  <Text style={[styles.value, styles.contractorId]}>
                    {order.contractorUid.substring(0, 8)}...
                  </Text>
                </View>
              )}
              <Button
                mode="contained"
                disabled={!order.hasArrived}
                onPress={async () => {
                  try {
                    alert("Viewing Before Photo");
                    //console.log("Order ID:", order.orderId);
                    const id = order.orderId;
                    router.push({
                      pathname: '/customerBeforePhotoVerification',
                      params: { orderId: id },
                    });
                    } catch (e) {
                      console.error("Failed to update order:", e);
                      alert("Failed to mark arrival.");
                    }
                }}
                  style={{ marginTop: 20 }}
                    >
                      Contractor Arrived, View Before Photo
              </Button>
              {order.orderStatus === "IN-PROGRESS" && (
                <Button
                  mode="contained"
                  style={[
                    styles.locationButton,
                    isTracking && { backgroundColor: "#dc3545" },
                  ]}
                  labelStyle={styles.locationButtonText}
                  onPress={handleGetLocation}
                  loading={locationLoading}
                >
                  {isTracking ? "Stop Tracking" : "Track This Contractor"}
                </Button>
              )}
            </>
          ) : (
            <Text style={styles.value}>
              No contractor has picked up the order yet.
            </Text>
          )}
        </View>

        {/* Location Tracking */}
        {isTracking && (
          <View style={styles.trackingSection}>
            <Text style={styles.trackingHeader}>
              📍 Tracking: {order.contractorFName} {order.contractorLName}
            </Text>

            {/* Status */}
            <Card
              style={[
                styles.statusCard,
                { backgroundColor: isConnected ? "#e8f5e8" : "#fff3e0" },
              ]}
            >
              <Card.Content>
                <View style={styles.statusRow}>
                  <Text style={styles.statusIcon}>
                    {driverStatus?.icon || "⏳"}
                  </Text>
                  <View style={styles.statusTextContainer}>
                    <Text
                      style={[
                        styles.statusText,
                        { color: driverStatus?.color || "#999" },
                      ]}
                    >
                      {driverStatus?.status || "Connecting..."}
                    </Text>
                    <Text style={styles.lastUpdated}>
                      Last update: {lastUpdated} | Updates: {updateCount}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Error Display */}
            {locationError && (
              <Card style={styles.errorCard}>
                <Card.Content>
                  <Text style={styles.errorText}>⚠️ {locationError}</Text>
                  <Button
                    mode="outlined"
                    onPress={() => handleGetLocation()}
                    style={styles.retryButton}
                    labelStyle={styles.retryButtonText}
                    loading={locationLoading}
                  >
                    Retry Connection
                  </Button>
                </Card.Content>
              </Card>
            )}

            {/* Map and Location Details */}
            {driverLocation && (
              <>
                {/* Map */}
                <Card style={styles.mapCard}>
                  <Card.Content>
                    <Text style={styles.mapTitle}>🗺️ Live Map View</Text>
                    <DriverMap
                      latitude={driverLocation.latitude}
                      longitude={driverLocation.longitude}
                      speed={driverLocation.speed}
                    />
                  </Card.Content>
                </Card>

                {/* Location Details */}
                <Card style={styles.positionCard}>
                  <Card.Content>
                    <Text style={styles.positionTitle}>
                      📍 Current Position
                    </Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Latitude:</Text>
                      <Text style={styles.value}>
                        {formatCoordinate(driverLocation.latitude, "lat")}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Longitude:</Text>
                      <Text style={styles.value}>
                        {formatCoordinate(driverLocation.longitude, "lng")}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Speed:</Text>
                      <Text style={styles.value}>
                        {(driverLocation.speed * 2.237).toFixed(1)} mph
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Accuracy:</Text>
                      <Text style={styles.value}>
                        ±{driverLocation.accuracy.toFixed(0)}m
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Coordinates:</Text>
                      <Text style={styles.coordValue}>
                        {driverLocation.latitude.toFixed(6)},{" "}
                        {driverLocation.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </>
            )}

            {/* Loading State */}
            {locationLoading && (
              <Card style={styles.loadingCard}>
                <Card.Content>
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#2196F3" />
                    <Text style={styles.loadingText}>
                      Connecting to {order.contractorFName}...
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

//Status color mapping
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
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: { color: "#888", marginBottom: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    marginBottom: 15,
    elevation: 3,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  status: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
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
  coordValue: {
    fontSize: 12,
    color: "#111",
    fontWeight: "bold",
    flex: 2,
    textAlign: "right",
    marginLeft: 10,
    fontFamily: "monospace",
  },
  contractorId: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  text: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
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
  locationButton: {
    marginTop: 12,
    backgroundColor: "#00c1de",
    borderRadius: 6,
    paddingVertical: 6,
  },
  locationButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // For the tracking faeture
  trackingSection: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#00c1de",
  },
  trackingHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  statusCard: {
    marginBottom: 10,
    elevation: 2,
    borderRadius: 6,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lastUpdated: {
    color: "#666",
    fontSize: 11,
    marginTop: 2,
  },
  errorCard: {
    marginBottom: 10,
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
    borderWidth: 1,
    elevation: 2,
    borderRadius: 6,
  },
  errorText: {
    color: "#d32f2f",
    textAlign: "center",
    fontSize: 14,
  },
  mapCard: {
    marginBottom: 10,
    elevation: 2,
    borderRadius: 6,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  positionCard: {
    marginBottom: 10,
    elevation: 2,
    borderRadius: 6,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  loadingCard: {
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    elevation: 2,
    borderRadius: 6,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  retryButton: {
    marginTop: 10,
    borderColor: "#f44336",
  },
  retryButtonText: {
    color: "#f44336",
  },
});
