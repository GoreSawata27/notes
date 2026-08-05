"use client";

import ExampleStoreProvider from "../../_shared/ExampleStoreProvider";
import { store } from "../_store/store";
import PostsDemo from "./PostsDemo";

export default function PostsDemoRoot() {
  return (
    <ExampleStoreProvider store={store}>
      <PostsDemo />
    </ExampleStoreProvider>
  );
}
