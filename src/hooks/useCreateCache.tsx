import { createContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InitialValueType = Map<string, any>;

export const CacheContext = createContext<InitialValueType | null>(null);

interface CacheProviderProps<T> {
  children: JSX.Element;
  cache: T;
}

export const CacheProvider = <Cache extends InitialValueType>(
  props: CacheProviderProps<Cache>
) => {
  const { cache, children } = props;
  return (
    <CacheContext.Provider value={cache}>{children}</CacheContext.Provider>
  );
};
