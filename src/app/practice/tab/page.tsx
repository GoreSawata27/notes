import type { Metadata } from "next";
import Tab from "./_components/Tab";
import { tabs } from "./_components/Data";

export const metadata: Metadata = {
  title: "Tab",
};

export default function TabPage() {
  return <Tab tabs={tabs} />;
}
