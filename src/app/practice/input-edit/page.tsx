import type { Metadata } from "next";
import InputEdit from "./_components/InputEdit";
import { Data } from "./_components/Array";

export const metadata: Metadata = {
  title: "Input Edit",
};

export default function InputEditPage() {
  return <InputEdit data={Data} />;
}
