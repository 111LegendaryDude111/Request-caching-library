import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const cache = new Map();

export const useFetchData = <T>({
  fetchFunction,
  nameForCache,
}: {
  fetchFunction: (init?: RequestInit) => Promise<T>;
  nameForCache?: string;
}) => {
  const memoizedFn = useRef(fetchFunction);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setError] = useState<Error | null>(null);
  const [reload, setReload] = useState(false);

  //update data
  const [refetch, setRefetch] = useState(false);

  useLayoutEffect(() => {
    memoizedFn.current = fetchFunction;
  }, [fetchFunction]);

  const reloadFetch = useCallback(() => {
    setRefetch(true);
    setReload((prev) => !prev);
  }, []);

  useEffect(() => {
    //add to cache
    if (cache.has(nameForCache) && !refetch) {
      const data = cache.get(nameForCache);
      setData(data);
      return;
    }

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();

    memoizedFn
      .current({ signal: controller.signal })
      .then((res) => {
        setData(res);
        setIsLoading(false);

        cache.set(nameForCache, res);
        setRefetch(false);
      })
      .catch(setError);

    return () => {
      controller.abort();
    };
  }, [nameForCache, refetch, reload]);

  return { data, isLoading, errors, reloadFetch };
};
