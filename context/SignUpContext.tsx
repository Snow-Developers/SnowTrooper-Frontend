import React, { createContext, ReactNode, useContext, useState } from 'react';

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userRole: string;
}

interface SignUpContextType {
  signUpData: SignUpData;
  setSignUpData: (data: SignUpData) => void;
}

const defaultData: SignUpData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  userRole: 'Customer',
};

const SignUpContext = createContext<SignUpContextType | undefined>(undefined);

export const SignUpProvider = ({ children }: { children: ReactNode }) => {
  const [signUpData, setSignUpData] = useState<SignUpData>(defaultData);

  return (
    <SignUpContext.Provider value={{ signUpData, setSignUpData }}>
      {children}
    </SignUpContext.Provider>
  );
};

export const useSignUpContext = (): SignUpContextType => {
  const context = useContext(SignUpContext);
  if (!context) throw new Error("useSignUpContext must be used within a SignUpProvider");
  return context;
};