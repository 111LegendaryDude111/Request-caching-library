import { createContext } from "react";
import { QueryCache } from "../constants";
export const CacheContext = createContext<QueryCache | null>(null);
