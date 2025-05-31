import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
  Button,
  DefaultTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import LogInScreen from "./logInScreen";
import SignUpScreen from "./signUpScreen";

const Stack = createNativeStackNavigator();
const { width } = Dimensions.get("window");

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/SnowTroopers_Logo.png")}
        style={styles.logo}
        contentFit="contain"
      />
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.navigate("SignUp")}
      >
        Sign Up
      </Button>
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        Log In
      </Button>
    </View>
  );
}

export default function App() {
  return (
    <PaperProvider theme={customTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fff" },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LogInScreen} />
        {/* <Stack.Screen name = "emailPage" component={EmailPage} /> */}
      </Stack.Navigator>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    flex: 1,
    backgroundColor: "#ffffff",
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 30,
  },
  button: {
    width: width * 0.8,
    marginVertical: 8,
    borderRadius: 10,
  },
});

const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#00bedc",
    accent: "#00bedc",
  },
};
