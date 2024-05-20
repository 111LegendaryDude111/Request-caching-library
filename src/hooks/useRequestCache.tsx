import { useContext } from "react";

import { CacheContext, type InitialValueType } from "./useCreateCache";

export const useRequestCache = (): InitialValueType => {
  const cache: InitialValueType | null = useContext(CacheContext);

  if (!cache) {
    throw new Error("useRequestCache must be used within an CacheContext");
  }

  return cache;
};
