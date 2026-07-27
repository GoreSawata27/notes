import type { Metadata } from "next";
import MultiSelect from "./_components/MultiSelect";

export const metadata: Metadata = {
  title: "Multi Select",
};

export default function MultiSelectPage() {
  return <MultiSelect />;
}
