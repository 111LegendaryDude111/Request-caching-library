import { useContext } from "react";

import { CacheContext } from "../Provider/CacheContext";
import { QueryCache } from "../constants";

export const useRequestCache = (): QueryCache => {
  const cache: QueryCache | null = useContext(CacheContext);

  if (!cache) {
    throw new Error("useRequestCache must be used within an CacheContext");
  }

  return cache;
};
