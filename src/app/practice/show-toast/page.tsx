import type { Metadata } from "next";
import ToasterProvider from "@/providers/ToasterProvider";
import ShowToastDemo from "./_components/ShowToastDemo";

export const metadata: Metadata = {
  title: "Show Toast",
};

export default function ShowToastPage() {
  return (
    <ToasterProvider>
      <ShowToastDemo />
    </ToasterProvider>
  );
}
