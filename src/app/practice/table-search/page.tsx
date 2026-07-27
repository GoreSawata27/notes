import type { Metadata } from "next";
import TableSearch from "./_components/TableSearch";

export const metadata: Metadata = {
  title: "Table Search",
};

export default function TableSearchPage() {
  return <TableSearch />;
}
