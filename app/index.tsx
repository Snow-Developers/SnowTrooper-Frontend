import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";



const { width } = Dimensions.get("window");

export default function HomeScreen() {
  // const [user, setUser] = useState(null);

// const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     if(Platform.OS !== "web"){
//       const unsubscribe = onAuthStateChanged(getAuth(), (user : any) => {
//         if(!!user){ 
//           api.get(`/users/${user.uid}`,
//               {
//                 headers: {
//                   Authorization: `Bearer ${getAPIToken()}`,
//                   'Content-Type': 'application/json',
//                 }
//          }).then((result) => {
//             if(!result.data.uid){
//               router.replace("/homeScreen");
//               console.log("User is currently logged in: ", user);
//             }
//          }).catch((error) => {
//             console.log("An error has occurred: ", error);
//             if(error.code === 404){
//               console.log("User profile cannot be found within Firestore");
//             }
//          });
          
//         }else{
//           console.log("No user is currently logged in");
//         }
//         setIsAuthenticated(!!user);
//       });
//       return unsubscribe;
//     }
//   }, []);
  

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/ST_Logo.png")}
        style={styles.logo}
        contentFit="contain"
      />
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => router.push("/signUpScreen")}
      >
        Sign Up
      </Button>
      <Button
        mode="contained"
        style={styles.button}
        onPress={() => router.push("/logInScreen")}
      >
        Log In
      </Button>
    </View>
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
