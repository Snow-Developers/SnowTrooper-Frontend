import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import auth from "../../services/firebaseConfig";

export default function EmailPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleEmailSignUp = async () => {
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      alert("Passwords do not match");
      return;
    }

    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user.uid; // Get the user ID
        console.log("User signed up successfully, userUID: ", user);
        console.log("Sign Up Details:", {
          firstName,
          lastName,
          email,
          phoneNumber,
          password,
          confirmPassword,
        });
        alert("Sign Up Successful");
      })
      .catch((error) => {
        console.error("Error signing up:", error);
        alert("Sign Up Failed: " + error.message);
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Enter Information
      </Text>

      <Text variant="labelLarge">First Name</Text>
      <TextInput
        label="First Name"
        value={firstName}
        onChangeText={(text) => setFirstName(text)}
        mode="outlined"
        style={styles.input}
      />

      <Text variant="labelLarge">Last Name</Text>
      <TextInput
        label="Last Name"
        value={lastName}
        onChangeText={(text) => setLastName(text)}
        mode="outlined"
        style={styles.input}
      />

      <Text variant="labelLarge">Email</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        mode="outlined"
        style={styles.input}
      />

      <Text variant="labelLarge">Phone Number</Text>
      <TextInput
        label="Phone Number"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(text)}
        mode="outlined"
        style={styles.input}
      />

      <Text variant="labelLarge">Password</Text>
      <TextInput
        label="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      <Text variant="labelLarge">Confirm Password</Text>
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleEmailSignUp}
        style={styles.button}
      >
        Sign Up
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 24,
    alignItems: "stretch",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: "white",
  },
  button: {
    width: "100%",
    marginTop: 20,
    borderRadius: 30,
  },
});
