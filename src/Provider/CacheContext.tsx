import { QueryCache } from "../constants";
import { CacheContext } from "./context";

interface CacheProviderProps {
  children: JSX.Element;
}

const cache = new QueryCache();

export const CacheProvider: React.FC<CacheProviderProps> = ({ children }) => {
  return (
    <CacheContext.Provider value={cache}>{children}</CacheContext.Provider>
  );
};
