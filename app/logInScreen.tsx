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

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callCode, setCallCode] = useState("");

  const handleEmailLogin = () => {
    router.push("/LogInViews/emailPage");

  };

  const handleGoogleLogin = async () => {
    const auth = getAuth();

    if (Platform.OS === "web") {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = result.user;
          console.log("User logged in with Google:", user);
        })
        .catch((error) => {
          console.error("Google login error:", error);
        });
    } else {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const signInResult = await GoogleSignin.signIn();

      const idToken = signInResult.data?.idToken;
      if (!idToken) throw new Error("No ID token found");

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    }
  };

  const handlePhoneNumberLogin = async () => {
    if (Platform.OS !== "web") {
      return alert("Can't use phone number login on mobile.");
    }

    try {
      const auth = getAuth();

       if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "phoneLogin", {
        size: "invisible",
        callback: (response: any) => {
          console.log("reCAPTCHA solved");
        },
      });
    }

      const e164Format = `+${callCode}${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        e164Format,
        window.recaptchaVerifier
      );

      const code = window.prompt("Enter the verification code");
      if (!code) {
        alert("Missing code, try again.");
        return;
      }

      await confirmationResult.confirm(code);
      console.log("Phone number login successful");
    } catch (error) {
      console.error("Phone login error:", error);
      alert(`Phone login failed: ${error}`);
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Log in</Text>

      <Button
        icon="facebook"
        mode="contained"
        onPress={() => console.log("Facebook login")}
        style={styles.socialButton}
      >
        Log in with Facebook
      </Button>

      <Button
        icon="google"
        mode="contained"
        onPress={handleGoogleLogin}
        style={styles.socialButton}
      >
        Log in with Google
      </Button>

      <Button
        icon="email"
        mode="contained"
        onPress={handleEmailLogin}
        style={styles.socialButton}
      >
        Log in with Email
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

      {Platform.OS === "web" && <div id="phoneLogin"></div>}

      <Button
        icon="arrow-right"
        mode="contained"
        onPress={handlePhoneNumberLogin}
        style={styles.submitButton}
      >
        Log In
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
