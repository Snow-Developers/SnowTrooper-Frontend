import api, { getAPIToken } from "@/services/api";
import { router, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";


export default function customerBeforePhoto() {
  const [image, getImage] = useState<string | null>(null);
  const { orderId } = useLocalSearchParams();


  console.log("Order ID:", orderId);

useEffect(() => {
  const fetchImageUrl = async () => {
    try {
      console.log("orderId:", orderId);
      console.log("userId:", getAuth().currentUser?.uid);
      console.log("token:", getAPIToken());
      const userId = getAuth().currentUser?.uid;
      const response = await api.get(`/order/upload/before/${orderId}/${userId}`, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          //...(Platform.OS !== "web" && {
          //   "Content-Type": "multipart/form-data",
          //}),
          "ngrok-skip-browser-warning": "11111",
        },
      });
      console.log("Response data:", response.data);
      const directImageUrl = response.data;
      console.log("Image URL:", directImageUrl);
      getImage(directImageUrl);
    } catch (error) {
      console.error("Failed to get image URL:", error);
    }
  };

  fetchImageUrl();
}, [orderId]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Here is the Before Photo Sent By the Contractor
      </Text>

      <View style={styles.topSpacer} />

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      )}

      <View style={styles.bottomButtonContainer}>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/customerOrdersScreen')}
          contentStyle={styles.wideButtonContent}
          style={styles.uploadButton}
        >
          Back to Order
        </Button>
      </View>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  topSpacer: {
    height: 80,
  },
  uploadButton: {
    alignSelf: 'center',
    marginBottom: 20,
    width: '90%',
  },
  wideButtonContent: {
    height: 48,
  },
  image: {
    width: screenWidth - 40,
    height: screenWidth * 1.2,
    resizeMode: 'cover',
    borderRadius: 12,
    alignSelf: 'center',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});