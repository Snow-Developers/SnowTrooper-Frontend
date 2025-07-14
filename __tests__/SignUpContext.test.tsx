import React from "react";
import { render, act } from "@testing-library/react-native";
import { SignUpProvider, useSignUpContext } from "../context/SignUpContext";

const TestComponent = () => {
  const { signUpData, setSignUpData } = useSignUpContext();
  return (
    <>
      <span data-testid="firstName">{signUpData.firstName}</span>
      <button
        onClick={() =>
          setSignUpData({
            ...signUpData,
            firstName: "Alice",
          })
        }
        data-testid="updateBtn"
      >
        Update
      </button>
    </>
  );
};

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
    act(() => {
      getByTestId("updateBtn").props.onClick();
    });
    expect(getByTestId("firstName").props.children).toBe("Alice");
  });

  it("throws error if used outside provider", () => {
    // Suppress error output for this test
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => useSignUpContext()).toThrow(
      /useSignUpContext must be used within a SignUpProvider/
    );
    spy.mockRestore();
  });
});
