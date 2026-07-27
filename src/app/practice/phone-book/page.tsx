import type { Metadata } from "next";
import PhoneBook from "./_components/PhoneBook";
import { MOCK_COUNTRY_OPTIONS } from "./_components/Constents";

export const metadata: Metadata = {
  title: "Phone Book",
};

export default function PhoneBookPage() {
  return <PhoneBook options={MOCK_COUNTRY_OPTIONS} />;
}
