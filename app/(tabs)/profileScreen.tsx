import api, { getAPIToken } from "@/services/api";
import { router } from "expo-router";
import {
  deleteUser,
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-paper";

export default function ProfileScreen() {
  const [profilePicture, setProfilePicture] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userRole, setUserRole] = useState("Customer"); //Defalut to Customer
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  //Customer Preference
  const [customerPropertySize, setCustomerPropertySize] = useState("");
  const [cleaningSpecifics, setCleaningSpecifics] = useState([]);
  const [preferredTimes, setPreferredTimes] = useState([]);
  const [propertySteps, setPropertySteps] = useState(null);
  const [usePetFriendlyMaterial, setUsePetFriendlyMaterial] = useState(null);

  //Contractor preference
  const [crewSize, setCrewSize] = useState("");
  const [contractorPropertySize, setContractorPropertySize] = useState([]);
  const [preferredRadius, setPreferredRadius] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (!user) return;
      api
        .get(`/users/${user.uid}`, {
          headers: {
            Authorization: `Bearer ${getAPIToken()}`,
            ...(Platform.OS !== "web" && {
              "Content-Type": "application/json",
            }),
            "ngrok-skip-browser-warning": "11111",
          },
        })
        .then((result) => {
          //Profile details
          setProfilePicture(result.data.profilePicture || "");
          setFirstName(result.data.firstName || "");
          setLastName(result.data.lastName || "");
          setEmail(result.data.email || "");
          setPhoneNumber(result.data.phoneNumber || "");
          setUserRole(result.data.role || "Customer");
          setStreetAddress(result.data.streetAddress || "");
          setCity(result.data.city || "");
          setState(result.data.state || "");
          setZipCode(result.data.zipCode || "");

          // Customer fields
          setCustomerPropertySize(result.data.customerPropertySize || "");
          setCleaningSpecifics(result.data.cleaningSpecifics || []);
          setPreferredTimes(result.data.prefTime || []);
          setPropertySteps(result.data.hasPropertySteps || null);
          setUsePetFriendlyMaterial(result.data.usePetFriendlyMaterial || null);

          // Contractor fields
          setCrewSize(result.data.crewSize || "");
          setContractorPropertySize(result.data.prefPropertySizeWork || []);
          setPreferredRadius(result.data.prefRadiusWork || "");
          setEquipmentTypes(result.data.equipments || []);
        })
        .catch((error) => {
          console.log("An error has occurred: ", error);
        });
    });
    return () => unsubscribe();
  }, []);

  const handleLogOut = async () => {
    signOut(getAuth()).then(() => {
      router.replace("/");
      console.log("Sucessfully logged out");
    });
  };

  const handleEditProfile = () => {
    router.push("/editInfo");
  };

  const handleChangePassword = () => {
    router.push("/changePassword");
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete your account?"
      );
      if (confirmed) {
        const user = getAuth().currentUser!;
        deleteUser(user)
          .then(() => {
            Alert.alert("Account has been deleted");
            console.log("Account has been deleted");
            router.replace("/");
          })
          .catch((error) => {
            Alert.alert("An error has occured: ", error);
            console.log("An error has occured: ", error);
          });
      } else {
        console.log("User cancelled");
      }
    } else {
      Alert.alert(
        "Confirm Action",
        "Are you sure you want to delete your account?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes",
            onPress: () => {
              const user = getAuth().currentUser!;
              deleteUser(user)
                .then(() => {
                  Alert.alert("Account has been deleted");
                  console.log("Account has been deleted");
                  router.replace("/");
                })
                .catch((error) => {
                  Alert.alert("An error has occured: ", error);
                  console.log("An error has occured: ", error);
                });
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Edit Profile */}
      <TouchableOpacity
        onPress={handleEditProfile}
        style={styles.editProfileButton}
      >
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Profile Image */}
      <Image source={{ uri: profilePicture }} style={styles.profileImage} />

      {/* Name */}
      <Text style={styles.nameText}>
        {firstName} {lastName}
      </Text>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.subSection}>
          <Text style={styles.itemText}>Email: {email}</Text>
          <Text style={styles.itemText}>Phone Number: {phoneNumber}</Text>
          <Text style={styles.itemText}>
            Address: {streetAddress}, {city}, {state}, {zipCode}
          </Text>
          <Text style={styles.itemText}>Role: {userRole}</Text>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>

        {/* Customer */}
        {userRole === "Customer" && (
          <View style={styles.subSection}>
            <Text style={styles.itemText}>
              Property Size: {customerPropertySize}
            </Text>
            <Text style={styles.itemText}>
              Cleaning Specifics: {cleaningSpecifics.join(", ")}
            </Text>
            <Text style={styles.itemText}>
              Preferred Time(s): {preferredTimes.join(", ")}
            </Text>
            <Text style={styles.itemText}>
              Have Property Steps: {propertySteps ? "Yes" : "No"}
            </Text>
            <Text style={styles.itemText}>
              Use Pet friendly material: {usePetFriendlyMaterial ? "Yes" : "No"}
            </Text>
          </View>
        )}

        {/* Contractor */}
        {userRole === "Contractor" && (
          <View style={styles.subSection}>
            <Text style={styles.itemText}>Crew Size: {crewSize}</Text>
            <Text style={styles.itemText}>
              Property Size to Work on: {contractorPropertySize.join(", ")}
            </Text>
            <Text style={styles.itemText}>
              Preferred Radius to Work: {preferredRadius}
            </Text>
            <Text style={styles.itemText}>
              Types of Equipment: {equipmentTypes.join(", ")}
            </Text>
          </View>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={handleLogOut}
          style={styles.logoutButton}
          labelStyle={styles.buttonText}
        >
          Log Out
        </Button>

        <Button
          mode="contained"
          onPress={handleChangePassword}
          style={styles.changePasswordButton}
          labelStyle={styles.buttonText}
        >
          Change Password
        </Button>

        <Button
          mode="contained"
          onPress={handleDeleteAccount}
          style={styles.deleteAccountButton}
          labelStyle={styles.deleteButtonText}
        >
          Delete Account
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 140,
    flexGrow: 1,
  },
  editProfileButton: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 1,
  },
  editProfileText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4ac1d3",
    marginTop: 40,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: "center",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 15,
    color: "#333",
    textAlign: "center",
    alignSelf: "center",
  },
  infoContainer: {
    padding: 16,
    width: "100%",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    color: "#333",
    textAlign: "center",
    width: "100%",
  },
  subSection: {
    marginTop: 4,
    marginLeft: 12,
    width: "100%",
    alignItems: "center",
  },
  itemText: {
    fontSize: 14,
    marginBottom: 2,
    color: "#555",
    textAlign: "center",
  },
  buttons: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: "#00c1de",
    borderRadius: 20,
    paddingVertical: 4,
    width: 200,
    alignSelf: "center",
  },
  changePasswordButton: {
    backgroundColor: "#00c1de",
    borderRadius: 20,
    paddingVertical: 4,
    width: 200,
    alignSelf: "center",
  },
  deleteAccountButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 20,
    paddingVertical: 4,
    width: 200,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
