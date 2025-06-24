import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Checkbox,
  HelperText,
  Menu,
  Text,
  TextInput,
} from "react-native-paper";
import api, { getAPIToken } from "../services/api";

export default function EditInfoForCustomerRequest() {
  //For React global context
  const fieldKeys = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "userRole",
    "streetAddress",
    "city",
    "state",
    "zipCode",
    "customerPropertySize",
    "selectedPrefTime",
  ];


  //General user info
  const [uid, setUid] = useState(getAuth().currentUser?.uid || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");


  //Prefill values upon render
  useEffect(() => {
    api.get(`/users/${uid}`, {
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
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email || '');
        setPhoneNumber(data.phoneNumber || '');
        setStreetAddress(data.streetAddress || '');
        setCity(data.city || '');
        setState(data.state || '');
        setZipCode(data.zipCode || '');

        // Customer-specific fields
        setCustomerPropertySize(data.customerPropertySize || '');
        setHasSteps(data.hasPropertySteps ?? true);
        setIsPetFriendly(data.usePetFriendlyMaterial ?? true);
        setSelectedCleaningSpecifics(data.cleaningSpecifics || []);
        setSelectedPrefTime(data.prefTime || []);

    })
    .catch((error) => {
        console.error("Error fetching user profile:", error);

    });
    }, [uid]);

  //Customer details
  const [customerPropertySize, setCustomerPropertySize] = useState<
    "Tiny" | "Small" | "Medium" | "Large" | "Extra Large" | ""
  >("");
  const [hasSteps, setHasSteps] = useState(true);
  const [isPetFriendly, setIsPetFriendly] = useState(true);
  const [selectedCleaningSpecifics, setSelectedCleaningSpecifics] = useState<
    string[]
  >([]);
  const [selectedPrefTime, setSelectedPrefTime] = useState<string[]>([]);

  //For error messages
  const [showErrors, setShowErrors] = useState(false);

  //Select button renderings
  const [propertyVisible, setPropertyVisible] = useState(false);
  const openPropertyMenu = () => setPropertyVisible(true);
  const closePropertyMenu = () => setPropertyVisible(false);

  const handlePropertySelect = (
    size: "Tiny" | "Small" | "Medium" | "Large" | "Extra Large"
  ) => {
    setCustomerPropertySize(size);
    closePropertyMenu();
  };

  //Checkbox options
  
  const propertySizeOptions = [
    "Tiny",
    "Small",
    "Medium",
    "Large",
    "Extra Large",
  ];
  const cleaningSpecificsOptions = ["Snow Removal", "Salting"];
  const prefTimeOptions = [
    { key: "Overnight", label: "Overnight (12:00 AM - 5:00 AM)" },
    { key: "Early Morning", label: "Early Morning (5:01 AM - 9:00 AM)" },
    { key: "Mid Morning", label: "Mid Morning (9:01 AM - 12:00 PM)" },
    { key: "Afternoon", label: "Afternoon (12:01 PM - 4:00 PM)" },
    { key: "Evening", label: "Evening (4:01 PM - 9:00 PM)" },
    { key: "Late Night", label: "Late Night (9:01 PM - 11:59 PM)" },
  ];

  //Toggles for checkboxes
  const toggleCleaningSpecifics = (item: string) => {
    setSelectedCleaningSpecifics((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };
  const togglePrefTime = (item: string) => {
    setSelectedPrefTime((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };


  //Validate values within fields
  const validateField = (key: string) => {
    switch (key) {
      case "firstName":
        return !firstName.trim();
      case "lastName":
        return !lastName.trim();
      case "email":
        return !email.trim() || !email.includes("@");
      case "phoneNumber":
        return !phoneNumber.trim() || phoneNumber.length < 10;
      case "streetAddress":
        return !streetAddress.trim();
      case "city":
        return !city.trim();
      case "state":
        return !state.trim();
      case "zipCode":
        return !zipCode.trim() || zipCode.length < 5;
      case "customerPropertySize":
        return !customerPropertySize;
      case "selectedPrefTime":
        return selectedPrefTime.length === 0;
      default:
        return false;
    }
  };

  const handleOrderRequestSubmission = async () => {
    console.log("Handle Order Request Submission");
    setShowErrors(true);

    //Alert user of fields missing proper values
    const missingFields = fieldKeys.filter(validateField);
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields`);
      return;
    }

    //Data to be sent as a JSON to the backend
    const customerOrder = {
      customerUid: uid,
      customerFName: firstName,
      customerLName: lastName,
      email:email,
      customerPhoneNumber: phoneNumber,
      streetAddress:streetAddress,
      city:city,
      state:state,
      zipCode:zipCode,
      customerPropertySize: customerPropertySize,
      hasPropertySteps: hasSteps,
      usePetFriendlyMaterial: isPetFriendly,
      cleaningSpecifics: selectedCleaningSpecifics,
      prefTime: selectedPrefTime,
    };


    console.log("Submitting Order Request:", customerOrder);
    //Sends HTTP POST request to backend api
    api
      .post(`/order/create`, customerOrder, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
            'Content-Type': 'application/json',
        },
      })
      .then(() => {
        console.log("Snow Removal Request has been updated successfully");
        router.replace("/customerHomeScreen");
      })
      .catch((error) => {
        console.log("Response Data:", error);
      });
  };

  //Dynamically render necessary fields
  const renderField = (
    fieldName: string,
    label: string,
    value: string,
    setter: (text: string) => void,
    style?: any
  ) => {
    const hasError = showErrors && validateField(fieldName);

    return (
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          label={`${label} *`}
          placeholder={`Enter your ${label.toLowerCase()}`}
          value={value}
          onChangeText={setter}
          error={hasError}
          style={style}
        />
        {hasError && (
          <HelperText type="error">{`${label} is required`}</HelperText>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled">
      <View style={styles.info}>
        <Text variant="headlineMedium" style={styles.title}>
          Please Confirm Your Order Request Information
        </Text>
        <View style={styles.infoTextBox}>
          {renderField("firstName", "First Name", firstName, setFirstName)}
          {renderField("lastName", "Last Name", lastName, setLastName)}
          {renderField("email", "Email", email, setEmail)}
          {renderField(
            "phoneNumber",
            "Phone Number",
            phoneNumber,
            setPhoneNumber
          )}
          <Text variant="headlineSmall">Address</Text>
          {renderField(
            "streetAddress",
            "Street Address",
            streetAddress,
            setStreetAddress
          )}
          {renderField("city", "City", city, setCity)}
          {renderField("state", "State", state, setState, styles.stateInput)}
          {renderField(
            "zipCode",
            "Zip Code",
            zipCode,
            setZipCode,
            styles.zipInput
          )}
        </View>

        <Text variant="headlineMedium">Preferences</Text>

        {/*Customer Preferences View */}
        {(
          <>
            <Text variant="headlineMedium" style={styles.promptText}>
              Select Your Property Size
            </Text>
            <View
              style={{
                paddingTop: 5,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Menu
                visible={propertyVisible}
                onDismiss={closePropertyMenu}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={openPropertyMenu}
                    style={[
                      showErrors &&
                        validateField("customerPropertySize") && {
                          borderColor: "red",
                        },
                    ]}
                  >
                    {customerPropertySize || "Select Property Size"}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => handlePropertySelect("Tiny")}
                  title="Tiny (0-500 sq ft)"
                />
                <Menu.Item
                  onPress={() => handlePropertySelect("Small")}
                  title="Small (501-1,501 sq ft)"
                />
                <Menu.Item
                  onPress={() => handlePropertySelect("Medium")}
                  title="Medium (1,501-3,000 sq ft)"
                />
                <Menu.Item
                  onPress={() => handlePropertySelect("Large")}
                  title="Large (3,001-6,000 sq ft)"
                />
                <Menu.Item
                  onPress={() => handlePropertySelect("Extra Large")}
                  title="Extra Large (6,001+ sq ft)"
                />
              </Menu>
            </View>
            {showErrors && validateField("customerPropertySize") && (
              <HelperText type="error">Property size is required</HelperText>
            )}

            <Text variant="headlineMedium" style={styles.promptText}>
              Select Cleaning Specifics
            </Text>
            {cleaningSpecificsOptions.map((item) => (
              <Checkbox.Item
                key={item}
                label={item}
                status={
                  selectedCleaningSpecifics.includes(item)
                    ? "checked"
                    : "unchecked"
                }
                onPress={() => toggleCleaningSpecifics(item)}
              />
            ))}

            <Text variant="headlineMedium" style={styles.promptText}>
              Select Your Preferred Time
            </Text>
            {showErrors && validateField("selectedPrefTime") && (
              <HelperText type="error">
                Select at least one preferred time
              </HelperText>
            )}
            {prefTimeOptions.map((item) => (
              <Checkbox.Item
                key={item.key}
                label={item.label}
                status={
                  selectedPrefTime.includes(item.key) ? "checked" : "unchecked"
                }
                onPress={() => togglePrefTime(item.key)}
              />
            ))}

            <Text variant="headlineMedium" style={styles.promptText}>
              Does your property have steps?
            </Text>
            <View style={styles.prompts}>
              <Button
                mode="outlined"
                onPress={() => setHasSteps(true)}
                style={[
                  styles.infoButton,
                  hasSteps === true && styles.selectedButton,
                ]}
                labelStyle={[
                  styles.buttonLabel,
                  hasSteps === true && styles.selectedButtonLabel,
                ]}
              >
                {" "}
                Yes{" "}
              </Button>

              <Button
                mode="outlined"
                onPress={() => setHasSteps(false)}
                style={[
                  styles.infoButton,
                  hasSteps === false && styles.selectedButton,
                ]}
                labelStyle={[
                  styles.buttonLabel,
                  hasSteps === false && styles.selectedButtonLabel,
                ]}
              >
                {" "}
                No{" "}
              </Button>
            </View>

            <Text variant="headlineMedium" style={styles.promptText}>
              Would you like pet friendly materials used?
            </Text>
            <View style={styles.prompts}>
              <Button
                mode="outlined"
                onPress={() => setIsPetFriendly(true)}
                style={[
                  styles.infoButton,
                  isPetFriendly === true && styles.selectedButton,
                ]}
                labelStyle={[
                  styles.buttonLabel,
                  isPetFriendly === true && styles.selectedButtonLabel,
                ]}
              >
                {" "}
                Yes{" "}
              </Button>

              <Button
                mode="outlined"
                onPress={() => setIsPetFriendly(false)}
                style={[
                  styles.infoButton,
                  isPetFriendly === false && styles.selectedButton,
                ]}
                labelStyle={[
                  styles.buttonLabel,
                  isPetFriendly === false && styles.selectedButtonLabel,
                ]}
              >
                {" "}
                No{" "}
              </Button>
            </View>
          </>
        )}

        <Button
        mode="contained"
        onPress={() => {
          console.log("Submit button pressed!");
          handleOrderRequestSubmission();
        }}
        style={styles.signupButton}
        >Submit Order Request</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: 10,
  },
  prompts: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    alignItems: "center",
  },
  infoButton: {
    marginVertical: 15,
    width: 150,
  },
  promptText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  documentSection: {
    marginVertical: 20,
    gap: 10,
  },
  uploadButton: {
    marginTop: 10,
  },
  documentList: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  documentName: {
    marginVertical: 5,
    color: "#666",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  stateInput: {
    flex: 1,
  },
  zipInput: {
    flex: 1,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
  infoTextBox: {
    paddingHorizontal: 10,
    flexDirection: "column",
    gap: 15,
  },
  roles: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "center",
    gap: 50,
    alignItems: "center",
  },
  roleButton: {
    marginVertical: 20,
    width: 150,
  },
  selectedButton: {
    backgroundColor: "#00bedc",
    color: "#ffffff",
  },
  buttonLabel: {
    color: "#00bedc",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedButtonLabel: {
    color: "#ffffff",
  },
  rolesText: {
    marginTop: 20,
    textAlign: "center",
  },
  signupButton: {
    paddingHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 8,
  },
  errorText: {
    color: "#B00020",
    fontSize: 12,
    marginTop: 4,
  },
});
