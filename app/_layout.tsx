import api, { getAPIToken } from "@/services/api";
import { router, Stack } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from 'react';
import { Platform } from "react-native";
import { BottomNavigation, DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SignUpProvider } from '../context/SignUpContext';
import WeatherScreen from "./homeScreen";
import ProfileScreen from "./profileScreen";


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

  useEffect(() => {
    if(Platform.OS !== "web"){
      const unsubscribe = onAuthStateChanged(getAuth(), (user : any) => {
        if(user){ 
          
          api.get(`/users/${user.uid}`,
              {
                headers: {
                  Authorization: `Bearer ${getAPIToken()}`,
                  'Content-Type': 'application/json',
                }
         }).then((result) => {
            if(result.data.uid){
              router.replace("/homeScreen");
              console.log("Result Data from API: ", result.data);
              console.log("User is currently logged in: ", user);
            }
         }).catch((error) => {
            console.log("An error has occurred: ", error);
            if(error.status === 404){
              console.log("User profile cannot be found within Firestore or user profile has not been created yet");
            }
         });
          
        }else{
          console.log("No user is currently logged in");
        }
        setIsAuthenticated(!!user);
      });
      return unsubscribe;
    }
  }, []);




  const [index, setIndex] = useState(0);

  //Create icons on bottom navbar
  const [routes] = useState([
    { key: 'home', title: 'Home', focusedIcon: 'heart'},
    { key: 'profile', title: 'Profile', focusedIcon: 'album'},
  ]);

  //Map icons to screens
  const renderScene = BottomNavigation.SceneMap({
    home: WeatherScreen,
    profile: ProfileScreen,
  });


  return (
    <PaperProvider theme={customTheme}>
        <SignUpProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#fff" },
            }}
          />
          {/* <BottomNavigation
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
          /> */}
        </SignUpProvider>
    </PaperProvider>
  );
}
