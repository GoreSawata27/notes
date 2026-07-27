import type { Metadata } from "next";
import NestedComments from "./_components/NestedComments";
import { comments } from "./_components/Data";

export const metadata: Metadata = {
  title: "Nested Comments",
};

export default function NestedCommentsPage() {
  return <NestedComments comments={comments} />;
}
