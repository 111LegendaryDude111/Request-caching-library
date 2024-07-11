import { createContext } from "react";
import { QueryCache } from "../constants";

export const CacheContext = createContext<QueryCache | null>(null);
const cache = new QueryCache();

interface CacheProviderProps {
  children: JSX.Element;
}

export const CacheProvider: React.FC<CacheProviderProps> = ({ children }) => {
  return (
    <CacheContext.Provider value={cache}>{children}</CacheContext.Provider>
  );
};
