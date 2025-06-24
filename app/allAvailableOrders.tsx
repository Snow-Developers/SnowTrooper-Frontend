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
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { db } from "../services/firebaseConfig";

interface Order {
  id: string;
  city: string;
  cleaningSpecifics: string[];
  customerFName: string;
  customerLName: string;
  customerPhoneNumber: string;
  customerPropertySize: string;
}

export default function AvailableOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingOrderId, setClaimingOrderId] = useState<string | null>(null);
  const [isContractor, setIsContractor] = useState<boolean>(false);

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
        id: doc.id,
        city: doc.data().city,
        cleaningSpecifics: doc.data().cleaningSpecifics,
        customerFName: doc.data().customerFName,
        customerLName: doc.data().customerLName,
        customerPhoneNumber: doc.data().customerPhoneNumber,
        customerPropertySize: doc.data().customerPropertySize,
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

  return (
    <ScrollView style={styles.container}>
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
          <Card key={order.id} style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>📍 {order.city}</Text>

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
                onPress={() => handleClaim(order.id)}
                loading={claimingOrderId === order.id}
                disabled={claimingOrderId === order.id}
                style={styles.claimButton}
              >
                {claimingOrderId === order.id ? "Claiming..." : "Claim Order"}
              </Button>
            </Card.Content>
          </Card>
        ))
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
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
});
