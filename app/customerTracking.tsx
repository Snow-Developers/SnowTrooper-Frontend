import { doc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import DriverMap from "../components/driverMap";
import { db } from "../services/firebaseConfig";

interface DriverLocation {
  latitude: number;
  longitude: number;
  speed: number;
  accuracy: number;
  heading: number;
  timestamp: any;
  isActive: boolean;
}

export default function CustomerTracking() {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);

  const driverId = "driver_123"; // static for now

  useEffect(() => {
    const locationRef = doc(db, "driverLocations", driverId);
    const unsubscribe = onSnapshot(
      locationRef,
      (docSnapshot) => {
        setIsLoading(false);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as DriverLocation;
          setDriverLocation(data);
          setLastUpdated(new Date().toLocaleTimeString());
          setError(null);
          setIsConnected(true);
          setUpdateCount((prev) => prev + 1);
        } else {
          setDriverLocation(null);
          setError("Driver location not available");
          setIsConnected(false);
        }
      },
      (err: any) => {
        setError(`Failed to get driver location: ${err?.message || err}`);
        setIsLoading(false);
        setIsConnected(false);
      }
    );
    return () => unsubscribe();
  }, [driverId]);

  const getDriverStatus = () => {
    if (!driverLocation)
      return { status: "Waiting for driver...", color: "#999", icon: "⏳" };

    if (!driverLocation.isActive) {
      return { status: "Driver Offline", color: "#ff4444", icon: "🔴" };
    }

    if (driverLocation.timestamp?.toDate) {
      const now = new Date();
      const locationTime = driverLocation.timestamp.toDate();
      const timeDiff = (now.getTime() - locationTime.getTime()) / 1000;
      if (timeDiff > 30) {
        return { status: "Connection Issues", color: "#ff8800", icon: "⚠️" };
      }
    }

    return { status: "Live Tracking Active", color: "#00cc44", icon: "🟢" };
  };

  // This can be used to calculate ETA later if we want to
  // const formatSpeed = (speed: number) => {
  //   if (!speed || speed === 0) return "0 km/h (Stationary)";
  //   const kmh = (speed * 3.6).toFixed(1);
  //   return `${kmh} km/h`;
  // };

  const formatCoordinate = (coord: number, type: "lat" | "lng") => {
    const direction =
      type === "lat" ? (coord >= 0 ? "N" : "S") : coord >= 0 ? "E" : "W";
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Connecting to driver...</Text>
        <Text style={styles.subText}>Driver ID: {driverId}</Text>
      </View>
    );
  }

  const driverStatus = getDriverStatus();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Driver Tracking</Text>
      <Text style={styles.subtitle}>Customer View</Text>

      <Card
        style={[
          styles.card,
          { backgroundColor: isConnected ? "#e8f5e8" : "#fff3e0" },
        ]}
      >
        <Card.Content>
          <View style={styles.statusRow}>
            <Text style={styles.statusIcon}>{driverStatus.icon}</Text>
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusText, { color: driverStatus.color }]}>
                {driverStatus.status}
              </Text>
              <Text style={styles.lastUpdated}>
                Last update: {lastUpdated} | Update Count: {updateCount}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Button
              mode="outlined"
              onPress={() => setIsLoading(true)}
              style={{ marginTop: 10 }}
            >
              Retry Connection
            </Button>
          </Card.Content>
        </Card>
      )}

      {driverLocation && (
        <>
          {/* Map */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>🗺️ Live Map View</Text>
              <DriverMap
                latitude={driverLocation.latitude}
                longitude={driverLocation.longitude}
                speed={driverLocation.speed}
              />
            </Card.Content>
          </Card>

          {/* Current Position */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>📍 Current Position</Text>
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

      {!driverLocation && !error && (
        <Card style={styles.waitingCard}>
          <Card.Content>
            <Text style={styles.waitingText}>
              📱 Waiting for driver to start tracking...
            </Text>
            <Text style={styles.waitingSubText}>Driver ID: {driverId}</Text>
          </Card.Content>
        </Card>
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
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  lastUpdated: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  errorCard: {
    marginBottom: 15,
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
    borderWidth: 1,
  },
  errorText: {
    color: "#d32f2f",
    textAlign: "center",
    fontSize: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
  coordValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
    fontFamily: "monospace",
  },
  waitingCard: {
    marginTop: 50,
    backgroundColor: "#fff3e0",
    borderColor: "#ff9800",
    borderWidth: 1,
  },
  waitingText: {
    textAlign: "center",
    fontSize: 18,
    color: "#f57f17",
    marginBottom: 10,
  },
  waitingSubText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#666",
  },
  subText: {
    marginTop: 5,
    fontSize: 14,
    color: "#999",
  },
});
