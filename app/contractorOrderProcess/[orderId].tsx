import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { db } from "../../services/firebaseConfig";

interface Order {
  customerFName: string;
  customerLName: string;
  customerPhoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function ContractorOrderProcess() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nativeWatcher, setNativeWatcher] = useState<any>(null);
  const [webWatchId, setWebWatchId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const user = getAuth().currentUser;
  const driverId = user?.uid || "driver_123";

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", orderId as string);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const data = orderSnap.data();
          setOrder({
            customerFName: data.customerFName,
            customerLName: data.customerLName,
            customerPhoneNumber: data.customerPhoneNumber,
            streetAddress: data.streetAddress,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
          });
          // Automatically start location tracking after order is loaded
          startTracking();
        } else {
          alert("Order not found.");
        }
      } catch (e) {
        console.error("Failed to fetch order:", e);
        alert("Error loading order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Cleanup function to stop tracking when component unmounts
    return () => stopTracking();
  }, [orderId]);

  const updateLocationInFirestore = async (
    locationData: Location.LocationObject
  ) => {
    try {
      const locationRef = doc(db, "driverLocations", driverId);
      await setDoc(locationRef, {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        speed: locationData.coords.speed || 0,
        accuracy: locationData.coords.accuracy,
        heading: locationData.coords.heading || 0,
        timestamp: serverTimestamp(),
        isActive: true,
      });
    } catch (error: any) {
      console.error("Error updating location in Firestore:", error);
      setErrorMsg(`Failed to update location: ${error?.message || error}`);
    }
  };

  const startTracking = async () => {
    // Prevent multiple tracking sessions
    if (isTracking) return;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    setIsTracking(true);
    setErrorMsg(null);

    if (Platform.OS === "web") {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: pos.coords.speed,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
          };
          const locationObj = { coords } as Location.LocationObject;
          setLocation(locationObj);
          setErrorMsg(null);
          updateLocationInFirestore(locationObj);
        },
        (err) => {
          setErrorMsg(`Location error: ${err.message}`);
          setIsTracking(false);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
      setWebWatchId(id);
    } else {
      try {
        const watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (newLocation) => {
            setLocation(newLocation);
            setErrorMsg(null);
            updateLocationInFirestore(newLocation);
          }
        );
        setNativeWatcher(watcher);
      } catch (error: any) {
        setErrorMsg(`Failed to start location tracking: ${error.message}`);
        setIsTracking(false);
      }
    }
  };

  const stopTracking = async () => {
    if (Platform.OS === "web") {
      if (webWatchId !== null) {
        navigator.geolocation.clearWatch(webWatchId);
        setWebWatchId(null);
      }
    } else {
      if (nativeWatcher && typeof nativeWatcher.remove === "function") {
        nativeWatcher.remove();
        setNativeWatcher(null);
      }
    }
    setIsTracking(false);

    try {
      const locationRef = doc(db, "driverLocations", driverId);
      await setDoc(
        locationRef,
        { isActive: false, timestamp: serverTimestamp() },
        { merge: true }
      );
    } catch (error: any) {
      console.error("Error updating driver status:", error);
    }
  };

  if (loading || !order) {
    return (
      <View style={styles.centered}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Customer Information</Text>
          <Text style={styles.info}>
            Name: {order.customerFName} {order.customerLName}
          </Text>
          <Text style={styles.info}>Phone: {order.customerPhoneNumber}</Text>
          <Text style={styles.info}>
            Address: {order.streetAddress}, {order.city}, {order.state}{" "}
            {order.zipCode}
          </Text>
        </Card.Content>
      </Card>

      {/* Location tracking status display */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <Text style={styles.statusTitle}>Location Sharing</Text>
          <Text
            style={[
              styles.statusText,
              isTracking ? styles.activeStatus : styles.inactiveStatus,
            ]}
          >
            {isTracking
              ? "🟢 Automatically sharing location with customer"
              : "🔴 Location sharing inactive"}
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={async () => {
          try {
            const orderRef = doc(db, "orders", orderId as string);
            await updateDoc(orderRef, { orderStatus: "ARRIVED" });
            alert("Marked as arrived!");
          } catch (e) {
            console.error("Failed to update order:", e);
            alert("Failed to mark arrival.");
          }
        }}
        style={{ marginTop: 20 }}
      >
        I'm here, submit before photo
      </Button>

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {location && (
        <View style={styles.locationBox}>
          <Text style={styles.locationTitle}>Current Location:</Text>
          <Text>Latitude: {location.coords.latitude.toFixed(6)}</Text>
          <Text>Longitude: {location.coords.longitude.toFixed(6)}</Text>
          <Text>Accuracy: {location.coords.accuracy} meters</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  statusCard: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  activeStatus: {
    color: "#4CAF50",
  },
  inactiveStatus: {
    color: "#f44336",
  },
  locationBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e8f5e8",
    borderRadius: 8,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorText: {
    marginTop: 20,
    color: "red",
    textAlign: "center",
    fontSize: 14,
  },
});
