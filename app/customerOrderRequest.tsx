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
import api, { ensureAPIAuthentication, getAPIToken } from "../services/api";

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

  //For loading states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Price calculation state
  const [calculatedPrice, setCalculatedPrice] = useState<any>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [showPriceAndPayment, setShowPriceAndPayment] = useState(false);

  // Store payment intent ID for order creation
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");

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
  const cleaningSpecificsOptions = ["Snow Removal", "Salting"];
  const prefTimeOptions = [
    { key: "Overnight", label: "Overnight (12:00 AM - 5:00 AM)" },
    { key: "Early Morning", label: "Early Morning (5:01 AM - 9:00 AM)" },
    { key: "Mid Morning", label: "Mid Morning (9:01 AM - 12:00 PM)" },
    { key: "Afternoon", label: "Afternoon (12:01 PM - 4:00 PM)" },
    { key: "Evening", label: "Evening (4:01 PM - 9:00 PM)" },
    { key: "Late Night", label: "Late Night (9:01 PM - 11:59 PM)" },
  ];

  //Prefill values upon render
  useEffect(() => {
    const fetchUserData = async () => {
      console.log("[DEBUG] Starting to fetch user profile data for UID:", uid);

      try {
        await ensureAPIAuthentication();

        const response = await api.get(`/users/${uid}`, {
          headers: {
            Authorization: `Bearer ${getAPIToken()}`,
            ...(Platform.OS !== "web" && {
              "Content-Type": "application/json",
            }),
            "ngrok-skip-browser-warning": "11111",
          },
        });

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
      } catch (error) {
        console.error("[DEBUG] Error fetching user profile:", error);
      }
    };

    if (uid) {
      fetchUserData();
    }
  }, [uid]);

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
    setIsCalculatingPrice(true);

    try {
      await ensureAPIAuthentication();

      const response = await api.get(`/order/calculate/${uid}`, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          ...(Platform.OS !== "web" && {
            "Content-Type": "application/json",
          }),
          "ngrok-skip-browser-warning": "11111",
        },
      });

      console.log("[DEBUG] Price calculation successful:", response.data);
      setCalculatedPrice(response.data);
      return response.data;
    } catch (error) {
      console.error("[DEBUG] Error calculating price:", error);

      if (error.response?.status === 425) {
        alert(
          "User profile not found. Please make sure your profile information is saved."
        );
      } else if (error.response?.status === 460) {
        alert("Weather service unavailable. Please try again later.");
      } else {
        alert("Failed to calculate price. Please try again.");
      }
      return null;
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // Handle "Proceed to Payment" button click
  const handleProceedToPayment = async () => {
    console.log("[DEBUG] Proceed to payment clicked");
    setShowErrors(true);

    // Validate all required fields
    const missingFields = fieldKeys.filter(validateField);
    if (missingFields.length > 0) {
      console.log("[DEBUG] Missing required fields:", missingFields);
      alert("Please fill in all required fields before proceeding.");
      return;
    }

    console.log("[DEBUG] All fields validated, calculating price...");

    // !!!!!!!!! TEMPORARILY SKIP PROFILE UPDATE DUE TO 403 ERROR !!!!!!!!!
    // !!!!!!!!! Will change later!!!!!!!!!!!
    console.log(
      "[DEBUG] Skipping profile update due to 403 error - using existing profile data"
    );

    // Calculate the price
    const priceData = await calculateOrderPrice();
    if (!priceData) {
      return;
    }

    // Show price and payment button
    setShowPriceAndPayment(true);
    console.log("[DEBUG] Price calculated, showing payment options");
  };

  // Initialize payment sheet with Stripe
  const initializePaymentSheet = async (calculatedAmount: number) => {
    console.log("[DEBUG] Initializing payment sheet...");

    try {
      await ensureAPIAuthentication();

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

      console.log("[DEBUG] Payment intent created:", response.data);

      const {
        paymentIntent,
        ephemeralKey,
        customer,
        publishableKey,
        paymentIntentId,
      } = response.data;

      console.log("[DEBUG] Payment intent client secret:", paymentIntent);
      console.log("[DEBUG] Payment intent ID from response:", paymentIntentId);
      console.log(
        "[DEBUG] Full response data:",
        JSON.stringify(response.data, null, 2)
      );

      // Extract payment intent ID if not directly provided
      let actualPaymentIntentId = paymentIntentId;
      if (!actualPaymentIntentId && paymentIntent) {
        // Extract ID from client secret (format: pi_xxx_secret_yyy)
        actualPaymentIntentId = paymentIntent.split("_secret_")[0];
        console.log(
          "[DEBUG] Extracted payment intent ID from client secret:",
          actualPaymentIntentId
        );
      }

      console.log("[DEBUG] Using payment intent ID:", actualPaymentIntentId);

      // Validate the data format
      if (!paymentIntent || !paymentIntent.includes("_secret_")) {
        console.error("[DEBUG] Invalid payment intent client secret format");
        alert("Invalid payment intent format received from server");
        return false;
      }

      if (!publishableKey || !publishableKey.startsWith("pk_")) {
        console.error("[DEBUG] Invalid publishable key format");
        alert("Invalid publishable key received from server");
        return false;
      }

      // Store the payment intent ID for later use in order creation
      setPaymentIntentId(actualPaymentIntentId);
      console.log("[DEBUG] Stored payment intent ID:", actualPaymentIntentId);

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Snow Removal Service",
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

        if (error.stripeErrorCode === "resource_missing") {
          alert(
            "Payment setup failed: The payment intent was not found. This might be due to environment mismatch (test vs live keys)."
          );
        } else {
          alert(
            `Payment setup failed: ${error.localizedMessage || error.message}`
          );
        }
        return false;
      }

      console.log("[DEBUG] Payment sheet initialized successfully");
      return true;
    } catch (error) {
      console.error("[DEBUG] Error initializing payment sheet:", error);
      alert("Failed to initialize payment. Please try again.");
      return false;
    }
  };

  // Handle Stripe payment flow
  const handleStripePayment = async () => {
    console.log("[DEBUG] Starting Stripe payment flow");
    setIsProcessingPayment(true);

    // Store the current payment intent ID before starting
    let currentPaymentIntentId = "";

    try {
      // Initialize payment sheet and capture the payment intent ID
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

      console.log("[DEBUG] Payment intent created:", response.data);

      const {
        paymentIntent,
        ephemeralKey,
        customer,
        publishableKey,
        paymentIntentId,
      } = response.data;

      // Extract and store payment intent ID immediately
      let actualPaymentIntentId = paymentIntentId;
      if (!actualPaymentIntentId && paymentIntent) {
        actualPaymentIntentId = paymentIntent.split("_secret_")[0];
        console.log(
          "[DEBUG] Extracted payment intent ID from client secret:",
          actualPaymentIntentId
        );
      }

      console.log("[DEBUG] Using payment intent ID:", actualPaymentIntentId);

      // Store in both state and local variable
      setPaymentIntentId(actualPaymentIntentId);
      currentPaymentIntentId = actualPaymentIntentId;

      console.log("[DEBUG] Stored payment intent ID:", actualPaymentIntentId);

      // Validate the data format
      if (!paymentIntent || !paymentIntent.includes("_secret_")) {
        console.error("[DEBUG] Invalid payment intent client secret format");
        alert("Invalid payment intent format received from server");
        setIsProcessingPayment(false);
        return;
      }

      if (!publishableKey || !publishableKey.startsWith("pk_")) {
        console.error("[DEBUG] Invalid publishable key format");
        alert("Invalid publishable key received from server");
        setIsProcessingPayment(false);
        return;
      }

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Snow Removal Service",
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

        if (error.stripeErrorCode === "resource_missing") {
          alert(
            "Payment setup failed: The payment intent was not found. This might be due to environment mismatch (test vs live keys)."
          );
        } else {
          alert(
            `Payment setup failed: ${error.localizedMessage || error.message}`
          );
        }
        setIsProcessingPayment(false);
        return;
      }

      console.log("[DEBUG] Payment sheet initialized successfully");

      // Present payment sheet to user
      console.log("[DEBUG] Presenting payment sheet to user...");
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        console.error("[DEBUG] Payment error:", paymentError);
        alert(`Payment failed: ${paymentError.message}`);
      } else {
        console.log("[DEBUG] Payment successful!");
        console.log(
          "[DEBUG] About to submit order with payment intent ID:",
          currentPaymentIntentId
        );

        // Use the local variable to ensure we have the correct payment intent ID
        await handleOrderRequestSubmission(currentPaymentIntentId);
      }
    } catch (error) {
      console.error("[DEBUG] Payment process error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleOrderRequestSubmission = async (
    providedPaymentIntentId?: string
  ) => {
    console.log("[DEBUG] Submitting order after successful payment...");

    // Use provided payment intent ID or fall back to state
    const orderPaymentIntentId = providedPaymentIntentId || paymentIntentId;
    console.log("[DEBUG] Using payment intent ID:", orderPaymentIntentId);
    console.log("[DEBUG] Provided ID:", providedPaymentIntentId);
    console.log("[DEBUG] State ID:", paymentIntentId);

    if (!orderPaymentIntentId) {
      console.error("[DEBUG] No payment intent ID available!");
      alert("Payment intent ID missing. Please try the payment process again.");
      return;
    }

    const orderData = {
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

    const orderRequest = {
      paymentIntent: orderPaymentIntentId,
      order: orderData,
    };

    try {
      const response = await api.post(`/order/create`, orderRequest, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          ...(Platform.OS !== "web" && {
            "Content-Type": "application/json",
          }),
          "ngrok-skip-browser-warning": "11111",
        },
      });

      console.log("[DEBUG] Order created successfully:", response.data);

      const { orderId, message } = response.data;
      alert(`${message}\nOrder ID: ${orderId}`);

      router.replace("/customerHomeScreen");
    } catch (error) {
      console.error("[DEBUG] Order submission error:", error);

      if (error.response?.status === 500) {
        alert(
          "Server error occurred while creating order. Payment was successful but order creation failed. Please contact support."
        );
      } else if (error.response?.status === 465) {
        alert(
          "Payment verification failed. Please contact support with payment intent: " +
            orderPaymentIntentId
        );
      } else {
        alert(
          "Order creation failed. Payment was successful but order could not be saved. Please contact support."
        );
      }
    }
  };

  // Validation function for payment button
  const canProceedToPayment = () => {
    const missingFields = fieldKeys.filter(validateField);
    return missingFields.length === 0;
  };

  // Debug functions
  const updateUserProfileSimple = async () => {
    console.log("[DEBUG] Updating user profile...");
    setIsUpdatingProfile(true);

    const userData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      streetAddress,
      city,
      state,
      zipCode,
      customerPropertySize,
      hasPropertySteps: hasSteps,
      usePetFriendlyMaterial: isPetFriendly,
      cleaningSpecifics: selectedCleaningSpecifics,
      prefTime: selectedPrefTime,
    };

    try {
      await ensureAPIAuthentication();

      const response = await api.put(`/users/update/${uid}`, userData, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          ...(Platform.OS !== "web" && {
            "Content-Type": "application/json",
          }),
          "ngrok-skip-browser-warning": "11111",
        },
      });

      console.log("[DEBUG] JSON update successful:", response.data);
      alert("Profile updated successfully!");
      return true;
    } catch (error) {
      console.error("[DEBUG] JSON update failed:", error);
      alert("Failed to update profile. Please try again.");
      return false;
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const debugAuthAndHeaders = async () => {
    console.log("[DEBUG] Debugging authentication and headers...");

    const currentToken = getAPIToken();
    console.log("[DEBUG] Current API Token:", currentToken ? "EXISTS" : "NULL");
    console.log("[DEBUG] Platform.OS:", Platform.OS);

    try {
      const getResponse = await api.get(`/users/${uid}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          ...(Platform.OS !== "web" && {
            "Content-Type": "application/json",
          }),
          "ngrok-skip-browser-warning": "11111",
        },
      });
      console.log("[DEBUG] GET request worked:", getResponse.status);

      const putResponse = await api.put(
        `/users/update/${uid}`,
        { test: "data" },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            ...(Platform.OS !== "web" && {
              "Content-Type": "application/json",
            }),
            "ngrok-skip-browser-warning": "11111",
          },
        }
      );
      console.log("[DEBUG] PUT request worked:", putResponse.status);
    } catch (error) {
      console.error("[DEBUG] Request failed:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
    }
  };

  const testAPIConnectivity = async () => {
    console.log("[DEBUG] Testing API connectivity...");

    try {
      const getUserResponse = await api.get(`/users/${uid}`, {
        headers: {
          Authorization: `Bearer ${getAPIToken()}`,
          ...(Platform.OS !== "web" && {
            "Content-Type": "application/json",
          }),
          "ngrok-skip-browser-warning": "11111",
        },
      });
      console.log("[DEBUG] GET /users worked:", getUserResponse.status);

      try {
        const testResponse = await api.put(
          `/users/update/${uid}`,
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
        console.log("[DEBUG] PUT endpoint exists:", testResponse.status);
      } catch (endpointError) {
        console.log("[DEBUG] PUT endpoint test error:", {
          status: endpointError.response?.status,
          statusText: endpointError.response?.statusText,
          message: endpointError.message,
        });
      }

      console.log("[DEBUG] API Base URL:", api.defaults.baseURL);
    } catch (error) {
      console.error("[DEBUG] Basic connectivity test failed:", error);
      alert("Cannot connect to API. Check if your backend server is running.");
    }
  };

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

        {/* Property Size Selection */}
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

        {/* Cleaning Specifics */}
        <Text variant="headlineMedium" style={styles.promptText}>
          Select Cleaning Specifics
        </Text>
        {cleaningSpecificsOptions.map((item) => (
          <Checkbox.Item
            key={item}
            label={item}
            status={
              selectedCleaningSpecifics.includes(item) ? "checked" : "unchecked"
            }
            onPress={() => toggleCleaningSpecifics(item)}
          />
        ))}

        {/* Preferred Time */}
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

        {/* Property Steps */}
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
            Yes
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
            No
          </Button>
        </View>

        {/* Pet Friendly Materials */}
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
            Yes
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
            No
          </Button>
        </View>

        {/* Main Action Button */}
        {!showPriceAndPayment ? (
          <Button
            mode="contained"
            onPress={handleProceedToPayment}
            disabled={
              !canProceedToPayment() || isUpdatingProfile || isCalculatingPrice
            }
            loading={isUpdatingProfile || isCalculatingPrice}
            style={[styles.signupButton, { marginTop: 20, marginBottom: 10 }]}
          >
            {isUpdatingProfile
              ? "Updating Profile..."
              : isCalculatingPrice
              ? "Calculating Price..."
              : "Proceed to Payment"}
          </Button>
        ) : (
          <>
            {/* Price Display Section */}
            {calculatedPrice && (
              <View style={styles.priceSection}>
                <Text variant="headlineMedium" style={styles.priceTitle}>
                  Order Summary
                </Text>
                <View style={styles.priceBreakdown}>
                  <Text style={styles.priceItem}>
                    Base Rate: $
                    {calculatedPrice["Base Rate"]?.toFixed(2) || "0.00"}
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

            {/* Stripe Payment Button */}
            <Button
              mode="contained"
              onPress={handleStripePayment}
              disabled={isProcessingPayment}
              loading={isProcessingPayment}
              style={[styles.signupButton, { marginBottom: 10 }]}
            >
              {isProcessingPayment
                ? "Processing Payment..."
                : "Continue with Stripe"}
            </Button>

            {/* Back button to modify order */}
            <Button
              mode="outlined"
              onPress={() => setShowPriceAndPayment(false)}
              disabled={isProcessingPayment}
              style={[styles.signupButton, { marginBottom: 10 }]}
            >
              Modify Order Details
            </Button>
          </>
        )}

        {/* Debug Buttons - Keep only essential ones */}
        <View style={styles.debugSection}>
          <Button
            mode="text"
            onPress={calculateOrderPrice}
            disabled={isCalculatingPrice}
            loading={isCalculatingPrice}
            style={styles.debugButton}
          >
            Debug: Calculate Price Only
          </Button>

          <Button
            mode="text"
            onPress={updateUserProfileSimple}
            disabled={isUpdatingProfile}
            loading={isUpdatingProfile}
            style={styles.debugButton}
          >
            Debug: Test Simple Update
          </Button>

          <Button
            mode="text"
            onPress={debugAuthAndHeaders}
            style={styles.debugButton}
          >
            Debug: Check Auth & Headers
          </Button>

          <Button
            mode="text"
            onPress={testAPIConnectivity}
            style={styles.debugButton}
          >
            Debug: Test API Connectivity
          </Button>
        </View>
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
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
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
  signupButton: {
    paddingHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 8,
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
  debugButton: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
});
