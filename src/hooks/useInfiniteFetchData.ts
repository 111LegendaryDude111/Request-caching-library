import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { QueryType, Status } from "../types";
import { useRequestCache } from "./useRequestCache";

interface UseInfiniteFetchDataProps<T, PageParamType> {
  fetchFunction: (
    signal: AbortController["signal"],
    pageParams: PageParamType
  ) => Promise<T>;
  queryKeys: QueryType;
  getNextPage: (data: T[]) => PageParamType;
  initialPageParam: PageParamType;
}

interface InfiniteDatatype<T, PageParamType> {
  pages: T[];
  pageParam: PageParamType;
}

export const useInfiniteFetchData = <T, PageParamType>({
  fetchFunction,
  queryKeys,
  getNextPage,
  initialPageParam,
}: UseInfiniteFetchDataProps<T, PageParamType>) => {
  const cache = useRequestCache();

  const [infiniteData, setInfiniteData] = useState<
    InfiniteDatatype<T, PageParamType>
  >({
    pages: [],
    pageParam: initialPageParam,
  });
  const [status, setStatus] = useState(Status.init);
  const [error, setError] = useState<null | Error>(null);
  const [reload, setReload] = useState(false);

  const refetch = useRef(false);

  const memoizedFetchFn = useRef(fetchFunction);

  const handleReload = useCallback(() => {
    refetch.current = true;
    setReload((prev) => !prev);
  }, []);

  const handleUpdateInfiniteData = useCallback((newData: T) => {
    setInfiniteData((prev) => ({
      ...prev,
      pages: [...prev.pages, newData],
    }));
  }, []);

  const fetchNextPage = () => {
    if (infiniteData.pages.length > 0) {
      const nextPage = getNextPage(infiniteData.pages);

      if (nextPage) {
        setInfiniteData((prev) => ({ ...prev, pageParam: nextPage }));
      }

      return;
    }
  };

  useLayoutEffect(() => {
    memoizedFetchFn.current = fetchFunction;
  }, [fetchFunction]);

  useEffect(() => {
    if (!cache) return;

    const nameForCache = JSON.stringify(queryKeys);

    if (cache.has(nameForCache) && !refetch.current) {
      const data = cache.get(nameForCache);

      handleUpdateInfiniteData(data);
      return;
    }

    const controller = new AbortController();

    setStatus(Status.loading);

    memoizedFetchFn
      .current(controller.signal, infiniteData.pageParam)
      .then((data: T) => {
        handleUpdateInfiniteData(data);

        setStatus(Status.success);

        const newDataToCache = cache.get(nameForCache).push(data);
        cache.set(nameForCache, newDataToCache);
        refetch.current = false;
      })
      .catch((err: Error) => {
        setStatus(Status.error);
        setError(err);
      });

    return () => {
      controller.abort();
    };
  }, [
    cache,
    handleUpdateInfiniteData,
    reload,
    infiniteData.pageParam,
    queryKeys,
  ]);

  return { infiniteData, error, status, handleReload, fetchNextPage };
};
