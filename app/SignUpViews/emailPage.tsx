import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useSignUpContext } from "../../context/SignUpContext";
import auth from "../../services/firebaseConfig";

export default function EmailPage() {
  const { setSignUpData } = useSignUpContext();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userRole, setUserRole] = useState("Customer"); //Default set to customer

  const handleEmailSignUp = async () => {
    //Check if password and confirm password match
    if (password.length >= 6) {
      if (password !== confirmPassword) {
        console.error("Passwords do not match");
        Alert.alert("Passwords do not match");
        return;
      }
    } else {
      console.error("Password needs to be at least 6 characters long");
      Alert.alert("Password needs to be at least 6 characters long");
      return;
    }

    //Create user within Firebase Auth
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const userUID = userCredential.user.uid; // Get the user ID
        console.log("User signed up successfully, userUID: ", userUID);

        //Add info to global context
        setSignUpData({
          profilePicture: "",
          firstName,
          lastName,
          email,
          phoneNumber,
          userRole,
        });
        router.push("/SignUpViews/additionalInfo");
      })
      .catch((error) => {
        console.error("Error signing up:", error);
        Alert.alert("Sign Up Failed: " + error.message);
      });
  };

  return (
    <View style={styles.info}>
      <Text variant="headlineMedium" style={styles.title}>
        Enter Information
      </Text>

      <View style={styles.infoTextBox}>
        <TextInput
          mode="outlined"
          label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
        />

        <TextInput
          mode="outlined"
          label="Last Name"
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={(text) => setLastName(text)}
        />

        <TextInput
          mode="outlined"
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />

        <TextInput
          mode="outlined"
          label="Phone Number"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
        />

        <TextInput
          mode="outlined"
          label="Password"
          placeholder="Enter a password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
        />

        <TextInput
          mode="outlined"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          secureTextEntry
        />

        <Button
          mode="contained"
          onPress={handleEmailSignUp}
          style={styles.signupButton}
        >Sign Up</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: 10,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  infoTextBox: {
    paddingHorizontal: 10,
    flexDirection: "column",
    gap: 15,
  },
  roles: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "center",
    gap: 50,
    alignItems: "center",
  },
  roleButton: {
    marginVertical: 20,
    width: 150,
  },
  selectedButton: {
    backgroundColor: "#00bedc",
    color: "#ffffff",
  },
  buttonLabel: {
    color: "#00bedc",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedButtonLabel: {
    color: "#ffffff",
  },
  rolesText: {
    marginTop: 20,
    textAlign: "center",
  },
  signupButton: {
    paddingHorizontal: 10,
  },
});
