import { fireEvent, render, waitFor } from "@testing-library/react-native";
import * as DocumentPicker from "expo-document-picker";
import React from "react";
import AdditionalInfo from "../app/SignUpViews/additionalInfo";
import * as Context from "../context/SignUpContext";

// Mock context
jest.spyOn(Context, "useSignUpContext").mockImplementation(() => ({
    signUpData: {
        profilePicture: "",
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        phoneNumber: "1234567890",
        userRole: "Customer", // Change as needed
    },
    setSignUpData: jest.fn(),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => Promise.resolve({
        currentUser: {
            uid: "test-uid",
            
        },
    })),
    browserLocalPersistence: {},
}));

// Mock navigation
jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
    },
}));

// Mock API
jest.mock("../services/api", () => ({
    __esModule: true,
    default: {
        get: jest.fn(() =>
            Promise.resolve({ data: { role: "Customer" } })
        ),
    },
    getAPIToken: jest.fn(() => "api-token"),
}));

// Mock DocumentPicker
jest.spyOn(DocumentPicker, "getDocumentAsync").mockResolvedValue({
    canceled: false,
    assets: [{ uri: "file://test.pdf", name: "test.pdf", mimeType: "application/pdf" }],
});

describe("AdditionalInfo", () => {
    test("renders all required fields and role selector", async () => {
        const { getByLabelText, getByText, debug } = await render(<AdditionalInfo />);

        debug();
        // await waitFor(() => {
        //     // Check if the required fields and role selector are rendered
        //     expect(screen.getByLabelText("First Name *")).toBeTruthy();
        //     expect(screen.getByLabelText("Last Name *")).toBeTruthy();
        //     expect(screen.getByLabelText("Email *")).toBeTruthy();
        //     expect(screen.getByLabelText("Phone Number *")).toBeTruthy();
        //     expect(screen.getByLabelText("Street Address *")).toBeTruthy();
        //     expect(screen.getByLabelText("City *")).toBeTruthy();
        //     expect(screen.getByLabelText("State *")).toBeTruthy();
        //     expect(screen.getByLabelText("Zip Code *")).toBeTruthy();
        //     expect(screen.getByText("Select Your Role")).toBeTruthy();
        // });
    });

    it("shows validation errors when submitting empty form", async () => {
        const { getByText, findAllByText } = render(<AdditionalInfo />);
        fireEvent.press(getByText(/Submit/i));
        const errors = await findAllByText(/is required/i);
        expect(errors.length).toBeGreaterThan(0);
    });

    it("allows toggling cleaning specifics and pref time for Customer", () => {
        const { getByText } = render(<AdditionalInfo />);
        const snowRemoval = getByText(/Snow Removal/i);
        fireEvent.press(snowRemoval);
        expect(snowRemoval.parent.props.status).toBe("checked");
        const overnight = getByText(/Overnight/i);
        fireEvent.press(overnight);
        expect(overnight.parent.props.status).toBe("checked");
    });

    it("submits form for Customer and navigates to customerHomeScreen", async () => {
        const { getByLabelText, getByText } = render(<AdditionalInfo />);
        fireEvent.changeText(getByLabelText(/First Name/i), "John");
        fireEvent.changeText(getByLabelText(/Last Name/i), "Doe");
        fireEvent.changeText(getByLabelText(/Email/i), "john@doe.com");
        fireEvent.changeText(getByLabelText(/Phone Number/i), "1234567890");
        fireEvent.changeText(getByLabelText(/Street Address/i), "123 Main St");
        fireEvent.changeText(getByLabelText(/City/i), "City");
        fireEvent.changeText(getByLabelText(/State/i), "ST");
        fireEvent.changeText(getByLabelText(/Zip Code/i), "12345");
        // Select cleaning specifics and pref time
        fireEvent.press(getByText(/Snow Removal/i));
        fireEvent.press(getByText(/Overnight/i));
        fireEvent.press(getByText(/Submit/i));
        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith("/(tabs)/customerHomeScreen");
        });
    });

    it("renders document upload section for Contractor", () => {
        jest.spyOn(Context, "useSignUpContext").mockReturnValue({
            signUpData: { userRole: "Contractor" },
        });
        const { getByText } = render(<AdditionalInfo />);
        expect(getByText(/Upload required documents/i)).toBeTruthy();
        expect(getByText(/Insurance Documentation/i)).toBeTruthy();
        expect(getByText(/Workers Compensation/i)).toBeTruthy();
        expect(getByText(/Driver's License/i)).toBeTruthy();
        expect(getByText(/Articles of Organization\/Incorporation/i)).toBeTruthy();
    });

    it("handles document upload for Contractor", async () => {
        jest.spyOn(Context, "useSignUpContext").mockReturnValue({
            signUpData: { userRole: "Contractor" },
        });
        const { getAllByText, getByText } = render(<AdditionalInfo />);
        const selectButtons = getAllByText(/Select Documents/i);
        fireEvent.press(selectButtons[0]);
        await waitFor(() => {
            expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
        });
        expect(getByText(/Documents will be uploaded on submission/i)).toBeTruthy();
    });

    it("shows validation errors for missing contractor fields", async () => {
        jest.spyOn(Context, "useSignUpContext").mockReturnValue({
            signUpData: { userRole: "Contractor" },
        });
        const { getByText, findAllByText } = render(<AdditionalInfo />);
        fireEvent.press(getByText(/Submit/i));
        const errors = await findAllByText(/is required/i);
        expect(errors.length).toBeGreaterThan(0);
    });

    it("submits form for Contractor and navigates to contractorHomeScreen", async () => {
        jest.spyOn(Context, "useSignUpContext").mockReturnValue({
            signUpData: { userRole: "Contractor" },
        });
        const { getByLabelText, getByText, getAllByText } = render(<AdditionalInfo />);
        fireEvent.changeText(getByLabelText(/First Name/i), "Jane");
        fireEvent.changeText(getByLabelText(/Last Name/i), "Smith");
        fireEvent.changeText(getByLabelText(/Email/i), "jane@smith.com");
        fireEvent.changeText(getByLabelText(/Phone Number/i), "1234567890");
        fireEvent.changeText(getByLabelText(/Street Address/i), "456 Main St");
        fireEvent.changeText(getByLabelText(/City/i), "Town");
        fireEvent.changeText(getByLabelText(/State/i), "TS");
        fireEvent.changeText(getByLabelText(/Zip Code/i), "54321");
        // Simulate document upload
        fireEvent.press(getAllByText(/Select Documents/i)[0]);
        await waitFor(() => {
            expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
        });
        fireEvent.press(getByText(/Submit/i));
        await waitFor(() => {
            expect(replaceMock).toHaveBeenCalledWith("/(tabs)/contractorHomeScreen");
        });
    });

    it("handles API error gracefully", async () => {
        jest.spyOn(Api, "default").mockImplementation(() => ({
            post: jest.fn().mockRejectedValue(new Error("API error")),
        }));
        const { getByLabelText, getByText } = render(<AdditionalInfo />);
        fireEvent.changeText(getByLabelText(/First Name/i), "John");
        fireEvent.changeText(getByLabelText(/Last Name/i), "Doe");
        fireEvent.changeText(getByLabelText(/Email/i), "john@doe.com");
        fireEvent.changeText(getByLabelText(/Phone Number/i), "1234567890");
        fireEvent.changeText(getByLabelText(/Street Address/i), "123 Main St");
        fireEvent.changeText(getByLabelText(/City/i), "City");
        fireEvent.changeText(getByLabelText(/State/i), "ST");
        fireEvent.changeText(getByLabelText(/Zip Code/i), "12345");
        fireEvent.press(getByText(/Snow Removal/i));
        fireEvent.press(getByText(/Overnight/i));
        fireEvent.press(getByText(/Submit/i));
        await waitFor(() => {
            // No navigation on error
            expect(replaceMock).not.toHaveBeenCalled();
        });
    });
});