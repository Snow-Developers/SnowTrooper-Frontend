import React from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, Dimensions } from "react-native";

export default function DriverMap({ latitude, longitude, speed }: {
  latitude: number;
  longitude: number;
  speed: number;
}) {
  return (
    <MapView
      style={styles.map}
      region={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker
        coordinate={{ latitude, longitude }}
        title="Driver"
        description={`Speed: ${(speed * 3.6).toFixed(1)} km/h`}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: Dimensions.get("window").height * 0.3,
    borderRadius: 10,
    marginTop: 10,
  },
});
