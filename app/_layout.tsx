import api, { getAPIToken } from "@/services/api";
import { Stack, router } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from 'react';
import { Platform } from "react-native";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SignUpProvider } from '../context/SignUpContext';


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
  const [index, setIndex] = useState(0);
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
              console.log("User is currently logged in: ", user);
            }
         }).catch((error) => {
            console.log("An error has occurred: ", error);
            if(error.code === 404){
              console.log("User profile cannot be found within Firestore");
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


  return (
    <PaperProvider theme={customTheme}>
        <SignUpProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#fff" },
            }}
          />
        </SignUpProvider>
    </PaperProvider>
  );
}
