import { createContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InitialValueType = null | Map<any, any>;

export const CacheContext = createContext<InitialValueType>(null);

interface CacheProviderProps<T> {
  children: JSX.Element;
  initialValue: T;
}

export const CacheProvider = <InitialValue extends InitialValueType>(
  props: CacheProviderProps<InitialValue>
) => {
  const { initialValue, children } = props;
  return (
    <CacheContext.Provider value={initialValue}>
      {children}
    </CacheContext.Provider>
  );
};
