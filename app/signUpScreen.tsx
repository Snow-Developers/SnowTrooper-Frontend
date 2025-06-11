import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import {
  FacebookAuthProvider,
  getAdditionalUserInfo,
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithPopup
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text
} from "react-native";
import { Button } from "react-native-paper";
import { useSignUpContext } from '../context/SignUpContext';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function SignUpScreen() {
  const { setSignUpData } = useSignUpContext();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState('Customer');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [callCode, setCallCode] = useState("");

  useEffect(() => {
      if (Platform.OS !== "web") {
        // Google Sign-in
        GoogleSignin.configure({
          webClientId:
            "287786333926-ldodf9sgglpl496des2iftafgc4bivo8.apps.googleusercontent.com",
        });

        // Debug Facebook SDK
        try {
          const {
            LoginManager,
            AccessToken,
            GraphRequest,
            GraphRequestManager
          } = require("react-native-fbsdk-next");
          console.log(
            "Facebook SDK loaded successfully:",
            !!LoginManager && !!AccessToken && !!GraphRequest && !!GraphRequestManager
          );
          console.log("LoginManager available:", !!LoginManager);
          console.log("AccessToken available:", !!AccessToken);
          console.log("GraphRequest available:", !!GraphRequest);
          console.log("GraphRequestManager available:", !!GraphRequestManager);
        } catch (error) {
          console.log("Facebook SDK load error:", error);
        }
      }
    }, []);
  

  const handleEmailSignUp = () => {
    router.push("/SignUpViews/emailPage");
  };

  const handleGoogleSignUp = async () => {
    if (Platform.OS === "web") {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
        .then((result : any) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken;
          // The signed-in user info.
          const user = result.user;
          console.log("User signed up successfully with Google:", user);
          //Google login info to use for later
          console.log("Google Sign Up Details:", {
            uid: user.uid,
            displayName: user.displayName,
            lastName: user.familyName,
            email: user.email,
            photoUrl: user.photoURL,
          });

          const additionalInfo = getAdditionalUserInfo(result);
          const profile = additionalInfo?.profile as any;
          const firstName = profile?.given_name;
          const lastName = profile?.family_name;
          const email = profile?.email;

          setSignUpData({
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    userRole,
                });

          router.push("/SignUpViews/additionalInfo");
        }).catch((error : any) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.customData.email;
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
        });
    } else {
      try {
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

        if (!signInResult.data)
          throw new Error("Missing data for signInResult");
        // Create a Google credential with the token
        const googleCredential = GoogleAuthProvider.credential(
          signInResult.data.idToken
        );
        console.log(googleCredential);

        // Sign-in the user with the credential
        return signInWithCredential(getAuth(), googleCredential);
      } catch (error) {
        console.error("Google Sign-in error:", error);
        alert(`Error during Google sign-in: ${error}`);
      }
    }
  };

  // const handlePhoneNumberSignUp = async () => {
  //   if (Platform.OS !== "web") {
  //     return alert("Can't use phone number sign up on mobile.");
  //   }

  //   try {
  //     const auth = getAuth();

  //     // Create the RecaptchaVerifier instance
  //     window.recaptchaVerifier = new RecaptchaVerifier(auth, "phoneSignUp", {
  //       size: "invisible",
  //       callback: (response: any) => {
  //         console.log("reCAPTCHA solved");
  //       },
  //     });

  //     // Start the phone number verification process
  //     const e164Format = `+${callCode}${phoneNumber}`;
  //     const confirmationResult = await signInWithPhoneNumber(
  //       auth,
  //       e164Format,
  //       window.recaptchaVerifier
  //     );

  //     // Prompt for verification code
  //     const code = window.prompt("Enter the verification code");
  //     if (!code) {
  //       alert("Missing confirmation code, please try again...");
  //       return;
  //     }

  //     // Verify the code
  //     await confirmationResult.confirm(code);
  //     console.log("Phone number verified successfully");
  //   } catch (error) {
  //     console.error("Phone verification error:", error);
  //     alert(`Error during phone verification: ${error}`);
  //     // Reset the reCAPTCHA if there's an error
  //     if (window.recaptchaVerifier) {
  //       window.recaptchaVerifier.clear();
  //     }
  //   }
  // };

  const handleFacebookSignUp = async () => {
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
          GraphRequest,
          GraphRequestManager,
        } = require("react-native-fbsdk-next");

        // Check if I can access Facebook SDK
        if (!LoginManager || !AccessToken || !GraphRequest || !GraphRequestManager) {
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

        //New code for grabing fb profile data
        console.log("Fetching Facebook user profile data...");
        const profileRequest = new GraphRequest(
          "/me",
          {
            parameters: {
              fields: {
                string: "id,name,email,first_name,last_name,picture.type(large)", // Request specific fields
              },
            },
          },
          (error : any, result : any) => {
            if (error) {
              console.error("Error fetching Facebook profile:", error);
              // Handle the error appropriately, e.g., show an alert
            } else {
              console.log("Facebook profile data:", result);
              
              const fbFirstName = result.first_name;
              const fbLastName = result.last_name;
              const fbEmail = result.email;

              setSignUpData({
                firstName: fbFirstName || firstName, // Use FB name if available, otherwise your existing firstName
                lastName: fbLastName || lastName, // Use FB name if available, otherwise your existing lastName
                email: fbEmail || email, // Use FB email if available, otherwise your existing email
                phoneNumber,
                userRole,
              });
            }
          }
        );

        // Start the graph request
        new GraphRequestManager().addRequest(profileRequest).start();
        //End


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

        setSignUpData({
                    firstName ,
                    lastName,
                    email,
                    phoneNumber,
                    userRole,
                });

        // alert("Successfully signed in with Facebook!");

        // Navigate to next screen or update UI
        router.replace("/SignUpViews/additionalInfo");
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
      <Text style={styles.title}>Sign up</Text>

      <Button
        icon="facebook"
        mode="contained"
        onPress={handleFacebookSignUp}
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

      {Platform.OS === "web" && <div id="phoneSignUp"></div>}
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
