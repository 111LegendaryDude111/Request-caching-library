import { useContext } from "react";
import { QueryCache } from "../constants";
import { CacheContext } from "../Provider/context";

export const useRequestCache = (): QueryCache => {
  const cache: QueryCache | null = useContext(CacheContext);

  if (!cache) {
    throw new Error("useRequestCache must be used within an CacheContext");
  }

  return cache;
};
