import { makeTypedHooks } from "../../_shared/typedHooks";
import type { AppDispatch, RootState } from "../_store/store";

export const { useAppDispatch, useAppSelector } = makeTypedHooks<RootState, AppDispatch>();
