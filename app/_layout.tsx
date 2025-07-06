import api, { getAPIToken } from "@/services/api";
import { StripeProvider } from "@stripe/stripe-react-native";
import { router, Stack, usePathname } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import {
  Appbar,
  DefaultTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import { SignUpProvider } from "../context/SignUpContext";

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#00c1de",
    accent: "#00c1de",
    background: "#ffffff",
  },
};

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname(); // current route path
  const [role, setRole] = useState(" ");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user: any) => {
      if (user) {
        api
          .get(`/users/${user.uid}`, {
            headers: {
              Authorization: `Bearer ${getAPIToken()}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "11111",
            },
          })
          .then((result) => {
            setRole(result.data.role || " ");
            if (result.data.uid) {
              console.log("Path: ", pathname);
              console.log("User profile data role: ", result.data.role);
              if (pathname === "/" && result.data.role === "Customer") {
                router.replace("/(tabs)/customerHomeScreen");
              } else if (
                pathname === "/" &&
                result.data.role === "Contractor"
              ) {
                router.replace("/(tabs)/contractorHomeScreen");
              }
              console.log("User is currently logged in: ", user);
            }
          })
          .catch((error) => {
            console.log("An error has occurred: ", error);
            if (error.status === 404) {
              console.log(
                "User profile cannot be found within Firestore or user profile has not been created yet"
              );
            }
          });
      } else {
        console.log("No user is currently logged in");
      }
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, [pathname]);
  /*
  const appBarPath: { [key: string]: string } = {
    "/homeScreen": "Home",
    "/profileScreen": "Profile",
    "/ordersScreen": "Orders"
  };
*/
  const appBarPath: { [key: string]: string } = {};

  if (role === "Contractor") {
    appBarPath["/(tabs)/contractorHomeScreen"] = "Home";
    appBarPath["/(tabs)/profileScreen"] = "Profile";
    appBarPath["/(tabs)/ordersScreen"] = "Orders";
  } else {
    appBarPath["/(tabs)/customerHomeScreen"] = "Home";
    appBarPath["/(tabs)/profileScreen"] = "Profile";
    appBarPath["/ordersScreen"] = "Orders";
  }

  return (
    <PaperProvider theme={customTheme}>
      <StripeProvider publishableKey="pk_test_51RhIhdRZ9LUagJRTHcaFv47iWwVIf3AB6MnGMmLolr4EZDLJUUvfhezOfkpgxIGtzthytL1295FYUVjabatgNQIr00LuW2ODJK">
        <SignUpProvider>
          {isAuthenticated && (
            <Appbar.Header
              style={{
                height: 50,
                backgroundColor: "#00c1de",
              }}
              mode="center-aligned"
            >
              <Appbar.Content
                title={appBarPath[pathname] || "SnowTroopers"}
                titleStyle={styles.appBarTitle}
              />
            </Appbar.Header>
          )}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#fff" },
            }}
          />
        </SignUpProvider>
      </StripeProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  appBarTitle: {
    fontFamily: "tt-supermolot-neue-trl",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 442,
    height: 275,
    marginBottom: 30,
    opacity: 0.04,
  },
});
