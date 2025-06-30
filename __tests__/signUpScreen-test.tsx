import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { signInWithCredential, signInWithPopup } from "firebase/auth";
import React from "react";
import { Alert, Platform } from "react-native";
import SignUpScreen from "../app/signUpScreen";
const { LoginManager } = require("react-native-fbsdk-next");

jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
    },
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn().mockResolvedValue(true),
        signIn: jest.fn().mockResolvedValue({
            data: {
                idToken: "mock-id-token",
                givenName: "John",
                familyName: "Doe",
                email: "john@example.com",
            },
        }),
    },
}));

jest.mock("firebase/auth", () => {
    function GoogleAuthProvider() {}
    GoogleAuthProvider.credential = jest.fn(() => "mock-google-credential");
    GoogleAuthProvider.credentialFromResult = jest.fn(() => ({ accessToken: "mock-token" }));

    function FacebookAuthProvider() {}
    FacebookAuthProvider.credential = jest.fn(() => "mock-facebook-credential");
    FacebookAuthProvider.credentialFromResult = jest.fn(() => ({ accessToken: "mock-fb-token" }));
    FacebookAuthProvider.prototype.addScope = jest.fn();

    return {
        getAuth: jest.fn(() => ({})),
        GoogleAuthProvider,
        FacebookAuthProvider,
        signInWithCredential: jest.fn().mockResolvedValue({
            user: {
                uid: "uid",
                displayName: "John Doe",
                email: "john@example.com",
                photoURL: "http://photo",
            },
        }),
        signInWithPopup: jest.fn().mockResolvedValue({
            user: {
                uid: "uid",
                displayName: "John Doe",
                email: "john@example.com",
                photoURL: "http://photo",
            },
        }),
        getAdditionalUserInfo: jest.fn(() => ({
            profile: {
                picture: "http://photo",
                given_name: "John",
                family_name: "Doe",
                email: "john@example.com",
            },
        })),
        RecaptchaVerifier: jest.fn(),
    };
});

jest.mock("../context/SignUpContext", () => ({
    useSignUpContext: () => ({
        setSignUpData: jest.fn(),
    }),
}));

// For Facebook SDK on mobile
jest.mock("react-native-fbsdk-next", () => ({
    LoginManager: {
        logInWithPermissions: jest.fn().mockResolvedValue({ isCancelled: false }),
    },
    AccessToken: {
        getCurrentAccessToken: jest.fn().mockResolvedValue({ accessToken: "fb-token" }),
    },
    GraphRequest: jest.fn(),
    GraphRequestManager: jest.fn().mockImplementation(() => ({
        addRequest: jest.fn().mockReturnThis(),
        start: jest.fn(),
    })),
}));

describe("SignUpScreen", () => {
    const originalPlatformOS = Platform.OS;
    let alertSpy: jest.SpyInstance;


    beforeEach(() => {
        jest.clearAllMocks();
        alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    afterAll(() => {
        Platform.OS = originalPlatformOS;
        alertSpy.mockRestore();
    });

    test("renders all sign up buttons", () => {
        const { getByText } = render(<SignUpScreen />);
        expect(getByText("Sign up with Facebook")).toBeTruthy();
        expect(getByText("Sign up with Google")).toBeTruthy();
        expect(getByText("Sign up with Email")).toBeTruthy();
    });

    test("navigates to email sign up page on button press", () => {
        const { getByText } = render(<SignUpScreen />);
        fireEvent.press(getByText("Sign up with Email"));
        expect(router.push).toHaveBeenCalledWith("/SignUpViews/emailPage");
    });

    describe("Google sign up", () => {
        test("handles Google sign up on web", async () => {
            Platform.OS = 'web';
            const { getByText } = render(<SignUpScreen />);
            fireEvent.press(getByText("Sign up with Google"));
            await waitFor(() => {
                expect(signInWithPopup).toHaveBeenCalled();
                expect(router.push).toHaveBeenCalledWith("/SignUpViews/additionalInfo");
            });
        });

        test("handles Google sign up on mobile", async () => {
            Platform.OS = 'android';
            const { getByText } = render(<SignUpScreen />);
            fireEvent.press(getByText("Sign up with Google"));
            await waitFor(() => {
                expect(GoogleSignin.signIn).toHaveBeenCalled();
                expect(signInWithCredential).toHaveBeenCalled();
                expect(router.push).toHaveBeenCalledWith("/SignUpViews/additionalInfo");
            });
        });

        test("handles Google sign up error", async () => {
            Platform.OS = 'android';
            (signInWithPopup as jest.Mock).mockRejectedValueOnce(new Error("Google error"));
            const { getByText } = render(<SignUpScreen />);
            fireEvent.press(getByText("Sign up with Google"));
            await waitFor(() => {
                expect(GoogleSignin.signIn).toHaveBeenCalled();
            });
        });
    });

    describe("Facebook sign up", () => {
        test("handles Facebook sign up on web", async () => {
            Platform.OS = 'web';
            const { getByText } = render(<SignUpScreen />);
            fireEvent.press(getByText("Sign up with Facebook"));
            await waitFor(() => {
                expect(signInWithPopup).toHaveBeenCalled();
            });
        });

        test("handles Facebook sign up on mobile", async () => {
            Platform.OS = 'android';
            const { getByText } = render(<SignUpScreen />);
            fireEvent.press(getByText("Sign up with Facebook"));
            await waitFor(() => {
                expect(LoginManager.logInWithPermissions).toHaveBeenCalled();
            });
        });

        test("handles Facebook sign up error", async () => {
            Platform.OS = 'web';
            (signInWithPopup as jest.Mock).mockRejectedValueOnce({ code: "auth/popup-closed-by-user", message: "closed" });
            const { getByText } = render(<SignUpScreen />);
            fireEvent.press(getByText("Sign up with Facebook"));
            await waitFor(() => {
                expect(signInWithPopup).toHaveBeenCalled();
            });
        });
    });
});