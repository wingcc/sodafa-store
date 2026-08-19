"use client";
import React, { createContext, useContext, useState } from "react";

type ToastSettings = { duration: number; position: "top-right" | "top-left" | "bottom-right" | "bottom-left" };
const ToastSettingsContext = createContext<ToastSettings>({ duration: 3000, position: "top-right" });
export const useToastSettings = () => useContext(ToastSettingsContext);

export function ToastSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings] = useState<ToastSettings>({ duration: 3000, position: "top-right" });
  return <ToastSettingsContext.Provider value={settings}>{children}</ToastSettingsContext.Provider>;
}
