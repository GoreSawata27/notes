"use client";

import ExampleStoreProvider from "../../_shared/ExampleStoreProvider";
import { store } from "../_store/store";
import LoginDemo from "./LoginDemo";

export default function LoginDemoRoot() {
  return (
    <ExampleStoreProvider store={store}>
      <LoginDemo />
    </ExampleStoreProvider>
  );
}
