import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import api, { getAPIToken } from "../../services/api";
import auth from "../../services/firebaseConfig";

export default function EmailLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User logged in successfully:", {
        uid: user.uid,
        email: user.email,
      });
      alert("Login Successful");
      api.get(`/users/${user.uid}`, {
        headers: {
            Authorization: `Bearer ${getAPIToken()}`,
            ...(Platform.OS !== 'web' && {
                'Content-Type': 'application/json',
            }),
            "ngrok-skip-browser-warning": "11111",
        },
      })
      .then((response) => {
        const data = response.data;
        console.log("User role data:", data.role);
        if (data.role === "Customer") {
          router.replace("/customerHomeScreen");
        } else if (data.role === "Contractor") {
          router.replace("/homeScreen");
        } else {
          console.error("Unknown user role:", data.role);
          alert("Unknown user role.");
        }
      })
      .catch((error) => {
        console.error("Error fetching user role:", error.response?.data || error.message);
      });
    } catch (error: any) {
      console.error("Login failed:", error);
      alert("Login Failed: " + error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Log In
      </Text>

      <TextInput
        mode="outlined"
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        mode="outlined"
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleEmailLogin}
        style={styles.socialButton}
      >
        Log In
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  socialButton: {
    width: "100%",
    marginVertical: 8,
    borderRadius: 30,
  },
  input: {
    width: "100%",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
});
