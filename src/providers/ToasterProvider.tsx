"use client";

import ToasterContextProvider from "@/app/practice/show-toast/_components/ToasterContext";

export default function ToasterProvider({ children }: { children: React.ReactNode }) {
  return <ToasterContextProvider>{children}</ToasterContextProvider>;
}
