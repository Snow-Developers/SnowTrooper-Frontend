import { useStripe } from "@stripe/stripe-react-native";
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
  //Stripe hook
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

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
    console.log("[DEBUG] Starting to fetch user profile data for UID:", uid);

    api
      .get(`/users/${uid}`, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          ...(Platform.OS !== "web" && {
            "Content-Type": "application/json",
          }),
          "ngrok-skip-browser-warning": "11111",
        },
      })
      .then((response) => {
        const data = response.data;
        console.log("[DEBUG] User profile data fetched successfully:", data);
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phoneNumber || "");
        setStreetAddress(data.streetAddress || "");
        setCity(data.city || "");
        setState(data.state || "");
        setZipCode(data.zipCode || "");

        // Customer-specific fields
        setCustomerPropertySize(data.customerPropertySize || "");
        setHasSteps(data.hasPropertySteps ?? true);
        setIsPetFriendly(data.usePetFriendlyMaterial ?? true);
        setSelectedCleaningSpecifics(data.cleaningSpecifics || []);
        setSelectedPrefTime(data.prefTime || []);
      })
      .catch((error) => {
        console.error("[DEBUG] Error fetching user profile:", error);
        console.error("[DEBUG] Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
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

  //For loading state for payment
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // New state for price calculation
  const [calculatedPrice, setCalculatedPrice] = useState<any>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

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

  // Calculate price from backend
  const calculateOrderPrice = async () => {
    console.log("[DEBUG] Starting price calculation...");
    console.log("[DEBUG] Current UID:", uid);

    // verify what user data i have locally
    console.log("[DEBUG] Current user data in frontend:", {
      firstName,
      lastName,
      email,
      zipCode,
      customerPropertySize,
      city,
      state,
    });

    setIsCalculatingPrice(true);

    try {
      console.log("[DEBUG] Making API call to /order/calculate/{uid}");
      console.log(
        "[DEBUG] Full API URL:",
        `${api.defaults.baseURL}/order/calculate/${uid}`
      );
      console.log("[DEBUG] Request headers will include:", {
        Authorization: `Bearer ${getAPIToken()}`,
        ...(Platform.OS !== "web" && {
          "Content-Type": "application/json",
        }),
        "ngrok-skip-browser-warning": "11111",
      });

      // actual call
      const response = await api.get(`/order/calculate/${uid}`, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          ...(Platform.OS !== "web" && {
            "Content-Type": "application/json",
          }),
          "ngrok-skip-browser-warning": "11111",
        },
      });

      console.log("[DEBUG] Price calculation API response received");
      console.log("[DEBUG] Response status:", response.status);
      console.log("[DEBUG] Response data:", response.data);

      // Log detailed price breakdown
      console.log("[DEBUG] PRICE BREAKDOWN:");
      console.log("[DEBUG] - Base Rate:", response.data["Base Rate"]);
      console.log("[DEBUG] - Size Factor:", response.data["Size Factor"]);
      console.log(
        "[DEBUG] - Location Factor:",
        response.data["Location Factor"]
      );
      console.log(
        "[DEBUG] - Snowfall Factor:",
        response.data["Snowfall Total"]
      );
      console.log("[DEBUG] - Total (in cents):", response.data["Total"]);
      console.log(
        "[DEBUG] - Total (in dollars):",
        (response.data["Total"] / 100).toFixed(2)
      );

      setCalculatedPrice(response.data);
      return response.data;
    } catch (error) {
      console.error("[DEBUG] Error calculating price:", error);
      console.error("[DEBUG] Full error object:", error);
      console.error("[DEBUG] Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
      });

      // Log specific error scenarios
      if (error.response?.status === 425) {
        console.error(
          "[DEBUG] User profile not found - ensure user data is saved"
        );
        alert(
          "User profile not found. Please make sure your profile information is saved."
        );
      } else if (error.response?.status === 460) {
        console.error("[DEBUG] Weather API failed - check weather service");
        alert("Weather service unavailable. Please try again later.");
      } else if (error.response?.status === 500) {
        console.error("[DEBUG] Internal server error - check backend logs");
        alert(
          "Server error occurred. Please check backend logs and try again."
        );
      } else {
        alert("Failed to calculate price. Please try again.");
      }

      return null;
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // Payment
  const initializePaymentSheet = async (calculatedAmount: number) => {
    console.log("[DEBUG] Initializing payment sheet...");
    console.log("[DEBUG] Amount to charge (in cents):", calculatedAmount);
    console.log("[DEBUG] Customer details:", {
      email: email,
      name: `${firstName} ${lastName}`,
    });

    try {
      console.log("[DEBUG] Making API call to create payment intent");

      // call paymentIntent endpoint
      const response = await api.post(
        `/order/paymentIntent/${uid}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getAPIToken()}`,
            ...(Platform.OS !== "web" && {
              "Content-Type": "application/json",
            }),
            "ngrok-skip-browser-warning": "11111",
          },
        }
      );

      console.log("[DEBUG] Payment intent creation response:", response.data);

      const { paymentIntent, ephemeralKey, customer, publishableKey } =
        response.data;

      console.log("[DEBUG] Payment sheet initialization data:", {
        paymentIntentReceived: !!paymentIntent,
        ephemeralKeyReceived: !!ephemeralKey,
        customerReceived: !!customer,
        publishableKeyReceived: !!publishableKey,
      });

      // Initialize the payment sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: "Your Snow Removal Service",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: `${firstName} ${lastName}`,
          email: email,
        },
      });

      if (error) {
        console.error("[DEBUG] Payment sheet initialization error:", error);
        alert("Failed to initialize payment. Please try again.");
        return false;
      }

      console.log("[DEBUG] Payment sheet initialized successfully");
      return true;
    } catch (error) {
      console.error("[DEBUG] Error initializing payment sheet:", error);
      console.error("[DEBUG] Payment initialization error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      alert("Failed to initialize payment. Please try again.");
      return false;
    }
  };

  const handlePayment = async () => {
    console.log("[DEBUG] Payment process started");
    setIsProcessingPayment(true);

    try {
      // Step 1: Calculate the price first
      console.log("[DEBUG] Step 1: Calculating order price...");
      const priceData = await calculateOrderPrice();

      if (!priceData) {
        console.error("[DEBUG] Price calculation failed, aborting payment");
        setIsProcessingPayment(false);
        return;
      }

      console.log("[DEBUG] Step 1 Complete: Price calculated successfully");

      // Step 2: Initialize payment sheet with calculated amount
      console.log("[DEBUG] Step 2: Initializing payment sheet...");
      const initialized = await initializePaymentSheet(priceData.Total);
      if (!initialized) {
        console.error(
          "[DEBUG] Payment sheet initialization failed, aborting payment"
        );
        setIsProcessingPayment(false);
        return;
      }

      console.log("[DEBUG] Step 2 Complete: Payment sheet initialized");

      // Step 3: Present payment sheet
      console.log("[DEBUG] Step 3: Presenting payment sheet to user...");
      const { error } = await presentPaymentSheet();

      if (error) {
        console.error("[DEBUG] Payment error:", error);
        alert(`Payment failed: ${error.message}`);
      } else {
        console.log("[DEBUG] Payment successful!");
        alert("Payment successful!");

        console.log("[DEBUG] Step 4: Proceeding to order submission...");
        await handleOrderRequestSubmission();
      }
    } catch (error) {
      console.error("[DEBUG] Payment process error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      console.log("[DEBUG] Payment process completed, resetting loading state");
      setIsProcessingPayment(false);
    }
  };

  const handleOrderRequestSubmission = async () => {
    console.log("[DEBUG] Handle Order Request Submission");
    setShowErrors(true);

    //Alert user of fields missing proper values
    const missingFields = fieldKeys.filter(validateField);
    if (missingFields.length > 0) {
      console.log("[DEBUG] Missing required fields:", missingFields);
      alert(`Please fill in the following required fields`);
      return;
    }

    console.log("[DEBUG] All required fields validated successfully");

    //Data to be sent as a JSON to the backend
    const customerOrder = {
      customerUid: uid,
      customerFName: firstName,
      customerLName: lastName,
      email: email,
      customerPhoneNumber: phoneNumber,
      streetAddress: streetAddress,
      city: city,
      state: state,
      zipCode: zipCode,
      customerPropertySize: customerPropertySize,
      hasPropertySteps: hasSteps,
      usePetFriendlyMaterial: isPetFriendly,
      cleaningSpecifics: selectedCleaningSpecifics,
      prefTime: selectedPrefTime,
    };

    console.log("[DEBUG] Submitting Order Request:", customerOrder);

    //Sends HTTP POST request to backend api
    api
      .post(`/order/create`, customerOrder, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          ...(Platform.OS !== "web" && {
            "Content-Type": "application/json",
          }),
          "ngrok-skip-browser-warning": "11111",
        },
      })
      .then((response) => {
        console.log(
          "[DEBUG] Snow Removal Request has been updated successfully"
        );
        console.log("[DEBUG] Order creation response:", response.data);
        router.replace("/customerHomeScreen");
      })
      .catch((error) => {
        console.error("[DEBUG] Order submission error:", error);
        console.error("[DEBUG] Response Data:", error.response?.data);
      });
  };

  // Validation function for payment button
  const canProceedToPayment = () => {
    const missingFields = fieldKeys.filter(validateField);
    return missingFields.length === 0;
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
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
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
        {
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
        }

        {/* Price Display Section - NEW */}
        {calculatedPrice && (
          <View style={styles.priceSection}>
            <Text variant="headlineMedium" style={styles.priceTitle}>
              Order Summary
            </Text>
            <View style={styles.priceBreakdown}>
              <Text style={styles.priceItem}>
                Base Rate: ${calculatedPrice["Base Rate"]?.toFixed(2) || "0.00"}
              </Text>
              <Text style={styles.priceItem}>
                Size Factor: {calculatedPrice["Size Factor"]}x
              </Text>
              <Text style={styles.priceItem}>
                Location Factor: {calculatedPrice["Location Factor"]}x
              </Text>
              <Text style={styles.priceItem}>
                Snowfall Factor: {calculatedPrice["Snowfall Total"]}x
              </Text>
              <Text style={styles.priceTotal}>
                Total: ${(calculatedPrice["Total"] / 100).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Payment Button */}
        <Button
          mode="contained"
          onPress={handlePayment}
          disabled={
            !canProceedToPayment() || isProcessingPayment || isCalculatingPrice
          }
          loading={isProcessingPayment || isCalculatingPrice}
          style={[styles.signupButton, { marginBottom: 10 }]}
        >
          {isCalculatingPrice
            ? "Calculating Price..."
            : isProcessingPayment
            ? "Processing..."
            : "Proceed to Payment"}
        </Button>

        {/* Debug Button - NEW */}
        <Button
          mode="outlined"
          onPress={calculateOrderPrice}
          disabled={isCalculatingPrice}
          loading={isCalculatingPrice}
          style={[styles.signupButton, { marginBottom: 10 }]}
        >
          {isCalculatingPrice
            ? "Calculating..."
            : "Calculate Price Only (Debug)"}
        </Button>

        {/* Keep the original submit button for testing/backup */}
        <Button
          mode="outlined"
          onPress={() => {
            console.log("Submit button pressed!");
            handleOrderRequestSubmission();
          }}
          style={styles.signupButton}
        >
          Submit Order Request (No Payment, kept in case)
        </Button>
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
  priceSection: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00bedc",
  },
  priceTitle: {
    textAlign: "center",
    marginBottom: 10,
    color: "#00bedc",
  },
  priceBreakdown: {
    gap: 5,
  },
  priceItem: {
    fontSize: 16,
    color: "#333",
  },
  priceTotal: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00bedc",
    marginTop: 10,
    textAlign: "center",
  },
});
