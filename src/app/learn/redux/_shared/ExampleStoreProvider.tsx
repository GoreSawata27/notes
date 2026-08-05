"use client";

import { Provider } from "react-redux";
import type { Store } from "@reduxjs/toolkit";

type Props = {
  store: Store;
  children: React.ReactNode;
};

export default function ExampleStoreProvider({ store, children }: Props) {
  return <Provider store={store}>{children}</Provider>;
}
