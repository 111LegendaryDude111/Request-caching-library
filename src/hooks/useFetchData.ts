import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRequestCache } from "./useRequestCache";
import { QueryType, Status } from "../types";
import { retryFetch } from "../helpers/retryFetch";

type FetchProps<T> = (
  props: Pick<RequestInit, "signal"> & { pageParams?: number }
) => Promise<T>;

export const useFetchData = <T>({
  fetchFunction,
  queryKey,
  getNextPage,
  retryTimeout,
  retry = 0,
}: {
  fetchFunction: FetchProps<T>;
  queryKey?: QueryType;
  retryTimeout?: number;
  retry?: number;
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

  useLayoutEffect(() => {
    memoizedFn.current = fetchFunction;
  }, [fetchFunction]);

  const clearRetryTimeout = useRef<null | VoidFunction>(null);

  const reloadFetch = useCallback(() => {
    refetch.current = true;
    setReload((prev) => !prev);

    clearRetryTimeout.current?.();
  }, []);

  const fetchNextPage = useCallback(() => {
    if (getNextPage && data) {
      pageParams.current = getNextPage(data);

      //reload with new params
      reloadFetch();
    }
  }, [data, getNextPage, reloadFetch]);

  const getDataFromServer = useCallback(() => {
    const intervalId = setInterval(() => {
      refetch.current = true;
      setReload((prev) => !prev);
    }, retryTimeout);

    return () => clearInterval(intervalId);
  }, [retryTimeout]);

  useEffect(() => {
    if (!cache) return;
    if (error) return;

    const nameForCache = JSON.stringify(queryKey);
    const { queryCache } = cache;

    if (queryCache.has(nameForCache) && !refetch.current) {
      const data: T = cache.getEntry(nameForCache);

      setData(data);

      clearRetryTimeout.current = getDataFromServer();
      return;
    }

    cache.onInvalidate(nameForCache, reloadFetch);

    setStatus(Status.loading);

    const controller = new AbortController();

    const getData = () => {
      return memoizedFn.current({
        signal: controller.signal,
        pageParams: pageParams.current,
      });
    };

    retryFetch<T>(retry, getData, retryTimeout)
      .then((res) => {
        //AbortError
        if (res instanceof DOMException) {
          return;
        }

        if (res instanceof Error) {
          throw new Error(res.message);
        }

        setData(res);
        setStatus(Status.success);

        cache.setEntry(nameForCache, res);
        refetch.current = false;

        //Start retry polling
        clearRetryTimeout.current = getDataFromServer();
      })
      .catch((error: Error) => {
        setStatus(Status.error);
        setError(error);
      });

    return () => {
      controller.abort();
      clearRetryTimeout.current?.();
    };
  }, [
    cache,
    refetch,
    reload,
    retry,
    queryKey,
    error,
    retryTimeout,
    reloadFetch,
    getDataFromServer,
  ]);

  useEffect(() => {
    const onFocus = () => reloadFetch();

    window.addEventListener("visibilitychange", onFocus);

    return () => {
      window.removeEventListener("visibilitychange", onFocus);
    };
  }, [reloadFetch]);

  return { data, status, error, reloadFetch, fetchNextPage };
};
