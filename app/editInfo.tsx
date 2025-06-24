import * as DocumentPicker from "expo-document-picker";
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

export default function EditInfo() {
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
    "selectedEquipmentItems",
    "selectedPropertySizes",
    "crewSize",
    "radiusSize",
    "documentsUploaded",
  ];


  //General user info
  const [uid, setUid] = useState(getAuth().currentUser?.uid || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userRole, setUserRole] = useState("Customer"); //Defalut to Customer
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [profilePicture, setProfilePicture] = useState("");


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

        setProfilePicture(data.profilePicture || '');
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email || '');
        setPhoneNumber(data.phoneNumber || '');
        setUserRole(data.role || 'Customer');
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

        // Contractor-specific fields
        setSelectedPropertySizes(data.prefPropertySizeWork || []);
        setCrewSize(data.crewSize || '');
        setRadiusSize(data.prefRadiusWork || '');
        setSelectedEquipmentItems(data.equipments || []);
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

  //Contrator details
  const [selectedPropertySizes, setSelectedPropertySizes] = useState<string[]>(
    []
  );
  const [crewSize, setCrewSize] = useState("");
  const [selectedEquipmentItems, setSelectedEquipmentItems] = useState<
    string[]
  >([]);
  const [radiusSize, setRadiusSize] = useState("");

  //For error messages
  const [showErrors, setShowErrors] = useState(false);

  //Select button renderings
  const [propertyVisible, setPropertyVisible] = useState(false);
  const [radiusVisible, setRadiusVisible] = useState(false);
  const [crewVisible, setCrewVisible] = useState(false);
  const openCrewMenu = () => setCrewVisible(true);
  const closeCrewMenu = () => setCrewVisible(false);
  const openRadiusMenu = () => setRadiusVisible(true);
  const closeRadiusMenu = () => setRadiusVisible(false);
  const openPropertyMenu = () => setPropertyVisible(true);
  const closePropertyMenu = () => setPropertyVisible(false);
  const handleRadiusSelect = (
    size: "Tiny" | "Small" | "Medium" | "Large" | "Extra Large"
  ) => {
    setRadiusSize(size);
    closeRadiusMenu();
  };
  const handleCrewSelect = (
    size: "Tiny" | "Small" | "Medium" | "Large" | "Extra Large"
  ) => {
    setCrewSize(size);
    closeCrewMenu();
  };
  const handlePropertySelect = (
    size: "Tiny" | "Small" | "Medium" | "Large" | "Extra Large"
  ) => {
    setCustomerPropertySize(size);
    closePropertyMenu();
  };

  //Checkbox options
  const snowEquipmentOptions = [
    "Snow Shovel",
    "Snow Blower",
    "Snow Plow",
    "Skid Steer Loader with Snow Blade/Bucket",
    "Rock Salt",
    "Salt Spreader",
    "Snow Broom / Push Broom",
    "Roof Rake",
  ];
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
  const toggleEquipmentItem = (item: string) => {
    setSelectedEquipmentItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };
  const togglePropertySizes = (item: string) => {
    setSelectedPropertySizes((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };
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

  //Types of documents to be uploaded by contractor
  const DOCUMENT_SECTIONS = {
    insurance: "Insurance Documentation",
    workersComp: "Workers Compensation",
    license: "Driver's License",
    articles: "Articles of Organization/Incorporation",
  };

  //Initialize each document
  type DocumentSectionKey = keyof typeof DOCUMENT_SECTIONS;
  const initialDocState: Record<DocumentSectionKey, any[]> = {
    insurance: [],
    workersComp: [],
    license: [],
    articles: [],
  };
  const [documentsBySection, setDocumentsBySection] = useState(initialDocState);

  //Docuemnt upload handler
  const DocumentUploadSection = ({
    sectionKey,
    title,
  }: {
    sectionKey: DocumentSectionKey;
    title: string;
  }) => {
    const docs = documentsBySection[sectionKey];

    //Opens device file system for selecting images and/or PDFs
    const handlePicker = async () => {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        multiple: true,
      });
      if (!result.canceled) {
        setDocumentsBySection((prev) => ({
          ...prev,
          [sectionKey]: [...prev[sectionKey], ...result.assets],
        }));
      }
    };

    //Removes document from list of documents to be uploaded
    const removeDoc = (index: number) => {
      setDocumentsBySection((prev) => ({
        ...prev,
        [sectionKey]: prev[sectionKey].filter((_, i) => i !== index),
      }));
    };

    return (
      <View style={styles.documentSection}>
        <Text variant="headlineSmall">{title}</Text>
        <Button
          mode="contained"
          onPress={handlePicker}
          style={styles.signupButton}
        >
          Select Documents
        </Button>

        {showErrors && docs.length === 0 && (
          <HelperText type="error">{title} is required</HelperText>
        )}

        {docs.length > 0 && (
          <View style={styles.documentList}>
            <Text variant="bodyMedium">
              Documents will be uploaded on submission.
            </Text>
            {docs.map((doc, index) => (
              <View key={index} style={styles.documentItem}>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Button mode="text" compact onPress={() => removeDoc(index)}>
                  X
                </Button>
              </View>
            ))}
          </View>
        )}
      </View>
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
      case "userRole":
        return !userRole.trim();
      case "streetAddress":
        return !streetAddress.trim();
      case "city":
        return !city.trim();
      case "state":
        return !state.trim();
      case "zipCode":
        return !zipCode.trim() || zipCode.length < 5;
      case "customerPropertySize":
        return userRole === "Customer" && !customerPropertySize;
      case "selectedPrefTime":
        return userRole === "Customer" && selectedPrefTime.length === 0;
      case "selectedEquipmentItems":
        return userRole === "Contractor" && selectedEquipmentItems.length === 0;
      case "selectedPropertySizes":
        return userRole === "Contractor" && selectedPropertySizes.length === 0;
      case "crewSize":
        return userRole === "Contractor" && !crewSize;
      case "radiusSize":
        return userRole === "Contractor" && !radiusSize;
      case "documentsUploaded":
        return (
          userRole === "Contractor" &&
          Object.entries(documentsBySection).some(
            ([_, docs]) => docs.length === 0
          )
        );
      default:
        return false;
    }
  };

  const handleSaveChanges = async () => {
    setShowErrors(true);

    //Alert user of fields missing proper values
    const missingFields = fieldKeys.filter(validateField);
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields`);
      return;
    }

    //Data to be sent as a JSON to the backend
    const userProfile = {
      uid,
      profilePicture,
      firstName,
      lastName,
      email,
      phoneNumber,
      role: userRole,
      streetAddress,
      city,
      state,
      zipCode,
      crewSize,
      prefPropertySizeWork: selectedPropertySizes,
      prefRadiusWork: radiusSize,
      equipments: selectedEquipmentItems,
      customerPropertySize,
      hasPropertySteps: hasSteps,
      usePetFriendlyMaterial: isPetFriendly,
      cleaningSpecifics: selectedCleaningSpecifics,
      prefTime: selectedPrefTime,
    };

    //formData contains both JSON (userProfile information) and files
    const formData = new FormData();
    formData.append("userProfile", JSON.stringify(userProfile));

    const allDocuments = Object.values(documentsBySection).flat();
    for (const [index, doc] of allDocuments.entries()) {
      try {
        if (Platform.OS === "web") {
          /*
            --Web device--
            Fetches local URL to file, then converts response to a blob (binary large object), 
            then appends to formData.
            */
          const response = await fetch(doc.uri);
          const blob = await response.blob();
          formData.append("files", blob, doc.name ?? `file-${index}`);
        } else {
          /*
            --Mobile device (iOS/Android)--
            Directly appends to formData
            */
          formData.append("files", {
            uri: doc.uri,
            name: doc.name ?? `file-${index}`,
            type: doc.mimeType || "application/octet-stream",
          } as any);
        }
      } catch (error) {
        console.error(
          `Failed to process file ${doc.name ?? `file-${index}`}:`,
          error
        );
      }
    }

    //Sends HTTP POST request to backend api
    api
      .put(`/users/update/${uid}`, formData, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          ...(Platform.OS !== "web" && {
            "Content-Type": "multipart/form-data",
          }),
        },
      })
      .then(() => {
        console.log("Profile has been updated successfully");
        router.back();
      })
      .catch((error) => {
        console.log("Response Data:", error);
      });

      if(userRole === "Customer"){
        router.replace("/homeScreen");
      }
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

  //Render user role buttons
  const renderRoleSelector = () => {
    const hasError = showErrors && validateField("userRole");
    const roles = ["Customer", "Contractor"];

    return (
      <View style={styles.inputContainer}>
        <Text variant="headlineSmall" style={styles.rolesText}>
          Select Your Role
        </Text>
        <View style={styles.roles}>
          {roles.map((role) => (
            <Button
              key={role}
              mode={userRole === role ? "contained" : "outlined"}
              onPress={() => setUserRole(role)}
              style={[
                styles.roleButton,
                userRole === role && styles.selectedButton,
              ]}
              labelStyle={[
                styles.buttonLabel,
                userRole === role && styles.selectedButtonLabel,
              ]}
            >
              {role}
            </Button>
          ))}
        </View>
        {hasError && (
          <HelperText type="error" visible={hasError}>
            Role is required
          </HelperText>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.info}>
        <Text variant="headlineMedium" style={styles.title}>
          Additional Information
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
          {renderRoleSelector()}
        </View>

        {/* Documentation section */}
        {userRole === "Contractor" && (
          <Text variant="headlineMedium">Upload required documents</Text>
        )}
        {userRole === "Contractor" &&
          (
            Object.entries(DOCUMENT_SECTIONS) as [DocumentSectionKey, string][]
          ).map(([key, label]) => (
            <DocumentUploadSection key={key} sectionKey={key} title={label} />
          ))}

        <Text variant="headlineMedium">Preferences</Text>

        {/*Customer Preferences View */}
        {userRole === "Customer" && (
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

        {/*Contrator Preferences View */}
        {userRole === "Contractor" && (
          <>
            <Text variant="headlineSmall">Crew Size</Text>
            <View
              style={{
                paddingTop: 5,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Menu
                visible={crewVisible}
                onDismiss={closeCrewMenu}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={openCrewMenu}
                    style={[
                      showErrors &&
                        validateField("crewSize") && { borderColor: "red" },
                    ]}
                  >
                    {crewSize || "Select Crew Size"}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => handleCrewSelect("Tiny")}
                  title="Tiny (1-2 member(s))"
                />
                <Menu.Item
                  onPress={() => handleCrewSelect("Small")}
                  title="Small (3-5 members)"
                />
                <Menu.Item
                  onPress={() => handleCrewSelect("Medium")}
                  title="Medium (6-9 members)"
                />
                <Menu.Item
                  onPress={() => handleCrewSelect("Large")}
                  title="Large (10-13 members)"
                />
                <Menu.Item
                  onPress={() => handleCrewSelect("Extra Large")}
                  title="Extra Large (14+ members)"
                />
              </Menu>
            </View>

            <Text variant="headlineSmall">Size of Properties to Work on</Text>
            {showErrors && validateField("selectedPropertySizes") && (
              <HelperText type="error">
                Select at least one preferred property size to work on
              </HelperText>
            )}
            {propertySizeOptions.map((item) => (
              <Checkbox.Item
                key={item}
                label={item}
                status={
                  selectedPropertySizes.includes(item) ? "checked" : "unchecked"
                }
                onPress={() => togglePropertySizes(item)}
              />
            ))}

            <Text variant="headlineSmall">Preferred Radius to work</Text>
            <View
              style={{
                paddingTop: 5,
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Menu
                visible={radiusVisible}
                onDismiss={closeRadiusMenu}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={openRadiusMenu}
                    style={[
                      showErrors &&
                        validateField("radiusSize") && { borderColor: "red" },
                    ]}
                  >
                    {radiusSize || "Select Radius"}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => handleRadiusSelect("Tiny")}
                  title="Tiny (1 mi.)"
                />
                <Menu.Item
                  onPress={() => handleRadiusSelect("Small")}
                  title="Small (5 mi.)"
                />
                <Menu.Item
                  onPress={() => handleRadiusSelect("Medium")}
                  title="Medium (10 mi.)"
                />
                <Menu.Item
                  onPress={() => handleRadiusSelect("Large")}
                  title="Large (25 mi.)"
                />
                <Menu.Item
                  onPress={() => handleRadiusSelect("Extra Large")}
                  title="Extra Large (50 mi.)"
                />
              </Menu>
            </View>

            <Text variant="headlineSmall">Type of Equipment</Text>
            {showErrors && validateField("selectedEquipmentItems") && (
              <HelperText type="error">
                Select at least one equipment
              </HelperText>
            )}
            {snowEquipmentOptions.map((item) => (
              <Checkbox.Item
                key={item}
                label={item}
                status={
                  selectedEquipmentItems.includes(item)
                    ? "checked"
                    : "unchecked"
                }
                onPress={() => toggleEquipmentItem(item)}
              />
            ))}
          </>
        )}

        <Button
        mode="contained"
        onPress={handleSaveChanges}
        style={styles.signupButton}
        >Save Changes</Button>
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
