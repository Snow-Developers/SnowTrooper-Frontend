import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithPhoneNumber,
  signInWithPopup,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "react-native-paper";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callCode, setCallCode] = useState("");

  // Configure Google Sign-in only on native platforms
  useEffect(() => {
    if (Platform.OS !== "web") {
      GoogleSignin.configure({
        webClientId:
          "287786333926-ldodf9sgglpl496des2iftafgc4bivo8.apps.googleusercontent.com",
      });
    }
  }, []);

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
      try {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
        const signInResult = await GoogleSignin.signIn();

        const idToken = signInResult.data?.idToken;
        if (!idToken) throw new Error("No ID token found");

        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } catch (error) {
        console.error("Google login error:", error);
        alert(`Error during Google login: ${error}`);
      }
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

    const handleFacebookLogIn = async () => {
      if (Platform.OS === "web") {
        const auth = getAuth();
        const provider = new FacebookAuthProvider();
  
        // Add additional permissions
        provider.addScope("email");
        provider.addScope("public_profile");
  
        try {
          const result = await signInWithPopup(auth, provider);
          const credential = FacebookAuthProvider.credentialFromResult(result);
          const accessToken = credential?.accessToken;
  
          // The signed-in user info
          const user = result.user;
          console.log("User signed up successfully with Facebook:", user);
  
          // Facebook login info to use for later
          console.log("Facebook Sign Up Details:", {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoUrl: user.photoURL,
          });
        } catch (error: any) {
          console.error("Facebook Sign-in error:", error);
  
          // Handle specific error cases
          const errorCode = error.code;
          const errorMessage = error.message;
  
          if (errorCode === "auth/account-exists-with-different-credential") {
            alert(
              "An account with this email already exists with a different sign-in method."
            );
          } else if (errorCode === "auth/popup-closed-by-user") {
            alert("Sign-in was cancelled.");
          } else {
            alert(`Error during Facebook sign-in: ${errorMessage}`);
          }
        }
      } else {
        // Debug code for Android FB SDK
        try {
          console.log("Starting Facebook login on mobile...");
  
          // Import Facebook SDK only when needed on mobile
          const {
            LoginManager,
            AccessToken,
          } = require("react-native-fbsdk-next");
  
          // Check if I can access Facebook SDK
          if (!LoginManager || !AccessToken) {
            throw new Error("Facebook SDK not properly loaded");
          }
  
          console.log("Facebook SDK modules loaded successfully");
  
          // Login with Facebook SDK
          console.log("Attempting Facebook login...");
          const result = await LoginManager.logInWithPermissions([
            "public_profile",
            "email",
          ]);
  
          console.log("Facebook login result:", result);
  
          if (result.isCancelled) {
            console.log("Facebook login was cancelled");
            alert("Facebook login was cancelled");
            return;
          }
  
          if (result.error) {
            throw new Error(`Facebook login error: ${result.error}`);
          }
  
          console.log("Getting Facebook access token...");
          // Get the access token
          const data = await AccessToken.getCurrentAccessToken();
  
          if (!data || !data.accessToken) {
            throw new Error("No access token found after successful login");
          }
  
          console.log("Facebook access token obtained successfully");
  
          // Create a Firebase credential with the token
          console.log("Creating Firebase credential...");
          const facebookCredential = FacebookAuthProvider.credential(
            data.accessToken
          );
  
          // Sign-in the user with the credential
          console.log("Signing in with Firebase...");
          const auth = getAuth();
  
          // Add timeout to Firebase auth call
          const userCredential = await signInWithCredential(
            auth,
            facebookCredential
          );
          const user = userCredential.user;
          console.log(
            "User signed up successfully with Facebook (Mobile):",
            user
          );
  
          // Facebook login info to use for later
          console.log("Facebook Mobile Sign Up Details:", {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoUrl: user.photoURL,
          });
  
          alert("Successfully signed in with Facebook!");
  
          // Navigate to next screen or update UI
          // router.push("/dashboard");
        } catch (error: any) {
          console.error("Facebook Sign-in error (Mobile):", error);
  
          // More detailed error handling
          if (error.message?.includes("Cannot resolve module")) {
            alert(
              "Facebook SDK not properly configured for mobile. Please check your setup."
            );
          } else if (error.message?.includes("Network")) {
            alert(
              "Network error during Facebook sign-in. Please check your internet connection and try again."
            );
          } else if (error.message?.includes("timeout")) {
            alert(
              "Sign-in timed out. Please check your internet connection and try again."
            );
          } else if (error.message?.includes("SDK not properly loaded")) {
            alert(
              "Facebook SDK failed to load. Please restart the app and try again."
            );
          } else {
            alert(`Error during Facebook sign-in: ${error.message || error}`);
          }
        }
      }
    };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Log in</Text>

      <Button
        icon="facebook"
        mode="contained"
        onPress={handleFacebookLogIn}
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
        <Text onPress={() => router.push("/LogInViews/forgotPasswordPage")}>
          Forgot password
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
