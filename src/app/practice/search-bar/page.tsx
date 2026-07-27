import type { Metadata } from "next";
import SearchBar from "./_components/SearchBar";
import { OptionsData } from "./_components/OptionsData";

export const metadata: Metadata = {
  title: "Search Bar",
};

export default function SearchBarPage() {
  return <SearchBar options={OptionsData} />;
}
