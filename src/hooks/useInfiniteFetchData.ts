import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { QueryType, Status } from "../types";
import { useRequestCache } from "./useRequestCache";

/*
    const {data, isLoading, fetchNextPage} = useInfiniteFetchData({
    key: ['asdfData'],
    fetch: ({signal, pageParams}) => {},
    getNextPage: (lastData) => {
        return lastData.page + 1 || undefined;
    }
})

При вызове fetchNextPage мы догружаем данные. 
Чтобы получить дополнительные параметры след запроса (pageParam) используется функция getNextPage.

*/

interface UseInfiniteFetchDataProps<T, PageParamType> {
  fetchFunction: (
    signal: AbortController["signal"],
    pageParams: PageParamType
  ) => Promise<T[]>;
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
  const cacheKeys = useRef(queryKeys);

  //   const pageParams = useRef(initialPageParam);

  const handleReload = useCallback(() => {
    refetch.current = true;
    setReload((prev) => !prev);
  }, []);

  const handleUpdateInfiniteData = useCallback((newData: T[]) => {
    setInfiniteData((prev) => ({
      ...prev,
      pages: prev.pages.concat(newData),
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

  useLayoutEffect(() => {
    cacheKeys.current = queryKeys;
  }, [queryKeys]);

  useEffect(() => {
    if (!cache) return;

    //при изменении параметров в fetchNextPage у нас бы генерился новый ключ и кешировались данные именно с этими параметрами
    const jsonKeys = cacheKeys.current.push(
      infiniteData.pageParam as QueryType
    );
    const nameForCache = JSON.stringify(jsonKeys);

    if (cache.has(nameForCache) && !refetch.current) {
      const data = cache.get(nameForCache);

      handleUpdateInfiniteData(data);

      return;
    }

    const controller = new AbortController();

    setStatus(Status.loading);
    memoizedFetchFn
      .current(controller.signal, infiniteData.pageParam)
      .then((data: T[]) => {
        handleUpdateInfiniteData(data);

        setStatus(Status.success);

        cache.set(nameForCache, data);
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
    /*мб через реф?? --->*/ infiniteData.pageParam,
  ]);
  return { infiniteData, error, status, handleReload, fetchNextPage };
};
