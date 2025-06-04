import { router } from "expo-router";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { Button } from "react-native-paper";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      alert("Reset Link Sent");
      router.replace("/logInScreen");
    } catch (error: any) {
      console.error("Reset error", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <Button
        icon="send"
        mode="contained"
        onPress={handlePasswordReset}
        style={styles.submitButton}
      >
        Send Reset Link
      </Button>

      <View style={styles.footer}>
        <Text onPress={() => router.replace("/logInScreen")}>
          Back to Login
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButton: {
    width: "100%",
    borderRadius: 30,
    marginBottom: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: 30,
  },
});