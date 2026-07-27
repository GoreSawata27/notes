import type { Metadata } from "next";
import Accordion from "./_components/Accordion";
import { AccordionData } from "./_components/AccData";

export const metadata: Metadata = {
  title: "Accordion",
};

export default function AccordionPage() {
  return <Accordion list={AccordionData} />;
}
