import type { Metadata } from "next";
import NestedCheckbox from "./_components/NestedCheckbox";
import { categories } from "./_components/Data";

export const metadata: Metadata = {
  title: "Nested Checkbox",
};

export default function NestedCheckboxPage() {
  return <NestedCheckbox categories={categories} />;
}
