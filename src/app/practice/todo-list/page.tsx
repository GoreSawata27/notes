import type { Metadata } from "next";
import TodoList from "./_components/TodoList";

export const metadata: Metadata = {
  title: "Todo List",
};

export default function TodoListPage() {
  return <TodoList />;
}
