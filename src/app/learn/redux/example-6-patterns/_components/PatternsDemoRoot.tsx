"use client";

import ExampleStoreProvider from "../../_shared/ExampleStoreProvider";
import { store } from "../_store/store";
import PatternsDemo from "./PatternsDemo";

export default function PatternsDemoRoot() {
  return (
    <ExampleStoreProvider store={store}>
      <PatternsDemo />
    </ExampleStoreProvider>
  );
}
