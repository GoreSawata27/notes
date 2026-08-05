"use client";

import ExampleStoreProvider from "../../_shared/ExampleStoreProvider";
import { store } from "../_store/store";
import CounterDemo from "./CounterDemo";

export default function CounterDemoRoot() {
  return (
    <ExampleStoreProvider store={store}>
      <CounterDemo />
    </ExampleStoreProvider>
  );
}
