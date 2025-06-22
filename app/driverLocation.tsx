import * as Location from "expo-location";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { db } from "../services/firebaseConfig";

export default function DriverLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nativeWatcher, setNativeWatcher] = useState<any>(null);
  const [webWatchId, setWebWatchId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const driverId = "driver_123"; // static for now

  // Test Firestore connection. (Saved in case later have to test again)
  // const testFirestore = async () => {
  //   try {
  //     console.log('Testing Firestore connection...');
  //     console.log('DB instance:', db);
  //     console.log('Firebase config loaded:', !!db);

  //     const testRef = doc(db, 'test', 'connection');
  //     await setDoc(testRef, {
  //       test: true,
  //       timestamp: serverTimestamp()
  //     });
  //     console.log('Firestore connection successful');
  //   } catch (error: any) {
  //     console.error('Firestore connection failed:', error);
  //     console.error('Error code:', error?.code);
  //     console.error('Error message:', error?.message);
  //   }
  // };

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
      console.log("Location updated in Firestore");
    } catch (error: any) {
      console.error("Error updating location in Firestore:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));
      setErrorMsg(
        `Failed to update location in database: ${error?.message || error}`
      );
    }
  };

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    setIsTracking(true);

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
          console.log(
            `Web location update: lat=${coords.latitude}, lng=${coords.longitude}`
          );
          const locationObj = { coords } as Location.LocationObject;
          setLocation(locationObj);
          setErrorMsg(null);

          // Update Firestore
          updateLocationInFirestore(locationObj);
        },
        (err) => {
          setErrorMsg(err.message);
          setIsTracking(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
      setWebWatchId(id);
    } else {
      const watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000, // Update every 1 second for now
          distanceInterval: 1, // Update every 1 meter for now
        },
        (newLocation) => {
          console.log(
            `Native location update: lat=${newLocation.coords.latitude.toFixed(
              6
            )}, lng=${newLocation.coords.longitude.toFixed(6)}`
          );
          setLocation(newLocation);
          setErrorMsg(null);

          // Update Firestore
          updateLocationInFirestore(newLocation);
        }
      );
      setNativeWatcher(watcher);
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

    // Mark driver as inactive in Firestore when stop
    try {
      const locationRef = doc(db, "driverLocations", driverId);
      await setDoc(
        locationRef,
        {
          isActive: false,
          timestamp: serverTimestamp(),
        },
        { merge: true }
      );
      console.log("Driver marked as inactive in Firestore");
    } catch (error: any) {
      console.error("Error updating driver status:", error);
    }
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Location Tracker</Text>
      <Text style={styles.subtitle}>Driver ID: {driverId}</Text>

      <Button
        mode="contained"
        onPress={startTracking}
        disabled={isTracking}
        style={styles.button}
      >
        {isTracking ? "Tracking Active..." : "Start Real-Time Tracking"}
      </Button>

      {/* Added this during development, saved in case i have to test again later */}
      {/* <Button 
        mode="outlined" 
        onPress={testFirestore}
        style={styles.button}
      >
        Test Firestore Connection
      </Button> */}

      {isTracking && (
        <Button mode="outlined" onPress={stopTracking} style={styles.button}>
          Stop Tracking
        </Button>
      )}

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      {location && (
        <View style={styles.locationBox}>
          <Text style={styles.locationTitle}>Current Location:</Text>
          <Text>Latitude: {location.coords.latitude.toFixed(6)}</Text>
          <Text>Longitude: {location.coords.longitude.toFixed(6)}</Text>
          <Text>Accuracy: {location.coords.accuracy} meters</Text>
          <Text style={styles.statusText}>
            Status: {isTracking ? "🟢 Broadcasting to customers" : "🔴 Offline"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  button: {
    marginTop: 10,
  },
  locationBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
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
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
