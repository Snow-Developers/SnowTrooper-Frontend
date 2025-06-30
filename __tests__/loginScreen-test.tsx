import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { signInWithPopup } from "firebase/auth";
import React from "react";
import { Platform } from "react-native";
import LoginScreen from "../app/logInScreen";
import api from "../services/api";
const { LoginManager } = require("react-native-fbsdk-next");

// Mocks
jest.mock("@react-native-google-signin/google-signin", () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn().mockResolvedValue(true),
        signIn: jest.fn().mockResolvedValue({ data: { idToken: "test-id-token" } }),
    },
}));
jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
        replace: jest.fn(),
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
jest.mock("../services/api", () => ({
    __esModule: true,
    default: {
        get: jest.fn(() =>
            Promise.resolve({ data: { role: "Customer" } })
        ),
    },
    getAPIToken: jest.fn(() => "api-token"),
}));
jest.mock("react-native-paper", () => ({
    Button: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
    ),
}));
jest.mock("react-native-fbsdk-next", () => ({
    LoginManager: {
        logInWithPermissions: jest.fn().mockResolvedValue({ isCancelled: false }),
    },
    AccessToken: {
        getCurrentAccessToken: jest.fn().mockResolvedValue({ accessToken: "fb-token" }),
    },
}));

describe("LoginScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders all login buttons", () => {
        const { getByText, getByTestId } = render(<LoginScreen />);
        expect(getByText("Log in")).toBeTruthy();
        expect(getByTestId("facebook-login-button")).toBeTruthy();
        expect(getByTestId("google-login-button")).toBeTruthy();
        expect(getByTestId("email-login-button")).toBeTruthy();
        expect(getByText("Forgot password")).toBeTruthy();
    });

    test("navigates to email login page on email button press", () => {
        const { getByTestId } = render(<LoginScreen />);
        fireEvent.press(getByTestId("email-login-button"));
        expect(router.push).toHaveBeenCalledWith("/LogInViews/emailPage");
    });

    describe("Google login", () => {
        test("handles Google login on web", async () => {
            Platform.OS = "web";
            const { getByTestId } = render(<LoginScreen />);
            fireEvent.press(getByTestId("google-login-button"));
            await waitFor(() => {
                expect(signInWithPopup).toHaveBeenCalled();
            });
        });

        test("handles Google login on native", async () => {
            Platform.OS = "android";
            const { getByTestId } = render(<LoginScreen />);
            fireEvent.press(getByTestId("google-login-button"));
            await waitFor(() => {
                expect(GoogleSignin.signIn).toHaveBeenCalled();
            });
        });

        test("navigates to customer home screen based on user role", async () => {
            Platform.OS = "web";
            (api.get as jest.Mock).mockResolvedValueOnce({ data: { role: "Customer" } });
            const { getByTestId } = render(<LoginScreen />);
            fireEvent.press(getByTestId("google-login-button"));
            await waitFor(() => {
                expect(router.replace).toHaveBeenCalledWith("/(tabs)/customerHomeScreen");
            });
        });

        test("navigates to contractor home screen based on user role", async () => {
            Platform.OS = "web";
            (api.get as jest.Mock).mockResolvedValueOnce({ data: { role: "Contractor" } });
            const { getByTestId } = render(<LoginScreen />);
            fireEvent.press(getByTestId("google-login-button"));
            await waitFor(() => {
                expect(router.replace).toHaveBeenCalledWith("/(tabs)/contractorHomeScreen");
            });
        });

        test("shows alert on unknown user role", async () => {
            Platform.OS = "web";
            (api.get as jest.Mock).mockResolvedValueOnce({ data: { role: "" } });
            global.alert = jest.fn();
            const { getByTestId } = render(<LoginScreen />);
            fireEvent.press(getByTestId("google-login-button"));
            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith("Unknown user role.");
            });
        });
    });

    describe("Facebook login", () => {
        test("handles Facebook login on web", async () => {
            Platform.OS = "web";
            const { getByTestId } = render(<LoginScreen />);
            fireEvent.press(getByTestId("facebook-login-button"));
            await waitFor(() => {
                expect(signInWithPopup).toHaveBeenCalled();
            });
        });

        test("handles Facebook login on native", async () => {
            Platform.OS = "android";
            const { getByTestId } = render(<LoginScreen />);
            fireEvent.press(getByTestId("facebook-login-button"));
            await waitFor(() => {
                expect(LoginManager.logInWithPermissions).toHaveBeenCalled();
            });
        });

        test("shows alert if Facebook login is cancelled on native", async () => {
            Platform.OS = "android";
            LoginManager.logInWithPermissions.mockResolvedValueOnce({ isCancelled: true });
            global.alert = jest.fn();
            const { getByTestId } = render(<LoginScreen />);
            fireEvent.press(getByTestId("facebook-login-button"));
            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith("Facebook login was cancelled");
            });
        });

        test("navigates to customer home screen based on user role after Facebook login", async () => {
            Platform.OS = "web";
           (api.get as jest.Mock).mockResolvedValueOnce({ data: { role: "Customer" } });
            const { getByTestId } = render(<LoginScreen />);
            fireEvent.press(getByTestId("facebook-login-button"));
            await waitFor(() => {
                expect(router.replace).toHaveBeenCalledWith("/(tabs)/customerHomeScreen");
            });
        });

        test("navigates to contractor home screen based on user role after Facebook login", async () => {
            Platform.OS = "web";
           (api.get as jest.Mock).mockResolvedValueOnce({ data: { role: "Contractor" } });
            const { getByTestId } = render(<LoginScreen />);
            fireEvent.press(getByTestId("facebook-login-button"));
            await waitFor(() => {
                expect(router.replace).toHaveBeenCalledWith("/(tabs)/contractorHomeScreen");
            });
        });
    });

    test("navigates to forgot password page", () => {
        const { getByText } = render(<LoginScreen />);
        fireEvent.press(getByText("Forgot password"));
        expect(router.push).toHaveBeenCalledWith("/LogInViews/forgotPasswordPage");
    });
});