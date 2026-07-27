import type { Metadata } from "next";
import Dropdown from "./_components/Dropdown";

export const metadata: Metadata = {
  title: "Dropdown",
};

export default function DropdownPage() {
  return <Dropdown />;
}
