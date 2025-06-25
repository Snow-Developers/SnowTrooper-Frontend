import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image, Platform, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import api, { getAPIToken } from "../../services/api";


export default function TabLayout() {

  const [uid, setUid] = useState(getAuth().currentUser?.uid || "");
  const [role, setRole] = useState("Customer");

  console.log("current:", role);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user : any) => {
        if(user){
        api.get(`/users/${user.uid}`, {
            headers: {
            Authorization: `Bearer ${getAPIToken()}`,
            ...(Platform.OS !== 'web' && {
                'Content-Type': 'application/json',
            }),
            "ngrok-skip-browser-warning": "11111",
            },
        })
        .then((response) => {
            const data = response.data;
            console.log("User profile data:", data);
            setRole(data.role || ' ');

        })
        .catch((error) => {
            console.error("Error fetching user profile!!:", error);
        });
      }
        return () => unsubscribe();
    }
  )}, []);


  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.floatingTabBar,
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: "#212322",
        tabBarActiveBackgroundColor: "rgba(0, 0, 0, 0.1)",
        tabBarShowLabel: false,
        tabBarIconStyle: styles.navIcons,
      }}
    >
      <Tabs.Screen
        name="homeScreen"
        options={{
          href: role === "Contractor" ? undefined : null,
          tabBarIcon: ({ focused }) => (
            <View>
              <MaterialIcons name="home" size={35} color={focused ? "#FFFFFF" : "#212322"} />
            </View>
          ),
        }}
      />

        <Tabs.Screen
          name="customerHomeScreen"
          options={{
            href:role === "Customer" ? undefined : null,
            tabBarIcon: ({ focused }) => (
              <View>
                <MaterialIcons name="home" size={35} color={focused ? "#FFFFFF" : "#212322"} />
              </View>
            ),
          }}
        />
      <Tabs.Screen
        name="ordersScreen"
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <Image 
                source={require("../../assets/images/ST_White_Logo_Shield.png")}
                style={{
                  top:2.5,
                  width: 35,
                  height: 40,
                  margin: 100,
                  tintColor: focused ? "#FFFFFF" : "#212322",
                }}/>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profileScreen"
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <MaterialIcons name="person" size={35} color={focused ? "#FFFFFF" : "#212322"} />
            </View>
          ),
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingTabBar: {
    position: "absolute",
    bottom: 35,
    marginHorizontal: 20,
    height: 70,
    borderRadius: 40,
    borderTopWidth: 0,
    borderColor: "#A33B20",
    backgroundColor: "#00C1DE",
    elevation: 5,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
    overflow: Platform.OS === "android" ? "hidden" : "visible", //prevent android ripple overflow
  },
  tabBarItemStyle: {
    borderRadius: 40,
    overflow: "hidden",
    marginTop: -1.5,
    left:-1,
    bottom: Platform.OS !== "web" ? -5 : 0,
    marginHorizontal: Platform.OS !== "web" ? 4.5 : 0,
    marginVertical: Platform.OS !== "web" ? -15 : 0,
    borderWidth: 0,
  },
  navIcons: {
    marginVertical: 8,
  },
});
