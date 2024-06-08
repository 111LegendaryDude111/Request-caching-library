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
    console.log(error);
    if (!cache) return;
    if (error) return;

    const nameForCache = JSON.stringify(queryKey);

    if (cache.has(nameForCache) && !refetch.current) {
      const data = cache.get(nameForCache);
      setData(data);
      return;
    }

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
        if (res instanceof Error && res.name === "AbortError") {
          return;
        }

        if (res instanceof Error) {
          throw new Error(res.message);
        }

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
  }, [cache, refetch, reload, retry, queryKey, error, retryTimeout]);

  //retryTimeout

  // useEffect(() => {
  //   if (!retryTimeout) {
  //     return;
  //   }

  //   const intervalId = setInterval(() => {
  //     reloadFetch();
  //   }, retryTimeout);

  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [reloadFetch, retryTimeout]);

  return { data, status, error, reloadFetch, fetchNextPage };
};
