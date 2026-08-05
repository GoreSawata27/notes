import type { UnknownAction } from "@reduxjs/toolkit";
import type { Dispatch } from "redux";
import { useDispatch, useSelector } from "react-redux";

export function makeTypedHooks<
  RootState,
  AppDispatch extends Dispatch<UnknownAction>,
>() {
  const useAppDispatch = useDispatch.withTypes<AppDispatch>();
  const useAppSelector = useSelector.withTypes<RootState>();
  return { useAppDispatch, useAppSelector };
}
