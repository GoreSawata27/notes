"use client";

import ExampleStoreProvider from "../../_shared/ExampleStoreProvider";
import { store } from "../_store/store";
import RtkQueryDemo from "./RtkQueryDemo";

export default function RtkQueryDemoRoot() {
  return (
    <ExampleStoreProvider store={store}>
      <RtkQueryDemo />
    </ExampleStoreProvider>
  );
}
