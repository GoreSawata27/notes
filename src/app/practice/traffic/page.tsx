import type { Metadata } from "next";
import Traffic from "./_components/Traffic";

export const metadata: Metadata = {
  title: "Traffic Light",
};

export default function TrafficPage() {
  return <Traffic />;
}
