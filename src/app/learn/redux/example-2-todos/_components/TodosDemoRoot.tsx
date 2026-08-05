"use client";

import ExampleStoreProvider from "../../_shared/ExampleStoreProvider";
import { store } from "../_store/store";
import TodosDemo from "./TodosDemo";

export default function TodosDemoRoot() {
  return (
    <ExampleStoreProvider store={store}>
      <TodosDemo />
    </ExampleStoreProvider>
  );
}
