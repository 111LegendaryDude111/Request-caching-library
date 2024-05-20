import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRequestCache } from "./useRequestCache";

type QueryType = (
  | string
  | number
  | boolean
  | null
  | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Record<string, any>
)[];

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
  getNextPage,
}: {
  fetchFunction: (
    props: Pick<RequestInit, "signal"> & { pageParams?: number }
  ) => Promise<T>;
  queryKey?: QueryType;
  getNextPage?: (lastData: T) => number | undefined;
}) => {
  const cache = useRequestCache();

  const memoizedFn = useRef(fetchFunction);
  const pageParams = useRef<number | undefined>();

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
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

  const fetchNextPage = useCallback(() => {
    if (getNextPage && data) {
      pageParams.current = getNextPage(data);

      //reload with new params
      reloadFetch();
    }
  }, [data, getNextPage, reloadFetch]);

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
      .current({ signal: controller.signal, pageParams: pageParams.current })
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

  return { data, status, errors: error, reloadFetch, fetchNextPage };
};
