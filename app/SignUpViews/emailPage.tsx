import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { View } from "react-native";
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
    <View>
      <Text variant="headlineMedium">Enter Information</Text>

      <Text variant="labelLarge">First Name</Text>
      <TextInput
        label="First Name"
        value={firstName}
        onChangeText={(text) => setFirstName(text)}
        style={{ backgroundColor: "white" }}
        mode="outlined" 
      />

      <Text variant="labelLarge">Last Name</Text>
      <TextInput
        label="Last Name"
        placeholder="Enter your last name"
        value={lastName}
        onChangeText={(text) => setLastName(text)}
        style={{ backgroundColor: "white" }}
        mode="outlined" 
      />

      <Text variant="labelLarge">Email</Text>
      <TextInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={{ backgroundColor: "white" }}
        mode="outlined" 
      />

      <Text variant="labelLarge">Phone Number</Text>
      <TextInput
        label="Phone Number"
        placeholder="Enter your phone number"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(text)}
        style={{ backgroundColor: "white" }}
        mode="outlined" 
      />

      <Text variant="labelLarge">Password</Text>
      <TextInput
        label="Password"
        placeholder="Enter a password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        style={{ backgroundColor: "white" }}
        mode="outlined" 
        secureTextEntry
      />

      <Text variant="labelLarge">Confirm Password</Text>
      <TextInput
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        style={{ backgroundColor: "white" }}
        mode="outlined" 
        secureTextEntry
      />

      <Button
        mode="contained"
        onPress={handleEmailSignUp}
        style={{ marginTop: 20 }}
      >
        {" "}
        Sign Up{" "}
      </Button>
    </View>
  );
}
