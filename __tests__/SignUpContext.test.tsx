import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Text } from 'react-native-paper';
import { SignUpProvider, useSignUpContext } from "../context/SignUpContext";

const TestComponent = () => {
  const { signUpData, setSignUpData } = useSignUpContext();
  return (
    <>
      <Text testID="firstName">{signUpData.firstName}</Text>
      <TouchableOpacity
        onPress={() =>
          setSignUpData({
            ...signUpData,
            firstName: "Alice",
          })
        }
        testID="updateBtn"
      >
        <Text>Update</Text>
      </TouchableOpacity>
    </>
  );
};

export default TestComponent;

const SignUpComponent = () => {
  useSignUpContext();
  return null;
}

describe("SignUpContext", () => {
   it("provides default values", () => {
    const { getByTestId } = render(
      <SignUpProvider>
        <TestComponent />
      </SignUpProvider>
    );
    expect(getByTestId("firstName").props.children).toBe("");
  });

  it("updates context value", () => {
    const { getByTestId } = render(
      <SignUpProvider>
        <TestComponent />
      </SignUpProvider>
    );

    fireEvent.press(getByTestId("updateBtn"));
    expect(getByTestId("firstName").props.children).toBe("Alice");
  });

  it("throws error if used outside provider", () => {
    // suppress error output
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<SignUpComponent />)).toThrow(
      /useSignUpContext must be used within a SignUpProvider/
    );
    spy.mockRestore();
  });
});
