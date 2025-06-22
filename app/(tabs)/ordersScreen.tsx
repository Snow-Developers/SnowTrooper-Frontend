import React, { useState } from "react";
import { StyleSheet, View } from 'react-native';
// import { router } from "expo-router";


export default function OrderScreen(){
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

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
  //     if(!user) return;
  //     api.get(`/users/${user.uid}`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${getAPIToken()}`,
  //               ...(Platform.OS !== 'web' && {
  //               'Content-Type': 'application/json',
  //               }),
  //             }
  //         }).then((result) => {
  //           //Profile details
  //           setProfilePicture(result.data.profilePicture || '');
  //           setFirstName(result.data.firstName || '');
  //           setLastName(result.data.lastName || '');
  //           setEmail(result.data.email || '');
  //           setPhoneNumber(result.data.phoneNumber || '');
  //           setUserRole(result.data.userRole || 'Customer');
  //           setStreetAddress(result.data.streetAddress || '');
  //           setCity(result.data.city || '');
  //           setState(result.data.state || '');
  //           setZipCode(result.data.zipCode || '');

  //           // Customer fields
  //           setCustomerPropertySize(result.data.customerPropertySize || '');
  //           setCleaningSpecifics(result.data.cleaningSpecifics || []);
  //           setPreferredTimes(result.data.prefTime || []);
  //           setPropertySteps(result.data.hasPropertySteps || null);
  //           setUsePetFriendlyMaterial(result.data.usePetFriendlyMaterial || null);

  //           // Contractor fields
  //           setCrewSize(result.data.crewSize || '');
  //           setContractorPropertySize(result.data.prefPropertySizeWork || []);
  //           setPreferredRadius(result.data.prefRadiusWork || '');
  //           setEquipmentTypes(result.data.equipments || []);
  //         })
  //         .catch((error) => {console.log("An error has occurred: ", error)});
  //       });
  //       return () => unsubscribe();
  // }, []);

const retrieveOrders = () => {

};



    return(
    <View>
        
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    opacity: 0.4,
  },
  text: {
    color: 'white',
    fontSize: 42,
    lineHeight: 84,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#000000c0',
  },
});