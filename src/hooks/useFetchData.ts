import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useRequestCache } from "./useRequestCache";
import { QueryType, Status } from "../types";

type FetchProps<T> = (
  props: Pick<RequestInit, "signal"> & { pageParams?: number }
) => Promise<T>;

export const useFetchData = <T>({
  fetchFunction,
  queryKey,
  getNextPage,
  // retryTimeout,
  retry = 0,
}: {
  fetchFunction: FetchProps<T>;
  queryKey?: QueryType;
  // retryTimeout?: number;
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

    const getData = async () => {
      return await memoizedFn.current({
        signal: controller.signal,
        pageParams: pageParams.current,
      });
    };

    retryFetch<T>(retry, getData)
      .then((res) => {
        if (res instanceof Error && res.message.includes("AbortError")) {
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
  }, [cache, refetch, reload, retry, queryKey, error]);

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

async function retryFetch<T>(
  attempts: number,
  fn: () => Promise<T>
): Promise<T | null> {
  return new Promise((resolve, reject) => {
    fn()
      .then((resp) => {
        resolve(resp);
      })
      .catch((err) => {
        if (err.message.includes("AbortError")) {
          return;
        }

        if (attempts > 1) {
          retryFetch(attempts - 1, fn);
          return;
        }

        reject(err);
      });
  });
}
