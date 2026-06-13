"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export type UserRiskContextType = {
  region: string;
  province?: string;

  latitude: number;
  longitude: number;

  temperature: number;
  humidity: number;
  rain: number;

  riskScore: number;
  riskStatus: string;

  diseasePrediction: string;
  riskPeriod: string;
};

type ContextType = {
  userRisk: UserRiskContextType | null;

  setUserRisk: (
    data: UserRiskContextType
  ) => void;
};

const UserRiskContext =
  createContext<ContextType | null>(
    null
  );

export function UserRiskProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    userRisk,
    setUserRisk,
  ] = useState<UserRiskContextType | null>(
    null
  );

  return (
    <UserRiskContext.Provider
      value={{
        userRisk,
        setUserRisk,
      }}
    >
      {children}
    </UserRiskContext.Provider>
  );
}

export function useUserRisk() {
  const context =
    useContext(UserRiskContext);

  if (!context) {
    throw new Error(
      "useUserRisk must be used inside UserRiskProvider"
    );
  }

  return context;
}