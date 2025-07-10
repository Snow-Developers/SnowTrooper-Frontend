import api, { getAPIToken } from "@/services/api";
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  doc
} from "firebase/firestore";
import { useState } from "react";
import { Dimensions, Image, Platform, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function contractorBeforePhoto() {
  const [image, setImage] = useState<string | null>(null);
  const { orderId } = useLocalSearchParams();


  const pickImage = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!cameraPermission.granted || !mediaPermission.granted) {
      alert("Camera permissions are required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      const timestamp = result.assets[0].exif?.DateTimeOriginal || result.assets[0].exif?.DateTime;
      console.log("Image captured at:", timestamp);
    }
  };

  const handleSubmit = async () => {
    try {
      const userId = getAuth().currentUser?.uid
      
      if (!image) {
        alert("Please select an image before submitting.");
        return;
      }
      const uriParts = image.split('/');
      let fileName = uriParts[uriParts.length - 1];
      const formData = new FormData();
      formData.append('photo', {
        uri: image,
        name: fileName,
        type: doc.mimeType || "application/octet-stream",
      } as any);
      const response = await api.put(`/order/upload/after/${orderId}/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          ...(Platform.OS !== "web" && {
          "Content-Type": "multipart/form-data",
          }),
          "ngrok-skip-browser-warning": "11111",
          },
      });
      //const orderRef = doc(db, "orders", orderId as string);
      //await updateDoc(orderRef, { orderStatus: "COMPLETED" });

  
      const orderResponse = await api.get(`/order/${orderId}/${userId}`, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          "ngrok-skip-browser-warning": "11111",
        },
      });
      console.log("Order Response:", orderResponse.data);
      console.log("Payment Intent ID:", orderResponse.data.paymentIntentId);

      const paymentResponse = orderResponse.data.paymentIntentId;

    
      const paymentId = {
        paymentIntentId: paymentResponse,
      }
      console.log("Payment Intent ID:", paymentId);
      
      try {
        const paymentIntentResponse = await api.put(
          `/order/update/${orderId}/completed`,
          { paymentIntentId: paymentResponse },
          {
            headers: {
              Authorization: `Bearer ${getAPIToken()}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "11111",
            },
          }
        );
        console.log("Payment Intent Update Response:", paymentIntentResponse.data);
      } catch (error) {
        console.error("Update failed:", error.response?.status, error.response?.data);
      }
      
      alert("Service has been completed!");
      router.push('/contractorOrderProcess/contractorCompleteService');
    } catch (e) {
      console.error("Failed to complete service:", e);
      //alert("Failed to submit photo.");
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Service Verification
      </Text>

      <View style={styles.topSpacer} />

      <Button
        mode="contained"
        onPress={pickImage}
        style={styles.uploadButton}
        contentStyle={styles.wideButtonContent}
      >
        Take After Photo
      </Button>

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      )}

      <View style={styles.bottomButtonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          contentStyle={styles.wideButtonContent}
          style={styles.uploadButton}
        >
          Complete Service
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