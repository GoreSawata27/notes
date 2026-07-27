import type { Metadata } from "next";
import Form from "./_components/Form";
import { formDataList } from "./_components/FormData";

export const metadata: Metadata = {
  title: "Form",
};

export default function FormPage() {
  return <Form list={formDataList} />;
}
