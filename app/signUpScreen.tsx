import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithPhoneNumber,
  signInWithPopup,
} from "firebase/auth";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "react-native-paper";

GoogleSignin.configure({
  webClientId:
    "287786333926-ldodf9sgglpl496des2iftafgc4bivo8.apps.googleusercontent.com",
});

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function SignUpScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [callCode, setCallCode] = useState("");

  const handleEmailSignUp = () => {
    router.push("/SignUpViews/emailPage");
  };

  const handleGoogleSignUp = async () => {
    if (Platform.OS === "web") {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;
          // The signed-in user info.
          const user = result.user;
          console.log("User signed up successfully with Google:", user);
          //Google login info to use for later
          console.log("Google Sign Up Details:", {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoUrl: user.photoURL,
          });
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.customData.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
        });
    } else {
      console.log("Mobile Google Signin");
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();

      let idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error("No ID token found");
      }

      if (!signInResult.data) throw new Error("Missing data for signInResult");
      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(
        signInResult.data.idToken
      );
      console.log(googleCredential);

      // Sign-in the user with the credential
      return signInWithCredential(getAuth(), googleCredential);
    }
  };

  const handlePhoneNumberSignUp = async () => {
    if (Platform.OS !== "web") {
      return alert("Can't use phone number sign up on mobile.");
    }

    try {
      const auth = getAuth();

      // Create the RecaptchaVerifier instance
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "phoneSignUp", {
        size: "invisible",
        callback: (response: any) => {
          console.log("reCAPTCHA solved");
        },
      });

      // Start the phone number verification process
      const e164Format = `+${callCode}${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        e164Format,
        window.recaptchaVerifier
      );

      // Prompt for verification code
      const code = window.prompt("Enter the verification code");
      if (!code) {
        alert("Missing confirmation code, please try again...");
        return;
      }

      // Verify the code
      await confirmationResult.confirm(code);
      console.log("Phone number verified successfully");
    } catch (error) {
      console.error("Phone verification error:", error);
      alert(`Error during phone verification: ${error}`);
      // Reset the reCAPTCHA if there's an error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      <Button
        icon="facebook"
        mode="contained"
        onPress={() => console.log("Facebook")}
        style={styles.socialButton}
      >
        Sign up with Facebook
      </Button>

      <Button
        icon="google"
        mode="contained"
        onPress={handleGoogleSignUp}
        style={styles.socialButton}
      >
        Sign up with Google
      </Button>

      <Button
        icon="email"
        mode="contained"
        onPress={handleEmailSignUp}
        style={styles.socialButton}
      >
        Sign up with Email
      </Button>

      <Text style={styles.orText}>Or</Text>

      <View style={styles.phoneRow}>
        <TextInput
          placeholder="+1"
          value={callCode}
          onChangeText={setCallCode}
          style={styles.inputCode}
        />
        <TextInput
          placeholder="Mobile number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.inputPhone}
        />
      </View>

      {Platform.OS === "web" && <div id="phoneSignUp"></div>}

      <Button
        icon="arrow-right"
        mode="contained"
        onPress={handlePhoneNumberSignUp}
        style={styles.submitButton}
      >
        Sign Up
      </Button>

      <View style={styles.footer}>
        <Text>Forgot password</Text>
        <Text>Help Center</Text>
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
  socialButton: {
    width: "100%",
    marginVertical: 8,
    borderRadius: 30,
  },
  orText: {
    marginVertical: 16,
    fontWeight: "600",
  },
  phoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  inputCode: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginRight: 8,
    borderRadius: 8,
  },
  inputPhone: {
    flex: 3,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
  submitButton: {
    width: "100%",
    borderRadius: 30,
    marginTop: 16,
    marginBottom: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
});
