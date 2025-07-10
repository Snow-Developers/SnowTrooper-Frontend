import api, { getAPIToken } from "@/services/api";
import { router, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";


export default function customerBeforePhoto() {
  const [beforeImage, getBeforeImage] = useState<string | null>(null);
  const [afterImage, getAfterImage] = useState<string | null>(null);
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
          "ngrok-skip-browser-warning": "11111",
        },
      });
      console.log("Before Response data:", response.data);
      const directImageUrl = response.data;
      console.log("Before Image URL:", directImageUrl);
      getBeforeImage(directImageUrl);

      const afterResponse = await api.get(`/order/upload/after/${orderId}/${userId}`, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          "ngrok-skip-browser-warning": "11111",
        },
      });
      console.log("After Response data:", afterResponse.data);
      const afterImageUrl = afterResponse.data;
      console.log("After Image URL:", afterImageUrl);
      getAfterImage(afterImageUrl);


    } catch (error) {
      console.error("Failed to get After image URL:", error);
    }
  };

  fetchImageUrl();
}, [orderId]);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Service is Complete! Here is the Before and After Photo Sent By the Contractor
      </Text>

      <View style={styles.topSpacer} />

      {beforeImage && (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                Before Photo:
            </Text>
            <Image
                source={{ uri: beforeImage }}
                style={styles.image}
            />
        </View>
      )}

      {afterImage && (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                After Photo:
            </Text>
            <Image
                source={{ uri: afterImage }}
                style={styles.image}
            />
        </View>
      )}

      <View style={styles.bottomButtonContainer}>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/customerOrdersScreen')}
          contentStyle={styles.wideButtonContent}
          style={styles.uploadButton}
        >
          Back to Order Screen
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
    height: 10,
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
    width: screenWidth - 20,
    height: screenWidth - 160,
    resizeMode: 'contain',
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