import { createContext } from "react";
import { QueryCache } from "../constants";

export const CacheContext = createContext<QueryCache | null>(null);

interface CacheProviderProps<T> {
  children: JSX.Element;
  cache: T;
}

export const CacheProvider = <Cache extends QueryCache>(
  props: CacheProviderProps<Cache>
) => {
  const { cache, children } = props;
  return (
    <CacheContext.Provider value={cache}>{children}</CacheContext.Provider>
  );
};
