import { router } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { Button } from "react-native-paper";
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

export default function ProfileScreen() {
  const handleLogOut = async () => {
    signOut(getAuth()).then(() => {
      router.replace("/");
      console.log("Sucessfully logged out");
    });
  };

  const handleEditProfile = () => {
    Alert.alert("Edit Profile pressed");
  };

  const handleChangePassword = () => {
    Alert.alert("Change Password pressed");
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account pressed");
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
        source={{ uri: "https://via.placeholder.com/100" }}
        style={styles.profileImage}
      />

      {/* Name */}
      <Text style={styles.nameText}>John Doe</Text>

      {/* Info */}
      <Text style={styles.infoText}>
        List their info here.{"\n"}
        Allow users to change them after clicking “Edit Profile”
      </Text>

      {/* Buttons */}
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
    // <View>
    //     <Text>Profile Page</Text>
    //     <Button
    //         mode="outlined"
    //         onPress={handleLogOut}
    //         style = {{marginTop: 400}}
    //     > Log out </Button>
    // </View>
  );
}

const styles = StyleSheet.create({
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
  changePasswordButton: {
    backgroundColor: "#4ac1d3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 20,
  },
  deleteAccountButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 10,
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
