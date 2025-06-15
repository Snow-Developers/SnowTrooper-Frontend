import api, { getAPIToken } from "@/services/api";
import { router } from "expo-router";
import { deleteUser, getAuth, onAuthStateChanged, signOut } from "firebase/auth";
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
import Icon from "react-native-vector-icons/FontAwesome";

export default function ProfileScreen() {

  // const [uid, setUid] = useState(getAuth().currentUser?.uid || "");
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
  const [customerPropertySize, setCustomerPropertySize] = useState('');
  const [cleaningSpecifics, setCleaningSpecifics] = useState([]);
  const [preferredTimes, setPreferredTimes] = useState([]);
  const [propertySteps, setPropertySteps] = useState(null);
  const [usePetFriendlyMaterial, setUsePetFriendlyMaterial] = useState(null);

  //Contractor preference
  const [crewSize, setCrewSize] = useState('');
  const [contractorPropertySize, setContractorPropertySize] = useState([]);
  const [preferredRadius, setPreferredRadius] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if(!user) return;
      api.get(`/users/${user.uid}`,
            {
              headers: {
                Authorization: `Bearer ${getAPIToken()}`,
                ...(Platform.OS !== 'web' && {
                'Content-Type': 'application/json',
                }),
              }
          }).then((result) => {
            //Profile details
            setProfilePicture(result.data.profilePicture || '');
            setFirstName(result.data.firstName || '');
            setLastName(result.data.lastName || '');
            setEmail(result.data.email || '');
            setPhoneNumber(result.data.phoneNumber || '');
            setUserRole(result.data.userRole || 'Customer');
            setStreetAddress(result.data.streetAddress || '');
            setCity(result.data.city || '');
            setState(result.data.state || '');
            setZipCode(result.data.zipCode || '');

            // Customer fields
            setCustomerPropertySize(result.data.customerPropertySize || '');
            setCleaningSpecifics(result.data.cleaningSpecifics || []);
            setPreferredTimes(result.data.prefTime || []);
            setPropertySteps(result.data.hasPropertySteps || null);
            setUsePetFriendlyMaterial(result.data.usePetFriendlyMaterial || null);

            // Contractor fields
            setCrewSize(result.data.crewSize || '');
            setContractorPropertySize(result.data.prefPropertySizeWork || []);
            setPreferredRadius(result.data.prefRadiusWork || '');
            setEquipmentTypes(result.data.equipments || []);
          })
          .catch((error) => {console.log("An error has occurred: ", error)});
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
     if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to delete your account?");
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
          { text: "Yes", onPress: () => {
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
          }},
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
      <Image
        source={{ uri: profilePicture }}
        style={styles.profileImage}
      />

      {/* Name */}
      <Text style={styles.nameText}>{firstName} {lastName}</Text>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.subSection}>
        <Text style={styles.itemText}>Email: {email}</Text>
        <Text style={styles.itemText}>Phone Number: {phoneNumber}</Text>
        <Text style={styles.itemText}>Address: {streetAddress}, {city}, {state}, {zipCode}</Text>
        <Text style={styles.itemText}>Role: {userRole}</Text>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>

        {/* Customer */}
        {userRole === "Customer" && (
          <View style={styles.subSection}>
            <Text style={styles.itemText}>Property Size: {customerPropertySize}</Text>
            <Text style={styles.itemText}>Cleaning Specifics: {cleaningSpecifics.join(', ')}</Text>
            <Text style={styles.itemText}>Preferred Time(s): {preferredTimes.join(', ')}</Text>
            <Text style={styles.itemText}>Have Property Steps: {propertySteps ? 'Yes' : 'No'}</Text>
            <Text style={styles.itemText}>Use Pet friendly material: {usePetFriendlyMaterial ? 'Yes' : 'No'}</Text>
          </View>
        )}

        {/* Contractor */}
        {userRole === "Contractor" && (
          <View style={styles.subSection}>
            <Text style={styles.itemText}>Crew Size: {crewSize}</Text>
            <Text style={styles.itemText}>Property Size to Work on: {contractorPropertySize.join(', ')}</Text>
            <Text style={styles.itemText}>Preferred Radius to Work: {preferredRadius}</Text>
            <Text style={styles.itemText}>Types of Equipment: {equipmentTypes.join(', ')}</Text>
          </View>
        )}
      </View>
      

      {/* Buttons */}
      <View style = {styles.buttons}>
        <TouchableOpacity
          style={styles.logout}
          onPress={handleLogOut}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.changePasswordButton}
          onPress={handleChangePassword}
        >
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Icon
            name="home"
            size={28}
            color="#fff"
            onPress={() => {
              router.push("/homeScreen");
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="car" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon
            name="user"
            size={28}
            color="#fff"
            onPress={() => {
              router.push("/profileScreen");
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
    
        
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  subSection: {
    marginTop: 8,
    marginLeft: 12,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#555',
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  editProfileButton: {
    position: "absolute",
    top: 60,
    right: 20,
  },
  editProfileText: {
    color: "#007AFF",
    fontSize: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4ac1d3",
    marginTop: 20,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
  },
  infoText: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  buttons: {
    flex: 1,
    flexDirection: "column",
  },
  logout: {
    backgroundColor: "#4ac1d3",
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 10,
  },
  changePasswordButton: {
    backgroundColor: "#4ac1d3",
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 10,
  },
  deleteAccountButton: {
    backgroundColor: "#FF3B30",
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#4ac1d3",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
});
