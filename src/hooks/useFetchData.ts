import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRequestCache } from "./useRequestCache";

type QueryType = (string | number | boolean | null | object)[];

export enum Status {
  init = "init",
  loading = "loading",
  success = "success",
  error = "error",
  // fetching = "fetching",
}

export const useFetchData = <T>({
  fetchFunction,
  queryKey,
}: {
  fetchFunction: (init: RequestInit["signal"]) => Promise<T>;
  queryKey?: QueryType;
}) => {
  // const cache = useContext(CacheProvider);

  const cache = useRequestCache();

  const memoizedFn = useRef(fetchFunction);
  const [data, setData] = useState<T | null>(null);
  const [errors, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState(Status.init);
  const [reload, setReload] = useState(false);

  //update data
  const refetch = useRef(false);
  const cacheKeys = useRef(queryKey);

  useLayoutEffect(() => {
    memoizedFn.current = fetchFunction;
  }, [fetchFunction]);

  useLayoutEffect(() => {
    cacheKeys.current = queryKey;
  }, [queryKey]);

  const reloadFetch = useCallback(() => {
    refetch.current = true;
    setReload((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!cache || cache instanceof Error) return;

    //add to cache
    const nameForCache = JSON.stringify(cacheKeys.current);

    // console.log({ cacheKeys, cache, nameForCache });
    if (cache.has(nameForCache) && !refetch.current) {
      // console.log("from cache");
      const data = cache.get(nameForCache);
      setData(data);
      return;
    }

    setStatus(Status.loading);

    const controller = new AbortController();

    memoizedFn
      .current(controller.signal)
      .then((res) => {
        setData(res);
        setStatus(Status.success);

        cache.set(nameForCache, res);
        refetch.current = false;
      })
      .catch((error: Error) => {
        setStatus(Status.error);
        setError(error);
      });

    return () => {
      controller.abort();
    };
  }, [cache, refetch, reload]);

  return { data, status, errors, reloadFetch };
};
