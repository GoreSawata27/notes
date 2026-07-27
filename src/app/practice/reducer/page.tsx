import type { Metadata } from "next";
import TodoApp from "./_components/Reducer";

export const metadata: Metadata = {
  title: "Reducer",
};

export default function ReducerPage() {
  return <TodoApp />;
}
