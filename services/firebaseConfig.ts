import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

const auth = Platform.OS !== "web"
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    })
  : getAuth(app);

// let appCheck;

// if (Platform.OS === 'web') {
//   appCheck = initializeAppCheck(app, {
//     provider: new ReCaptchaV3Provider(process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || ''),
//     isTokenAutoRefreshEnabled: true
//   });
// }


export default auth;
// export { appCheck };

