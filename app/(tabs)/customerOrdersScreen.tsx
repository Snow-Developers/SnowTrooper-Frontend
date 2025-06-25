import api, { getAPIToken } from "@/services/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card } from "react-native-paper";

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
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
};

export default function CustomerOrdersScreen() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(getAuth(), (user : any) => {
            if (user) {
                api.get(`/order/history/${user.uid}`, {
                    headers: {
                        Authorization: `Bearer ${getAPIToken()}`,
                        ...(Platform.OS !== 'web' && {
                            'Content-Type': 'application/json',
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
        return () => unsubscribe();
    }, []);

    const currentOrders = orders.filter(order => order.orderStatus === "IN-PROGRESS" || order.orderStatus === "WAITING");
    const orderHistory = orders.filter(order => order.orderStatus === "COMPLETED" || order.orderStatus === "CANCELLED");

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    

    return (
        <ScrollView style={styles.container}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
            <Text style={styles.sectionTitle}>Current Orders</Text>
            {currentOrders.length === 0 ? (
                <Text style={styles.emptyText}>No current orders.</Text>
            ) : (
                currentOrders.map(order => (
                    <OrderCard key={order.orderId} order={order} />
                ))
            )}

            <Text style={styles.sectionTitle}>Order History</Text>
            {orderHistory.length === 0 ? (
                <Text style={styles.emptyText}>No past orders.</Text>
            ) : (
                orderHistory.map(order => (
                    <OrderCard key={order.orderId} order={order} />
                ))
            )}
        </ScrollView>
    );
}


//Helper function for formatting timestamps
function formatTimestamp(ts: any) {
    if (!ts || typeof ts !== "object" || typeof ts.seconds !== "number") return null;
    const date = new Date(ts.seconds * 1000);
    return date.toLocaleString();
}

// OrderCard component to display individual order details
function OrderCard({ order }: { order: Order }) {
    const hasContractor = order.contractorFName && order.contractorLName && order.contractorPhoneNumber;

    const handleGetLocation = () => {
        // You can replace this with navigation or a modal, etc.
        alert(
            hasContractor
                ? `Get real-time location for contractor: ${order.contractorFName} ${order.contractorLName}`
                : "No contractor assigned yet."
        );
    };

    return (
        <Card style={styles.card}>
            <Card.Content>
                <Text style={styles.cardTitle}>Order #{order.orderId}</Text>
                <Text style={[styles.status, { color: getStatusColor(order.orderStatus) }]}>
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
                        <Text style={styles.value}>{formatTimestamp(order.orderPlacedTime)}</Text>
                    </View>
                )}
                {order.orderFulfilledTime && (
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Fulfilled:</Text>
                        <Text style={styles.value}>{formatTimestamp(order.orderFulfilledTime)}</Text>
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
                            {order.orderStatus === "IN-PROGRESS" && (<Button
                                mode="contained"
                                style={styles.locationButton}
                                labelStyle={styles.locationButtonText}
                                onPress={handleGetLocation}
                            >
                            Get Contractor Location
                            </Button>)}
                        </>
                        
                    ) : (
                        <Text style={styles.value}>No contractor has picked up the order yet.</Text>
                    )}
                </View>
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
    sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
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
});