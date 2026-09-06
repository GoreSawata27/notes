import type { Metadata } from "next";
import ToasterContextProvider from "./_components/ToasterContext";
import ShowToastDemo from "./_components/ShowToastDemo";

export const metadata: Metadata = {
  title: "Show Toast",
};

export default function ShowToastPage() {
  return (
    <ToasterContextProvider>
      <ShowToastDemo />
    </ToasterContextProvider>
  );
}
