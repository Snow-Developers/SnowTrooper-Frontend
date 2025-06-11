import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
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
      router.replace("/homeScreen");
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

      {/* <Text variant="labelLarge">Email</Text> */}
      <TextInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      {/* <Text variant="labelLarge">Password</Text> */}
      <TextInput
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
    alignItems: "center",
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
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 4,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
});
