import { useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { db } from "../services/firebaseConfig";

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
  }, [orderId]);

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
      >
        I'm Here
      </Button>
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
});
